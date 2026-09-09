import { mkdirSync, writeFileSync } from 'node:fs';
import { siteFixture } from '../tests/helpers/site-fixtures.ts';
mkdirSync('.site-fixtures',{recursive:true});
for (const [name,extended] of [['demo-base',false],['demo-extended',true]] as const) {
  writeFileSync(`.site-fixtures/${name}.json`,JSON.stringify(siteFixture(extended),null,2)+'\n');
}
console.log('Prepared sanitized fictional fixtures for local tests only.');
