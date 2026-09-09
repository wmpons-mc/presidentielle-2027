# POL-8 content contract design

Implement the versioned data contract from POL-8 and the owner-validated POL-6 v0.1 rubric. The reference documents stay in Linear; no real political examples, review records or private content are copied to this repository.

## Architecture

Use Zod as the single structural schema definition, infer TypeScript types, and generate JSON Schema 2020-12. Keep semantic reference/date/history validation separate from structural schemas. Use Node 24 built-in TypeScript execution and test runner; no web framework is introduced.

All entities use stable IDs and integer revisions. Version references are explicit pairs. Actors (people or organizations), topics, questions, source versions, citations, propositions and coverage are data collections. Editorial definitions are private question configuration, with inclusion/exclusion, comparison fields/units, overlap rules and examples. No hard-coded candidate or topic lists.

Private content carries per-record editorial state and notes, separately from public fields. A private snapshot review records the owner identity, timestamp and SHA-256 digest. The exporter requires a matching trusted approval supplied by the caller outside untrusted content. The digest covers the full content snapshot including dependency versions, definitions and per-record states. Approval is batch-wide in this foundational contract; the trusted human review/authentication and deployment workflow belongs to POL-16/POL-17. No helper fabricates a human approval.

Public export explicitly selects fields and only approved/published, active current records plus eligible referenced historical evidence. The public `current` index distinguishes active records from historical reference closure entries. Full history links/descriptions stay private; public change metadata is kind/date only. Reject incomplete reference closures. Never export private definitions, review metadata, notes or full source text. Production exports reject fixture datasets; tests explicitly request fixture-test output.

## Semantics

Keep nature, action, modality, support, attribution and time independent. Coverage is person/question/corpus-specific and separates unexamined, unreadable and examined-with-no-measure. Unknown values use tagged unions; explicit absence differs from unknown, omitted required fields and unknown object keys are rejected. Preserve source dates, locators, quotation fragments, quantitative units and conditions. Candidate political status is independent of editorial availability.

Preserve previous revisions and event links on modification/withdrawal. Migrate the documented 0.1.0 bootstrap contract to 1.0.0 explicitly and invalidate review. Adding compatible entities never requires schema migration.

## Validation

Tests cover structural and semantic failures, exact-version approval invalidation, private-field leakage, unsupported/malformed migrations, lifecycle history and canonical shared proofs. JSON fixtures demonstrate a fourth fictional topic and another fictional candidate using data additions only. CI runs locked install, typecheck, tests and generated-schema freshness. No production content, external API calls or deployment.
