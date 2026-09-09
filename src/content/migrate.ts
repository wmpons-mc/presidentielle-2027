import { legacyDatasetSchema } from './schemas.ts';
import type { PrivateDataset } from './schemas.ts';
import { ContentError, validatePrivate } from './validate.ts';

/** Explicit bootstrap migration; no political meaning or missing evidence is inferred. */
export function migrate(input: unknown): PrivateDataset {
  const version = input !== null && typeof input === 'object' && 'schemaVersion' in input ? input.schemaVersion : undefined;
  if (version === '1.0.0') return validatePrivate(input);
  if (version !== '0.1.0') throw new ContentError('unsupported_schema_version', 'schemaVersion');
  const parsed = legacyDatasetSchema.safeParse(input);
  if (!parsed.success) throw new ContentError('invalid_legacy_structure', parsed.error.issues[0].path.join('.'));
  const data = parsed.data;
  for (const records of Object.values(data.content)) for (const record of records) {
    if (record.editorialState !== 'withdrawn') record.editorialState = 'draft';
  }
  return validatePrivate({ ...data, schemaVersion: '1.0.0', review: { state: 'draft', approval: null } });
}
