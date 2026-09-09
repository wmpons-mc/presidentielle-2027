import { readFileSync, statSync } from 'node:fs';
import { ContentError, validatePrivate } from '../src/content/validate.ts';

try {
  const path = process.argv[2];
  if (!path || process.argv.length !== 3) throw new ContentError('usage', 'npm run validate:content -- /absolute/private/snapshot.json');
  if (statSync(path).size > 20_000_000) throw new ContentError('input_too_large', 'file');
  validatePrivate(JSON.parse(readFileSync(path, 'utf8')));
  console.log('Private content is structurally and semantically valid. This is not publication approval.');
} catch (error) {
  // Never print JSON parser excerpts, filesystem errors or private source values.
  console.error(error instanceof ContentError ? error.message : 'Unable to read valid JSON content.');
  process.exitCode = 1;
}
