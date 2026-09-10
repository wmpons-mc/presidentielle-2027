# Method and publication metadata (POL-11)

The site consumes two sanitized public inputs: the existing POL-8
`data/public.json` and the new `data/publication.json`. The latter describes method
copy, responsibility/funding, collection/publication observations and explicitly
published correction notices. It never contains drafts, review identities,
approval records, visitor reports or internal correction discussions.

## Contract and boundaries

`src/content/publication-schema.ts` and `schemas/publication.schema.json` define
the strict companion contract. `validatePublication` also verifies the SHA-256 of
the exact UTF-8 bytes of the public dataset, including formatting and trailing
newline. Editing either input requires the publication process to revalidate the
pair. Dataset formatting changes require a new `datasetSha256` value.

- `state: unavailable` has no copy, dates or correction fields. Production allows
  it only while all content collections are empty, including historical records.
- `state: available` requires method version, four named sections (definitions,
  sources, limits, workflow), responsibility, funding and explicit date states.
  Each section is plain text; markup is escaped by Astro. References use HTTP(S).
- Fixture flags must match the dataset and cannot enter production. Missing files,
  invalid fields, mismatched snapshots and broken correction references stop the
  build with a generic error, without echoing source text or parser excerpts.
- Current production deliberately uses `unavailable`. The actual French draft
  belongs in the private editorial repository for exact-version owner review.
  Public tests contain fictional copy only. Never point a public build at a draft.

This is structural validation, not proof of approval. An `available` flag or a
matching hash cannot authenticate a reviewer or make a factual assertion true.
The protected POL-16/POL-17 process must obtain owner approval for the exact copy
and correction notices before exporting them. No script here copies private
drafts to public files or creates an approval. Existing public content schema 1.0.0
and its private approval semantics remain unchanged.

## Dates and correction events

`lastSuccessfulCollection` and `lastPublication` are independently supplied UTC
timestamps or explicit `unknown` values. The former also requires `collectionScope`
to name the bounded source set represented by the observation. A success does not
mean all possible sources were collected. The latter records the last confirmed
public release, not an attempted deployment, Git commit or build time. Failed runs
must not advance either timestamp. The future pipeline must carry confirmed events
into an authorized publication; this UI does not create operational timestamps.

Neither date is inferred from a source's publication/access time, a proposition's
statement date, a record's change date, or a coverage examination date. Unknown
values stay unknown. They are displayed separately on every page.

Correction notices have a stable ID, explicit publication timestamp, sanitized
summary, collection and exact before/after references. Only editorial corrections
enter this journal. The references must share an identity, advance the revision,
resolve in the public snapshot, and end at an editorial-correction revision. A
notice cannot predate that revision or postdate the last confirmed publication.
Duplicate notice IDs fail validation. A change record alone never creates a notice.
Political changes and unresolved divergences remain in POL-10 version details.
Notices whose historical targets cannot legally remain public cannot be emitted
with broken links; resolve that in the private publication review, without restoring
withdrawn material. The journal does not claim a complete history or absence of errors.

## Coverage and routes

`/methode/` renders approved sections and links to `/couverture/` and `/corrections/`.
The coverage register derives every current question/person pair from the same
catalog and ordering as POL-10. The shared `CoverageDetails` component displays
source revisions, examination dates and explicit missing rows. It calculates no
completeness percentage or political score. Adding a candidate/theme changes data,
not coverage components. Historical correction links use existing version routes.

## Validation and owner handoff

Run `npm run check`, `npm run test:site` and `npm run test:browser`. The demo fixture
helper binds fictional companion files to the base/extended snapshots. The scope
removal integration test regenerates that binding and checks historical links.
Browser cases exercise method → coverage → corrections → before/after proof at
375/1280 px, including keyboard navigation and distinct collection/publication dates.

Before launch, the owner must review the private French draft's exact version and
confirm the public editorial identity and actual funding. Do not infer funding from
account tiers or a budget ceiling. A code PR is reviewable independently; merging it
does not approve, publish or deploy the private texts. No purchase is required.
