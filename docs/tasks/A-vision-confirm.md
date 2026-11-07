# Lane A: Vision count + confirm flow (Best Use of AI; biggest risk, start first)
**Tool:** Claude Code · Opus 5.5 · effort high · agent `lane-a` · **reviewed by Codex**
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md` (stock groups, CountResult, levels), `docs/DEMO.md` 0:50–1:35.
**Owns:** `components/staff/CaseTab.tsx`, `components/staff/case/*`, `app/api/inventory/count/route.ts`, `lib/vision/*`, `scripts/eval-count.ts`, `test-images/*`, `docs/eval.md`.

> **Rate limits:** `lib/ai.ts` retries 429s with backoff. `gpt-6-astra` has a 1.35M tokens/day cap shared by all dev testing, so keep images ≤1024px and don't loop the eval needlessly.

## 1. `POST /api/inventory/count` (replace the stub)
- Staff-only. Accepts a multipart `image`; resize to ≤1024px with sharp; call `visionJSON` with `VISION_MODEL`.
- Prompt: the 4 stock groups with their visual descriptions from CONTRACTS; count group by group; it may be **a photo of a printed or on-screen picture**, so count what's depicted; never invent groups; confidence 0–1 per group; short `notes`. Validate with zod → `CountResult`. Never save.
- Target < 8s. On failure return `{ error }` (the UI falls back to manual).

## 2. Case tab UI (replace the stub `CaseTab.tsx`)
- Big **📷 Snap the case** button (`<input type="file" accept="image/*" capture="environment">`).
- Spinner ("Counting donuts…") → one row per group: name, count with big **+/−**, level chip preview (Plenty / Only N left / Sold out); rows with confidence < 0.8 highlighted, with the model's note.
- **Confirm & publish** → `PUT /api/inventory` `{groups, source:"photo"}` → success toast "Live on the site."
- Below: manual **+/−** for each group without a photo (`source:"manual"`) and a **Sold out for today** toggle.
- Phone-first: ≥44px targets, one-handed, theme tokens only.

## 3. Eval (do early; it's the slide's proof)
`scripts/eval-count.ts` runs the photos in `test-images/` against `test-images/expected.json` and prints per-group error. Use Sunny's 3 demo pictures (full / few / empty), shot with his phone the way he'll shoot them on stage. Run the eval on **two OpenAI models** (flagship `gpt-6-astra` vs fast `gpt-6-luna` / `gpt-6.1-terra`) and record accuracy **and latency** in `docs/eval.md`; pick the best one that answers in < 8s as `VISION_MODEL`. If both are poor, iterate on the prompt (per-group counting, "count what is depicted in the picture").

## 4. Second opinion (after the core works)
When `VISION_SECOND_MODEL` is set, call that second OpenAI model **in parallel**, fill `CountResult.secondOpinion`, and if any group differs by > 1, lower that row's confidence so the UI highlights it ("Two models disagree. Check this one."). Must not add latency beyond the slower call.

## Done when
On the deployed preview from Sunny's phone: snap picture #1 → sensible counts in < 8s → confirm → public `/api/inventory` reflects it. Picture #3 → all zeros → `shopSoldOut`. Eval table written.
