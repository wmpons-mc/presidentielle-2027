import type { PublicDataset } from '../content/schemas.ts';
export const coverageLabels: Record<PublicDataset['content']['coverage'][number]['state'],string> = {
  unexamined:'Sources non encore examinées', in_progress:'Examen des sources en cours',
  unreadable:'Source non exploitable', examined_no_measure:'Aucune mesure trouvée dans les sources examinées',
  measures_identified:'Propositions repérées dans les sources examinées', attribution_unestablished:'Attribution non établie',
};
export const candidacyLabels: Record<PublicDataset['content']['actors'][number]['candidateStatuses'][number]['status'],string> = {
  unknown:'Statut de candidature non établi',declared:'Candidature déclarée',nominated:'Personnalité investie',
  primary:'Participation à une primaire',official:'Candidature officielle',withdrawn:'Candidature retirée',not_candidate:'Non-candidature établie',
};
