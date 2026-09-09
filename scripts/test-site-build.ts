import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import './prepare-site-fixtures.ts';

function build(mode:string) {
  const result = spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{encoding:'utf8',env:{...process.env,SITE_MODE:mode,ASTRO_TELEMETRY_DISABLED:'1'}});
  if(result.status !== 0) throw new Error(`Build failed for ${mode}: ${result.stderr}`);
  const dir = mode === 'production' ? 'dist' : 'dist-demo';
  const files = readdirSync(dir,{recursive:true}).filter((p):p is string => typeof p === 'string' && p.endsWith('.html'));
  assert.ok(files.includes('questions/index.html'),'Questions route must exist');
  for (const file of files) {
    const html = readFileSync(join(dir,file),'utf8');
    assert.match(html,/<html lang="fr"/);
    assert.ok(!/<script\b/i.test(html),'Static pages must not ship browser scripts');
    assert.ok(!/PRIVATE|privateNotes|reviewerId|rightsNotes|fullText|reexaminePropositionRefs/.test(html),'No private fields or source text');
    assert.ok(!/role="tab"/.test(html),'No unavailable analysis tabs');
    if(mode !== 'production') assert.match(html,/Données entièrement fictives/);
    else assert.ok(!/fiction\.|Fictional|Données entièrement fictives/.test(html),'No production fixtures');
    for (const [,href] of html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const pathname=decodeURIComponent(href);
      const target=join(dir,pathname.endsWith('/') ? pathname+'index.html' : pathname);
      assert.ok(existsSync(target),`Broken link ${href} in ${file}`);
    }
  }
  return {dir,files};
}
const base = build('demo-base');
assert.ok(base.files.includes('candidats/fiction.actor.a/index.html'));
const extended = build('demo-extended');
for(const file of base.files) assert.ok(extended.files.includes(file),`Lost old route: ${file}`);
for(const file of ['candidats/fiction.actor.b/index.html','themes/fiction.topic.4/index.html','questions/fiction.question.4/index.html']) assert.ok(extended.files.includes(file));
assert.match(readFileSync('dist-demo/candidats/index.html','utf8'),/fiction.actor.b/);
assert.match(readFileSync('dist-demo/index.html','utf8'),/fiction.topic.4/);
assert.match(readFileSync('dist-demo/questions/fiction.question.3/index.html','utf8'),/Aucune proposition documentée/);
const production = build('production');
const html=readFileSync('dist/index.html');
const cssPaths=[...html.toString().matchAll(/href="([^\"]+\.css)"/g)].map(m => join('dist',m[1]));
const css=cssPaths.map(p => readFileSync(p));
assert.ok(css.length>0,'Measure the actual stylesheet');
const raw=html.length+css.reduce((s,b)=>s+b.length,0);
const gzip=gzipSync(html).length+css.reduce((s,b)=>s+gzipSync(b).length,0);
assert.ok(raw < 50_000,'Initial HTML + CSS budget: 50 kB raw');
assert.ok(readdirSync('dist',{recursive:true}).every(p=>!String(p).endsWith('.js')),'No browser JS assets');
console.log(JSON.stringify({basePages:base.files.length,extendedPages:extended.files.length,productionPages:production.files.length,initialHtmlBytes:html.length,initialCssBytes:css.reduce((s,b)=>s+b.length,0),initialTotalBytes:raw,initialGzipBytes:gzip,browserJavaScriptBytes:0},null,2));
