import type { Ref } from '../content/schemas.ts';
import type { Catalog,RouteCollection } from './catalog.ts';
export function relatedContent(catalog:Catalog,collection:RouteCollection,record:Ref,historical:boolean) {
  const matches=(ref:Ref)=>ref.id===record.id && (collection==='actors' && !historical || ref.version===record.version);
  const records=historical ? catalog.data.content : catalog.current;
  return {
    coverage:records.coverage.filter(c=>collection==='actors' ? matches(c.actorRef) : collection==='questions' && matches(c.questionRef)),
    propositions:records.propositions.filter(p=>collection==='actors' ? matches(p.authorRef) : collection==='questions' && p.questionRefs.some(matches)),
    questions:collection==='topics' ? records.questions.filter(q=>q.topicRef.id===record.id && (!historical || q.topicRef.version===record.version)) : [],
  };
}
