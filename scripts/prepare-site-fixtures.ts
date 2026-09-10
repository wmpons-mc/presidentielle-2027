import { mkdirSync, writeFileSync } from 'node:fs';
import { siteFixture } from '../tests/helpers/site-fixtures.ts';
import { publicationFixture } from '../tests/helpers/publication-fixtures.ts';
mkdirSync('.site-fixtures',{recursive:true});
for (const [name,extended] of [['demo-base',false],['demo-extended',true]] as const) {
  const bytes=JSON.stringify(siteFixture(extended,true),null,2)+'\n';
  writeFileSync(`.site-fixtures/${name}.json`,bytes);
  writeFileSync(`.site-fixtures/${name}-publication.json`,JSON.stringify(publicationFixture(bytes),null,2)+'\n');
}
console.log('Prepared sanitized fictional fixtures for local tests only.');
