import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import './prepare-site-fixtures.ts';
import { publicationFixture } from '../tests/helpers/publication-fixtures.ts';

function build(mode:string) {
  const result = spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{encoding:'utf8',env:{...process.env,SITE_MODE:mode,ASTRO_TELEMETRY_DISABLED:'1'}});
  if(result.status !== 0) throw new Error(`Build failed for ${mode}: ${result.stderr}`);
  const dir = mode === 'production' ? 'dist' : 'dist-demo';
  const files = readdirSync(dir,{recursive:true}).filter((p):p is string => typeof p === 'string' && p.endsWith('.html'));
  assert.ok(files.includes('questions/index.html'),'Questions route must exist');
  for (const file of files) {
    const html = readFileSync(join(dir,file),'utf8');
    assert.match(html,/<html lang="fr"/);
    for(const [,src] of html.matchAll(/<script[^>]*src="([^"]+)"/g)) assert.ok(src.startsWith('/_astro/'),'Only bundled local enhancement scripts');
    assert.ok(!/PRIVATE|privateNotes|reviewerId|rightsNotes|fullText|reexaminePropositionRefs/.test(html),'No private fields or source text');
    assert.ok(!/role="tab"/.test(html),'No unavailable analysis tabs');
    if(mode !== 'production') assert.match(html,/Données entièrement fictives/);
    else assert.ok(!/fiction\.|Fictional|Données entièrement fictives/.test(html),'No production fixtures');
    for (const [,href] of html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const pathname=decodeURIComponent(href.split('?')[0]);
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
assert.match(readFileSync('dist-demo/questions/fiction.question.1/index.html','utf8'),/Contexte distinct/);
assert.match(readFileSync('dist-demo/propositions/fiction.proposition.a/versions/2/index.html','utf8'),/Correction éditoriale/);
assert.match(readFileSync('dist-demo/propositions/fiction.proposition.b/versions/1/index.html','utf8'),/https:\/\/example.org/);
assert.match(readFileSync('dist-demo/methode/index.html','utf8'),/Fictional definitions/);
assert.match(readFileSync('dist-demo/couverture/index.html','utf8'),/fiction.question.4/);
assert.match(readFileSync('dist-demo/couverture/index.html','utf8'),/data-coverage-actor="fiction.actor.b"/);
assert.match(readFileSync('dist-demo/corrections/index.html','utf8'),/Avant — version 1/);
// A published historical revision may remain referenced after leaving current scope.
// This is not permission to expose records marked inactive/withdrawn in the exporter.
const fixturePath='.site-fixtures/demo-extended.json';
const original=readFileSync(fixturePath,'utf8');
const publicationPath='.site-fixtures/demo-extended-publication.json';
const originalPublication=readFileSync(publicationPath,'utf8');
const scoped=JSON.parse(original);
for(const collection of ['actors','topics','questions','propositions']) scoped.current[collection]=scoped.current[collection].filter((r:{id:string})=>!['fiction.actor.b','fiction.topic.4','fiction.question.4','fiction.proposition.b'].includes(r.id));
writeFileSync(fixturePath,JSON.stringify(scoped));
writeFileSync(publicationPath,JSON.stringify(publicationFixture(JSON.stringify(scoped))));
const reduced=build('demo-extended');
assert.ok(!reduced.files.includes('questions/fiction.question.4/index.html'));
assert.ok(reduced.files.includes('questions/fiction.question.4/versions/1/index.html'));
assert.ok(reduced.files.includes('propositions/fiction.proposition.b/versions/1/index.html'));
assert.doesNotMatch(readFileSync('dist-demo/index.html','utf8'),/fiction.topic.4/);
assert.doesNotMatch(readFileSync('dist-demo/questions/fiction.question.1/index.html','utf8'),/data-actor="fiction.actor.b"/);
writeFileSync(fixturePath,original);
writeFileSync(publicationPath,originalPublication);
build('demo-extended');
const production = build('production');
assert.match(readFileSync('dist/methode/index.html','utf8'),/pol-11.fr.v0.2/);
assert.match(readFileSync('dist/methode/index.html','utf8'),/Atelier civique/);
assert.match(readFileSync('dist/index.html','utf8'),/Non renseignée/);
const html=readFileSync('dist/index.html');
const cssPaths=[...html.toString().matchAll(/href="([^\"]+\.css)"/g)].map(m => join('dist',m[1]));
const css=cssPaths.map(p => readFileSync(p));
assert.ok(css.length>0,'Measure the actual stylesheet');
const raw=html.length+css.reduce((s,b)=>s+b.length,0);
const gzip=gzipSync(html).length+css.reduce((s,b)=>s+gzipSync(b).length,0);
assert.ok(raw < 50_000,'Initial HTML + CSS budget: 50 kB raw');
const js=readdirSync('dist',{recursive:true}).filter(p=>String(p).endsWith('.js')).map(p=>readFileSync(join('dist',String(p))));
const jsBytes=js.reduce((sum,b)=>sum+b.length,0);
assert.ok(jsBytes<15_000,'All browser enhancement scripts: under 15 kB raw');
for(const script of js) assert.doesNotMatch(script.toString(),/PRIVATE|reviewerId|fullText|privateNotes/);
console.log(JSON.stringify({basePages:base.files.length,extendedPages:extended.files.length,productionPages:production.files.length,initialHtmlBytes:html.length,initialCssBytes:css.reduce((s,b)=>s+b.length,0),initialTotalBytes:raw,initialGzipBytes:gzip,browserJavaScriptBytes:jsBytes},null,2));
