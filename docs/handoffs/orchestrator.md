# Orchestrator handoff — Crimson Hacks 2026

Refreshed: 2026-11-06T22:13:48-07:00. Run `date` at every check-in.

## Current state
- Working directory: `/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/orchestrator-crimson-hacks-173615f7`, branch `integration`.
- Original chat cwd b578253d is a stale isolated pitch worktree; do NOT use it as the app source.
- Node 22: prepend `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin` to PATH.
- **Main merged and pushed: `4be30e0`**, with explicit Sunny approval: "yes merge main, approved" (21:52). Separate user-authorized recolor subsequently advanced origin/main to `132f692`; local main is now fast-forwarded to match, preserving the dirty contract note byte-for-byte.
- **Production verified:** https://fresh-donuts-deli-crimson2026.vercel.app
- Current deployment: `dpl_5jRjHhSRC2rLuEMB8hgyQDLmzXpo`, immutable URL `https://fresh-donuts-deli-crimson2026-lvvuhg332.vercel.app`, READY/production; canonical alias independently inspected at22:14. Deployed application SHA `285f5b2`; main `132f692` adds only its handoff. Previous live-AI verified deployment was `dpl_Hoc1HV9ZoxbKfXVR9qbCX5zNeUDS` (`rkhjh6itz`).
- Previous uploaded source was `git archive 4be30e0`; current recolor was independently cross-reviewed and deployed from tracked-source archive `285f5b2` by its owning chat. See `docs/handoffs/recolor.md`.
- Production/Preview vision model: `gpt-6.1-terra`. Parse model remains `gpt-6-luna`. No source or contract changes for this configuration correction.
- Vercel project has **no Git auto-deploy link**. Main push was followed by explicit deployment from a clean archive. Do not assume a new push deploys automatically.
- Account-owned Free Upstash **newDB**, US-WEST-1, was connected by the separate deployment chat. All required Production env names checked.
- Recolor changes only theme tokens/public styling; contracts and app behavior are unchanged. Coordinator independently reran verify and fixture demo before merging into integration.
- Local checks use Node22. Vercel project setting is22.x, but existing package engines `>=22` resolved BOTH previous and recolor deployments to nodejs26.x; this is not a new recolor regression. No runtime/tooling source edit made tonight.

## Remaining work and clock
- **Continue this active orchestration task; do not end the turn merely because decisions are pending.** Sunny objected when the coordinator stopped earlier.
- 22:00 integration milestone: MET early; verify and fixture demo checks pass on integration and main.
- 22:20 live-AI + phone milestone: live production AI and hosted app verified; **actual Sunny phone flow still awaiting reply** to async question.
- 22:30 FEATURE FREEZE: only demo blockers/copy/polish after; record final backup AFTER this time.
- 23:00 rehearsal + playable offline backup due. Orchestrator owns recording; script/slides belong to the separate pitch agent.
- 23:20 main/production gate already met early with approval; recheck final state if anything changes.
- 23:30 keyboards down: **no commits after**. If a milestone is over 15 minutes late, cut D/E/H then polish. None of these optional lanes has been started. Never cut full → low → empty → notes → Save → Ready.
- No new tooling, skills, CI, refactors or process work. No pitch worker. Workers write feature code if an actual bug requires a fix; max 3 workers, explicit ownership, no recursive workers. No workers currently active under this coordinator.

## Approvals, preserved edits, unresolved semantics
- Production approval was found in the OTHER chat: user said **"terms accepted, deploy production."** No need to ask again.
- That chat: workspace `7efb4a55-644e-4e85-838d-5911da0a581f`, session `6896a636-0c09-4d01-9ad9-13d3eb8d1d66`; it completed deployment and live storage/parse checks. Use `superset sessions read --local` for messages, not terminals (none listed).
- Main's original six edits preserved in stash `c1789146fe0daeef5945869f81ec14bd2864a2c7` and `/tmp/crimson-main-doc-edits-premerge-20261106.patch`.
- Five NON-CONTRACT edits reconciled in integration/main (`fc76e14`), retaining workflow's three-worker cap.
- Only the original `docs/CONTRACTS.md` note is restored DIRTY on main; not committed/pushed. Do not pop the entire stash over merged docs. `/tmp/crimson-main-contract-note-20261106.patch` preserves that note.
- **Ready semantics unchanged:** releases today's held quantity without reducing stored case count. Local sample proved count20/held2/available18 → Ready count20/held0/available20, then sample restored. Evidence `.artifacts/live/ready-accounting-current.json`.
- Recommended count deduction is NOT approved/implemented. Main approval was not permission to silently rewrite the contract. This does not affect the scripted tomorrow order's today stock.

## Verification evidence
- Recolor integration recheck PASS: `.artifacts/verify/1794028345262-a7b76d/result.json` and all3 fixture demo flows `.artifacts/demo/run-iNNms6/`. Read-only diff matches the recolor owner’s7 files. Cross-review evidence in that worktree `.artifacts/recolor/claude-review.json` reports MERGE at285f5b2.
- Independent Codex MERGE verdicts: B `2b10be9` (inherits F `2caa94a` ONCE), C `83904e9`, A `c9fc35c` and `d3c787a`; A handoff correction `258b372` also integrated.
- Workflow `692a5a6` was integrated first. Existing merge helper refuses non-main branches, so integration used pending merge → verify → commit procedure without tooling edits. Actual main merge used the helper normally.
- Main `npm run verify`: 35 tests + lint/build/assets passed, `/Users/sunnynguyen/Desktop/crimsonHacks2026/.artifacts/verify/1794027187124-72315f/result.json`.
- Main `npm run test:demo`: all 3 fixture browser flows passed, main `.artifacts/demo/run-Bjold1/`. Integration equivalents: `.artifacts/demo/run-iyTPCd/`, `.artifacts/verify/1794025091602-37684e/`.
- Local unmocked browser real Commons photo + typed DEMO notes + correction/publish + Save/Ready passed: `.artifacts/live-ui/result.json`. Count UI16.679sec, parse UI2.345sec. No page errors/overflow. Not an actual-phone or shop-photo benchmark.
- Actual app Redis storage paths passed against isolated scratch DB: `.artifacts/deploy/redis-app-check.json`. Separate deploy agent also verified intended production Redis persistence/status flows.
- **Production final check:** `.artifacts/production/result.json`, live real photo HTTP200 **9.741sec**, live notes HTTP200 **1.763sec**, correct draft fields. Public/staff/inventory200; orders401 without PIN and200 with PIN. Chromium390px public/staff passed; loaded manual controls independently awaited before refreshed staff screenshot. No parent production stock/order mutations in this check.
- Prior production Astra count hit25sec/HTTP504: `.artifacts/production/astra-timeout.json`. Switching configured model to Terra resolved that timeout in the recheck; **eight-second target still not met**. Do not claim reliable latency or accuracy.
- Real Commons photo has uncertain group labels/cruller; synthetic drawings are pipeline fixtures, never model accuracy evidence. See docs/eval.md.

## Local runtime and final recording
- Local production-mode app on **3110**, restarting after verified recolor build, with `VISION_MODEL=gpt-6.1-terra VISION_SECOND_MODEL=`. Uses JSON; never place Redis in local .env.
- Node22, rebuilt `.next` production build matches application code of main132f692/deployed285f5b2. Dev mode previously blocked127.0.0.1 HMR; no config edit was made. Use http://localhost:3110.
- Local demo was reset:20/group, one sample,78 available. Seed again immediately before recording, local only.
- Provisional fixture video: `.artifacts/pitch/golden-path-fixture.mp4` and `.webm`; 80.92sec/3,209,010bytes. All8 golden steps + offline playback passed. Permanent fixture-AI label. It is NOT the final post-freeze recording.
- Final LIVE recording variant prepared (syntax checked, not run before freeze): `.artifacts/pitch/record-live.mjs`. It calls actual local AI routes (no AI interception), uses staged synthetic images with known counts, corrects counts explicitly, and labels LIVE OPENAI/STAGED IMAGES/HUMAN CONFIRMATION. It is not an accuracy benchmark.
- After22:30, run:
  `PITCH_APP_ROOT=<integration-path> PITCH_MUTATION_APPROVED=yes BACKUP_OUTPUT=.artifacts/final-backup-live node --import tsx .artifacts/pitch/record-live.mjs`
- Preserve provisional video. If live recording fails, save its failure evidence and record full fixture backup after freeze:
  `PITCH_APP_ROOT=<integration-path> PITCH_MUTATION_APPROVED=yes PITCH_OUTPUT=.artifacts/final-backup-fixture node --import tsx .artifacts/pitch/record.mjs`
- Use ffmpeg to transcode final WebM to MP4; ffprobe duration; inspect frames and verify offline HTML video playback. Save exact source SHA, timestamps, AI mode and checks in handoff. No PIN may appear in recordings. Restore local seed afterward; do not reset production blindly.

## Other lanes and caveats
- A Claude stopped at21:16 (hard stop21:45 met), final258b372. Original lane retains generated dirty AGENTS.md and browser artifacts, untouched.
- Review native worker completed; old deploy native worker hit TPM limits and was replaced; replacement finished blocked before the separate user-led deployment chat succeeded. No need to resume them.
- User stopped our duplicate Pitch worker. Our pitch-doc cherry-pick b0ec956 was reverted ascb17966. Do not reintroduce it.
- Separate pitch branch `pitch-demo-docs-e9465335`, commit `e9b98d3`, owns scripts/slides. Read-only review found demo-script lines47/53/54 permit skipping golden-path steps; noted for owner, NOT edited or integrated. No terminal to message. Preserve all steps using fallback/video.
- A accidentally sent the user's email once in a Wikimedia download User-Agent; disclosed to Sunny and stopped. Current handoff redacts it; old d3c787a history retains it. No API secrets sent.
- Superseded scratch Upstash expires November10; credentials/claim link privately at `/tmp/crimson-upstash-bootstrap-secret.md` mode0600. Let it expire; do not overwrite the account-owned hosting DB configuration with it.
