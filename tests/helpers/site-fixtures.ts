import { readFileSync } from 'node:fs';
import { exportPublic, snapshotDigest } from '../../src/content/export.ts';

/** Synthetic test approvals only. Never import this module into the website. */
export function siteFixture(extended = false, comparison = false) {
  const data = JSON.parse(readFileSync(new URL('../fixtures/base.json', import.meta.url), 'utf8'));
  if (extended) {
    const addition = JSON.parse(readFileSync(new URL('../fixtures/extension.json', import.meta.url), 'utf8'));
    for (const [name, records] of Object.entries(addition)) data.content[name].push(...records as unknown[]);
  }
  if (comparison) {
    const addition = JSON.parse(readFileSync(new URL('../fixtures/comparison.json', import.meta.url), 'utf8'));
    for (const [name, records] of Object.entries(addition)) data.content[name].push(...records as unknown[]);
  }
  for (const records of Object.values(data.content)) for (const r of records as any[]) r.editorialState = 'approved';
  data.review.state = 'approved';
  const trustedApproval = {digest:snapshotDigest(data),reviewerId:'fiction.reviewer',reviewedAt:'2026-02-01T12:00:00Z'};
  data.review.approval = trustedApproval;
  return exportPublic(data, {purpose:'fixture-test',trustedApproval});
}
