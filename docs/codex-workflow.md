# Working with Codex

## Start a task

Open Codex at the repository root. It automatically reads `AGENTS.md`; restart the session after changing instructions. Example:

> Implement POL-9 through a validated branch, commits, push, and pull request. Read its full requirements and dependencies first. Stop at review.

For backlog work, explicitly request the next unblocked Todo ticket. Reading Linear and creating a code PR are part of this workflow. If you also want Linear status changes and handoff comments, authorize those in the task. This setup does not install a background worker or schedule unattended runs.

## Connections and machine setup

1. Use the connected Linear app in Codex. Verify it can read the project and a complete ticket with comments and relations. If unavailable in another environment, connect Linear there before ticket selection; never guess requirements.
2. Provide Git access to `git@github.com:wmpons-mc/presidentielle-2027.git` and a configured commit identity. Check `git ls-remote origin HEAD` and `git var GIT_AUTHOR_IDENT` without printing credentials.
3. For PR writes, install GitHub CLI using its official distribution and authenticate with `gh auth login`, or use an available GitHub connector with PR write capability. Check `gh auth status` and `gh repo view wmpons-mc/presidentielle-2027`. Authentication stays outside the repository. Git transport access alone does not provide PR API access.
4. Trust this checkout in Codex only after reviewing its instructions. Optional project configuration is shown below. Project settings load only for trusted projects; managed policies may override them.

```toml
# Optional .codex/config.toml; no credentials or machine-specific paths.
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

These settings keep the workspace sandbox and allow requests for operations it blocks. They do not grant GitHub/Linear access or remove protected-path approval requirements. Keep personal model preferences and OAuth tokens in user settings; do not commit them. Do not disable the sandbox to obtain autonomy.

## Ticket to PR

Read the full ticket, comments, acceptance criteria, linked documents and completed dependency deliverables. Verify the current project state rather than relying on copied status lists. Record a short plan for substantial tasks, implement the bounded result, and validate it.

Typical commands after verifying a clean checkout and absence of an existing task branch:

```sh
git fetch origin
git switch -c codex/pol-9-static-navigation origin/main
# Implement and run the checks documented by the application ticket.
git diff --check
# Stage explicit task files, then inspect before committing.
git diff --cached
git commit -m 'feat(POL-9): add static navigation'
git push -u origin HEAD
```

Prepare the PR description in a temporary file using the repository template, excluding private ticket contents. Check for an existing PR before creating one. With an authenticated GitHub CLI:

```sh
gh pr list --head codex/pol-9-static-navigation --state open
gh pr create --base main --head codex/pol-9-static-navigation \
  --title 'feat(POL-9): add static navigation' --body-file /tmp/pol-9-pr.md
gh pr checks
```

Use the real task number, paths, title, and branch. Inspect CI once available and fix relevant failures. Leave the PR for review; merge/deployment authorization is separate. If access is unavailable, preserve the commit and prepared description and report the blocked push or PR step precisely.

## Validation and repository administration

The POL-8 content package has a locked Node/TypeScript toolchain. Run `npm ci --ignore-scripts`, `npm run check` and `git diff --check`. The `Content contract` workflow runs the same checks using fictional fixtures only. See [the content model](content-model.md). POL-9 must add the static application build and corresponding CI; content tests do not test a website.

Once CI exists, configure repository rules to require PRs and the actual required checks, prevent force pushes to `main`, and choose a review policy supported by the repository plan. These are administrator settings, not enforced by `AGENTS.md`. Do not invent status-check names or silently change permissions. The POL-7 code license decision is recorded in `LICENSE` and the repository access document.

## Project references

- [First milestone](https://linear.app/political-analysis/project/presidentielle-2027-comparateur-public-des-propositions-f2553b886c2f)
- [Linear work order and agent conventions](https://linear.app/political-analysis/document/ordre-de-travail-conventions-agents-et-index-des-tickets-4128c24252d8)
- [Architecture and controlled publication](https://linear.app/political-analysis/document/architecture-contraintes-et-publication-controlee-82bf9de536aa)
- [OpenAI: AGENTS.md discovery and review instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI: configuration and precedence](https://learn.chatgpt.com/docs/config-file/config-basic)

The project constraints were checked against Linear on 2026-09-06. Fetch current documents when working on a ticket; this file is not a copy of the backlog.
