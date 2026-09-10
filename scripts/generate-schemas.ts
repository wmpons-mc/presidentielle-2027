import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { privateDatasetSchema, publicDatasetSchema, legacyDatasetSchema } from '../src/content/schemas.ts';
import { publicationSchema } from '../src/content/publication-schema.ts';

const check = process.argv.includes('--check');
for (const [name, schema] of Object.entries({ private: privateDatasetSchema, public: publicDatasetSchema, 'bootstrap-0.1': legacyDatasetSchema, publication:publicationSchema })) {
  const document = z.toJSONSchema(schema, { target: 'draft-2020-12', reused: 'ref' });
  const output = JSON.stringify({ ...document, $id: `https://wmpons-mc.github.io/presidentielle-2027/schemas/${name}.schema.json` }, null, 2) + '\n';
  const path = new URL(`../schemas/${name}.schema.json`, import.meta.url);
  if (check) {
    if (readFileSync(path, 'utf8') !== output) throw new Error(`Stale ${name} schema; run npm run schemas`);
  } else writeFileSync(path, output);
}
console.log(check ? 'Generated schemas are current.' : 'Generated structural schemas. Semantic validation remains required.');
