import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exportPublic, snapshotDigest } from '../src/content/export.ts';

function approvedFixture() {
  const data = JSON.parse(readFileSync(new URL('./fixtures/base.json', import.meta.url), 'utf8'));
  for (const records of Object.values(data.content)) for (const record of records as any[]) record.editorialState = 'approved';
  data.review.state = 'approved';
  // Synthetic test approval; never a human approval or production authority.
  const trustedApproval = { digest: snapshotDigest(data), reviewerId: 'fiction.reviewer', reviewedAt: '2026-02-01T12:00:00Z' };
  data.review.approval = trustedApproval;
  return { data, options: { purpose: 'fixture-test' as const, trustedApproval } };
}

test('exports only the explicit public fields and preserves canonical evidence', () => {
  const {data, options} = approvedFixture();
  const before = structuredClone(data);
  const result = exportPublic(data, options);
  const json = JSON.stringify(result);
  for (const forbidden of ['privateNotes', 'fullText', 'rightsNotes', 'definition', 'reexaminePropositionRefs', 'reviewerId', 'editorialState', 'description', 'PRIVATE']) assert.ok(!json.includes(forbidden), forbidden);
  assert.equal(result.content.propositions[0].questionRefs.length, 2);
  assert.equal(result.content.citations.length, 1);
  assert.equal(result.fixture, true);
  assert.deepEqual(data, before);
});

for (const [label, mutate] of [
  ['summary', (d: any) => d.content.propositions[0].summary += ' Changed'],
  ['source text', (d: any) => d.content.sources[0].fullText += ' Changed'],
  ['quotation', (d: any) => d.content.citations[0].fragments[0].text += ' Changed'],
  ['module definition', (d: any) => d.content.questions[0].definition.meaning += ' Changed'],
  ['fixture marker', (d: any) => d.fixture = false],
  ['dataset identity', (d: any) => d.datasetId = 'another.dataset'],
] as const) test(`rejects changes to approved ${label}`, () => {
  const {data, options} = approvedFixture(); mutate(data);
  assert.throws(() => exportPublic(data, options), /approval_digest_mismatch/);
});

test('rejects self-declared approval that differs from the trusted record', () => {
  const {data, options} = approvedFixture();
  data.review.approval = {...data.review.approval, reviewerId: 'untrusted.actor'};
  assert.throws(() => exportPublic(data, options), /untrusted_approval/);
});

test('refuses fictional fixtures in production', () => {
  const {data, options} = approvedFixture();
  assert.throws(() => exportPublic(data, {...options, purpose: 'production'}), /fixture_not_publishable/);
});

test('refuses draft snapshots even with a matching digest', () => {
  const {data, options} = approvedFixture(); data.review.state = 'draft';
  assert.throws(() => exportPublic(data, options), /snapshot_not_approved/);
});

test('fails closed if an active record relies on a draft source', () => {
  const {data, options} = approvedFixture(); data.content.sources[0].editorialState = 'draft';
  options.trustedApproval.digest = snapshotDigest(data);
  assert.throws(() => exportPublic(data, options), /dependency_not_publishable/);
});

test('withdrawn latest revision cannot resurrect the old proposition', () => {
  const {data, options} = approvedFixture(); const old = data.content.propositions[0];
  data.content.propositions.push({...structuredClone(old), version:2, availability:'withdrawn', editorialState:'withdrawn', change:{kind:'withdrawal',previous:{id:old.id,version:1},date:'2026-02-01',description:'Fictional withdrawal'}});
  options.trustedApproval.digest = snapshotDigest(data);
  const result = exportPublic(data, options);
  assert.deepEqual(result.current.propositions, []);
  assert.deepEqual(result.content.propositions, []);
  assert.equal(data.content.propositions.length, 2);
});

test('unreferenced drafts are excluded even from an approved snapshot', () => {
  const {data, options} = approvedFixture();
  data.content.topics.push({...structuredClone(data.content.topics[0]), id:'fiction.unreviewed', editorialState:'draft'});
  options.trustedApproval.digest = snapshotDigest(data);
  assert.ok(!JSON.stringify(exportPublic(data, options)).includes('fiction.unreviewed'));
});

test('object key order does not invalidate approval', () => {
  const {data} = approvedFixture();
  const reordered = Object.fromEntries(Object.entries(data).reverse());
  assert.equal(snapshotDigest(data), snapshotDigest(reordered));
});

test('historical author references stay resolvable without replacing the current version', () => {
  const {data, options} = approvedFixture(); const old = data.content.actors[0];
  data.content.actors.push({...structuredClone(old), version:2, name:'Fictional Person A revised', change:{kind:'clarification',previous:{id:old.id,version:1},date:'2026-02-01',description:'Private fictional history'}});
  options.trustedApproval.digest = snapshotDigest(data);
  const result = exportPublic(data, options);
  assert.deepEqual(result.current.actors, [{id:old.id,version:2}]);
  assert.deepEqual(result.content.actors.map(a => a.version), [1,2]);
  assert.deepEqual(result.content.propositions[0].authorRef, {id:old.id,version:1});
});

test('deactivation and reactivation append revisions without changing proof or political status', () => {
  const {data, options} = approvedFixture(); const old = data.content.propositions[0];
  const statuses = structuredClone(data.content.actors[0].candidateStatuses);
  data.content.propositions.push({...structuredClone(old), version:2, availability:'inactive', change:{kind:'deactivation',previous:{id:old.id,version:1},date:'2026-02-01',description:'Fictional deactivation'}});
  options.trustedApproval.digest = snapshotDigest(data);
  assert.deepEqual(exportPublic(data, options).current.propositions, []);
  data.content.propositions.push({...structuredClone(old), version:3, change:{kind:'activation',previous:{id:old.id,version:2},date:'2026-02-02',description:'Fictional activation'}});
  options.trustedApproval.digest = snapshotDigest(data);
  const result = exportPublic(data, options);
  assert.deepEqual(result.current.propositions, [{id:old.id,version:3}]);
  assert.deepEqual(result.content.propositions[0].citationRefs, old.citationRefs);
  assert.equal(data.content.propositions.length, 3);
  assert.deepEqual(data.content.actors[0].candidateStatuses, statuses);
});

test('a newer draft never falls back to the old approved proposition', () => {
  const {data, options} = approvedFixture(); const old = data.content.propositions[0];
  data.content.propositions.push({...structuredClone(old), version:2, editorialState:'draft', change:{kind:'clarification',previous:{id:old.id,version:1},date:'2026-02-01',description:'Unreviewed fictional clarification'}});
  options.trustedApproval.digest = snapshotDigest(data);
  assert.deepEqual(exportPublic(data, options).content.propositions, []);
});

test('withdrawing a topic rejects current questions that still depend on it', () => {
  const {data, options} = approvedFixture(); const old = data.content.topics[0];
  data.content.topics.push({...structuredClone(old), version:2, availability:'withdrawn', editorialState:'withdrawn', change:{kind:'withdrawal',previous:{id:old.id,version:1},date:'2026-02-01',description:'Fictional withdrawal'}});
  options.trustedApproval.digest = snapshotDigest(data);
  assert.throws(() => exportPublic(data, options), /dependency_not_publishable/);
});
