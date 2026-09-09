import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePrivate } from '../src/content/validate.ts';

const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/base.json', import.meta.url), 'utf8'));

test('accepts fictional evidence shared by multiple questions', () => {
  const data = validatePrivate(fixture());
  assert.equal(data.content.propositions[0].questionRefs.length, 2);
  assert.equal(data.content.citations.length, 1);
});

test('adds a candidate and fourth topic using only data files', () => {
  const input = fixture();
  const before = structuredClone(input.content);
  const additions = JSON.parse(readFileSync(new URL('./fixtures/extension.json', import.meta.url), 'utf8'));
  for (const [collection, records] of Object.entries(additions)) input.content[collection].push(...records as unknown[]);
  const data = validatePrivate(input);
  assert.equal(data.content.topics.length, 4);
  assert.equal(data.content.actors.length, 2);
  for (const [collection, records] of Object.entries(before)) {
    assert.deepEqual(input.content[collection].slice(0, (records as unknown[]).length), records);
  }
});

const invalidCases: [string, (data: any) => void][] = [
  ['dangling question reference', d => d.content.propositions[0].questionRefs[0].id = 'missing'],
  ['dangling source version', d => d.content.citations[0].sourceRef.version = 2],
  ['duplicate revision', d => d.content.actors.push(structuredClone(d.content.actors[0]))],
  ['impossible date', d => d.content.sources[0].accessedAt = '2026-02-30'],
  ['missing proof', d => d.content.propositions[0].citationRefs = []],
  ['empty quotation', d => d.content.citations[0].fragments[0].text = ''],
  ['missing locator', d => delete d.content.citations[0].fragments[0].locator],
  ['unknown object field', d => d.content.propositions[0].score = 99],
  ['omitted required field', d => delete d.content.propositions[0].population],
  ['ambiguous null', d => d.content.propositions[0].population = null],
  ['unproved absence', d => d.content.propositions[0].population = {state:'absent', reason:'none', evidenceRefs:[]}],
  ['spokesperson without mandate proof', d => d.content.propositions[0].attribution.kind = 'mandated_spokesperson'],
  ['missing speaker reference', d => d.content.citations[0].speakerRef.id = 'missing'],
  ['conditional claim without condition', d => d.content.propositions[0].conditions = {state:'unknown'}],
  ['no-measure coverage without corpus', d => d.content.coverage[0].sourceRefs = []],
  ['duplicate question link', d => d.content.propositions[0].questionRefs.push(d.content.propositions[0].questionRefs[0])],
  ['missing prior revision', d => {d.content.propositions[0].version = 2; d.content.propositions[0].change.previous = {id:'fiction.proposition.a', version:1};}],
  ['invented candidate status without proof', d => d.content.actors[0].candidateStatuses[0].status = 'declared'],
];
for (const [name, mutate] of invalidCases) test(`rejects ${name}`, () => {
  const data = fixture(); mutate(data);
  assert.throws(() => validatePrivate(data));
});

function partyFixture() {
  const d = fixture();
  d.content.actors.push({...structuredClone(d.content.actors[0]), id:'fiction.organization',kind:'organization',name:'Fictional Organization'});
  const organization = {id:'fiction.organization',version:1};
  d.content.sources[0].authorRef = organization;
  d.content.sources[0].support = 'party_program';
  d.content.citations[0].speakerRef = organization;
  return d;
}

test('rejects party-to-person attribution even when every actor exists', () => {
  const d = partyFixture();
  d.content.propositions[0].attribution.kind = 'organization';
  assert.throws(() => validatePrivate(d), /invalid_organization_attribution/);
});

test('organization positions remain attributed to the organization', () => {
  const d = partyFixture(); const p = d.content.propositions[0];
  p.authorRef = {id:'fiction.organization',version:1};
  p.attribution = {kind:'organization',attributedTo:p.authorRef,proofCitationRefs:[]};
  assert.equal(validatePrivate(d).content.propositions[0].authorRef.id, 'fiction.organization');
});

test('direct attribution cannot borrow another existing speaker', () => {
  assert.throws(() => validatePrivate(partyFixture()), /speaker_mismatch/);
});

test('unestablished attribution cannot assert a target', () => {
  const d = fixture(); d.content.propositions[0].attribution.kind = 'unestablished';
  assert.throws(() => validatePrivate(d), /unestablished_target/);
  d.content.propositions[0].attribution.attributedTo = null;
  assert.equal(validatePrivate(d).content.propositions[0].attribution.attributedTo, null);
});

test('mandated attribution requires a consistent author as well as proof', () => {
  const d = partyFixture(); const p = d.content.propositions[0];
  p.attribution = {kind:'mandated_spokesperson',attributedTo:{id:'fiction.organization',version:1},proofCitationRefs:p.citationRefs};
  assert.throws(() => validatePrivate(d), /attribution_author_mismatch/);
});

test('distinguishes unknown from evidence-backed absence', () => {
  const d = fixture();
  d.content.propositions[0].funding = {state:'absent', reason:'The fictional source explicitly excludes funding.', evidenceRefs:[{id:'fiction.citation.a',version:1}]};
  const value = validatePrivate(d).content.propositions[0];
  assert.equal(value.funding.state, 'absent');
  assert.equal(value.population.state, 'unknown');
});

test('withdrawal preserves the previous revision and its evidence', () => {
  const d = fixture(); const old = d.content.propositions[0];
  d.content.propositions.push({...structuredClone(old), version:2, availability:'withdrawn', editorialState:'withdrawn', change:{kind:'withdrawal',previous:{id:old.id,version:1},date:'2026-02-01',description:'Fictional withdrawal'}});
  const parsed = validatePrivate(d);
  assert.equal(parsed.content.propositions.length, 2);
  assert.deepEqual(parsed.content.propositions[0], old);
  assert.equal(parsed.content.citations.length, 1);
});
