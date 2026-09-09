import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migrate } from '../src/content/migrate.ts';
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/base.json', import.meta.url), 'utf8'));

test('bootstrap migration preserves stable references and invalidates old approvals', () => {
  const data = fixture(); data.schemaVersion = '0.1.0';
  data.review = {state:'approved', approval:{digest:'a'.repeat(64),reviewerId:'fiction.reviewer',reviewedAt:'2026-02-01T12:00:00Z'}};
  data.content.propositions[0].editorialState = 'approved';
  const before = structuredClone(data);
  const result = migrate(data);
  assert.equal(result.schemaVersion, '1.0.0');
  assert.deepEqual(result.review, {state:'draft', approval:null});
  assert.equal(result.content.propositions[0].editorialState, 'draft');
  assert.deepEqual(result.content.propositions[0].citationRefs, before.content.propositions[0].citationRefs);
  assert.deepEqual(result.content.actors, before.content.actors);
  assert.deepEqual(data, before);
  assert.deepEqual(migrate(result), result);
});

test('unknown versions fail instead of guessing a migration', () => {
  const data = fixture(); data.schemaVersion = '2.0.0';
  assert.throws(() => migrate(data), /unsupported_schema_version/);
});

test('migration validates malformed references and dates', () => {
  const data = fixture(); data.schemaVersion = '0.1.0';
  data.content.sources[0].accessedAt = '2026-02-30';
  assert.throws(() => migrate(data));
  data.content.sources[0].accessedAt = '2026-02-01';
  data.content.citations[0].sourceRef.id = 'missing';
  assert.throws(() => migrate(data), /broken_reference/);
});
