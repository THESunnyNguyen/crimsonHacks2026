# Lane E handoff

- Branch: `feat/preorder-stripe-sandbox`
- Base commit: `e7bc8a5a89c13ac29c4b6f9e17bdb8e918407074`
- Snapshot commit: `406c76d1da578a206e88158a4b25243202d5e180`
- Refreshed: 2026-11-07T05:50:21.895Z
- Worktree: `/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/feasible-add-online-order-a44a0adf`

## Committed changes since base
```text
.env.example                          |   3 +
 app/api/checkout/route.ts             |  27 +++
 app/api/preorder/route.ts             |  16 ++
 app/api/webhooks/stripe/route.ts      |  31 +++
 app/order/return/page.tsx             |  17 ++
 app/page.tsx                          |  11 +-
 components/public/CheckoutResult.tsx  |  93 +++++++++
 components/public/PreorderForm.tsx    | 361 ++++++++++++++++++++++++++++++++++
 components/public/PreorderReceipt.tsx |  38 ++++
 components/staff/orders/OrderCard.tsx |  10 +-
 components/staff/orders/content.ts    |   4 +-
 content/preorder.ts                   |  61 ++++++
 content/site.ts                       |   1 +
 docs/CONTRACTS.md                     |  37 ++++
 docs/STRIPE-DEMO.md                   |  79 ++++++++
 docs/WORKFLOW.md                      |   8 +-
 docs/handoffs/E.md                    |  77 ++++++++
 lib/pickup.ts                         |  48 +++++
 lib/preorder-request.ts               |  46 +++++
 lib/preorder.test.ts                  | 339 +++++++++++++++++++++++++++++++
 lib/preorder.ts                       |  53 +++++
 lib/store.ts                          | 263 ++++++++++++++++++++++++-
 lib/stripe.ts                         | 182 +++++++++++++++++
 lib/types.ts                          |   7 +
 package-lock.json                     |  22 ++-
 package.json                          |   1 +
 scripts/demo-test.mjs                 |   8 +-
 tests/e2e/preorder.spec.ts            | 216 ++++++++++++++++++++
 tests/fixtures/demo-clock.mjs         |  13 ++
 29 files changed, 2060 insertions(+), 12 deletions(-)
```

## Working tree at snapshot
```text
Clean
```

<!-- Agent-maintained progress below; refresh preserves this section. -->

## Coordinator scope sync — 2026-11-06, 22:49 America/Denver
- **Lane E is excluded from tonight's feature-frozen release.** The coordinator
  is finishing the original A+B+C release and backup, not integrating this lane.
- Keep implementation and contract extensions local to
  `feat/preorder-stripe-sandbox` for a separate decision. Earlier A+B+C release
  approval does not authorize pushing this branch, merging it into integration
  or main, configuring production payment keys, or deploying it.
- No recursive workers. No workers were launched for this lane.
- Global keyboards-down cutoff: **2026-11-06 23:30 America/Denver
  (2026-11-07 06:30 UTC)**. No commits after that cutoff.
- Snapshot `406c76d` contained the completed implementation, tests, setup notes,
  and original handoff. The tree was clean before this documentation-only sync.
  No code changes or additional runtime checks were needed for this scope update.

## Completed behavior
- Feature branch `feat/preorder-stripe-sandbox`, based on `e7bc8a5a89c13ac29c4b6f9e17bdb8e918407074`; no push, deployment, or merge to main.
- Public priced-donut preorders with assorted dozen/custom quantities, pickup slots, name/phone, optional notes, and pay at pickup.
- Atomic same-day stock checks and request deduplication; orders reach the staff board and update public stock through the existing polling.
- Stripe sandbox hosted Checkout for tomorrow only, server-side USD totals, durable drafts, signed webhook fulfillment, and idempotent paid orders.
- Return page waits for webhook confirmation; cancelled/expired/unpaid checkout never reports a confirmed payment. Missing configuration leaves pay-at-pickup available; live keys/events are rejected.
- Payment labels on staff cards; contract extension and setup/runbook in `docs/STRIPE-DEMO.md`.

## Checks and evidence
- `npm run verify`: lint, 43 unit/workflow tests, production build/typecheck, and asset validation pass. Final report: `.artifacts/verify/1794030528811-31e99c/result.json`.
- Exact verification steps: `npm run lint` (exit 0), `npm run test` (43 passed,
  zero failed/skipped), `npm run build` (exit 0, includes TypeScript), and
  `npm run gen:assets -- --validate` (exit 0). Completed at 22:49:07 Denver time.
  The report records the base HEAD and dirty tree because verification preceded
  the local commits; that tested source was committed in `90407a7`, `19958ee`,
  and `c13f7d4`. Later handoff edits are documentation only.
- `npm run test:demo`: all 6 browser acceptance tests pass in a disposable production app. Report: `.artifacts/demo/run-eFwgxJ/result.json`.
- Exact browser scenarios: photo correction publishes; empty photo publishes
  sold-out; call-note draft saves to tomorrow's board; customer preorder reaches
  staff and lowers today's stock; sold-out today offers tomorrow and rejects a
  direct same-day order; checkout UI redirects and waits for confirmation.
  The run finished at 22:48:36 Denver time. Scenario details and durations are in
  `.artifacts/demo/run-eFwgxJ/tests.log`.
- Browser evidence confirms a real public preorder reaches the staff board in the five-second polling cycle and stock becomes "Only 4 left". Replaying the request creates no duplicate.
- Stripe SDK transport is mocked in backend tests; signature verification and persistence are real. Tests cover amount tampering, live events, failed/unpaid checkout, expiration, and concurrent duplicate webhooks without resetting fulfillment state.
- Browser Stripe navigation/confirmation uses explicit API fixtures; no external Stripe account was contacted. Viewed mobile confirmation and staff-board screenshots.
- **Fixture-versus-live boundary:** the actual Stripe SDK builds requests against
  a mocked transport in unit tests; real local JSON storage and Stripe signature
  verification process synthetic events. Browser tests stub checkout creation,
  the hosted destination, and payment-status responses. They prove UI behavior,
  not a real Stripe-hosted payment, issuer decline, 3DS challenge, Stripe webhook
  delivery, refund, or merchant readiness. Those checks remain unperformed.
- Final copy extraction/formatting preserves the tested browser text and behavior; final verification covers the final source.
- Tests use a fixed Friday-morning clock in disposable processes only. No production fake-payment switch exists.

## Remaining work / limitations
- Sandbox keys were absent. Actual Stripe-hosted checkout must be rehearsed using `docs/STRIPE-DEMO.md`; add local `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_BASE_URL` and run Stripe CLI forwarding.
- Redis storage paths implement atomic writes and shared rate limits but have not been exercised against deployed Upstash in this session. Local JSON paths are tested.
- Cards are tomorrow-only; today uses pay at pickup. Closed Sundays; max 36 donuts. Prices are a demo subtotal without tax.
- Cancelling a staff order does not refund a Stripe test payment. Abandoned checkout drafts remain until seed/reset and do not hold stock.
- Cross-review and Sunny's approval are still required before integration into main.

## Resume
1. Preserve the local branch for later review. Start with `git status --short`
   and `git log -5 --oneline` in this worktree; do not switch or merge release branches.
2. For a later sandbox rehearsal, read `docs/STRIPE-DEMO.md` and configure only
   local sandbox credentials when supplied. Use `npm run dev -- --port 3105` if
   free, or another port with a matching `APP_BASE_URL`. No persistent dev server
   was left running by this task.
3. Rehearse an actual sandbox checkout and webhook replay, then obtain the required
   Claude cross-review. Neither successful tests nor that review authorize release.
4. Await a **separate explicit decision from Sunny** before any push, integration,
   deployment, or production payment configuration. Lane E is not shipping tonight.
