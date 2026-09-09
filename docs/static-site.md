# Static site and extensible navigation

POL-9 adds an Astro static shell consuming the POL-8 public contract. The interface is French; implementation and contributor documentation are English. Questions, Candidats, Méthode and Sources are working routes within the Propositions area. POL-10 adds question comparison and source-backed proposition detail; full method/correction reporting remains POL-11.

## Local commands

Use Node from `.node-version` and run `npm ci --ignore-scripts`. Astro and its checker are pinned; TypeScript 6.0.3 is used because the checker supports TypeScript 5/6, not the TypeScript 7 initially used by POL-8. All POL-8 tests remain part of validation.

- `npm run dev`: local production-data development server at 127.0.0.1.
- `npm run check`: TypeScript, Astro diagnostics, content/site unit tests and generated-schema freshness.
- `npm run build`: production static files in `dist/`.
- `npm run preview`: serve `dist/` locally.
- `npm run build:demo`: prepare sanitized fictional fixtures and build the extended demonstration into `dist-demo/`.
- `npm run build:demo -- demo-base`: build the initial three-theme demonstration.
- `npm run test:site`: build both demos and production, verify all generated local links, retained routes, empty states, fixture boundaries and initial asset bytes.
- `npm exec -- playwright install chromium`: install the development-only browser once.
- `npm run test:browser`: run desktop/mobile keyboard and overflow checks against `dist-demo/` via a loopback-only test server. Run `test:site` first.

If Google Chrome is already installed locally, `PLAYWRIGHT_CHANNEL=chrome npm run test:browser` uses it instead; CI uses the Playwright-pinned Chromium. `tsc` checks all TypeScript including browser tooling, while `astro check --tsconfig tsconfig.astro.json` checks the site with Astro’s language service. Project Astro commands disable optional telemetry. There are no client frameworks, remote fonts, visitor tracking, AI calls or credentials in the site. Browser tooling is development-only. No command deploys the output. CI installs Chromium with its Linux dependencies and runs the same checks without publishing artifacts.

## Public input boundary

`data/public.json` is the only production content input. It starts empty, with explicit empty-state pages; this is not a political publication. Real source text, drafts, review identities and approval records never belong in this checkout. Only the exact approved, sanitized output of the private publication pipeline may replace this file.

`src/site/load.ts` loads at most 20 MB and reports a generic failure without JSON excerpts. `createCatalog` reuses `publicDatasetSchema`, rejects fixtures in production, unknown/private fields, duplicates, inactive records and broken public references, then resolves the authoritative `current` index. An invalid or missing input aborts the build; it is not silently treated as empty. The existing approved deployment should remain untouched when a future publication build fails.

These checks cannot authenticate an approval or detect a lie in a public field. POL-16/POL-17 must enforce the owner-reviewed exact version before it reaches the public repository. No private store or private-schema dataset is read by the website. Build logs and previews are not private editorial review tools.

## Add data, rebuild navigation

Follow [the agent guide](content-agent-guide.md) in the private editorial workspace. Add the actor, topic/question and evidence, obtain review and export the sanitized snapshot. Replace only the public input after publication is authorized, then rebuild. `sitePages`, the shared layout and generic record component derive pages, topic navigation and indexes from collections. No candidate/theme names, number limits or dedicated components are encoded in navigation.

Current person indexes use `current.actors`; organizations remain resolvable as source authors and are labeled as organizations, not asserted candidates. Topic/question indexes use their `current` arrays. Source indexes show the latest version present in the public reference closure, not a claim that no newer private/original source exists.

| Address | Meaning |
| --- | --- |
| `/questions/`, `/candidats/`, `/themes/`, `/sources/` | Generated indexes |
| `/methode/` | Introductory reading guidance and current scope |
| `/<collection>/<stable-id>/` | Current public record (or latest referenced source version) |
| `/<collection>/<stable-id>/versions/<integer>/` | Exact public revision |
| `/404.html` | Recovery page for missing addresses |

Labels can change without changing stable IDs or URLs. Historical records do not become current navigation entries. Routes are generated for exact revisions present in the sanitized public snapshot, including referenced older versions. The publication pipeline must retain permitted public revisions for their historical URLs to remain resolvable. POL-9 does not reconstruct deleted data, import private history or re-publish withdrawn content. Configure the eventual static host to return `404.html` with HTTP 404 for missing addresses; the test server exercises this behavior locally.

## Fictional demonstration and validation evidence

`tests/helpers/site-fixtures.ts` reads the wholly fictional POL-8 JSON files and uses a synthetic approval only in test memory to exercise the existing exporter. `scripts/prepare-site-fixtures.ts` writes sanitized demo inputs under `.site-fixtures/`; the website reads only those public-shaped results in explicit `demo-base` or `demo-extended` mode. No private-schema fixture is bundled into the site module graph. Demo mode always writes `dist-demo/`, shows a persistent fictional-data warning and emits noindex/nofollow metadata. Neither the banner nor noindex is a confidentiality boundary; only fictional data may enter this mode. Never deploy `dist-demo/`.

The integration test adds a seventh personality and fourth theme/question by the existing extension JSON, validates both builds, checks all old paths, verifies index visibility and scans generated HTML for private sentinels. Production output contains no fictional records. Initial payload measurements include homepage HTML and its actual CSS, both raw and independently gzip-compressed. They exclude HTTP headers and are not a field performance claim. A 50 kB raw budget catches accidental asset inflation.

Playwright checks the skip link, keyboard traversal to Questions, visible focus, current-page navigation, exact-version links, explicit empty coverage, 404 recovery, local-only requests and horizontal overflow at 375 px and 1280 px. These are observed automated browser checks, not human usability testing or a full accessibility audit.

POL-9 baseline validation on 2026-09-09: 56 Node cases and 3 Chrome keyboard/mobile cases passed; Astro reported zero diagnostics. Base/extended/production builds produced 23/31/7 pages with all local links resolving. Initial production homepage: 2,799 bytes HTML + 5,685 bytes CSS = 8,484 bytes raw; 3,030 bytes combined gzip; zero browser JavaScript. Desktop and mobile screenshots were inspected locally.

## Comparison (POL-10)

`comparisonRows` renders every current person, sorted by French name and stable ID,
including rows without a documented response or coverage. Direct or mandated
personal measures/objectives are distinct from contextual statements. The latter
retain their nature and attribution labels and never enter personal answer rows.
Each row reports coverage for that exact question revision, with source corpus and
date where supplied. Missing coverage does not assert that sources were examined.

`PropositionSummary` displays nature, action, modality, attribution, beneficiaries,
conditions, statement date and source type/date/vintage. Its detail link opens an
exact proposition revision. `PropositionDetails`, `FactValue` and `Evidence` render
unknown versus evidenced absence, quantity dimensions, funding/calendar, exact
quote fragments with omission markers, actual speakers and original source links.
No amount conversion, political score or conclusion about equivalence is computed.
One canonical proposition can serve multiple questions without duplicating it.

Theme/question options come from current collections. Candidate filters enhance
static HTML with two small local scripts, without network calls or browser storage.
For example `/questions/fiction.question.4/?candidate=fiction.actor.b` selects the
fictional extension personality. Repeated `candidate` parameters select multiple
people; no parameter means all, and `candidate=` means none. Unknown IDs produce
an explicit notice and are not substituted. Back/forward navigation restores the
selection. The share link points to the applied selection; switching questions
retains it. Without JavaScript all rows remain readable with an explicit notice.
Contextual statements remain separate and visible regardless of personal filters.

`/propositions/<id>/versions/<version>/` is the stable evidence-detail address.
Current question pages show current propositions only. Exact question-version
pages show the supplied public revisions linked to that question, explicitly
labelled as a reference view, not a reconstruction of a past publication date.
History labels distinguish political changes from editorial corrections and do
not imply that a related statement supersedes another.

The data-only integration exercise removes the added actor, topic, question and
proposition from the public `current` arrays and rebuilds: current navigation and
comparison entries disappear while explicitly retained historical links resolve.
This tests public scope removal, not a change to POL-8's withdrawal policy. Records
marked inactive or withdrawn must still be excluded by the private exporter;
this site never reconstructs or republishes them. Historical availability depends
on what the approved export is permitted to retain.

`tests/fixtures/comparison.json` adds entirely fictional similar/conditional,
objective, uncertain-attribution, diagnosis and editorial-correction cases to the
POL-8 fixtures. Base/extended builds contain six/seven personalities; a unit test
also exercises twelve questions. This demonstrates data-driven extension, not an
unlimited-volume guarantee. Built-link checks cover both levels and every source
revision. Browser tests cover selection/reload/back, extension selection and proof
navigation, no-JavaScript fallback, keyboard and 375/1280 px layouts.

The production homepage remains empty of political content. The aggregate browser
script budget is 15 kB raw; initial homepage HTML + CSS remains under 50 kB raw.
The production build currently contains two bundled enhancements (2,153 bytes total);
the homepage itself does not load them. Demo output remains local-only and must
not be deployed. There is no human editorial approval or usability test implied.

POL-10 local validation on 2026-09-09: 62 Node cases (also run with
`node --test --test-isolation=none tests/*.test.ts` to obtain per-case evidence on
this machine's N|Solid runtime), zero TypeScript/Astro diagnostics, seven Chrome
browser cases passed. Builds produced 47/57/8 base/extended/production pages and
all generated local links resolved. Initial homepage HTML + CSS: 9,428 raw bytes,
3,276 combined gzip bytes. Desktop comparison and mobile proof screenshots were
inspected. These are automated checks, not editorial or human usability approval.
