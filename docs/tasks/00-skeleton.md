# 00: Walking skeleton (7:10–7:45, one agent, sequential)
**Tool:** Claude Code · Opus 5.5 · effort high · agent `lane-00`
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PLAN.md`, `docs/DEMO.md`.

> **Rate limits:** `lib/ai.ts` retries 429s with backoff. `gpt-6-astra` has a 1.35M tokens/day cap shared by all dev testing, so keep images ≤1024px and don't loop the eval needlessly.

## Goal
A deployed app where **every route and page exists with the real shapes** but simple insides, so lanes A/B/C only fill in their own files. Don't build features; stub them.

## Do
1. `create-next-app` (App Router, TS, Tailwind, ESLint) in the repo root. Keep `AGENTS.md`, `CLAUDE.md`, `docs/`, `.claude/`, `scripts/` intact.
2. Install now so no lane touches `package.json` later: `zod openai @upstash/redis sharp nanoid` (no Anthropic SDK: the app is OpenAI-only).
3. `lib/types.ts` (exact CONTRACTS types), `lib/store.ts` (Redis or JSON; computes held/available/level/total/shopSoldOut), `lib/ai.ts` (OpenAI only: `visionJSON(image, prompt, zodSchema, {model?})`, `textJSON(prompt, zodSchema, {model?})`, `transcribe(audio)`; structured JSON output; one retry on bad JSON). **First, run `GET https://api.openai.com/v1/models` with the key and confirm every model ID in `.env`; report and swap any that don't exist.**, `lib/time.ts` (Mon–Sat 5:00–17:00 America/Denver; `isOpenNow()`, `today()`), `lib/auth.ts` (`requireStaff(req)`).
4. `data/menu.json` = `docs/menu.seed.json`. Seed inventory: every group 20 (Plenty). One sample order. `npm run seed` (Plenty) and `npm run seed:demo` (demo reset) write to the active store.
5. Routes owned by 00 fully working. **Stubs** that return valid fake data in the contract shape: `/api/inventory/count` (fixed CountResult), `/api/orders/parse` (fixed draft), `/api/transcribe` (fixed text). Add an empty `content/menu-copy.json` (`{}`) and `npm run gen:assets` pointing at `scripts/gen-menu-assets.ts` (lane F fills it in).
6. Theme tokens in `app/globals.css` (cream, cocoa, frosting pink; display + body font via `next/font`).
7. Pages that render: `/` lists menu and inventory levels as plain text (B replaces it). `/staff` = PIN gate (stored in localStorage, try/catch) + two tabs rendering stub `components/staff/CaseTab.tsx` and `components/staff/OrdersTab.tsx`.
8. Create empty lane folders from the ownership table. `.env.example`; README (run, seed, deploy). Fill in AGENTS.md "How to run / How to test".
9. Push → Vercel auto-deploys (Sunny connects the GitHub repo and adds Upstash). Run `npm run seed` against prod.

## Done when
- `npm run build` passes. The production URL shows the menu with real prices and inventory levels.
- `PUT /api/inventory` without PIN → 401; with PIN updates; a today `new` order lowers `available`; `ready` restores it.
- Committed to `main`.
