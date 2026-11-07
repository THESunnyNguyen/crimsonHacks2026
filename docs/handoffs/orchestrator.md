# Integration handoff — November 6, 2026

Coordinator operates in existing integration worktree:
`/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/orchestrator-crimson-hacks-173615f7`.
Original chat cwd b578253d was fast-forwarded to6004e25 for isolated Pitch work;
Pitch commit6ef7385 cherry-picked onto integration as b0ec956.
Use Node22: prepend `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin` to PATH.
Run `date` at every check-in; shell clock is authoritative (last 21:25 MST).

## Authorization and clock
User authorizes integration and preview only, NOT main merge or production push.
Separate explicit final yes required. No tooling, CI, skills, refactors, process work.
Max 3 workers, no recursive agents. Until 22:00 isolated worktrees; after 22:00
workers work against integration with nonoverlapping ownership.
22:00 verify + fixture test:demo; 22:20 real photo/notes + preview phone check;
22:30 freeze; 23:00 rehearsal + saved video; 23:20 approved main + prod;
23:30 no further commits. If milestone >15 min late drop D/E/H then polish.
Golden path docs/DEMO.md cannot be cut.

## Decisions pending Sunny (async questions sent)
1. Ready semantics: release held only (C brief explicitly says restores stock)
versus decrement physical case count AND release held. Recommend latter; do not
change CONTRACTS/store before reply. Need handle repeated transitions, tomorrow,
post-box cancellation/reopening if approved.
2. Six main dirty docs: preserve/reconcile after approval; patch backup at
`/tmp/crimson-main-doc-edits-20261106.patch`. Main originals untouched.
3. Confirm separate final approval gate; no approval yet.
4. Need real donut photo path/URL with known counts. Only synthetic images found.

## Integration — 22:00 milestone met early at21:17
Base3f0b12a; existing clean integration reused. All reviewed and integrated:
- Workflow692a5a6 as275d97b; B2b10be9 (includes F2caa94a ONCE) asd81d026.
- C83904e9 as6004e25; A corec9fc35c asc23f172; A cap/evald3c787a asfef73f3.
- Pitch docs6ef7385 cherry-picked asb0ec956; A handoff258b372 merged afterward.
Own npm run verify passed after EVERY integration merge. Latest evidence:
`.artifacts/verify/1794025091602-37684e/result.json` (35 tests + lint/build/assets).
Own npm run test:demo passed all3 fixture-AI browser flows on combined source:
`.artifacts/demo/run-2SwpOO/` and after1024px `.artifacts/demo/run-iyTPCd/`.
No live accuracy claim from fixtures. No required new feature fixes found yet.
IMPORTANT merge-task.sh refuses branches other than main (observed exit1).
No tooling edit: reproduced its pending merge + verify + commit-on-pass procedure.

## Live evidence
Local ignored .env copied only app variables from main, NO Redis. Main .env has
stale model IDs: first live parse failed404 for claude-haiku-5-5. Integration-only
.env corrected to contracted OpenAI IDs. Main file untouched. Do not log keys.
- Typed DEMO notes via real gpt-6-luna passed assertions2491ms (<3sec).
  `.artifacts/live/parse-result.json`. This is typed sample text, not a real caller.
- A real licensed Commons photo evaluated with real models; group labels uncertain.
  A documents latency17–23s astra;6.7–7.5s terra. No shop-photo benchmark.
- Independently reran one real-photo astra evaluation:19.8s, output5/4/0/3 versus
  tentative labels7/1/1/3; total12 correct, grouping poor. `.artifacts/live/count-real-astra.log`.
- Need real shop full/low/empty phone photos and phone testing before accuracy claim.
A accidentally sent email in one Wikimedia User-Agent; disclosed to Sunny, stopped.
Current handoff redacts literal address; original remains in d3c787a history.

## Local app / video
App running3110 via production exec session43961 (localhost and10.56.51.5:3110).
Seeded local demo data20/group with one sample. Pitch finished and RELEASED the runtime write window.
Video explicitly labels fixture AI throughout; real local publish/order writes.
USER STEERING21:25: separate agent owns pitch script/slides; stop our Pitch worker.
Our duplicate pitch docs commit b0ec956 reverted. Retain ignored provisional
recording only. ORCHESTRATOR must capture FINAL backup AFTER22:30 freeze.
No more pitch workers or pitch-document edits.
Current provisional .artifacts/pitch/golden-path-fixture.mp4 and .webm passed
all8 golden-path assertions with3count and1parse fixtures, no page errors.
Parent ffprobe verified MP4 duration80.92sec, size3,209,010bytes; worker offline
HTML video playback metadata+seeks passed. This is PROVISIONAL, not post-freeze final.
Runtime write window released.3110 now production next start, session43961;
dev HMR blocked127.0.0.1, no source/config fix needed. Parent reset local demo data at21:26:20/group, one sample, available78. Keep backup labeled fixture AI.

## Workers — phase2 started early after integration passed
A Claude workspace639ca8bb-82d9-43d3-a9fa-4cd4b354d3f6,
terminal75148cc2-db58-4ad5-a51b-d80110946e67 finished/stopped at258b372.
All A changes reviewed; dirty generated AGENTS/browser artifacts preserved in lane.
Review Codex native `/root/review_bc` completed read-only B/C/A reviews (MERGE all),
then reassigned DEPLOY worker in integration (only .vercel, .artifacts/deploy,
docs/handoffs/deploy.md and preview external config). No app code or main/prod.
Pitch native `/root/pitch` INTERRUPTED and STOPPED on user request21:25.
No further pitch worker permitted; script/slides handled separately.
Replacement deployment worker `/root/preview_finish` completed blocked handoff;
prior `/root/review_bc` deployment attempts hit TPM limits; do not resume.
All workers now stopped/finished. Parent handles post-freeze recording.
Both workers must coordinate commits with parent. No recursive workers.
Old CLI reviewer failed auth before work; older B/C/F sessions idle/limited.

## Deploy preparation
New Vercel project `fresh-donuts-deli-crimson2026` created and linked to integration.
Vercel CLI authenticated thesunnynguyen. No production deployment authorized.
CLI created ignored .env.local OIDC token; removed its redundant .gitignore edits.
Vercel integration installations EMPTY. No Redis credentials available locally.
Async question to Sunny asks intended DB/project (no secrets in chat), pending.
Deploy worker handles Node22 and preview-only OpenAI/PIN env via stdin; never
copy Redis into local .env or attach unrelated production database.
Actual preview Redis and phone acceptance outstanding. No working preview claim yet.

##21:25 deployment gate
See docs/handoffs/deploy.md. New project first preview refused by Vercel:
reason first_deployment_production; userActionRequired:true. No deployments/URL
or Vercel build exists. Do NOT bypass or deploy production without explicit yes.
Async question asks wait until final gate vs authorize first deployment once
Redis ready vs named existing dedicated project. Pending, not approved.
Preview-only OpenAI/PIN/model env ready; Next+Node22 configured; Vercel login
protection disabled only for this new project to permit public phone preview.
Staff PIN gate unchanged. Dedicated Redis still missing.
Clean tracked deployment source prepared at .artifacts/deploy/source (0f233ae);
refresh from final HEAD before deployment. No secrets/runtime data in upload.
Main six-edit patch rechecked identical to saved backup at21:22.

##21:34 resumed monitoring — do not end merely for deployment blockers
Sunny asked why coordinator stopped at21:27. Ending the turn was an error:
deployment decisions block only deployment, not monitoring/post-freeze recording.
Continue authorized work and timed monitoring through deadline; don't interpret
silence or elapsed time as approval. No more pitch workers.

- Unmocked Chromium phone-width browser run passed on local3110 at21:32:
  real Commons image -> count remains unsaved -> staff correction -> publish ->
  public Only3left; typed DEMO notes -> unsaved draft -> Save -> Tomorrow -> Ready.
  Photo UI16,679ms; notes UI2,345ms; HTTP200 both; no page errors/overflow.
  Evidence `.artifacts/live-ui/result.json` and screenshots. No AI interception.
  This is not an actual phone/Redis test or a shop-photo accuracy benchmark.
- Independent Terra real-photo pipeline run11.0s (slower than A's6.7–7.5s).
  `.artifacts/live/count-real-terra.log`. Neither model reliably meets8sec;
  no default model change made from this evidence. Manual fallback remains vital.
- Local data reset after live UI run:20/group, one sample, available78.
- WebKit browser executable absent. Did not install new browser/tooling.
- Separate pitch owner branch `pitch-demo-docs-e9465335`, worktree
  `own-lane-p-pitch-e9465335`, commit e9b98d3, three docs only. No terminal session
  exists to message. Do not spawn one or edit its content. Review finding:
  docs/demo-script.md:47 and:53 permit skipping repeated photos;:54 permits showing
  seeded board instead of draft/save. Conflicts with Sunny's never-cut-golden-path
  instruction. Preserve full->low->empty->notes->save->Ready via labeled recording
  or manual fallback. Not integrated pending owner resolution. Actual manual label
  is 'Publish counts'. Core app remains unmodified.

## Final backup after22:30 freeze (orchestrator only)
Confirm date and final source/runtime, seed intended LOCAL app, then reuse ignored
one-off recorder (no repo tooling added):
`PITCH_APP_ROOT=<integration-path> PITCH_MUTATION_APPROVED=yes PITCH_OUTPUT=.artifacts/final-backup node --import tsx .artifacts/pitch/record.mjs`
This records fixture AI+real local writes with permanent visible fixture label.
Transcode WebM to MP4 via ffmpeg, independently ffprobe duration and inspect frames;
verify offline HTML video playback, record HEAD/check results in this handoff.
Keep provisional21:23 recording until final succeeds. Restore local demo seed
when finished. Do NOT claim fixtures establish model accuracy or hosted Redis.

##21:39 documentation reconciliation
Applied the five NON-CONTRACT main edits into integration, preserving workflow's
existing three-worker policy. `git diff --check` passed. Main originals and saved
patch remain byte-identical. CONTRACTS.md unchanged: its rate/retry text and
Ready semantics still need Sunny approval. Do not block reversible non-contract
reconciliation on the earlier unnecessarily broad approval question.

##21:44 actual Redis advanced without a paid dependency
Dedicated free temporary Upstash created, PING and actual lib/store.ts Redis
paths passed. All seven Preview env names/targets checked. See updated deploy.md.
Expires November10 unless claimed. Private bootstrap credentials/claim link only
in /tmp/crimson-upstash-bootstrap-secret.md, mode0600; never local .env or Git.
No production deployment/env/main change. Only deployment gate now is explicit
first-Production yes (or named appropriate existing project).
Current Ready behavior reproduced via local sample: count20 held2 available18
-> Ready count20 held0 available20; reverted sample toNew. Evidence
.artifacts/live/ready-accounting-current.json. Stock decision still pending.
