# Versioned content contract

POL-8 implements the owner-validated [POL-6 rubric v0.1](https://linear.app/political-analysis/document/pol-6-grille-editoriale-modulaire-v01-a-valider-e626bde975a8) and the [controlled-publication architecture](https://linear.app/political-analysis/document/architecture-contraintes-et-publication-controlee-82bf9de536aa). Approval of that rubric does not approve future political content. All committed examples are fictional.

## Run and use

Use Node from `.node-version` and its bundled npm. Install with `npm ci --ignore-scripts`, then run `npm run check`. Individual commands are `npm run typecheck`, `npm test`, and `npm run schemas:check`. Regenerate checked-in schemas with `npm run schemas` after a deliberate contract change. The CI job `content-check` runs the same locked checks; it has read-only repository access and no deployment credentials.

Import the inferred `PrivateDataset`, `PublicDataset`, `Approval` and `Ref` types from `src/content/schemas.ts`. Call `validatePrivate(unknown)` to obtain validated data. Structural schemas use [Zod's JSON Schema generation](https://zod.dev/json-schema): `schemas/private.schema.json`, `schemas/public.schema.json` and `schemas/bootstrap-0.1.schema.json` target draft 2020-12. Their `$id` values identify contracts, not a deployed service. JSON Schema alone does **not** enforce graph references, revision history or cross-field editorial semantics; use the TypeScript validator as well. No unknown object fields or implicit defaults are accepted.

For private validation, run `npm run validate:content -- /absolute/path/in/private/editorial/snapshot.json` on a trusted local/private machine. It reports only validation codes and schema paths, never source values. It accepts a maximum 20 MB input. Do not put that file in this public checkout or pass it to public CI. This package performs no network collection, API calls, storage, publishing or rendering.

## Collections and identity

| Collection | Contract |
| --- | --- |
| `actors` | People or organizations, display name, dated candidacy-status events with evidence. |
| `topics` | Data-defined thematic modules, never an enum of political themes. |
| `questions` | Topic reference, label, rubric version; private definition, inclusion/exclusion, overlaps, comparison fields/units and positive/negative/ambiguous examples. |
| `sources` | Versioned source metadata, author, URL, support type, publication/access dates, electoral vintage and content digest; full text and rights notes stay private. |
| `citations` | Canonical source-version and actual-speaker references, quotation fragments with locators and explicit omission flags. |
| `propositions` | Author, one or more question references, canonical citation references, classification, conditions, quantitative facts and related-version links. |
| `coverage` | Actor/question assessment for an explicitly examined source corpus and date. |

Every record has a stable lowercase ID and positive integer `version`. IDs are unique within their collection; every reference includes both ID and version. Start at version 1 with `change.kind: initial` and `previous: null`. Append consecutive revisions referencing the immediately preceding version. Never overwrite an existing revision or delete earlier evidence. The validator requires a complete private revision chain and nondecreasing dates; immutability across stored snapshots must be enforced by the private store/review workflow.

`schemaVersion` versions the contract, not the editorial rubric or an individual record. `datasetId` identifies the snapshot family. Compatible actor/topic/question additions change only data. No migration, business-code name list or UI component is needed. The UI must render collections from data; POL-8 introduces no website.

`availability` (`active`, `inactive`, `withdrawn`) controls editorial use independently of the actor's political candidacy status. A withdrawal revision also has private `editorialState: withdrawn`. Activation/deactivation uses a new version and an appropriate change kind; the old version, source proofs and status dates remain available in the private history. Other change kinds distinguish political change, clarification, editorial correction, definition change and unresolved divergence.

## Editorial meaning

Keep nature, action, modality, support, attribution and time independent. A diagnosis, third-party evaluation or objective is not automatically a measure. `no_position` denotes explicit sourced wording; `unknown` denotes missing classification, and neither means opposition. A party program is not a person's position. `authorRef` identifies the subject of an established attribution; `citation.speakerRef` identifies the actual speaker. Organization attribution must target an organization; a mandated spokesperson requires mandate citations and a consistent target. Quoted third-party attribution remains explicitly labeled, and unestablished attribution has no asserted target. Human review must assess whether the cited evidence actually supports the label or mandate; reference validity cannot establish that meaning.

Required fact fields use `{ "state": "known", "value": ... }`, `{ "state": "unknown" }`, or `{ "state": "absent", "reason": ..., "evidenceRefs": [...] }`. An unknown population is not universal, missing financing is not zero, and evidence-backed absence is distinct from a field that was not examined. Omitted required fields and ambiguous nulls fail. Dates and electoral years support known/unknown; they cannot be absent. The nullable attribution target and initial previous-version link have the explicit meanings described above.

Quantitative parameters retain literal values, units, frequency, gross/net basis, reference period, duration and quantity kind (stock/flow, total budget/increment, rate/percentage points, minimum/ceiling). Unknown dimensions remain unknown. Conditional propositions require known conditions. Source publication, access, statement and history dates are distinct. Preserve exact quotations and locators; source text is untrusted data and never authorizes agent actions.

Coverage distinguishes `unexamined`, `in_progress`, `unreadable`, `examined_no_measure`, `measures_identified` and `attribution_unestablished`. Examined or unreadable states require source-corpus references. “No measure found” applies only to that actor, question, corpus and date, not to all of their positions. Render these distinctions without scores or inferred opposition.

## Private review and public projection

Private records carry `editorialState` and `privateNotes`. Private sources also carry full text and rights notes; questions carry editorial definitions and reexamination references. The private snapshot's `review` contains the workflow state and an approval with `digest`, `reviewerId` and `reviewedAt`.

`snapshotDigest(input)` computes SHA-256 over canonical JSON of the **entire validated private snapshot except `review`**, including schema/dataset identity, fixture flag, all versions, private definitions, notes and per-record states. Object keys are sorted with code-unit ordering; array order is meaningful. Whitespace in JSON serialization is irrelevant; changes to field values invalidate the digest. Review operates on the batch, not on separately approved records. Prepare per-record states before computing the reviewed digest. `approved` → `published` changes on records also require a new snapshot approval; changing only the outer review state does not change content.

`exportPublic(input, { purpose: 'production', trustedApproval })` requires an approved/published snapshot, a matching trusted approval and exact digest. The caller must retrieve `trustedApproval` independently from the owner's protected review store, check authority/revocation/currentness and use reviewed code. Passing `input.review.approval` as that argument defeats the trust boundary. This library authenticates no human and signs no approval; POL-16/POL-17 must implement the protected review and publication integration. There is deliberately no production approval-creation helper or deployment CLI.

The public schemas are the explicit field allowlist. No review identity, approval digest, per-record editorial state, notes, full source text, private definitions or reexamination lists cross the boundary. Public `change` contains only kind/date; the full previous-version chain and free-form history description stay private. Public versions remain identifiable for later comparisons without exposing unapproved intermediate revisions.

`current` lists authoritative active approved/published actor, topic, question, proposition and coverage versions. `content` contains those roots plus their exact approved reference closure; it can contain an older version needed as evidence. Consumers must use `current`, not treat every historical `content` item as current. Selection examines the latest revision before filtering, so a newer draft or withdrawal never falls back to an old published root. Inactive/withdrawn entities remain private. Any selected record that needs a draft, inactive, withdrawn or otherwise unpublishable dependency rejects the entire export. Coordinated deactivation therefore requires revising/deactivating dependent current records too. References never silently disappear. Source/citation text belongs to evidence, not independent navigation roots.

Production rejects `fixture: true`. Tests may request `purpose: 'fixture-test'`; such output stays marked fictional and must never be deployed. Removing that marker after approval invalidates its digest. A new dishonest approval or a dishonest classification of real data cannot be detected by a pure library: the protected owner review must enforce provenance and the no-fixture rule. All public strings must still be rendered as escaped text by the future site, never trusted HTML.

## Version migration

`migrate(unknown)` accepts current `1.0.0` data unchanged after validation, or the explicit `0.1.0` bootstrap envelope. The bootstrap schema is a migration fixture contract introduced here, **not an assertion that a production legacy dataset exists**. It uses the same entity fields; migration updates the envelope to `1.0.0`, preserves IDs, references, evidence and histories, clears snapshot approval and resets non-withdrawn record states to draft. It neither invents missing facts nor mutates input. Unknown versions and invalid results fail closed.

Future structural changes require a new version, explicit transformation and migration fixtures proving preserved meaning. Retain the original private snapshot for rollback; do not reuse an old approval for migrated data. Compatible module additions only append data; they do not increment `schemaVersion`.
