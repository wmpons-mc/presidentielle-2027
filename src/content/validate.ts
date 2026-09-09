import { privateDatasetSchema } from './schemas.ts';
import type { Collection, PrivateDataset, Ref } from './schemas.ts';

export const key = (value: Ref): string => `${value.id}@${value.version}`;
export class ContentError extends Error {
  readonly code: string;
  readonly location: string;
  constructor(code: string, location: string) {
    // Locations are schema paths, never source text or private field values.
    super(`${code} at ${location}`);
    this.code = code;
    this.location = location;
    this.name = 'ContentError';
  }
}
export function validatePrivate(input: unknown): PrivateDataset {
  const parsed = privateDatasetSchema.safeParse(input);
  if (!parsed.success) throw new ContentError('invalid_structure', parsed.error.issues[0].path.join('.'));
  const data = parsed.data;
  const maps = Object.fromEntries(Object.entries(data.content).map(([name, records]) => [name, new Map(records.map(r => [key(r), r]))])) as unknown as Record<Collection, Map<string, Ref>>;
  const requireRef = (collection: Collection, reference: Ref, path: string) => {
    if (!maps[collection].has(key(reference))) throw new ContentError('broken_reference', path);
  };
  const checkRefs = (collection: Collection, references: Ref[], path: string) => {
    if (new Set(references.map(key)).size !== references.length) throw new ContentError('duplicate_reference', path);
    references.forEach(r => requireRef(collection, r, path));
  };
  for (const [name, records] of Object.entries(data.content)) {
    const collection = name as Collection;
    if (records.length !== maps[collection].size) throw new ContentError('duplicate_revision', name);
    records.forEach((r, i) => {
      const path = `${name}.${i}.change`;
      if (r.version === 1) {
        if (r.change.previous !== null || r.change.kind !== 'initial') throw new ContentError('invalid_initial_revision', path);
      } else {
        const previous = r.change.previous;
        if (!previous || previous.id !== r.id || previous.version !== r.version - 1 || r.change.kind === 'initial') throw new ContentError('invalid_history', path);
        requireRef(collection, previous, path);
        const old = records.find(v => key(v) === key(previous))!;
        if (old.change.date > r.change.date) throw new ContentError('reversed_history_date', path);
      }
      if (r.availability === 'withdrawn' && r.editorialState !== 'withdrawn') throw new ContentError('withdrawal_state_mismatch', `${name}.${i}`);
    });
  }
  data.content.actors.forEach((a, i) => {
    let last = '';
    a.candidateStatuses.forEach((s, j) => {
      const path = `actors.${i}.candidateStatuses.${j}`;
      checkRefs('citations', s.evidenceRefs, path);
      if (s.status !== 'unknown' && !s.evidenceRefs.length) throw new ContentError('missing_status_proof', path);
      if (s.date < last) throw new ContentError('reversed_status_date', path);
      last = s.date;
    });
  });
  data.content.questions.forEach((q, i) => {
    requireRef('topics', q.topicRef, `questions.${i}.topicRef`);
    checkRefs('propositions', q.reexaminePropositionRefs, `questions.${i}.reexaminePropositionRefs`);
  });
  data.content.sources.forEach((s, i) => {
    requireRef('actors', s.authorRef, `sources.${i}.authorRef`);
    if (s.publishedAt.state === 'known' && s.publishedAt.value > s.accessedAt) throw new ContentError('publication_after_access', `sources.${i}`);
  });
  data.content.citations.forEach((c, i) => {
    requireRef('sources', c.sourceRef, `citations.${i}.sourceRef`);
    requireRef('actors', c.speakerRef, `citations.${i}.speakerRef`);
  });
  data.content.propositions.forEach((p, i) => {
    const path = `propositions.${i}`;
    requireRef('actors', p.authorRef, `${path}.authorRef`);
    checkRefs('questions', p.questionRefs, `${path}.questionRefs`);
    checkRefs('citations', p.citationRefs, `${path}.citationRefs`);
    checkRefs('citations', p.attribution.proofCitationRefs, `${path}.attribution.proofCitationRefs`);
    checkRefs('propositions', p.relatedPropositionRefs, `${path}.relatedPropositionRefs`);
    if (p.attribution.attributedTo) requireRef('actors', p.attribution.attributedTo, `${path}.attribution.attributedTo`);
    if (p.modality === 'explicit_condition' && p.conditions.state !== 'known') throw new ContentError('missing_condition', path);
    if (p.attribution.kind === 'mandated_spokesperson' && (!p.attribution.proofCitationRefs.length || !p.attribution.attributedTo)) throw new ContentError('missing_attribution_proof', path);
    if (p.attribution.kind === 'unestablished' && p.attribution.attributedTo !== null) throw new ContentError('unestablished_target', path);
    if (p.attribution.kind === 'organization') {
      const author = data.content.actors.find(a => key(a) === key(p.authorRef))!;
      if (author.kind !== 'organization' || !p.attribution.attributedTo || key(p.attribution.attributedTo) !== key(p.authorRef)) throw new ContentError('invalid_organization_attribution', path);
    }
    if (['mandated_spokesperson', 'quoted_third_party'].includes(p.attribution.kind) && (!p.attribution.attributedTo || key(p.attribution.attributedTo) !== key(p.authorRef))) throw new ContentError('attribution_author_mismatch', path);
    if (p.attribution.kind === 'direct') {
      if (!p.attribution.attributedTo || key(p.attribution.attributedTo) !== key(p.authorRef)) throw new ContentError('invalid_direct_attribution', path);
      if (p.citationRefs.some(r => key(data.content.citations.find(c => key(c) === key(r))!.speakerRef) !== key(p.authorRef))) throw new ContentError('speaker_mismatch', path);
    }
    const fields = [p.population, p.territory, p.conditions, p.schedule, p.funding, ...p.parameters.flatMap(v => [v.value, v.unit, v.frequency, v.quantityKind, v.basis, v.referencePeriod, v.duration])];
    fields.forEach((f, j) => { if (f.state === 'absent') checkRefs('citations', f.evidenceRefs, `${path}.facts.${j}`); });
  });
  data.content.coverage.forEach((c, i) => {
    requireRef('actors', c.actorRef, `coverage.${i}.actorRef`);
    requireRef('questions', c.questionRef, `coverage.${i}.questionRef`);
    checkRefs('sources', c.sourceRefs, `coverage.${i}.sourceRefs`);
    if (['examined_no_measure', 'unreadable', 'measures_identified'].includes(c.state) && !c.sourceRefs.length) throw new ContentError('missing_corpus', `coverage.${i}`);
  });
  return data;
}
