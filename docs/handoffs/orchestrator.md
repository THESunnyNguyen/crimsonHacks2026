# Orchestrator handoff — Crimson Hacks 2026

Refreshed: 2026-11-06T22:56:22-07:00. Run `date` at every check-in.

## Current release
- Use `/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/orchestrator-crimson-hacks-173615f7`, branch `integration`. Original chat cwd ending b578253d is stale; do not use it as application source.
- Node22: prepend `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin` to PATH.
- Main merge and production were explicitly approved and completed. Main contains final reviewed application source **4f106acc6d56bf18dc24d5b7abde49b78b45938b**, plus documentation commits. Run git log/status for current documentation tip.
- Production: https://fresh-donuts-deli-crimson2026.vercel.app
- Final deployment: **dpl_8XT5ChiRSN3jqFy19E6aAv9aNf3P**, immutable https://fresh-donuts-deli-crimson2026-lgfqkfzoz.vercel.app, READY/production. Application source4f106ac (application tree equals story commit85e13cc).
- Final public styling includes red/navy/cream palette, user-supplied storefront and kitchen photos, user-supplied Wilson and Brenda story copy, and generated deli sandwich with Illustration label. See `recolor.md` and `photos.md` for independent reviews and deployment evidence.
- Vercel project has **no Git auto-deploy link**. Documentation pushes do not require deployment; future application changes need a deliberate reviewed deploy from a clean tracked archive.
- Production/Preview vision model `gpt-6.1-terra`; notes model `gpt-6-luna`. Account-owned Free Upstash newDB, US-WEST-1. Never overwrite it with the historical scratch DB.
- Local checks use Node22. Vercel project says22.x, but existing package engines `>=22` resolved both earlier and current builds to nodejs26.x. No runtime/tooling source edit was made tonight.

## Clock and remaining acceptance
- 22:00 integration A+B+C verify/demo milestone: MET early.
- 22:20 hosted live AI: MET with a real Commons donut photo and typed DEMO notes. **Sunny physical-phone full flow remains UNCONFIRMED.** Visual approval of the design is not functional phone acceptance. Actual shop/customer call notes were not supplied.
- 22:30 FEATURE FREEZE is active. Only demo blockers, copy and polish allowed; no new features/tooling/skills/CI/refactors/process work.
- The phone milestone is unconfirmed beyond its15-minute buffer. D/E/H and further optional polish are cut; keep the entire golden path.
- 23:00 rehearsal: **offline backup is ready and verified; Sunny's actual timed pitch/QR/phone rehearsal remains pending.** Script/slides belong to the separate pitch owner; no new pitch worker.
- 23:20 main/production milestone: approved main and production already completed early. Final documentation sync follows recording; verify main/origin and production identity before closeout.
- 23:30 keyboards down: **nothing commits after this time**.
- Continue coordination while remaining acceptance is pending; Sunny objected when the coordinator stopped mid-task. Respond to status questions briefly, then continue independent authorized work.

## Final offline backup — COMPLETE
- Easy-access file: `/Users/sunnynguyen/Desktop/Crimson Hacks Demo Backup/Fresh Donuts Demo - 2026-11-06.mp4`.
- Same folder: `Play backup.html` and `README.txt` with cue points and evidence labels.
- Complete source artifacts: `.artifacts/final-backup-release/`; keep original WebM, MP4, screenshots, recording-result.json, playback-result.json, video-metadata.json and delivery.json.
- Recorded **22:51:23–22:53:05 MST, AFTER freeze**, against application source4f106ac. Runtime **101.68sec**, H.264 MP4,1440×1000,5,735,612bytes, silent for live narration.
- SHA256 `05586f59c92dbfdeced90a9dcdb04bb471dc71ac90249e758cd9d3f33aeafd82`.
- Shows public menu/story/directions → full photo draft → human correction → explicit publish → low → empty/sold out → unsaved notes draft → Save Tomorrow → Ready.
- Three LIVE OpenAI count calls and one LIVE notes call, allHTTP200; real LOCAL persistence. Staged synthetic images are clearly labeled throughout; **not an accuracy benchmark or physical-phone test**. No AI responses mocked, no PIN shown, no production data changed.
- Offline Chromium playback with networking disabled passed: playback advances, nine seek points decode, no video error. Public story/directions, correction, draft and final states visually inspected. Desktop copy hash equals verified MP4.
- Normal-speed complete backup needs102sec; a3-minute pitch has78sec left for opening, architecture and close. Do not cut full/low/empty/notes/Save/Ready to fit90sec.
- Prior full recording `.artifacts/final-backup-complete/`, core recording `.artifacts/final-backup-live/` and pre-freeze fixture recording `.artifacts/pitch/golden-path-fixture.mp4` are retained, but deliver the COMPLETE file above.
- Local JSON demo reset afterward to20/group, one sample order,78available. Do not reset production blindly.

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
- Local production-mode site: http://localhost:3110, exec session **87668**, built from the final app source. Runtime overrides `VISION_MODEL=gpt-6.1-terra VISION_SECOND_MODEL=`. Uses local JSON; production data untouched by coordinator recording.
- A Claude lane stopped at21:16, final258b372, last terminal read still confirms stopped. Existing dirty generated AGENTS.md and browser artifacts were left untouched. No workers under this coordinator are doing feature work.
- Separate design owner: workspace31ee83c5-68c3-49c2-b713-4f506e8c8892, sessionb4988b4e-aec3-400c-8c3d-5a1edf67cb9e. Final deployed application4f106ac and deployment handoff10cac39. Later impeccable-init request remains local/uncommitted outside the frozen release; owner explicitly confirmed no main/deploy changes and23:30 cutoff. No recording/pitch/tooling ownership.
- Existing pitch owner: workspacee9465335-3e3e-4085-9676-3399452d2117, sessiona4f9b1ea-6754-4379-ae43-1778b8f87070. Corrected fallback copy/labels in de88b3b/67a2fa5; coordinator reviewed and integrated all3 Markdown pitch files. Full recording path/runtime sent at22:38; same Desktop path refreshed at22:55 for the updated story. No new edits or worker requested. This lane supplies Markdown content, not an exported slide deck. Actual slide assembly/QR/rehearsal remain with Sunny/separate owner.
- Separate later feature request: workspacea44a0adf-561c-49f0-9628-b605eac22337, session3fce215f-5767-4ea1-877e-0f96b5dfbc26, local branch `feat/preorder-stripe-sandbox` at e015e88. User explicitly requested a new branch to consider later. It is **excluded from tonight release**; no push/merge/deploy/payment production configuration authorized by earlier release approval. Owner reports43tests/6browserchecks with fixture Stripe; actual Stripe sandbox/Redis checks remain outside release acceptance. Owner acknowledged separate decision and23:30 cutoff; local sandbox rehearsal may continue if user supplies keys. Do not cherry-pick its contract/tooling/feature changes into this release.
- Earlier deployment chat: workspace7efb4a55-644e-4e85-838d-5911da0a581f, session6896a636-0c09-4d01-9ad9-13d3eb8d1d66, completed.
- Use `superset sessions read --local` for these chat sessions. Current status/last messages should be checked before sending followups. Max3 workers; no recursive spawns; explicit file ownership.
- Original duplicate pitch worker was stopped at Sunny's request; its commit b0ec956 reverted ascb17966. Do not revive it.
- Historical scratch Upstash expiresNovember10; private credentials at `/tmp/crimson-upstash-bootstrap-secret.md` mode0600. Let expire; account-owned DB supersedes it.
- A's one Wikimedia request sent the user's email in a User-Agent; disclosed and stopped. Current handoff redacts it; old d3c787a history still contains it. No API secret sent.
