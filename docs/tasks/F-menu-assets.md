# Lane F: Menu photos + flavor copy (OpenAI)
**Tool:** Codex · reasoning effort medium · **reviewed by Claude** (quick look at images + copy)
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md` (MenuCopy, ownership), `docs/menu.seed.json`, `docs/SHOP.md`.
**Owns:** `scripts/gen-menu-assets.ts`, `content/menu-copy.json`, `public/img/menu/*`, `public/img/groups/*`.

## Do
1. `scripts/gen-menu-assets.ts` (`npm run gen:assets`, using the `openai` SDK and `OPENAI_API_KEY`):
   - **Copy:** one call to `OPENAI_TEXT_MODEL` returns JSON descriptions for every menu item, plus the 4 stock groups. Warm, specific, ≤ 18 words, no invented history or awards. Validate with zod.
   - **Photos:** `OPENAI_IMAGE_MODEL` generates one image per donut/pastry item (skip deli) and one per stock group. Use **one shared style prompt** so the set looks consistent: *"Photorealistic close-up of a single [item] on a cream-colored bakery paper liner, warm morning light, shallow depth of field, simple warm background, classic American neighborhood donut shop, no text, no logos, no people."* Add item-specific details (e.g. old fashioned = cracked ridged edges; buttermilk bar = rectangular, glazed; white cake = smooth top with vanilla/chocolate/strawberry frosting; cream cheese croissant = flaky, cream cheese center).
   - Resize to 1024px, convert to **webp ≤ 200 KB** with sharp; write `public/img/menu/<id>.webp`, `public/img/groups/<groupId>.webp`; write `content/menu-copy.json` per CONTRACTS.
   - Idempotent: skip files that already exist unless `--force`; `--only <id>` regenerates one. Log the cost estimate.
2. Generate everything, eyeball the set, regenerate any that look wrong (melted shapes, text artifacts).
3. Commit the images + JSON (they're small).

## Done when
13 item images (every menu item except deli) + 4 group images + `menu-copy.json` exist, look like one consistent set, and pass `npm run build`. Report total spend.
