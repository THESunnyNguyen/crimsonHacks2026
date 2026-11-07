# Fresh Donuts & Deli

Crimson Hacks 2026 concept demo. Not affiliated with the shop.

## Local development

Requires Node.js 22 and npm. Run `npm install`, copy `.env.example` to `.env`, and set a four-digit `STAFF_PIN`. Leave both `UPSTASH_*` values unset locally: local inventory and orders use ignored `data/*.local.json` files.

Run `npm run seed`, then `npm run dev`. Visit `/` for the menu and `/staff` for the PIN gate and two staff tabs. `npm run seed:demo` resets the active store to 20 donuts per group and one sample order. Both seed commands overwrite inventory and orders, so select the intended environment first.

## Checks

- `npm test`: date/time, authentication, validation, stock reservations, status changes, and concurrent local writes, isolated in temporary storage.
- `npm run typecheck`: TypeScript.
- `npm run build`: production build.

API smoke check: GET `/api/menu` and `/api/inventory` are public. PUT `/api/inventory`, GET/POST `/api/orders`, and PATCH `/api/orders/:id` require `x-staff-pin`. Missing/wrong PIN returns 401. Create a today order to reserve stock; set it ready to release the reservation. Inventory levels are sold out at 0, low at 1–6, and plenty at 7+. Clients poll every five seconds.

## Shared interfaces and lane handoff

See `docs/CONTRACTS.md`. The skeleton includes deliberately fake counting, parsing and transcription endpoints for lanes A and C to replace. They do not call AI. Lane B replaces the basic public page. Lane F implements `npm run gen:assets`. Mini-wave routes for Case Cam and preorder are not implemented in the skeleton.

`lib/ai.ts` provides `visionJSON(image, prompt, schema, {model?})`, `textJSON(prompt, schema, {model?})`, and `transcribe(audio)`. The image accepts a URL/data URL, Blob/File or JPEG Buffer. Transcription returns a string. Structured outputs use the OpenAI SDK and Zod, with one retry for invalid JSON/schema output. SDK reference: https://developers.openai.com/api/docs/guides/structured-outputs .

Model IDs verified against the account model list on November 6, 2026: `gpt-6-astra`, `gpt-6-luna`, `gpt-transcribe`, `gpt-image-2.5-sunburst`. Set `VISION_MODEL`, `PARSE_MODEL`, `TRANSCRIBE_MODEL`, `OPENAI_TEXT_MODEL`, and `OPENAI_IMAGE_MODEL` accordingly. `VISION_SECOND_MODEL` is optional; `CASECAM_MIN_CONFIDENCE` defaults to the contract value 0.8 when the camera lane implements it. No secrets belong in source control.

## Deployment

Import this GitHub repository into Vercel as a Next.js app and attach Upstash Redis. Configure `STAFF_PIN`, the OpenAI key/model values, and both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel. Vercel deployments fail closed without Redis rather than attempting ephemeral filesystem writes. Run `npm run seed -- --yes` only with credentials for the intended deployment's Redis. Remote resets require explicit `--yes`; the demo reset uses `npm run seed:demo -- --yes`. If the Marketplace exposes `KV_REST_API_URL` and `KV_REST_API_TOKEN`, configure the contract's `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` with the matching values before deployment; the app deliberately selects Redis through the contracted names. Preview deployments should use a separate Redis database from production.

Merge to `main` only after cross-review (`docs/tasks/REVIEW.md`); `main` auto-deploys. A deployment is not verified by a successful local build: check the production URL and storage round trip.

## Dependencies

Scaffolded with the official create-next-app template; uses Next.js, React, Tailwind CSS, Zod, OpenAI's Node SDK, Upstash Redis, Sharp, and Nano ID under their respective open-source licenses. No third-party application code or copyrighted shop photos were copied.
