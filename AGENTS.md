# Crimson Hacks 2026

Instructions shared by every coding agent in this repo (Claude Code reads this via CLAUDE.md; Codex reads it directly).

## Project
- What we're building: a website and staff app for Fresh Donuts & Deli (award-winning family donut shop in South Salt Lake). It has a public menu, story, and map; live "in the case now" stock that staff update by snapping a photo (a vision model counts the donuts, staff confirm); and a phone-order board. Theme: democratizing AI for small, non-technical businesses.
- Plan: `docs/PLAN.md` · **Demo script: `docs/DEMO.md`** · Shop facts: `docs/SHOP.md` · Event rules: `docs/EVENT.md`
- **Contracts (types, routes, env vars, file ownership): `docs/CONTRACTS.md`. Code against these; don't change them without Sunny.**
- Lanes and briefs: `docs/tasks/` (board + Paradev steps: `docs/tasks/README.md`; review: `docs/tasks/REVIEW.md`). Edit only the files your lane owns.
- Stack: Next.js App Router + TypeScript + Tailwind on Vercel (auto-deploy from `main`). Storage via `lib/store.ts` (Upstash Redis in prod, JSON locally). AI via `lib/ai.ts`: **OpenAI API only**, no Anthropic API in the app. (Claude Code and Codex are just the coding agents.)
- Styling: colors and fonts only via theme tokens in `app/globals.css`. Copy lives in content files.
- How to run: `npm ci`, `npm run seed`, `npm run dev -- --port <lane-port>`
- How to test: `npm run verify`; integrated demo: `npm run test:demo`. See `docs/WORKFLOW.md`.

## Working rules
- Hackathon pace: prefer small, working increments over big rewrites.
- Never commit secrets. Keys live in `.env` (git-ignored); keep `.env.example` updated with variable names only.
- Run the app or tests before saying a change works.
- Keep commits small, with clear messages.
- Keep milestone progress in `docs/handoffs/<lane>.md`; `npm run handoff -- <lane> <base-sha>` captures Git state. Each lane owns its handoff file.
- Read the relevant brief and contract sections for feature work; use `docs/DEMO.md` for acceptance and `docs/WORKFLOW.md` for handoffs/reviews.
- For Next.js APIs, consult version-matched `node_modules/next/dist/docs/`. Runtime MCP calls must target this worktree's port and project path.
- Event rule: all code is written tonight; cite any open-source code you copy.
- Don't use Salt Lake Tribune photos on the site (copyright). Footer says "Concept demo, not affiliated."
- `main` must always be demoable. Merges happen only after a cross-review and user approval.

## Agent Orchestration Policy

This project uses Paradev for parallel AI development. Delegation is encouraged when it helps, but does not require spawning agents for every task.

When a task contains multiple independent workstreams:
- Use the `superset:orchestrate` skill to assess and coordinate the work.
- Spawn up to 3 worker agents concurrently when delegation is useful; do not launch unnecessary workers.
- Give workers isolated Git worktrees and branches.
- Assign explicit file ownership.
- Prefer Claude Code for UI work and Codex for backend or test tasks when appropriate.
- Monitor workers and collect their results.
- Verify each worker's changes before integration.
- Do not merge to `main` without user approval.

For small or tightly coupled tasks:
- Work directly without spawning additional agents.

Never allow workers to recursively spawn more Paradev workers without explicit authorization.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
