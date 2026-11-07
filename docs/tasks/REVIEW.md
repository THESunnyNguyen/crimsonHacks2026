# Cross-review (before every merge to main)

A different model catches different mistakes: **Codex reviews Claude's lanes (00, A, B, D); Claude reviews Codex's (C, E, F, H).** Run the review in the lane's own worktree (in Paradev: a new Codex/Claude session in that workspace).

## Prompt (paste as is; replace X)
> Review lane X before integration. Don't edit files. Read AGENTS.md, the relevant contract/brief, and its handoff. Review `git diff <recorded-base-sha>...HEAD`, staged/unstaged changes and untracked source files. Run `npm run verify`; run `npm run test:demo` for integrated A/B/C flows. Check contracts, lane ownership, staff auth, client secrets, acceptance criteria and demo steps. Report **MERGE** or **FIX FIRST**, the reviewed SHA and dirty state, evidence (mocked versus live), and concrete fixes (file:line). Skip style nitpicks. See docs/WORKFLOW.md.

- Claude Code: `claude --agent reviewer "Review lane X for merge."`
- Codex: `codex -c model_reasoning_effort="high" "<prompt above>"`

Send **FIX FIRST** items back to the authoring agent (Paradev: comment on the diff lines), then merge.

## Merge checklist (Sunny, ~8:30 · ~9:15 · ~10:00 · ~10:30)
1. Review says MERGE.
2. Obtain user approval, then merge into `main` (Paradev, or `./scripts/merge-task.sh <branch>`), which runs `npm run build`. A review verdict alone does not authorize the merge.
3. Push → Vercel deploys → open the production URL on your phone and run that lane's DEMO.md steps.
4. Broken? Revert the merge right away (`git revert -m 1 HEAD && git push`). **Main must always be demoable.**
5. The other lanes pull main into their branches (`git merge main`) so they stay current.
