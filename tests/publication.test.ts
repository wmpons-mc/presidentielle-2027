import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { siteFixture } from './helpers/site-fixtures.ts';
import { validatePublication,loadPublication } from '../src/site/publication.ts';
import { publicationFixture } from './helpers/publication-fixtures.ts';

test('publication metadata is tied to exact dataset bytes and rejects private fields',()=>{
  const data=siteFixture(true,true); const bytes=JSON.stringify(data);
  const input=publicationFixture(bytes);
  assert.equal(validatePublication(input,bytes,true).state,'available');
  assert.throws(()=>validatePublication(input,bytes+' ',true),/dataset_mismatch/);
  assert.throws(()=>validatePublication({...input,reviewerId:'private'},bytes,true),/invalid_publication/);
  assert.throws(()=>validatePublication(input,bytes,false),/fixture/);
});
test('unknown freshness is preserved, not inferred from propositions or build time',()=>{
  const bytes=JSON.stringify(siteFixture(true,true));
  const input=publicationFixture(bytes);
  input.lastSuccessfulCollection={state:'unknown'};
  const result=validatePublication(input,bytes,true);
  assert.equal(result.state,'available');
  if(result.state==='available') assert.deepEqual(result.lastSuccessfulCollection,{state:'unknown'});
});
test('corrections require real public before/after references and publication dates',()=>{
  const bytes=JSON.stringify(siteFixture(true,true));
  const input=publicationFixture(bytes);
  input.corrections[0].after.version=99;
  assert.throws(()=>validatePublication(input,bytes,true),/correction_reference/);
  const future=publicationFixture(bytes);future.corrections[0].publishedAt='2027-01-01T00:00:00Z';
  assert.throws(()=>validatePublication(future,bytes,true),/correction_date/);
});
test('empty production has explicit unavailable metadata; populated production requires it',()=>{
  const empty=siteFixture(); for(const records of Object.values(empty.content)) records.length=0;
  for(const refs of Object.values(empty.current)) refs.length=0;
  empty.fixture=false;
  assert.doesNotThrow(()=>validatePublication({schemaVersion:'1.0.0',state:'unavailable'},JSON.stringify(empty),false));
  const populated=siteFixture();populated.fixture=false;
  assert.throws(()=>validatePublication({schemaVersion:'1.0.0',state:'unavailable'},JSON.stringify(populated),false),/missing_public_method/);
});
test('missing funding/responsibility and draft envelopes cannot enter the public contract',()=>{
  const bytes=JSON.stringify(siteFixture(true,true));
  const input:any=publicationFixture(bytes);
  delete input.funding;
  assert.throws(()=>validatePublication(input,bytes,true),/invalid_publication/);
  assert.throws(()=>validatePublication({schemaVersion:'1.0.0',state:'draft'},bytes,true),/invalid_publication/);
  const empty=publicationFixture(bytes); empty.responsibility.paragraphs=[];
  assert.throws(()=>validatePublication(empty,bytes,true),/invalid_publication/);
});
test('record changes do not manufacture published correction notices',()=>{
  const bytes=JSON.stringify(siteFixture(true,true));
  const input=publicationFixture(bytes); input.corrections=[];input.lastPublication={state:'unknown'};
  const result=validatePublication(input,bytes,true);
  assert.equal(result.state,'available');
  if(result.state==='available') {assert.deepEqual(result.corrections,[]);assert.deepEqual(result.lastPublication,{state:'unknown'});}
});
test('publication loader errors never echo malformed private text',()=>{
  const root=mkdtempSync(join(tmpdir(),'pol11-loader-'));
  const cwd=process.cwd(); const mode=process.env.SITE_MODE;
  try {
    mkdirSync(join(root,'data'));process.chdir(root);delete process.env.SITE_MODE;
    writeFileSync('data/public.json',JSON.stringify({...siteFixture(),fixture:false}));
    writeFileSync('data/publication.json','{"PRIVATE EDITORIAL DRAFT');
    assert.throws(()=>loadPublication(),error=>error instanceof Error && error.message==='Public publication metadata validation failed. Check the sanitized files locally.');
  } finally {
    process.chdir(cwd); if(mode===undefined) delete process.env.SITE_MODE; else process.env.SITE_MODE=mode;
    rmSync(root,{recursive:true});
  }
});
