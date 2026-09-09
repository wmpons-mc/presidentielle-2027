import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCatalog } from '../src/site/load.ts';
import { siteFixture } from './helpers/site-fixtures.ts';

test('build input errors hide parser excerpts and fixtures cannot enter production',()=>{
  const cwd=process.cwd(); const mode=process.env.SITE_MODE;
  const root=mkdtempSync(join(tmpdir(),'pol9-loader-')); mkdirSync(join(root,'data'));
  try {
    process.chdir(root); delete process.env.SITE_MODE;
    for(const content of ['{"PRIVATE SOURCE SENTINEL"',JSON.stringify(siteFixture()),JSON.stringify({...siteFixture(),fixture:false,privateNotes:'PRIVATE SOURCE SENTINEL'})]) {
      writeFileSync('data/public.json',content);
      assert.throws(()=>loadCatalog(),error=>error instanceof Error && error.message === 'Public content validation failed. Check the sanitized dataset locally.');
    }
    process.env.SITE_MODE='unexpected';
    assert.throws(()=>loadCatalog(),/invalid_site_mode/);
  } finally {process.chdir(cwd);if(mode===undefined) delete process.env.SITE_MODE;else process.env.SITE_MODE=mode;}
});
