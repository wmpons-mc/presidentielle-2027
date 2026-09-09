import { z } from 'zod';

export const text = z.string().min(1).max(20_000).regex(/\S/);
export const id = z.string().regex(/^[a-z][a-z0-9._-]{0,119}$/);
export const date = z.iso.date();
export const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const ref = z.strictObject({ id, version: z.int().positive() });
export type Ref = z.infer<typeof ref>;
const refs = z.array(ref).max(10_000);
const unknownValue = z.strictObject({ state: z.literal('unknown') });
export const fact = <T extends z.ZodType>(value: T) => z.union([
  z.strictObject({ state: z.literal('known'), value }), unknownValue,
  z.strictObject({ state: z.literal('absent'), reason: text, evidenceRefs: refs.min(1) }),
]);
export const dated = z.union([z.strictObject({ state: z.literal('known'), value: date }), unknownValue]);
const year = z.union([z.strictObject({ state: z.literal('known'), value: z.int().min(1900).max(9999) }), unknownValue]);
export const editorialState = z.enum(['draft', 'in_review', 'approved', 'published', 'withdrawn']);
export const availability = z.enum(['active', 'inactive', 'withdrawn']);
const change = z.strictObject({
  kind: z.enum(['initial', 'political_change', 'clarification', 'editorial_correction', 'withdrawal', 'unresolved_divergence', 'activation', 'deactivation', 'definition_change']),
  previous: ref.nullable(), date, description: text,
});
const base = { id, version: z.int().positive(), availability, change: change.pick({ kind: true, date: true }) };
const privateFields = { change, editorialState, privateNotes: z.string().max(20_000) };

export const actorPublic = z.strictObject({
  ...base, kind: z.enum(['person', 'organization']), name: text,
  candidateStatuses: z.array(z.strictObject({
    status: z.enum(['unknown', 'declared', 'nominated', 'primary', 'official', 'withdrawn', 'not_candidate']),
    date, evidenceRefs: refs,
  })).min(1),
});
export const topicPublic = z.strictObject({ ...base, label: text });
export const questionPublic = z.strictObject({ ...base, topicRef: ref, label: text, rubricVersion: text });
const definition = z.strictObject({
  meaning: text, includes: z.array(text).min(1), excludes: z.array(text).min(1),
  overlapRules: z.array(text).min(1), comparisonFields: z.array(text), units: z.array(text),
  examples: z.strictObject({ positive: z.array(text).min(1), negative: z.array(text).min(1), ambiguous: z.array(text).min(1) }),
});
export const sourcePublic = z.strictObject({
  ...base, authorRef: ref, url: z.url({ protocol: /^https?$/ }), title: text,
  support: z.enum(['campaign_program', 'party_program', 'personal_announcement', 'spokesperson_statement', 'discussion_document', 'historical_document']),
  publishedAt: dated, accessedAt: date, electionYear: year, contentDigest: digest,
});
export const citationPublic = z.strictObject({
  ...base, sourceRef: ref, speakerRef: ref,
  fragments: z.array(z.strictObject({
    text, locator: z.strictObject({ kind: z.enum(['page', 'section', 'paragraph', 'timestamp']), value: text }),
    omissionBefore: z.boolean(), omissionAfter: z.boolean(),
  })).min(1).max(100),
});
export const propositionPublic = z.strictObject({
  ...base, authorRef: ref, questionRefs: refs.min(1), citationRefs: refs.min(1), summary: text,
  nature: z.enum(['measure', 'objective', 'diagnosis', 'third_party_evaluation', 'undetermined']),
  action: z.enum(['propose', 'support', 'maintain', 'modify', 'repeal', 'reject', 'no_position', 'unknown']),
  modality: z.enum(['commitment', 'explicit_condition', 'under_study', 'illustrative_hypothesis', 'ambiguous']),
  attribution: z.strictObject({
    kind: z.enum(['direct', 'mandated_spokesperson', 'organization', 'quoted_third_party', 'unestablished']),
    attributedTo: ref.nullable(), proofCitationRefs: refs,
  }),
  statementDate: dated, rubricVersion: text,
  population: fact(text), territory: fact(text), conditions: fact(text), schedule: fact(text), funding: fact(text),
  parameters: z.array(z.strictObject({
    name: text, value: fact(text), unit: fact(text), frequency: fact(text),
    basis: fact(z.enum(['gross', 'net', 'not_applicable'])), referencePeriod: fact(text), duration: fact(text),
    quantityKind: fact(z.enum(['stock', 'flow', 'total_budget', 'increment', 'rate', 'percentage_points', 'minimum', 'ceiling', 'other'])),
  })),
  relatedPropositionRefs: refs,
});
export const coveragePublic = z.strictObject({
  ...base, actorRef: ref, questionRef: ref,
  state: z.enum(['unexamined', 'in_progress', 'unreadable', 'examined_no_measure', 'measures_identified', 'attribution_unestablished']),
  sourceRefs: refs, asOf: date, detail: text,
});

export const actor = actorPublic.extend(privateFields);
export const topic = topicPublic.extend(privateFields);
export const question = questionPublic.extend({ ...privateFields, definition, reexaminePropositionRefs: refs });
export const source = sourcePublic.extend({ ...privateFields, fullText: z.string().max(1_000_000), rightsNotes: z.string().max(20_000) });
export const citation = citationPublic.extend(privateFields);
export const proposition = propositionPublic.extend(privateFields);
export const coverage = coveragePublic.extend(privateFields);

export const content = z.strictObject({
  actors: z.array(actor).max(10_000), topics: z.array(topic).max(10_000), questions: z.array(question).max(10_000),
  sources: z.array(source).max(10_000), citations: z.array(citation).max(10_000),
  propositions: z.array(proposition).max(10_000), coverage: z.array(coverage).max(10_000),
});
export const approval = z.strictObject({ digest, reviewerId: id, reviewedAt: z.iso.datetime() });
export const review = z.strictObject({ state: editorialState, approval: approval.nullable() });
const datasetFields = { datasetId: id, fixture: z.boolean(), content, review, privateNotes: z.string().max(20_000) };
export const privateDatasetSchema = z.strictObject({ schemaVersion: z.literal('1.0.0'), ...datasetFields });
// Explicit bootstrap input contract. Migration changes the envelope version and invalidates approval.
export const legacyDatasetSchema = z.strictObject({ schemaVersion: z.literal('0.1.0'), ...datasetFields });
export const publicDatasetSchema = z.strictObject({
  schemaVersion: z.literal('1.0.0'), datasetId: id, fixture: z.boolean(),
  current: z.strictObject({ actors: refs, topics: refs, questions: refs, propositions: refs, coverage: refs }),
  content: z.strictObject({
    actors: z.array(actorPublic), topics: z.array(topicPublic), questions: z.array(questionPublic),
    sources: z.array(sourcePublic), citations: z.array(citationPublic),
    propositions: z.array(propositionPublic), coverage: z.array(coveragePublic),
  }),
});
export type PrivateDataset = z.infer<typeof privateDatasetSchema>;
export type PublicDataset = z.infer<typeof publicDatasetSchema>;
export type Approval = z.infer<typeof approval>;
export type Collection = keyof PrivateDataset['content'];
