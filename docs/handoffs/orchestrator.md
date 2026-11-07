# Orchestrator handoff — Crimson Hacks 2026

Refreshed: 2026-11-06T23:26:00-07:00. Run `date` at every check-in.

## Current release
- Use `/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/orchestrator-crimson-hacks-173615f7`, branch `integration`. Original chat cwd ending b578253d is stale; do not use it as application source.
- Node22: prepend `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin` to PATH.
- Main merge and production were explicitly approved and completed. Main contains final reviewed application source **313e63a180873506789a7cd9ed2a5cd77ea14f88**, plus documentation commits. Run git log/status for current documentation tip.
- Production: https://fresh-donuts-deli-crimson2026.vercel.app
- Final deployment: **dpl_HMH9zfRo2TdX15NUq3zGg21ZNnSU**, immutable https://fresh-donuts-deli-crimson2026-h50zveomo.vercel.app, READY/production. Application source313e63a, including reviewed pay-at-pickup preorders. Stripe cards are disabled in production.
- Final public styling includes red/navy/cream palette, user-supplied storefront and kitchen photos, user-supplied Wilson and Brenda story copy, and generated deli sandwich with Illustration label. See `recolor.md` and `photos.md` for independent reviews and deployment evidence.
- Vercel project has **no Git auto-deploy link**. Documentation pushes do not require deployment; future application changes need a deliberate reviewed deploy from a clean tracked archive.
- Production/Preview vision model `gpt-6.1-terra`; notes model `gpt-6-luna`. Account-owned Free Upstash newDB, US-WEST-1. Never overwrite it with the historical scratch DB.
- Local checks use Node22. Vercel project says22.x, but existing package engines `>=22` resolved both earlier and current builds to nodejs26.x. No runtime/tooling source edit was made tonight.

## Clock and remaining acceptance
- 22:00 integration A+B+C verify/demo milestone: MET early.
- 22:20 hosted live AI: MET with a real Commons donut photo and typed DEMO notes. **Sunny physical-phone full flow remains UNCONFIRMED.** Visual approval of the design is not functional phone acceptance. Actual shop/customer call notes were not supplied.
- 22:30 freeze applied to the original release. Sunny later explicitly approved Lane E integration/main publication at23:05; that reviewed feature is now deployed. No new tooling/skills/CI/refactors/process work.
- Phone acceptance remains unconfirmed beyond its15-minute buffer. D/H and optional polish remain cut; E was explicitly reinstated by Sunny. Keep the entire golden path.
- 23:00 rehearsal: **offline backup is ready and verified; Sunny's actual timed pitch/QR/phone rehearsal remains pending.** Script/slides belong to the separate pitch owner; no new pitch worker.
- 23:20 latest production release READY around23:19; hosted preorder smoke completed23:21:34 (about1.5 minutes late). Final documentation sync follows recording; verify main/origin and production identity before closeout.
- 23:30 keyboards down: **nothing commits after this time**.
- Continue coordination while remaining acceptance is pending; Sunny objected when the coordinator stopped mid-task. Respond to status questions briefly, then continue independent authorized work.

## Final offline backup — COMPLETE
- Easy-access file: `/Users/sunnynguyen/Desktop/Crimson Hacks Demo Backup/Fresh Donuts Demo - 2026-11-06.mp4`.
- Same folder: `Play backup.html` and `README.txt` with cue points and evidence labels.
- Complete source artifacts: `.artifacts/final-backup-preorder/`; keep original WebM, MP4, screenshots, recording-result.json, playback-result.json, video-metadata.json and delivery.json.
- Recorded **23:19:42–23:21:23 MST, AFTER freeze**, against application source313e63a. Runtime **103.28sec**, H.264 MP4,1440×1000,5,715,625bytes, silent for live narration.
- SHA256 `c63908319cfe08050fd10d11776707b62eb5dcf5ecfe06bbe8ff1551b6a616b8`.
- Shows public menu/story/directions → full photo draft → human correction → explicit publish → low → empty/sold out → unsaved notes draft → Save Tomorrow → Ready.
- Three LIVE OpenAI count calls and one LIVE notes call, allHTTP200; real LOCAL persistence. Staged synthetic images are clearly labeled throughout; **not an accuracy benchmark or physical-phone test**. No AI responses mocked, no PIN shown, no production data changed.
- Offline Chromium playback with networking disabled passed: playback advances, nine seek points decode, no video error. Public story/directions, correction, draft and final states visually inspected. Desktop copy hash equals verified MP4.
- Normal-speed complete backup needs104sec; a3-minute pitch has76sec left for opening, architecture and close. Do not cut full/low/empty/notes/Save/Ready to fit90sec.
- Prior full recording `.artifacts/final-backup-complete/`, core recording `.artifacts/final-backup-live/` and pre-freeze fixture recording `.artifacts/pitch/golden-path-fixture.mp4` are retained, but deliver the COMPLETE file above.
- Local JSON demo reset afterward to20/group, one sample order,78available. Do not reset production blindly.

## Latest preorder release verification — supersedes earlier application snapshots
- Coordinator personally passed verify (lint,43tests,build/assets) `.artifacts/verify/1794031976826-18d1ea/result.json` and all6 fixture browser flows `.artifacts/demo/run-PX3ed4/` on source313e63a.
- Coordinator personally reran real temporary Redis probe at23:17. Twelve concurrent last-stock submissions produced one winner/eleven409s; idempotency, changed-payload conflict, inventory/status, and synthetic checkout fulfillment deduplication passed. Original scratch values/types/TTLs restored. Evidence in E worktree `.artifacts/stripe/redis-storage-result.json`. No real Stripe payment in this probe.
- Hosted mobile390px pay-at-pickup smoke passed23:21:34: HTTP201, real staff order sourceweb/unpaid/$19.80, tomorrow16:45, today holds unchanged, no page errors/overflow, receipt excludes name/phone. Test order F0A2FD5D-788A-47B2-96C1-25167AD618D3 cancelled afterward. `.artifacts/production/preorder-check.json`. Do not reset production.
- Actual local Stripe sandbox success/decline/cancellation and real initial webhook passed in E's rehearsal; duplicate replays were locally re-signed. Production Stripe cards remain disabled. No production payment/3DS/refund claim.
- Latest clean archive deploy staging `.artifacts/deploy/main-preorder-313e63a`; dry upload283files/3,634,703bytes, no secrets/runtime data. Deployment identity `.artifacts/production/preorder-deployment.json`.
- Core backup does not add a separate preorder flow; public preorder is covered by the hosted check above. Previous story-only backup is retained at `.artifacts/final-backup-release/`.
- Temporary scratch Redis connection string was accidentally printed in a worker's private tool output; disclosed to Sunny. No production credentials or committed files affected. Never repeat the credential; scratch database expiresNovember10.

## Verification evidence
- Latest user-supplied story copy: coordinator verify `.artifacts/verify/1794030560825-ade087/result.json` and all3 fixture flows `.artifacts/demo/run-gv7NWv/` passed. Owner independent Claude MERGE at85e13cc and merged4f106ac. Current production identity/text independently passed `.artifacts/production/story-check.json`; old Tribune quote absent.
- Initial independent Codex MERGE: B2b10be9 (includes F2caa94a ONCE), C83904e9, Ac9fc35c/d3c787a; A handoff258b372 integrated. Workflow692a5a6 integrated first. No tooling additions afterward.
- Main original verify35 tests+lint/build/assets: `/Users/sunnynguyen/Desktop/crimsonHacks2026/.artifacts/verify/1794027187124-72315f/result.json`; main three fixture demo flows `.artifacts/demo/run-Bjold1/`.
- Recolor coordinator recheck: `.artifacts/verify/1794028345262-a7b76d/result.json`, `.artifacts/demo/run-iNNms6/`.
- Shop photos coordinator recheck: `.artifacts/verify/1794028896595-95a08c/result.json`, `.artifacts/demo/run-Bsfs9I/`.
- FINAL deli/application coordinator recheck: `.artifacts/verify/1794029276617-3c0059/result.json`, all3 fixture demo flows `.artifacts/demo/run-5RFg0i/`. Author lane also has independent Claude MERGE at85a914e plus verify/demo evidence in `photos.md`.
- Freeze production check: `.artifacts/production/freeze-check.json`: expected deployment READY, canonical alias correct, public/staff/menu/inventory200, unauthenticated orders401, deployed sandwich SHA256 matches source.
- Earlier production LIVE real photo9.741sec and notes1.763sec: `.artifacts/production/result.json`. Prior Astra25sec/504 failure `.artifacts/production/astra-timeout.json` motivated configured Terra; no source/contract change. **Do not claim reliable8sec or accuracy.**
- Local LIVE real Commons-photo browser flow `.artifacts/live-ui/result.json`; countUI16.679sec (earlier Astra), parse2.345sec. This and final backup are distinct from fixture browser tests.
- Actual app Redis operations passed against isolated scratch DB `.artifacts/deploy/redis-app-check.json`; separate deploy chat verified intended account-owned production Redis persistence and status operations.

## Approvals and preserved user work
- Sunny approved main: "yes merge main, approved" at21:52. Separate deployment chat approved: "terms accepted, deploy production." Do not ask again.
- Main checkout `/Users/sunnynguyen/Desktop/crimsonHacks2026` retains ONLY the user's original uncommitted `docs/CONTRACTS.md` note. Do not stage it, change the contract, or pop old stash over merged docs.
- Original six edits preserved in stash `c1789146fe0daeef5945869f81ec14bd2864a2c7` and `/tmp/crimson-main-doc-edits-premerge-20261106.patch`. Five non-contract edits reconciled in fc76e14. Contract-only backup `/tmp/crimson-main-contract-note-20261106.patch`; later byte-for-byte check `/tmp/crimson-main-contract-note-20261106-postrecolor.patch`.
- Ready accounting unchanged: today count20/held2/available18 → Ready count20/held0/available20. It releases the hold without automatic physical-count deduction. Evidence `.artifacts/live/ready-accounting-current.json`; sample restored. Deduction recommendation remains unapproved; main approval is not contract approval. Scripted tomorrow order does not affect today's stock.
- No secrets committed. Vercel credentials/env stay private. Never copy Redis credentials into local .env.

## Runtime and other chats
- Local production-mode site: http://localhost:3110, exec session **91774**, built from the final app source. Runtime overrides `VISION_MODEL=gpt-6.1-terra VISION_SECOND_MODEL=`. Uses local JSON; production data untouched by coordinator recording.
- A Claude lane stopped at21:16, final258b372, last terminal read still confirms stopped. Existing dirty generated AGENTS.md and browser artifacts were left untouched. No workers under this coordinator are doing feature work.
- Separate design owner: workspace31ee83c5-68c3-49c2-b713-4f506e8c8892, sessionb4988b4e-aec3-400c-8c3d-5a1edf67cb9e. Final deployed application4f106ac and deployment handoff10cac39. Later impeccable-init request remains local/uncommitted outside the frozen release; owner explicitly confirmed no main/deploy changes and23:30 cutoff. No recording/pitch/tooling ownership.
- Existing pitch owner: workspacee9465335-3e3e-4085-9676-3399452d2117, sessiona4f9b1ea-6754-4379-ae43-1778b8f87070. Corrected fallback copy/labels in de88b3b/67a2fa5; coordinator reviewed and integrated all3 Markdown pitch files. Full recording path/runtime sent at22:38; same Desktop path refreshed at22:55 for the updated story. No new edits or worker requested. This lane supplies Markdown content, not an exported slide deck. Actual slide assembly/QR/rehearsal remain with Sunny/separate owner.
- Lane E: workspacea44a0adf-561c-49f0-9628-b605eac22337, session3fce215f-5767-4ea1-877e-0f96b5dfbc26. Sunny explicitly said "push to main if it looks good enough" and "Make sure the last commit is in by11:30pm" at23:05. Independent Claude MERGE, helper merge5197d2a, and main313e63a followed. This supersedes earlier E-local-only notes. Production pay-at-pickup is deployed under the existing production approval. Stripe credentials were not copied to production. See E.md for actual local sandbox evidence versus fixture checks. Owner's final E.md update is the only delegated file change; root owns final handoff publication.
- Earlier deployment chat: workspace7efb4a55-644e-4e85-838d-5911da0a581f, session6896a636-0c09-4d01-9ad9-13d3eb8d1d66, completed.
- Use `superset sessions read --local` for these chat sessions. Current status/last messages should be checked before sending followups. Max3 workers; no recursive spawns; explicit file ownership.
- Original duplicate pitch worker was stopped at Sunny's request; its commit b0ec956 reverted ascb17966. Do not revive it.
- Historical scratch Upstash expiresNovember10; private credentials at `/tmp/crimson-upstash-bootstrap-secret.md` mode0600. Let expire; account-owned DB supersedes it.
- A's one Wikimedia request sent the user's email in a User-Agent; disclosed and stopped. Current handoff redacts it; old d3c787a history still contains it. No API secret sent.
