# Lane A handoff: vision count + confirm

- Branch `task/A-vision-confirm`, base `3f0b12a`. Commits: `c9fc35c` (core) plus the eval/1024px/docs commit on top.
- Files: `app/api/inventory/count/route.ts`, `components/staff/CaseTab.tsx`, `components/staff/case/*`, `lib/vision/*`, `scripts/eval-count.ts`, `test-images/*`, `docs/eval.md`, `docs/handoffs/A.md`. No shared files changed. The dirty `AGENTS.md` block written by `next dev` was left uncommitted.

## What it does
- **Count:** photo → client downscale to ≤1024px → `POST /api/inventory/count` → `requireStaff` → size/type checks (400/413/415) → sharp: EXIF rotate, ≤1024px, JPEG → `visionJSON` with a strict schema.
  - The schema has one fixed key per group and uses nullable fields, not optional ones.
  - The output is normalized (clamped) into the contract `CountResult`.
- **Second opinion:** if `VISION_SECOND_MODEL` is set, it runs in parallel and waits at most 8s from the start of the request, or until the primary answers if that's later. Any group differing by more than 1 gets its confidence lowered to 0.5.
- **Failures:**
  - Primary AI failure → 502 `{error}`.
  - No answer within 25s → 504.
  - No key → 503.
  - None of these responses leak internal details.
- **Not saved:** counting never writes. A test asserts this.
- **Case tab:**
  - Snap → "Counting donuts…" (with Cancel) → review with photo thumbnail and per-group +/− and number input. Each row shows a level chip preview (held orders subtracted), and rows below 0.8 confidence or with model disagreement are highlighted with the note.
  - **Confirm & publish** → `PUT /api/inventory` with source photo.
  - Manual +/− publish (source manual) and the **Sold out for today** switch are always visible.
  - An AI error shows an alert and scrolls to the manual panel.
  - A 401 calls `onUnauthorized`. The props `{pin, onUnauthorized}` are preserved.

## Checks run (PATH has node v22.23.4)
- `npx tsx --test lib/vision/*.test.ts` → 8/8 pass. Covers:
  - schema strictness and normalization
  - resize bounds and EXIF rotation
  - timeouts and errors
  - second opinion (parallel, disagree flag, failure, late, same model)
  - the route: 401, 400, 415, 413, 200 strict request with a ≤1024px JPEG, 502, 503, and no store writes
  
  **`npm test` only globs `lib/*.test.ts`, so these tests must be run explicitly.**
- `npm test` 4/4 pass. `npx tsc --noEmit` and eslint on lane files are clean. `npm run build` passes.
- **Live API** (dev server, real OpenAI, synthetic images):
  - no PIN or wrong PIN → 401; no image → 400; text file → 415; `PUT /api/inventory` without a PIN → 401.
  - Counts came back 200 with second opinion `gpt-6.1-terra`, and the disagreement was flagged. Inventory was unchanged after counting.
- **Browser** (Playwright at 390px, dev server, test PIN set at process level):
  - snap → review (warm run 5.7s end to end) → + correction → publish → `/api/inventory` showed `source:"photo"` with the corrected count.
  - A corrupt photo gave a 415 and showed the error with the manual fallback, and manual − worked.
  - **Not exercised in the browser:** manual publish and the sold-out toggle click. Both use the same `PUT` path, but this is unverified in the UI.

## Eval (see docs/eval.md)
- **Fixture vs live:** `test-images/synthetic/*` are generated drawings. They are fixture/latency checks only, not accuracy.
- **Real photo:** one real photo, `test-images/real/commons-box-of-doughnuts.jpg`.
  - Wikimedia Commons "Box of doughnuts (5533414164).jpg" by Amy from Newburgh, NY, CC BY 2.0.
  - sha256 `a8b3ce501a70584404f8f6cd4f07acf8a412581d0e4b6f1c467622bf290c7a78`.
  - Hand-labelled by the agent, with uncertain labels; the cruller doesn't map cleanly to a group.
  - Command: `VISION_MODEL=gpt-6-astra npx tsx scripts/eval-count.ts --dir test-images/real --models gpt-6-astra,gpt-6-luna,gpt-6.1-terra --runs 2`.
  - This is a pipeline check, not a benchmark, and it is not from the shop.
- **Shop demo photos:** still missing, so the demo accuracy eval is blocked on Sunny's photos.
- **Latency limitation:** on the real photo, `gpt-6-astra` took 17–23s, well over the 8s target. `gpt-6.1-terra` took 6.7–7.5s. Synthetic images ran 3–6s, with one live astra call at 8.5s.

## Environment and disclosure
- The worktree `.env` could not be edited because permission was denied. Tests ran with `VISION_MODEL=gpt-6-astra PARSE_MODEL=gpt-6-luna` set at process level. The copied `.env` still has stale model IDs and lacks `VISION_SECOND_MODEL`; it has the stale name `VISION_SECOND_OPINION` instead. No UPSTASH variables are set.
- **Disclosure:** while fetching the Commons photo, one HTTP request to `upload.wikimedia.org` sent the User-Agent header `CrimsonHacksEval/1.0 (thesunnynguyen@gmail.com)`, which contains the user's email. This was a mistake; other requests used no identifying header. No secrets were sent.
- `.playwright-mcp/` (screenshots, logs, test images) is untracked local output and not committed.
- Shared-change need: add `lib/vision/*.test.ts` to the `npm test` glob in `package.json` (lane 00 owns it).
