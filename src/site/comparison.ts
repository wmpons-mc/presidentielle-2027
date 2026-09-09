import type { PublicDataset, Ref } from '../content/schemas.ts';
import type { Catalog } from './catalog.ts';
export type Proposition = PublicDataset['content']['propositions'][number];
export const sameRevision = (a:Ref,b:Ref) => a.id===b.id && a.version===b.version;
export function isPersonalAnswer(p:Proposition) {
  return (p.nature==='measure' || p.nature==='objective') &&
    (p.attribution.kind==='direct' || p.attribution.kind==='mandated_spokesperson') &&
    p.attribution.attributedTo !== null && sameRevision(p.authorRef,p.attribution.attributedTo);
}
function statements(catalog:Catalog,question:Ref,historical:boolean) {
  return (historical ? catalog.data.content : catalog.current).propositions
    .filter(p=>p.questionRefs.some(q=>sameRevision(q,question)))
    .sort((a,b)=>a.id.localeCompare(b.id,'en') || a.version-b.version);
}
export function comparisonRows(catalog:Catalog,question:Ref,historical=false) {
  const propositions=statements(catalog,question,historical).filter(isPersonalAnswer);
  const coverage=(historical ? catalog.data.content : catalog.current).coverage.filter(c=>sameRevision(c.questionRef,question));
  // Archives show the exact actors referenced by their public statements/coverage,
  // supplemented by current people to keep undocumented rows visible.
  const actors=new Map(catalog.current.actors.filter(a=>a.kind==='person').map(a=>[a.id,a]));
  if(historical) for(const ref of [...propositions.map(p=>p.authorRef),...coverage.map(c=>c.actorRef)]) {
    const actor=catalog.resolve('actors',ref);
    if(actor.kind==='person' && !actors.has(actor.id)) actors.set(actor.id,actor);
  }
  return [...actors.values()].sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}) || a.id.localeCompare(b.id,'en'))
    .map(actor=>({actor,propositions:propositions.filter(p=>p.authorRef.id===actor.id),coverage:coverage.filter(c=>c.actorRef.id===actor.id)}));
}
export function contextualStatements(catalog:Catalog,question:Ref,historical=false) {
  return statements(catalog,question,historical).filter(p=>!isPersonalAnswer(p));
}
