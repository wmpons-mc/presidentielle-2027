# Repository and service access

Preparation record for [POL-7](https://linear.app/political-analysis/issue/POL-7/preparer-les-depots-et-les-acces-de-deploiement), initially checked on 2026-09-07 and updated on 2026-09-08. Protection observations below date from 2026-09-07; repository visibility was rechecked on 2026-09-08. This preparation record distinguishes verified metadata, owner-confirmed account settings and future implementation work. No service purchase or paid API call is authorized here.

## Observed state

| Item | Evidence | Result |
| --- | --- | --- |
| Code owner and technical name | GitHub repository metadata and Git remote | `wmpons-mc/presidentielle-2027`, owned by a personal account |
| Code repository | [Existing repository](https://github.com/wmpons-mc/presidentielle-2027) | Public; default branch `main` |
| Baseline | Remote HEAD and fetched `origin/main` | `a496f895717d79bd3c9c06f6c5bff2e1248767a9` |
| Code license | Owner confirmation and [LICENSE](../LICENSE) on the POL-7 branch | MIT; copyright (c) 2026 William Pons |
| Main protection | [Branch API](https://api.github.com/repos/wmpons-mc/presidentielle-2027/branches/main) | `protected: false` |
| Rulesets | [Rulesets API](https://api.github.com/repos/wmpons-mc/presidentielle-2027/rulesets) | Empty list |
| Detailed protection settings | Branch protection API | HTTP 403, integration lacks access; not evidence of plan eligibility |
| Editorial repository | Connected repository listing for the owner | [Existing editorial repository](https://github.com/wmpons-mc/presidentielle-2027-editorial), confirmed private by authenticated metadata on 2026-09-08; owner confirms no collaborators and Actions disabled; installed-app inventory and permissions reported by owner; existing integration scope explicitly retained by owner |
| Git and PR access | Remote read/fetch; GitHub connector | Git read works; PR creation capability available; local `gh` is absent |
| Account plans and billing | No billing dashboard access | Owner confirms GitHub Free, Workers Free and sufficient OpenAI API project/billing access on 2026-09-08; provider dashboards were not independently inspected |

The ticket has no native blockers and no comments at inspection. Its native dependents are POL-8, POL-13, POL-16 and POL-18. The architecture and work-order project documents were read. Other native prerequisites still apply to dependent tickets.

## Code license decision

The owner explicitly selected **MIT** for original code and confirmed **William Pons** as the copyright holder on 2026-09-07, after MIT, Apache-2.0 and GPL-3.0 were presented. The standard [MIT License](../LICENSE) is included on this branch with copyright (c) 2026 William Pons.

The license covers original code and associated software documentation. It does not grant rights to third-party quotations, source documents, photographs or personal data. Publication and reuse rules for editorial material remain separate; preserve attribution and source-specific rights.

## Private editorial repository

The owner supplied https://github.com/wmpons-mc/presidentielle-2027-editorial on 2026-09-08. The authenticated GitHub connector confirms that it exists under `wmpons-mc` with private visibility. No editorial content was retrieved during this verification.

The public repository makes the implementation and approved publication inspectable and reusable. The private repository supports preparation and owner review without exposing unfinished political claims or visitor submissions. Public branches and PRs cannot serve as a private review area. Publication must export only sanitized content approved for its exact version; linking to the private repository does not grant access to its contents.

The owner confirms no collaborators and disabled Actions on 2026-09-08 (Actions tab hidden; workflows cannot run). The owner subsequently reported the repository selection and permissions for both installed GitHub Apps. The inventory is complete by owner report, not by an independent administrator API inspection. The owner explicitly chose to retain the existing integration scope for use across projects on 2026-09-08. This is an accepted exception to the proposed project-only scope, not an unresolved decision. It does not authorize new installations, broader permissions or changes to publication controls. Keep app identities and detailed access records private; this public record reports only the audit outcome. No application permissions were changed.

Initial configuration proposal:

1. No collaborators or new invitations; retain the existing integrations as explicitly chosen by the owner. Confirm account recovery and two-factor authentication privately.
2. Document data boundaries and the access register alongside the private editorial implementation in POL-8/POL-16. Keep Actions disabled until the workflows and their permission boundaries have been reviewed.
3. Keep drafts, admissible working sources, approval records, review artifacts and correction history there. Visitor submissions are received in private D1; any editorial copy stays private.
4. Use a separate local checkout outside this public repository. Do not use public branches, PRs, Actions artifacts, logs, Pages or unauthenticated previews for private material. `.gitignore` is not an access control.
5. The owner authorizes documenting both repository URLs publicly in AGENTS.md. Keep installed-app details, access review records and account-specific information private; publish only sanitized verification outcomes.

### Branch protection and the selected plan

GitHub documents protected branches for public repositories on Free, and private repositories on Pro, Team and Enterprise. Public protection is therefore available without an upgrade; **availability does not mean it is enabled**. The owner confirmed GitHub Free on 2026-09-08. GitHub Pro is deferred until project results justify reconsideration; no subscription is authorized and any future price must be checked at that time. [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

For public `main`, propose requiring PRs, preventing force pushes and deletion, and applying the rules to administrators where supported. Add only observed CI check names after POL-9 introduces and runs CI. For a sole maintainer, requiring another approving reviewer can prevent all merges; choose the review rule explicitly. Code PR approval does not replace exact-version editorial approval.

For the private repository, GitHub Free does not include protected branches according to the official plan documentation, rechecked on 2026-09-08. Keep owner-led manual review and Actions disabled at this preparation stage, with the existing integrations retained by explicit owner decision. This fallback does **not** enforce branch protection or permit autonomous privileged writers. Keep collection/publication credentials disconnected until POL-16/POL-17 provide a reviewed separation of authority. A paid upgrade is an owner decision and is not part of this task.

## Proposed minimum permissions and secret inventory

The following names describe future configuration; no values or credentials are created here. The owner remains responsible for provisioning, revocation and recovery. Actual credential identifiers, expiry dates and account membership belong in a private access register.

| Principal or secret | Purpose and minimum scope | Storage and boundary |
| --- | --- | --- |
| Public CI `GITHUB_TOKEN` | `contents: read`; no deployment or editorial access | Per-job ephemeral token; untrusted PRs receive no secrets |
| Private collection job | Read authorized inputs; write draft branches only when enforceable | Private workflow; no public repository or approval authority |
| Editorial owner | Review and approve the exact content digest | Private approval record; any edit invalidates approval |
| `EDITORIAL_EXPORT_APP_PRIVATE_KEY` | Proposed dedicated GitHub App, installed only on the public destination, Contents and Pull requests write for sanitized export PRs | Only the trusted private export job; never extraction/model code; no administration or workflow-write permission |
| `CLOUDFLARE_API_TOKEN` | Static site deployment: Workers Scripts Write scoped to the selected account; add only permissions demonstrated necessary by deployment tooling | Trusted deployment job only; never visitor JavaScript or fork jobs |
| Separate corrections deployment token | Worker/D1 management only for the selected account and required resources, using the narrowest provider-supported scope | Trusted infrastructure job; not the public build or collector |
| `OPENAI_API_KEY` | Dedicated project/service account for extraction; restrict to required API operations, no administrative key | Private extraction job secret; never public CI, browser or model prompt |
| Future budget-service credential | Access only to reservation/settlement operations designed in POL-13 | Private caller and Worker secret storage; no direct database administration for extraction |
| `CLOUDFLARE_ACCOUNT_ID`, D1 database IDs, OpenAI project ID | Configuration identifiers, not authentication secrets | Keep account-specific inventory private; never mistake identifiers for access checks |

Cloudflare tokens can be narrowed by permissions, resources and expiry; some permissions are account-wide, so verify the actual resource granularity rather than promising per-Worker isolation. Runtime D1 access should use Worker bindings rather than an administrative API token. [Cloudflare token configuration](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

For every future secret: create it directly in the provider and trusted secret store, record purpose/scope/expiry privately, test without printing values, replace before expiry, then revoke the old credential. On suspected exposure, revoke immediately and inspect access privately. Never paste secrets into Linear, a PR, logs, screenshots, or a committed `.env` file. Disable workflows using the affected credential until replacement is verified.

## Service and billing inventory

| Service | Required owner action | Cost position |
| --- | --- | --- |
| GitHub | Free, no collaborators and Actions disabled confirmed by owner; app inventory confirmed by owner; existing integration scope accepted by owner; verify future automation allowances | No upgrade authorized; private automation must fit verified allowances |
| Cloudflare | Workers Free confirmed by owner; verify API token scope and D1 EU configuration when provisioning the relevant services | Start with available free allowances; no paid activation or deployment here |
| OpenAI API | Owner confirms sufficient API project and billing access; no provider-side test performed; provision a restricted service credential only when needed | Paid processing disabled pending authorization and POL-13 controls |
| ChatGPT | Record subscription separately in the private billing inventory | ChatGPT subscription and API billing are separate, as specified in the project architecture; do not count a subscription as API credit |
| Domain | Confirm whether an existing domain will be used | No purchase or invented deployment URL; include annual cost divided by 12 if later approved |

Static asset requests are free under Cloudflare's documented model, while Worker execution has separate limits and billing. This does not make the entire service free. D1 supports an EU jurisdiction, but that does not establish EU-only processing for the whole chain. [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [D1 location](https://developers.cloudflare.com/d1/configuration/data-location/).

D1 is Cloudflare's managed SQL database, accessed by backend Workers. In this architecture it will store visitor corrections privately (POL-18) and persist the shared API cost ledger (POL-13). Git preserves versioned editorial files; D1 handles live submissions and transactional accounting. D1 is available on Workers Free within quotas. Creating a database is deferred to those implementation tickets, not required to identify the service in POL-7. [D1 overview](https://developers.cloudflare.com/d1/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

GitHub private Actions usage and storage must be checked against the owner's actual allowance and existing consumption before scheduling collection. [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

Project ceiling: **€50/month total**, with an initial measured target of **€5–15/month**. The architecture's **€5–10/month API envelope is a proposal, not approval**. Include API usage, retries, tools, Actions/storage, Cloudflare, domain amortization, applicable subscriptions, tax and currency conversion. Record actual spending and remaining headroom privately; none of these figures proves that an account is configured.

POL-13 must reserve the maximum cost before each paid call, persist a shared counter, bound input/output and retries, and reject new paid work if accounting is unavailable. Provider alerts and limits complement this control. Model choice and a priced evaluation belong to POL-14/POL-15. [OpenAI API pricing](https://developers.openai.com/api/docs/pricing), [production guidance](https://developers.openai.com/api/docs/guides/production-best-practices).

## Completion evidence and implementation handoff

POL-7 prepares repositories and inventories access; it does not provision the application or activate paid processing.

| Acceptance criterion | Evidence |
| --- | --- |
| Owner, technical names and code license | Both repository URLs in AGENTS.md; MIT explicitly selected by owner before LICENSE was added |
| Private editorial space, permissions and secrets | Authenticated metadata confirms private visibility; unauthenticated GitHub API request returned HTTP 404 on 2026-09-08. Owner confirms no collaborators and disabled Actions; existing integration scope explicitly retained. Future minimum permissions, secret storage and rotation are documented above; no secret values included |
| Cloudflare/API accounts and billing envelope | Owner confirms Workers Free and sufficient OpenAI API project/billing access. Separate ChatGPT/API billing and total €50/month ceiling are documented. No paid probe was performed |
| Visibility and protection availability | Public/private metadata verified; anonymous private access denied. GitHub Free supports public protected branches but not private protected branches. Public main was observed unprotected; no claim of enforcement or administrator-setting change |

The remaining actions belong to implementation and activation:

- POL-9: introduce CI, then configure public branch rules with real check names under the repository workflow and appropriate administrator authorization.
- POL-8/POL-16/POL-17: implement private editorial storage, exact-version approval and controlled export; establish enforceable separation before enabling privileged automation on the selected plan.
- POL-13/POL-14: provision narrowly scoped credentials when needed, verify provider access and implement the persistent budget guard before any explicitly authorized paid processing.
- POL-18: provision the corrections Worker and D1, checking EU jurisdiction and account permissions at that time.
- POL-20: verify Actions allowances and spending controls before enabling scheduled private workflows.
- Before deployment: confirm domain choice and any purchase separately. GitHub Pro remains optional and deferred.

Recheck visibility and access after permission changes. Provider account readiness is based on owner confirmation; provider dashboards and app permissions were not independently audited. POL-7 delivery requires the preparation PR to be merged and that result observed before updating Linear to Done.
