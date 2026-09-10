import { createHash } from 'node:crypto';
import { readFileSync,statSync } from 'node:fs';
import { publicationSchema } from '../content/publication-schema.ts';
import { createCatalog } from './catalog.ts';

/** This validates sanitized public data, not an owner's identity or approval. */
export function validatePublication(input:unknown,datasetBytes:string,allowFixtures=false) {
  const parsed=publicationSchema.safeParse(input);
  if(!parsed.success) throw new Error('invalid_publication');
  const publication=parsed.data;
  const catalog=createCatalog(JSON.parse(datasetBytes),allowFixtures);
  if(publication.state==='unavailable') {
    if(!allowFixtures && Object.values(catalog.data.content).some(records=>records.length)) throw new Error('missing_public_method');
    return publication;
  }
  if(publication.fixture && !allowFixtures || publication.fixture!==catalog.data.fixture) throw new Error('publication_fixture_mismatch');
  if(createHash('sha256').update(datasetBytes,'utf8').digest('hex')!==publication.datasetSha256) throw new Error('publication_dataset_mismatch');
  const correctionIds=new Set<string>();
  for(const correction of publication.corrections) {
    if(correctionIds.has(correction.id)) throw new Error('duplicate_correction');
    correctionIds.add(correction.id);
    try {
      catalog.resolve(correction.collection,correction.before);
      const after=catalog.resolve(correction.collection,correction.after);
      if(correction.before.id!==correction.after.id || correction.before.version>=correction.after.version || after.change.kind!=='editorial_correction') throw new Error();
      if(Date.parse(correction.publishedAt)<Date.parse(after.change.date)) throw new Error();
    } catch {throw new Error('invalid_correction_reference');}
    if(publication.lastPublication.state!=='known' || Date.parse(correction.publishedAt)>Date.parse(publication.lastPublication.value)) throw new Error('invalid_correction_date');
  }
  return publication;
}

export function loadPublication() {
  const mode=process.env.SITE_MODE ?? 'production';
  if(!['production','demo-base','demo-extended'].includes(mode)) throw new Error('invalid_site_mode');
  const demo=mode!=='production';
  const datasetPath=demo ? `.site-fixtures/${mode}.json` : 'data/public.json';
  const publicationPath=demo ? `.site-fixtures/${mode}-publication.json` : 'data/publication.json';
  try {
    if(statSync(datasetPath).size>20_000_000 || statSync(publicationPath).size>2_000_000) throw new Error();
    return validatePublication(JSON.parse(readFileSync(publicationPath,'utf8')),readFileSync(datasetPath,'utf8'),demo);
  } catch {
    throw new Error('Public publication metadata validation failed. Check the sanitized files locally.');
  }
}
