# Cross-review (before every merge to main)

A different model catches different mistakes: **Codex reviews Claude's lanes (00, A, B, D); Claude reviews Codex's (C, E, F, H).** Run the review in the lane's own worktree (in Paradev: a new Codex/Claude session in that workspace).

## Prompt (paste as is; replace X)
> You are reviewing branch for lane X before it merges into `main`. Don't edit files. Read `AGENTS.md`, `docs/CONTRACTS.md`, `docs/DEMO.md`, and `docs/tasks/<lane brief>`. Run `git diff main...HEAD` and `npm run build`. Check: (1) matches the contract types and routes exactly; (2) only touches files this lane owns; (3) staff routes call `requireStaff`; (4) no secrets or keys reach client code; (5) the brief's "Done when" holds; (6) the DEMO.md steps for this lane would work on stage. Reply with **MERGE** or **FIX FIRST**, plus a numbered list of concrete fixes (file:line). Skip style nitpicks.

- Claude Code: `claude --agent reviewer "Review lane X for merge."`
- Codex: `codex -c model_reasoning_effort="high" "<prompt above>"`

Send **FIX FIRST** items back to the authoring agent (Paradev: comment on the diff lines), then merge.

## Merge checklist (Sunny, ~8:30 · ~9:15 · ~10:00 · ~10:30)
1. Review says MERGE.
2. Merge into `main` (Paradev, or `./scripts/merge-task.sh <branch>`), which runs `npm run build`.
3. Push → Vercel deploys → open the production URL on your phone and run that lane's DEMO.md steps.
4. Broken? Revert the merge right away (`git revert -m 1 HEAD && git push`). **Main must always be demoable.**
5. The other lanes pull main into their branches (`git merge main`) so they stay current.
