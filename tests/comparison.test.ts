import test from 'node:test';
import assert from 'node:assert/strict';
import { siteFixture } from './helpers/site-fixtures.ts';
import { createCatalog } from '../src/site/catalog.ts';
import { comparisonRows, contextualStatements } from '../src/site/comparison.ts';
import { readSelection, selectionQuery } from '../src/site/selection.ts';
import { sitePages } from '../src/site/pages.ts';

test('all active people receive a row, including missing evidence, in stable name order', () => {
  const data = siteFixture(true);
  data.content.actors[0].name = 'Zulu'; data.content.actors[1].name = 'Alpha';
  const catalog = createCatalog(data,true);
  const rows = comparisonRows(catalog,catalog.current.questions[0]);
  assert.deepEqual(rows.map(r => r.actor.name),['Alpha','Zulu']);
  assert.equal(rows[0].propositions.length,0);
  assert.equal(rows[0].coverage.length,0);
  assert.equal(rows[1].propositions.length,1);
});
test('uncertain attribution and diagnoses never become personal answers', () => {
  for (const scenario of ['unestablished','diagnosis'] as const) {
    const data=siteFixture(); const p=data.content.propositions[0];
    if(scenario==='unestablished') p.attribution={kind:scenario,attributedTo:null,proofCitationRefs:[]};
    else p.nature=scenario;
    const catalog=createCatalog(data,true); const q=catalog.current.questions[0];
    assert.equal(comparisonRows(catalog,q)[0].propositions.length,0);
    assert.equal(contextualStatements(catalog,q).length,1);
  }
});
test('removing current scope retains explicitly supplied versioned references only', () => {
  const data=siteFixture(true); data.current.actors=data.current.actors.filter(r=>r.id!=='fiction.actor.b');
  const catalog=createCatalog(data,true);
  assert.equal(comparisonRows(catalog,catalog.current.questions[3]).length,1);
  assert.equal(catalog.resolve('actors',{id:'fiction.actor.b',version:1}).name,'Fictional Person B');
});
test('URL selection distinguishes all, none and unavailable IDs, and round trips safely', () => {
  const ids=['a','b'];
  assert.deepEqual(readSelection(new URLSearchParams(),ids),{ids,unavailable:[]});
  assert.deepEqual(readSelection(new URLSearchParams('candidate='),ids),{ids:[],unavailable:[]});
  assert.deepEqual(readSelection(new URLSearchParams('candidate=b&candidate=old&candidate=b'),ids),{ids:['b'],unavailable:['old']});
  assert.deepEqual(readSelection(new URLSearchParams(selectionQuery(['b'])),ids).ids,['b']);
  assert.deepEqual(readSelection(new URLSearchParams(selectionQuery([])),ids).ids,[]);
});
test('current comparison deduplicates revisions and archive preserves explicitly related history', () => {
  const catalog=createCatalog(siteFixture(true,true),true);
  const q=catalog.current.questions[0];
  const current=comparisonRows(catalog,q)[0].propositions.filter(p=>p.id==='fiction.proposition.a');
  assert.deepEqual(current.map(p=>p.version),[2]);
  assert.deepEqual(comparisonRows(catalog,q,true)[0].propositions.filter(p=>p.id==='fiction.proposition.a').map(p=>p.version),[1,2]);
  assert.equal(comparisonRows(catalog,q).length,7);
  assert.equal(contextualStatements(catalog,q).length,2);
});
test('new question definitions do not require route or component changes beyond nine questions', () => {
  const data=siteFixture(true);
  for(let i=5;i<=12;i++) {
    const question={...data.content.questions[0],id:`fiction.question.${i}`,label:`Fictional question ${i}`};
    data.content.questions.push(question); data.current.questions.push({id:question.id,version:1});
  }
  const catalog=createCatalog(data,true);
  assert.equal(catalog.current.questions.length,12);
  assert.ok(sitePages(catalog).some(page=>page.path==='questions/fiction.question.12'));
  assert.ok(comparisonRows(catalog,catalog.current.questions.at(-1)!).every(row=>row.propositions.length===0));
});
