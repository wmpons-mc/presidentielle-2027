import { recordLabel, recordPath, routeCollections } from './catalog.ts';
import type { Catalog, RouteCollection } from './catalog.ts';
import type { PublicDataset } from '../content/schemas.ts';
export type RecordPage = {type:'record';path:string;title:string;collection:RouteCollection;record:PublicDataset['content'][RouteCollection][number];historical:boolean};
export type SitePage = RecordPage | {type:'index';path:string;title:string;collection:RouteCollection} | {type:'method'|'coverage'|'corrections';path:string;title:string};
export function sourceIndex(catalog:Catalog) {
  const versions = new Map<string,PublicDataset['content']['sources'][number]>();
  for (const source of catalog.data.content.sources) if (!versions.has(source.id) || versions.get(source.id)!.version < source.version) versions.set(source.id,source);
  return [...versions.values()];
}
export function sitePages(catalog:Catalog): SitePage[] {
  const titles = {actors:'Candidats',topics:'Thèmes',questions:'Questions',sources:'Sources',propositions:'Énoncés documentés'};
  const pages:SitePage[] = [{type:'method',path:'methode',title:'Méthode'},{type:'coverage',path:'couverture',title:'Couverture des sources'},{type:'corrections',path:'corrections',title:'Corrections publiées'}];
  for (const collection of Object.keys(routeCollections) as RouteCollection[]) {
    pages.push({type:'index',path:routeCollections[collection],title:titles[collection],collection});
    const current = collection === 'sources' ? sourceIndex(catalog) : catalog.current[collection];
    for (const record of current) pages.push({type:'record',collection,record,historical:false,title:recordLabel(record),path:recordPath(collection,record).slice(1,-1)});
    for (const record of catalog.data.content[collection]) pages.push({type:'record',collection,record,historical:true,title:recordLabel(record),path:recordPath(collection,record,true).slice(1,-1)});
  }
  return pages;
}
