# Project and worktree review

Observed November 6, 2026 (America/Denver). This is a snapshot; check Git and the
lane handoffs before resuming. The working application is distributed across
branches, while `main` still contains the plan. Do not use `main` as a new feature
lane's base until integration is complete.

## Worktrees

Paths below are under `~/.paradev/worktrees/crimsonHacks2026/`, except main at
`~/Desktop/crimsonHacks2026`.

| Worktree / branch | HEAD | State and next action |
| --- | --- | --- |
| main | `6bc51d5` | Plan only; six modified plan/contract/brief files. Preserve and reconcile deliberately before integration. |
| start-executing-27f7cb18 | `3f0b12a` | Integrated skeleton and foundation fixes; clean feature base. |
| task/00-shell | `74c5f57` | Original skeleton; browser artifacts untracked. Foundation fixes are on the integrated skeleton. |
| review/shared-foundation | `648c519` | AI defaults, audio uploads and remote-seed guard fixes; clean. |
| task/A-vision-confirm | `3f0b12a` | Vision API, confirmation UI and nested tests are uncommitted. Preserve them; finish real-photo evaluation and lane review before committing/integrating. |
| task/B-public-site | `2b10be9` | Public site committed, including inherited F assets. Generated AGENTS changes and browser artifacts remain local. |
| task/C-order-board | `83904e9` | Order board, note parsing and live sample script committed. Generated AGENTS change remains local. |
| task/F-menu-assets | `2caa94a` | Menu and group assets committed; clean. Already inherited by B. |
| review-output-d7b5e9a8 / review-build-inventory-d7b5e9a8 | `6bc51d5` | Clean plan-era review workspace. |
| commit-push-c87778eb | `1fdc69b` | Clean initial-commit workspace. |
| test-claude-codex-both-e1e99970 / verify-claude-codex-cli-e1e99970 | `1fdc69b` | Clean initial-commit CLI-check workspace. |
| review-current-state-project-b3420790 / project-worktree-review-b3420790 | See Git | Workflow improvements and isolated acceptance tests; completion evidence in `docs/handoffs/workflow.md`. |

The temporary `workflow/demo-checks` worker was created for this review. Its test
changes are integrated into the workflow branch; it is not another product lane.
No older workspace has been deleted or archived.

## Evidence and remaining product work

All seven code-bearing worktrees passed lint, their existing test command and
production build during the initial audit. A's eight nested tests also passed
when run explicitly; recursive discovery in the workflow update prevents those
tests being silently omitted in future runs.

A disposable combination of A's working files, B/F and C passed three browser
flows: corrected photo counts appear publicly only after confirmation, an empty
case publishes sold-out status, and a call-notes draft creates an order only on
Save. These checks mock the two AI responses and use real authentication, local
storage and public polling. Original feature worktrees were not merged or edited
by that test.

Before production integration:

- Resolve the Ready/boxed stock-accounting ambiguity against the contract with
  Sunny. Do not silently change shared interfaces or inventory semantics.
- Complete A's real-photo evaluation and missing acceptance evidence. Fixture
  browser checks establish UI behavior, not model accuracy.
- Cross-review the exact lane commits, reconcile main's existing doc edits, and
  run integrated demo checks after combining A/B/C. Include F only once.
- Rehearse on the actual phone and verify deployed storage and live AI separately.

The new workflow covers base-SHA recording, recoverable handoffs, safe pending
merges, recursive tests, compact verification logs, repo-scoped skills, and local
Paradev setup. See `docs/WORKFLOW.md` for commands and upstream tool sources.
