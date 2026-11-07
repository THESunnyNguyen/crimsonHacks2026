# Integration handoff — November 6, 2026

Coordinator operates in existing integration worktree:
`/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/orchestrator-crimson-hacks-173615f7`.
Original chat cwd b578253d remains untouched at plan-era main descendant.
Use Node22: prepend `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin` to PATH.
Run `date` at every check-in; shell clock is authoritative (last 21:12 MST).

## Authorization and clock
User authorizes integration and preview only, NOT main merge or production push.
Separate explicit final yes required. No tooling, CI, skills, refactors, process work.
Max 3 workers, no recursive agents. Until 22:00 isolated worktrees; after 22:00
workers work against integration with nonoverlapping ownership.
22:00 verify + fixture test:demo; 22:20 real photo/notes + preview phone check;
22:30 freeze; 23:00 rehearsal + saved video; 23:20 approved main + prod;
23:30 no further commits. If milestone >15 min late drop D/E/H then polish.
Golden path docs/DEMO.md cannot be cut.

## Decisions pending Sunny (async questions sent)
1. Ready semantics: release held only (C brief explicitly says restores stock)
versus decrement physical case count AND release held. Recommend latter; do not
change CONTRACTS/store before reply. Need handle repeated transitions, tomorrow,
post-box cancellation/reopening if approved.
2. Six main dirty docs: preserve/reconcile after approval; patch backup at
`/tmp/crimson-main-doc-edits-20261106.patch`. Main originals untouched.
3. Confirm separate final approval gate; no approval yet.
4. Need real donut photo path/URL with known counts. Only synthetic images found.

## Integration
Base 3f0b12a; existing clean integration reused.
Workflow 692a5a6 merged as 275d97b after own npm ci + npm run verify passed.
Evidence `.artifacts/verify/1794024682178-a25505/result.json`.
B 2b10be9 (inherits F 2caa94a ONCE) is currently a PENDING MERGE awaiting review.
Own npm run verify passed all four checks including asset validation:
`.artifacts/verify/1794024712340-2f0f17/result.json`.
Next commit B after MERGE verdict, merge C then verify/commit, then A verify and
cross-review, then test:demo (fixture AI only). No live accuracy claim from fixtures.
IMPORTANT merge-task.sh refuses any branch other than main (observed exit 1).
No tooling edit: reproduce its git merge --no-ff --no-commit, npm verification,
commit-on-pass behavior on integration; abort own pending merge on failure.

## Workers
A Claude existing Paradev workspace 639ca8bb-82d9-43d3-a9fa-4cd4b354d3f6,
terminal 75148cc2-db58-4ad5-a51b-d80110946e67, branch task/A-vision-confirm.
Owns A contract files + docs/handoffs/A.md only. Hard stop 21:45.
First feature commit c9fc35c; working on 1024px cap then handoff/real evaluation.
Do not include dirty generated AGENTS.md or browser artifacts.
Review Codex native child `/root/review_bc` replaces failed terminal Codex login.
Isolated review-output-d7b5e9a8 checkout; READ ONLY B/C; no source commits.
CLI terminal 09395be2-8954-43f1-8943-5a9aada362b8 failed auth before working, idle.
Other old C/F terminals are usage-limited and B terminal is interrupted/idle.
Only A and Review active. Third slot available.

## Deploy preparation
Vercel CLI authenticated as thesunnynguyen. No linked .vercel project found here.
Account lists corporate-portfolio, ih-hackathon, sunny-it-solutions, glazegpt;
do not assume glazegpt is this project or overwrite unrelated production.
No preview created yet. Need preview-specific Redis + OpenAI env; never copy
Redis credentials into local .env. Local JSON data and real credentials stay ignored.
