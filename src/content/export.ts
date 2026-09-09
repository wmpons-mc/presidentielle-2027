import { createHash } from 'node:crypto';
import {
  actorPublic, topicPublic, questionPublic, sourcePublic, citationPublic,
  propositionPublic, coveragePublic, publicDatasetSchema, approval,
} from './schemas.ts';
import type { Approval, Collection, PrivateDataset, PublicDataset, Ref } from './schemas.ts';
import { ContentError, key, validatePrivate } from './validate.ts';

type RecordVersion = PrivateDataset['content'][Collection][number];
const publicSchemas = {
  actors: actorPublic, topics: topicPublic, questions: questionPublic, sources: sourcePublic,
  citations: citationPublic, propositions: propositionPublic, coverage: coveragePublic,
};
const rootCollections = ['actors', 'topics', 'questions', 'propositions', 'coverage'] as const;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Digest the entire validated private snapshot except the approval envelope itself. */
export function snapshotDigest(input: unknown): string {
  const { review: _review, ...snapshot } = validatePrivate(input);
  return createHash('sha256').update(canonical(snapshot), 'utf8').digest('hex');
}

const approved = (r: RecordVersion) => ['approved', 'published'].includes(r.editorialState);
const reference = (r: Ref): Ref => ({ id: r.id, version: r.version });

/**
 * Pure projection. The caller MUST obtain trustedApproval from the owner's protected
 * review store, never from the candidate input. This library does not authenticate humans.
 */
export function exportPublic(input: unknown, options: { purpose: 'production' | 'fixture-test'; trustedApproval: Approval }): PublicDataset {
  const data = validatePrivate(input);
  if (!['approved', 'published'].includes(data.review.state) || !data.review.approval) throw new ContentError('snapshot_not_approved', 'review');
  const trusted = approval.safeParse(options.trustedApproval);
  if (!trusted.success || canonical(trusted.data) !== canonical(data.review.approval)) throw new ContentError('untrusted_approval', 'review');
  if (snapshotDigest(data) !== trusted.data.digest) throw new ContentError('approval_digest_mismatch', 'review');
  if (options.purpose !== 'production' && options.purpose !== 'fixture-test') throw new ContentError('invalid_export_purpose', 'options');
  if (data.fixture && options.purpose === 'production') throw new ContentError('fixture_not_publishable', 'fixture');
  const maps = new Map<Collection, Map<string, RecordVersion>>();
  const latest = new Map<Collection, Map<string, RecordVersion>>();
  const selected = new Map<Collection, Set<string>>();
  for (const name of Object.keys(publicSchemas) as Collection[]) {
    maps.set(name, new Map(data.content[name].map(r => [key(r), r])));
    const revisions = new Map<string, RecordVersion>();
    for (const r of data.content[name]) if (!revisions.has(r.id) || revisions.get(r.id)!.version < r.version) revisions.set(r.id, r);
    latest.set(name, revisions);
    selected.set(name, new Set());
  }
  // Iterative traversal bounds stack use and handles actor/status/evidence cycles.
  const pending: [Collection, Ref][] = [];
  const current = Object.fromEntries(rootCollections.map(name => {
    const roots = [...latest.get(name)!.values()].filter(r => r.availability === 'active' && approved(r)).map(reference);
    for (const r of roots) pending.push([name, r]);
    return [name, roots];
  }));
  while (pending.length) {
    const [name, ref] = pending.pop()!;
    if (selected.get(name)!.has(key(ref))) continue;
    const r = maps.get(name)!.get(key(ref));
    const newest = latest.get(name)!.get(ref.id);
    if (!r || !approved(r) || r.availability !== 'active' || newest?.availability !== 'active' || !approved(newest)) throw new ContentError('dependency_not_publishable', `content.${name}`);
    selected.get(name)!.add(key(ref));
    pending.push(...dependencies(name, r));
  }
  const content = Object.fromEntries((Object.keys(publicSchemas) as Collection[]).map(name => [name,
    data.content[name].filter(r => selected.get(name)!.has(key(r))).map(r => {
      // The public schema is the allowlist. Nested change metadata is deliberately reduced.
      const fields: Record<string, unknown> = Object.fromEntries(Object.keys(publicSchemas[name].shape).map(field => [field, r[field as keyof typeof r]]));
      fields.change = { kind: r.change.kind, date: r.change.date };
      return publicSchemas[name].parse(fields);
    }),
  ]));
  return publicDatasetSchema.parse({ schemaVersion: '1.0.0', datasetId: data.datasetId, fixture: data.fixture, current, content });
}

function dependencies(name: Collection, record: RecordVersion): [Collection, Ref][] {
  const links: [Collection, Ref][] = [];
  const add = (collection: Collection, refs: Ref[]) => { links.push(...refs.map(r => [collection, r] as [Collection, Ref])); };
  // Narrow through the collection's explicit schema; adding a schema relationship must
  // extend this allowlisted graph traversal and its dependency tests.
  switch (name) {
    case 'actors': {
      const r = actorPublic.strip().parse({ ...record, change: { kind: record.change.kind, date: record.change.date } });
      for (const s of r.candidateStatuses) add('citations', s.evidenceRefs);
      break;
    }
    case 'questions': add('topics', [(record as PrivateDataset['content']['questions'][number]).topicRef]); break;
    case 'sources': add('actors', [(record as PrivateDataset['content']['sources'][number]).authorRef]); break;
    case 'citations': {
      const r = record as PrivateDataset['content']['citations'][number];
      add('sources', [r.sourceRef]); add('actors', [r.speakerRef]); break;
    }
    case 'propositions': {
      const r = record as PrivateDataset['content']['propositions'][number];
      add('actors', [r.authorRef, ...(r.attribution.attributedTo ? [r.attribution.attributedTo] : [])]);
      add('questions', r.questionRefs); add('citations', [...r.citationRefs, ...r.attribution.proofCitationRefs]);
      add('propositions', r.relatedPropositionRefs);
      const facts = [r.population, r.territory, r.conditions, r.schedule, r.funding, ...r.parameters.flatMap(p => [p.value, p.unit, p.frequency, p.quantityKind, p.basis, p.referencePeriod, p.duration])];
      for (const f of facts) if (f.state === 'absent') add('citations', f.evidenceRefs);
      break;
    }
    case 'coverage': {
      const r = record as PrivateDataset['content']['coverage'][number];
      add('actors', [r.actorRef]); add('questions', [r.questionRef]); add('sources', r.sourceRefs); break;
    }
    case 'topics': break;
  }
  return links;
}
