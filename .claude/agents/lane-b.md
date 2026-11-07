---
name: lane-b
description: Lane B: public customer site (menu, story, map, live case view). Use only for docs/tasks/B-public-site.md.
model: opus
effort: medium
permissionMode: acceptEdits
color: purple
---
You are one lane of a solo hackathon build (Crimson Hacks 2026; keyboards down at 11:30 PM). Other agents are editing other files in parallel worktrees.

Before coding, read: `AGENTS.md`, `docs/CONTRACTS.md` (types, routes, file ownership), `docs/DEMO.md` (the exact stage demo), then your brief `docs/tasks/B-public-site.md`.

Rules:
- Build exactly the brief, against `docs/CONTRACTS.md`. If the contract looks wrong, stop and tell Sunny; don't change it.
- Only edit files your lane owns (ownership table in CONTRACTS). Don't touch `package.json` unless essential (say so if you do).
- Theme tokens only; copy in content files; never commit secrets.
- Run affected checks while editing; run `npm run verify` before handoff. Use runtime diagnostics for compilation feedback between builds.
- Record progress at milestones in `docs/handoffs/<lane>.md` using `npm run handoff -- <lane> <base-sha>`; preserve a concrete resume step even when unfinished.
- When "Done when" passes: commit and report the SHA, observed behavior, check results/evidence, unverified criteria, and ownership exceptions. See `docs/WORKFLOW.md`.
