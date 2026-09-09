# POL-8 Content Implementation Plan

> Execute the tightly coupled contract tasks inline with test-driven-development; use requesting-code-review for an independent final review. Repository autonomy instructions authorize routine implementation decisions and delivery through PR.

**Goal:** Deliver validated, modular private/public content schemas and a fail-closed public projection.
**Architecture:** Zod structural schemas, separate semantic validators, explicit projection and snapshot approval digest.
**Tech Stack:** Node 24, TypeScript, Zod, Node test runner.
**Spec:** ../specs/2026-09-09-pol-8-content-design.md

## Global constraints

English code/documentation; fictional fixtures only. No API calls, real political content or editorial approval simulation. References use stable ID/revision pairs. Owner approval identity is externally trusted, never inferred from input.

## Tasks

- [x] Schemas and validation: `src/content/schemas.ts`, `validate.ts`, `tests/model.test.ts`, JSON fixtures. First assert that `validatePrivate(fixture)` accepts valid data and rejects dangling references, dates, duplicate IDs/revisions and missing evidence. Run failing tests, implement, rerun.
- [x] Export: `src/content/export.ts`, `tests/export.test.ts`. First assert `exportPublic(dataset, options)` rejects missing/stale approval and production fixtures, strips all private fields, preserves citations shared across questions, and excludes withdrawn/draft records. Implement explicit whitelist and reference closure; rerun.
- [x] Migration: `src/content/migrate.ts`, `tests/migration.test.ts`. First assert explicit legacy migration keeps IDs and data, returns draft/unapproved review, rejects unknown versions, and leaves input unchanged. Implement and rerun.
- [x] Artifacts and handoff: `scripts/generate-schemas.ts`, generated `schemas/*.json`, agent guide, CI, README and workflow updates. Run `npm run check`, inspect complete diff, request independent review, and fix findings. Delivery continues through one POL-8 commit/push/PR under the repository workflow.

## Decisions

The checkout is clean; continue in place on the dedicated branch from fetched origin/main. Routine design approval gates are superseded by the explicit AGENTS.md autonomy instruction. A separate worktree is unnecessary because no user work occupies the checkout. Tasks share a single contract and are executed inline; final review may run independently alongside documentation verification.
