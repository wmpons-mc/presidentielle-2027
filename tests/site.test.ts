import test from 'node:test';
import assert from 'node:assert/strict';
import { siteFixture } from './helpers/site-fixtures.ts';
import { createCatalog, recordPath } from '../src/site/catalog.ts';

test('production rejects fixtures and private-schema fields', () => {
  assert.throws(() => createCatalog(siteFixture()), /fixture/);
  const input:any = siteFixture(); input.fixture = false; input.privateNotes = 'PRIVATE SENTINEL';
  assert.throws(() => createCatalog(input), /invalid_public/);
});
test('broken public references fail before rendering', () => {
  const input = siteFixture(); input.content.questions[0].topicRef.id = 'missing';
  assert.throws(() => createCatalog(input, true), /broken_public_reference/);
});
test('unactivated public records and duplicate revisions fail closed', () => {
  const input = siteFixture(); input.content.topics[0].availability = 'inactive';
  assert.throws(() => createCatalog(input, true), /inactive_public_record/);
  const duplicate = siteFixture(); duplicate.content.topics.push(duplicate.content.topics[0]);
  assert.throws(() => createCatalog(duplicate, true), /duplicate_public_revision/);
});
test('data-only extension adds indexes while retaining old stable URLs', () => {
  const base = createCatalog(siteFixture(), true); const extended = createCatalog(siteFixture(true), true);
  assert.equal(extended.current.actors.length, 2); assert.equal(extended.current.topics.length, 4);
  for (const item of base.current.questions) assert.ok(extended.current.questions.some(q => recordPath('questions',q) === recordPath('questions',item)));
  const renamed = {...base.current.actors[0],name:'New fictional label',version:2};
  assert.equal(recordPath('actors',renamed),recordPath('actors',base.current.actors[0]));
  assert.equal(recordPath('actors',renamed,true),'/candidats/fiction.actor.a/versions/2/');
});
test('historical records resolve but never become current index entries', () => {
  const input = siteFixture(); const old = input.content.actors[0];
  input.content.actors.push({...old,version:2,name:'Revised fictional label'});
  input.current.actors = [{id:old.id,version:2}];
  const catalog = createCatalog(input,true);
  assert.equal(catalog.current.actors.length,1);
  assert.equal(catalog.current.actors[0].version,2);
  assert.equal(catalog.resolve('actors',{id:old.id,version:1}).name,old.name);
});
