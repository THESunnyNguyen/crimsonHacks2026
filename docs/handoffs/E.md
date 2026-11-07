# Lane E handoff

- Branch: `feat/preorder-stripe-sandbox`
- Base commit: `e7bc8a5a89c13ac29c4b6f9e17bdb8e918407074`
- Snapshot commit: `c13f7d44a9dc8e2ea8f19545e8deef4734d50677`
- Refreshed: 2026-11-07T05:49:35.651Z
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
 28 files changed, 1983 insertions(+), 12 deletions(-)
```

## Working tree at snapshot
```text
?? docs/handoffs/E.md
```

<!-- Agent-maintained progress below; refresh preserves this section. -->

## Completed behavior
- Feature branch `feat/preorder-stripe-sandbox`, based on `e7bc8a5a89c13ac29c4b6f9e17bdb8e918407074`; no push, deployment, or merge to main.
- Public priced-donut preorders with assorted dozen/custom quantities, pickup slots, name/phone, optional notes, and pay at pickup.
- Atomic same-day stock checks and request deduplication; orders reach the staff board and update public stock through the existing polling.
- Stripe sandbox hosted Checkout for tomorrow only, server-side USD totals, durable drafts, signed webhook fulfillment, and idempotent paid orders.
- Return page waits for webhook confirmation; cancelled/expired/unpaid checkout never reports a confirmed payment. Missing configuration leaves pay-at-pickup available; live keys/events are rejected.
- Payment labels on staff cards; contract extension and setup/runbook in `docs/STRIPE-DEMO.md`.

## Checks and evidence
- `npm run verify`: lint, 43 unit/workflow tests, production build/typecheck, and asset validation pass. Final report: `.artifacts/verify/1794030528811-31e99c/result.json`.
- `npm run test:demo`: all 6 browser acceptance tests pass in a disposable production app. Report: `.artifacts/demo/run-eFwgxJ/result.json`.
- Browser evidence confirms a real public preorder reaches the staff board in the five-second polling cycle and stock becomes "Only 4 left". Replaying the request creates no duplicate.
- Stripe SDK transport is mocked in backend tests; signature verification and persistence are real. Tests cover amount tampering, live events, failed/unpaid checkout, expiration, and concurrent duplicate webhooks without resetting fulfillment state.
- Browser Stripe navigation/confirmation uses explicit API fixtures; no external Stripe account was contacted. Viewed mobile confirmation and staff-board screenshots.
- Final copy extraction/formatting preserves the tested browser text and behavior; final verification covers the final source.
- Tests use a fixed Friday-morning clock in disposable processes only. No production fake-payment switch exists.

## Remaining work / limitations
- Sandbox keys were absent. Actual Stripe-hosted checkout must be rehearsed using `docs/STRIPE-DEMO.md`; add local `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_BASE_URL` and run Stripe CLI forwarding.
- Redis storage paths implement atomic writes and shared rate limits but have not been exercised against deployed Upstash in this session. Local JSON paths are tested.
- Cards are tomorrow-only; today uses pay at pickup. Closed Sundays; max 36 donuts. Prices are a demo subtotal without tax.
- Cancelling a staff order does not refund a Stripe test payment. Abandoned checkout drafts remain until seed/reset and do not hold stock.
- Cross-review and Sunny's approval are still required before integration into main.

## Resume
1. `git switch feat/preorder-stripe-sandbox` in this worktree (already selected).
2. Read `docs/STRIPE-DEMO.md`; configure sandbox credentials locally when available.
3. Run `npm run dev -- --port 3105` if free, or choose another port and update `APP_BASE_URL` accordingly. No persistent dev server was left running by this task.
4. Rehearse a real sandbox checkout and webhook replay; obtain cross-review before asking Sunny to integrate/push.
