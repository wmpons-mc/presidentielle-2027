import { createHash } from 'node:crypto';
import type { AvailablePublication } from '../../src/content/publication-schema.ts';

/** Fictional interface fixtures only; never actual editorial copy or approvals. */
export function publicationFixture(datasetBytes:string):AvailablePublication {
  const section=(title:string,paragraph:string)=>({title,paragraphs:[paragraph]});
  return {
    schemaVersion:'1.0.0',state:'available',fixture:true,
    datasetSha256:createHash('sha256').update(datasetBytes,'utf8').digest('hex'),
    method:{version:'fiction.method.1',
      definitions:section('Définitions fictives','Fictional definitions for interface testing only.'),
      sources:section('Sélection fictive des sources','Fictional source selection for interface testing only.'),
      limits:section('Limites fictives','Fictional limitations; no claim about real coverage.'),
      workflow:section('Étapes fictives','Fictional human and automatic steps; no actual workflow is asserted.'),
      references:[{title:'Fictional reference',url:'https://example.org/fiction/method'}],
    },
    responsibility:section('Responsabilité fictive','Fictional Editor — no real person or approval.'),
    funding:section('Financement fictif','Fictional funding only; not a statement about this project.'),
    lastSuccessfulCollection:{state:'known',value:'2026-01-04T09:00:00Z'},
    collectionScope:'Fictional source registry; this is not exhaustive collection.',
    lastPublication:{state:'known',value:'2026-01-05T12:00:00Z'},
    corrections:[{id:'fiction.correction.1',kind:'editorial_correction',publishedAt:'2026-01-05T12:00:00Z',
      summary:'Fictional wording correction; the conditional amount remains unchanged.',
      collection:'propositions',before:{id:'fiction.proposition.a',version:1},after:{id:'fiction.proposition.a',version:2}}],
  };
}
