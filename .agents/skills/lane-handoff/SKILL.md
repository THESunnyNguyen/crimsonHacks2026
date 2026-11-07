---
name: lane-handoff
description: Prepare or resume a Crimson Hacks lane handoff, or review a lane before integration.
---

Use `docs/WORKFLOW.md` for commands and the lane's `docs/handoffs/<lane>.md`
for progress. Shared interfaces and ownership remain in `docs/CONTRACTS.md`.

On resume, compare the handoff's snapshot commit with current HEAD and inspect
`git status --short`. Preserve work not represented by the handoff. Use the
recorded base commit to distinguish this lane from inherited foundation work.

At a milestone, run `npm run handoff -- <lane> <base-sha>` and fill in completed
behavior, evidence, unfinished acceptance criteria, and the exact resume step.
Refreshing preserves those sections. A handoff is a checkpoint, not proof of
completion; keep it useful even if work stops before the feature is done.

Before review, run affected checks and `npm run verify`. For completed A/B/C
integration, also run `npm run test:demo`. Record the evidence directory and
whether AI was mocked or live. Never describe mock results as accuracy evidence.

Review committed changes from the recorded base, staged and unstaged changes,
and untracked source files. Give a verdict tied to a commit and working-tree
state. A new source change invalidates the previous verdict. Report concrete
blockers with file and line; don't manufacture style work to fill the review.

Only use `scripts/merge-task.sh` from the clean main checkout after the required
cross-review and within the user's integration authorization. It verifies the
pending merge before committing; it never pushes. For a branch which predates
this helper, use its absolute path from the workflow checkout.
