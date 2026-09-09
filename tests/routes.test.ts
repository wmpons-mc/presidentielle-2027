import test from 'node:test';
import assert from 'node:assert/strict';
import { siteFixture } from './helpers/site-fixtures.ts';
import { createCatalog } from '../src/site/catalog.ts';
import { sitePages } from '../src/site/pages.ts';

test('every route and index extends from data while preserving previous routes', () => {
  const base = sitePages(createCatalog(siteFixture(),true));
  const extended = sitePages(createCatalog(siteFixture(true),true));
  const paths = extended.map(p => p.path);
  for (const p of base) assert.ok(paths.includes(p.path));
  assert.ok(paths.includes('candidats/fiction.actor.b'));
  assert.ok(paths.includes('themes/fiction.topic.4'));
  assert.ok(paths.includes('questions/fiction.question.4'));
  assert.ok(paths.includes('sources/fiction.source.b/versions/1'));
  assert.equal(new Set(paths).size,paths.length);
});

test('a candidate name/status revision retains documentation on the current identity page',async()=>{
  const {relatedContent}=await import('../src/site/relations.ts');
  const input=siteFixture();const old=input.content.actors[0];const revised={...old,version:2,name:'Updated fictional actor'};
  input.content.actors.push(revised);input.current.actors=[{id:old.id,version:2}];
  const catalog=createCatalog(input,true);
  assert.equal(relatedContent(catalog,'actors',revised,false).propositions.length,1);
  assert.equal(relatedContent(catalog,'actors',revised,false).coverage.length,1);
  assert.equal(relatedContent(catalog,'actors',revised,true).propositions.length,0);
  assert.equal(relatedContent(catalog,'actors',old,true).propositions.length,1);
});
