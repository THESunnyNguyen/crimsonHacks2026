# Deployment handoff — November 6, 2026

Last checked: **21:24 MST**. Integration source: `0f233aed25cc5e5d53cbf63cad4f1f40bb3b52bb`.

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

## Redis and phone acceptance remain unresolved

The intended dedicated Redis database has not been identified. These variables
are absent and must be configured in the intended Vercel environment before a
working hosted inventory/order flow can be claimed:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Do not put Redis credentials in local `.env`, attach another project's database,
or ask for secret values in chat. `lib/store.ts` deliberately throws on Vercel
without Redis. No hosted HTTP, staff PIN, persistence, or phone acceptance checks
have run because there is no deployment. Prior integration verification remains
the parent's local evidence, not a Vercel build result.

## Evidence (ignored)

- `.artifacts/deploy/deploy-start.json` — structured preview refusal.
- `.artifacts/deploy/deployment-status.json` — API confirms zero deployments.
- `.artifacts/deploy/env-configured.json` — env names, targets, and setup results.
- `.artifacts/deploy/project-before.json` and `project-public-preview.json` —
  sanitized framework, Node, and login-protection settings.
- `.artifacts/deploy/source-head.txt`, `source-dry.json`, `source-summary.json` —
  source identity and clean upload inspection.

No commit made; parent owns the index and may commit this handoff.
