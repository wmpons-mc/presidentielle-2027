import { publicDatasetSchema } from '../content/schemas.ts';
import type { PublicDataset, Ref } from '../content/schemas.ts';

type Collection = keyof PublicDataset['content'];
type Current = keyof PublicDataset['current'];
export type Catalog = ReturnType<typeof createCatalog>;
const key = (r: Ref) => `${r.id}@${r.version}`;
const referenceFields: Record<string, Collection> = {
  authorRef:'actors', speakerRef:'actors', actorRef:'actors', attributedTo:'actors',
  topicRef:'topics', questionRef:'questions', questionRefs:'questions',
  sourceRef:'sources', sourceRefs:'sources', citationRefs:'citations',
  proofCitationRefs:'citations', evidenceRefs:'citations', relatedPropositionRefs:'propositions',
};

export function createCatalog(input: unknown, allowFixtures = false) {
  const parsed = publicDatasetSchema.safeParse(input);
  if (!parsed.success) throw new Error('invalid_public_content');
  const data = parsed.data;
  if (data.fixture && !allowFixtures) throw new Error('fixture_not_publishable');
  const maps = new Map<Collection, Map<string, Ref>>();
  for (const name of Object.keys(data.content) as Collection[]) {
    const records = data.content[name];
    const map = new Map(records.map(r => [key(r),r]));
    if (map.size !== records.length) throw new Error('duplicate_public_revision');
    if (records.some(r => r.availability !== 'active')) throw new Error('inactive_public_record');
    maps.set(name,map);
  }
  function resolve<C extends Collection>(collection: C, ref: Ref): PublicDataset['content'][C][number] {
    const record = maps.get(collection)?.get(key(ref));
    if (!record) throw new Error('broken_public_reference');
    return record as PublicDataset['content'][C][number];
  }
  function check(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(check); return; }
    if (!value || typeof value !== 'object') return;
    for (const [field, item] of Object.entries(value)) {
      const collection = referenceFields[field];
      if (collection && item !== null) {
        for (const ref of Array.isArray(item) ? item : [item]) resolve(collection,ref);
      } else check(item);
    }
  }
  check(data.content);
  function currentRecords<C extends Current>(collection:C) {
    const refs = data.current[collection];
    if (new Set(refs.map(r => r.id)).size !== refs.length) throw new Error('duplicate_current_identity');
    return refs.map(r => resolve(collection,r));
  }
  const current = {
    actors:currentRecords('actors'), topics:currentRecords('topics'), questions:currentRecords('questions'),
    propositions:currentRecords('propositions'), coverage:currentRecords('coverage'),
  };
  return { data, current, resolve };
}

export const routeCollections = { actors:'candidats', topics:'themes', questions:'questions', sources:'sources' } as const;
export type RouteCollection = keyof typeof routeCollections;
export function recordPath(collection: RouteCollection, record: Ref, historical = false): string {
  return `/${routeCollections[collection]}/${record.id}/${historical ? `versions/${record.version}/` : ''}`;
}
export const recordLabel = (record: {name?: string;label?: string;title?: string}) => record.name ?? record.label ?? record.title ?? '';
