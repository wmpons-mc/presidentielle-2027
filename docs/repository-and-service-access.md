# Repository and service access

Preparation record for [POL-7](https://linear.app/political-analysis/issue/POL-7/preparer-les-depots-et-les-acces-de-deploiement), checked on 2026-09-07. This is a proposed setup with observed evidence, not a deployment or a completed access audit. No service purchase or paid API call is authorized here.

## Observed state

| Item | Evidence | Result |
| --- | --- | --- |
| Code owner and technical name | GitHub repository metadata and Git remote | `wmpons-mc/presidentielle-2027`, owned by a personal account |
| Code repository | [Existing repository](https://github.com/wmpons-mc/presidentielle-2027) | Public; default branch `main` |
| Baseline | Remote HEAD and fetched `origin/main` | `a496f895717d79bd3c9c06f6c5bff2e1248767a9` |
| Code license | Repository metadata and tracked files | No license adopted |
| Main protection | [Branch API](https://api.github.com/repos/wmpons-mc/presidentielle-2027/branches/main) | `protected: false` |
| Rulesets | [Rulesets API](https://api.github.com/repos/wmpons-mc/presidentielle-2027/rulesets) | Empty list |
| Detailed protection settings | Branch protection API | HTTP 403, integration lacks access; not evidence of plan eligibility |
| Editorial repository | Connected repository listing for the owner | No editorial repository visible; existence and visibility remain unverified |
| Git and PR access | Remote read/fetch; GitHub connector | Git read works; PR creation capability available; local `gh` is absent |
| Account plans and billing | No billing dashboard access | GitHub plan, Cloudflare account and OpenAI API project unverified |

The ticket has no native blockers and no comments at inspection. Its native dependents are POL-8, POL-13, POL-16 and POL-18. The architecture and work-order project documents were read. This preparation alone does not unblock them or satisfy Done.

## Code license decision

Propose **MIT** for original code, subject to the owner's explicit decision. It is short and permits broad reuse with preservation of its notice. Alternatives are [Apache-2.0](https://choosealicense.com/licenses/apache-2.0/), which includes explicit patent provisions, and [GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/), which requires covered distributed derivatives to remain under the same license. See the [MIT terms](https://choosealicense.com/licenses/mit/).

No `LICENSE` file is added until the owner chooses the license and confirms the copyright holder. Code licensing must not purport to license third-party quotations, source documents, photographs or personal data. Publication and reuse rules for editorial material remain separate; preserve attribution and source-specific rights.

## Private editorial repository

Proposed technical name: `presidentielle-2027-editorial`, under `wmpons-mc`. This is a proposal, not a verified repository or URL. Create it as **private from the start**, without importing data from this public checkout. If an editorial repository already exists, use its verified identity instead.

Initial configuration proposal:

1. Owner access only; no collaborators, outside invitations or broad app installations. Confirm account recovery and two-factor authentication privately.
2. Initialize a private README describing data boundaries, ownership and the access register. Keep Actions disabled until the workflows and their permission boundaries have been reviewed.
3. Keep drafts, admissible working sources, approval records, review artifacts and correction history there. Visitor submissions are received in private D1; any editorial copy stays private.
4. Use a separate local checkout outside this public repository. Do not use public branches, PRs, Actions artifacts, logs, Pages or unauthenticated previews for private material. `.gitignore` is not an access control.
5. Record the actual repository URL, visibility, plan, installed apps and access review privately. Publish only a sanitized completion statement in this document.

### Branch protection and the selected plan

GitHub documents protected branches for public repositories on Free, and private repositories on Pro, Team and Enterprise. Public protection is therefore available without an upgrade; **availability does not mean it is enabled**. The owner's actual plan is still unknown. [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

For public `main`, propose requiring PRs, preventing force pushes and deletion, and applying the rules to administrators where supported. Add only observed CI check names after POL-9 introduces and runs CI. For a sole maintainer, requiring another approving reviewer can prevent all merges; choose the review rule explicitly. Code PR approval does not replace exact-version editorial approval.

For the private repository, verify Settings → Branches / Rules against the actual plan before claiming enforcement. On Free, keep an owner-only manual workflow if private protections are unavailable. This fallback does **not** enforce branch protection or permit autonomous privileged writers. Keep collection/publication credentials disconnected until POL-16/POL-17 provide a reviewed separation of authority. A paid upgrade is an owner decision and is not part of this task.

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
| GitHub | Confirm actual plan, private-repository access, Actions allowance, storage usage and spending controls | No upgrade authorized; private automation must fit verified allowances |
| Cloudflare | Identify owner-controlled account, current Workers plan, API token capability and D1 EU jurisdiction availability | Start with available free allowances; no paid activation or deployment here |
| OpenAI API | Identify organization/project and billing owner; confirm access without running inference; provision a restricted service credential only when needed | Paid processing disabled pending authorization and POL-13 controls |
| ChatGPT | Record subscription separately in the private billing inventory | ChatGPT subscription and API billing are separate, as specified in the project architecture; do not count a subscription as API credit |
| Domain | Confirm whether an existing domain will be used | No purchase or invented deployment URL; include annual cost divided by 12 if later approved |

Static asset requests are free under Cloudflare's documented model, while Worker execution has separate limits and billing. This does not make the entire service free. D1 supports an EU jurisdiction, but that does not establish EU-only processing for the whole chain. [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [D1 location](https://developers.cloudflare.com/d1/configuration/data-location/).

GitHub private Actions usage and storage must be checked against the owner's actual allowance and existing consumption before scheduling collection. [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

Project ceiling: **€50/month total**, with an initial measured target of **€5–15/month**. The architecture's **€5–10/month API envelope is a proposal, not approval**. Include API usage, retries, tools, Actions/storage, Cloudflare, domain amortization, applicable subscriptions, tax and currency conversion. Record actual spending and remaining headroom privately; none of these figures proves that an account is configured.

POL-13 must reserve the maximum cost before each paid call, persist a shared counter, bound input/output and retries, and reject new paid work if accounting is unavailable. Provider alerts and limits complement this control. Model choice and a priced evaluation belong to POL-14/POL-15. [OpenAI API pricing](https://developers.openai.com/api/docs/pricing), [production guidance](https://developers.openai.com/api/docs/guides/production-best-practices).

## Remaining owner actions and completion evidence

| Action | Evidence required before completion | Current state |
| --- | --- | --- |
| Choose MIT, Apache-2.0 or GPL-3.0 for code and confirm copyright holder | Explicit decision, followed by reviewed license file | Pending |
| Confirm proposed private repository identity or supply the existing one | Authenticated metadata showing `private: true`, and denied anonymous access | Pending; no repository creation tool or authenticated `gh` available |
| Confirm GitHub plan and minimal access | Private review of collaborators/apps and actual protection availability; sanitized result only in public | Pending |
| Decide and apply branch rules or acknowledge the manual private fallback | Read-back of configured rules, plus a controlled verification of blocked direct/force pushes using a disposable test ref or repository | Pending; no account-permission changes authorized |
| Identify Cloudflare account and plan | Owner confirms Workers/API access, D1 EU option and spending settings without sharing keys | Pending; no connected Cloudflare capability or plugin discovery tool available |
| Identify OpenAI API project and billing owner | Private project/service-account and billing check, separate from ChatGPT | Pending; no paid probe required |
| Confirm the budget allocation and future activation | Explicit spending authorization plus observed POL-13 verification before paid calls | Future activation; not granted by preparation |

Recheck repository visibility and access after creation and after every permission change. Authenticated access should succeed, anonymous private access should fail, and non-owner access should be absent unless explicitly approved. A 404 alone cannot distinguish a private repository from a missing one; pair it with authenticated metadata. Record timestamps and sanitized outcomes, not private data or raw account responses.

POL-7 remains incomplete until the license decision, private repository preparation, plan/protection verification and account inventory have real evidence. Do not mark it Done based only on this document or the earlier Codex setup PR.
