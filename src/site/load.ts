import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCatalog } from './catalog.ts';

export function loadCatalog() {
  const mode = process.env.SITE_MODE ?? 'production';
  if (!['production','demo-base','demo-extended'].includes(mode)) throw new Error('invalid_site_mode');
  const demo = mode !== 'production';
  const path = resolve(demo ? `.site-fixtures/${mode}.json` : 'data/public.json');
  try {
    if (statSync(path).size > 20_000_000) throw new Error();
    return createCatalog(JSON.parse(readFileSync(path,'utf8')),demo);
  } catch {
    // Do not expose file paths, parser excerpts, source values or private fields in build logs.
    throw new Error('Public content validation failed. Check the sanitized dataset locally.');
  }
}
