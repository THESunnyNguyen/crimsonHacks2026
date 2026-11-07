# Deployment handoff — November 6, 2026

## Superseding status — 21:52 MST
Production is LIVE after Sunny explicitly approved in the separate deployment
chat: "terms accepted, deploy production." Account-owned Free Upstash newDB in
US-WEST-1 supersedes the temporary scratch database described below.
Live: https://fresh-donuts-deli-crimson2026.vercel.app
Deployment source bd13056; application code equals current integration. The other
agent reported Redis persistence, staff auth, inventory/order updates and live
AI parsing passed. Parent independently confirmed public HTTP200 and staff401.
Main merge now separately approved in this chat. Earlier blocked notes below
are historical. Actual-phone acceptance and post-freeze backup still pending.

Last checked: **21:44 MST**. Integration source: `0f233aed25cc5e5d53cbf63cad4f1f40bb3b52bb`.

## Status: blocked before build

**No deployment URL exists; no Vercel build has started.** The project API reports
zero deployments. The authorized command `vercel deploy --target preview --yes
--no-wait --json` stopped with `reason: first_deployment_production` and
`status: action_required`. Vercel requires this new project's first deployment to
be Production; the CLI explicitly requires user approval before retrying.
No Production deployment or main merge was attempted.

This is documented in [Vercel's deployment guide](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting).
The current authorization covers Preview only. A separate explicit decision is
needed before any first Production deployment; this must not be interpreted as
approval to merge main. Alternatively, Sunny can identify an appropriate existing
project that already supports Preview. Do not use an unrelated project.

## Prepared and checked

- Project: `fresh-donuts-deli-crimson2026`, ID `prj_0gvO8JeuXii5sCeULRB3qb8eohtE`;
  team `team_pogAINEPGSNS3tya8FixFGpE`; CLI authenticated as `thesunnynguyen`.
- Framework `nextjs`; Node `22.x`. The integration worktree is linked via ignored
  `.vercel/project.json`.
- Preview-only env metadata confirmed: sensitive `STAFF_PIN`, `OPENAI_API_KEY`;
  encrypted `VISION_MODEL`, `PARSE_MODEL`, `TRANSCRIBE_MODEL`. No values logged.
- Disabled Vercel login protection for this new project (`ssoProtection: null`)
  to allow the requested public phone preview when a deployment exists.
  Password protection and trusted IP restrictions are also null. The app's staff
  PIN gate remains in source. [Documented API setting](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).
- Created a clean tracked-source package at `.artifacts/deploy/source/` from the
  exact commit above. A dry run detected Next.js and 259 upload files (3,047,876
  bytes), with no `.env` secrets, local JSON data, `.vercel` files, or artifacts in
  the upload set. `.env.example` contains variable names/placeholders only.
  The earlier direct-worktree dry run included ignored runtime artifacts, so use
  refreshed clean staging for any later deployment rather than the worktree root.
- Did not edit app/source/contracts/tooling/CI/skills, mutate port 3110 runtime
  data, provision a database, accept service terms, or make additional AI calls.

## Redis ready; hosted and phone acceptance remain unresolved

At 21:42 the coordinator provisioned a dedicated free temporary Upstash database
through the officially documented `POST https://upstash.com/start-redis` endpoint.
No signup, billing details, personal identifying headers, or paid resources.
The response contains credentials and a claim link, saved **privately** at
`/tmp/crimson-upstash-bootstrap-secret.md` (mode 0600), never in local `.env` or Git.
The database expires **November 10, 2026** unless claimed into an Upstash account;
do not present it as permanent production storage before claiming/replacing it.
Source: https://upstash.com/docs/redis/overall/getstarted

`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are now set as sensitive
Preview-only Vercel variables. All seven required Preview env names/targets were
independently checked. No Production variables or deployment have been created.

Real database PING passed. Actual `lib/store.ts` paths passed against this new
isolated database: seed sample, Lua count update/low level, order status update
and hold release/restoration, sold-out override on/off. Demo data is restored to
20 per group and one sample (78 available). Credentials were passed only to the
scoped child verification process; the existing local app remains on JSON.
Evidence: `.artifacts/deploy/redis-readiness.json`, `redis-app-check.json`.

No hosted HTTP or actual-phone checks have run because Vercel still requires
explicit approval for the new project's first Production deployment. An existing
dedicated project can be selected instead. On first-Production approval, configure
its Production env deliberately before deploying; Preview env does not cover it.
Main merge authorization remains a separate final gate.

## Evidence (ignored)

- `.artifacts/deploy/deploy-start.json` — structured preview refusal.
- `.artifacts/deploy/deployment-status.json` — API confirms zero deployments.
- `.artifacts/deploy/env-configured.json` — env names, targets, and setup results.
- `.artifacts/deploy/project-before.json` and `project-public-preview.json` —
  sanitized framework, Node, and login-protection settings.
- `.artifacts/deploy/source-head.txt`, `source-dry.json`, `source-summary.json` —
  source identity and clean upload inspection.

No commit made; parent owns the index and may commit this handoff.
