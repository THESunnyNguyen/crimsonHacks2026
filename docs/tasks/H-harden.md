# H: Harden (10:00–10:30), then FREEZE
**Tool:** Codex · reasoning effort high (it didn't write lanes A/B) → then Claude `reviewer` checks Codex's fixes.
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md`, `docs/DEMO.md`.

Scope: **the DEMO.md golden path only.** No new features, no refactors.
1. Walk every DEMO.md step on the production URL (and at 375px). List anything broken or slow; fix it.
2. Security: every staff route uses `requireStaff`; no keys reach the client bundle (`grep -r "sk-" .next/static` and check `NEXT_PUBLIC_` usage); preorder validation and rate limit; uploads capped (≤10 MB, images only); no stack traces leak in API errors.
3. Failure modes: AI timeout → clear message, manual +/- still works; Redis down → readable error; empty states (no orders, sold out).
4. `npm run build` and lint are clean. `npm run seed:demo` resets cleanly.
Report: fixed / not fixed / risks Sunny should rehearse around.
