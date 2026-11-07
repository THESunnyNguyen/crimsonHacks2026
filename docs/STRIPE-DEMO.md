# Preorders and Stripe sandbox demo

Branch: `feat/preorder-stripe-sandbox`. Sunny authorized integration and a main push
on November 6 at 23:05 Denver, subject to cross-review and passing checks, with a
hard final-commit cutoff of 23:30. No changes to production payment configuration.

## Start with pay at pickup

Run `npm run dev -- --port 3105` (choose another port if occupied), then open
`http://localhost:3105/#preorder`. Choose an assorted dozen or individual donuts,
pickup day/time, name, and phone. Submit with **Pay at pickup**. The order appears
on `/staff` within the next five-second poll; today's quantities reduce available
stock. Both surfaces identify the concept demo. Sunday is closed.

## Enable actual Stripe sandbox checkout

Create/use a Stripe sandbox and add these to the git-ignored `.env`:

```dotenv
STRIPE_SECRET_KEY=sk_test_your_sandbox_key
STRIPE_WEBHOOK_SECRET=whsec_your_local_listener_secret
APP_BASE_URL=http://localhost:3105
```

Only test keys are accepted. A publishable key isn't needed for this hosted
redirect flow.

Restricted sandbox keys (`rk_test_`) and temporary claimable-sandbox keys
(`rkcs_test_`) are also accepted when they grant Checkout and webhook access.
Live variants remain disabled. Temporary CLI sandboxes expire after seven days;
they can be provisioned without account registration using
`stripe --config .artifacts/stripe/config.toml sandboxes create --from-git --non-interactive`.
Keep the CLI profile and output ignored: both contain credentials. Use the same
`--config` option for that sandbox's listener; see `stripe sandboxes create --help`.

For your own existing account, run Stripe CLI forwarding from your own terminal:

```sh
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3105/api/webhooks/stripe
```

Put the listener's signing secret in `STRIPE_WEBHOOK_SECRET`, then restart Next.js.
Use the same hostname and port in the browser and `APP_BASE_URL`.

Choose **tomorrow** (when it is Mon–Sat), then **Try a test card with Stripe**.
The server calculates USD totals from the menu and redirects to hosted Checkout.
Use `4242 4242 4242 4242`, any future expiry and any three-digit CVC. No money moves.
The return page waits for the webhook to save the order; staff see **Test payment · paid**.

For a later Vercel preview, configure the sandbox webhook endpoint to the exact
preview origin plus `/api/webhooks/stripe`, use that endpoint's signing secret,
and set `APP_BASE_URL` to the preview origin. Local Stripe CLI signing secrets and
Dashboard webhook endpoint secrets differ. The deployed store requires Upstash.

## Smoke test

1. Place a pay-at-pickup order for today; see one staff card and lower public stock.
2. Pay for tomorrow with the success test card; see one paid sandbox card.
3. Use decline card `4000 0000 0000 9995`; no paid order should appear.
4. Cancel checkout; the return page offers another preorder without confirming one.
5. Resend the completed event from Stripe; the same order remains, even if staff
   have already marked it Ready. Reloading the return page doesn't create an order.
6. Stop webhook forwarding, complete a test payment, and observe the pending
   confirmation message. Resume forwarding and resend the event to confirm it.

`npm run verify` covers validation, stock races, request deduplication, Stripe
request parameters, raw-body webhook signatures, mismatched amounts, live-event
rejection, unpaid/expired states and repeated deliveries. The Stripe SDK transport
is a deterministic fixture in these tests; they don't contact a Stripe account.

`npm run test:demo` uses a disposable copy, a Friday-morning clock, and real local
preorder persistence. Checkout navigation/status UI use explicit browser fixtures;
the original inventory/call-notes tests also run. No runtime fake-payment mode is
added to the shipped app. Evidence lives under `.artifacts/demo/`.

Actual Stripe-hosted payment completion and deployed Redis behavior require
separate checks from the automated fixture suite. Abandoned drafts are retained in demo storage until the next
seed/reset; they never appear on the staff board or reserve stock. Tax is not
calculated. Cancelling an order on the staff board does not refund a Stripe test
payment. Same-day card checkout would require temporary inventory holds and expiry
handling; this version deliberately limits cards to tomorrow.

## Local rehearsal completed November 6

A temporary Stripe sandbox was provisioned in an isolated CLI profile at
`.artifacts/stripe/config.toml`; test configuration is in ignored `.env.local`.
It expires November 14, 2026 unless claimed. No production keys or release settings
were changed. Keep all profile files and logs private; they contain credentials.

Verified against actual Stripe sandbox APIs and hosted Checkout:
- A $19.80 test-card payment completed, its Stripe-delivered signed webhook returned
  HTTP 200, the return page confirmed the correct pickup, and staff saw one paid order.
- The insufficient-funds test card failed; cancellation returned to the app and
  neither action created an order. Expiring that sandbox session produced the app's
  `expired` state.
- Three concurrent local replays of the retrieved real event, re-signed with the
  listener secret, returned HTTP 200 and preserved one order. This was a local
  replay, not a Stripe-originated redelivery.

Evidence: `.artifacts/stripe/rehearsal-result.json` and screenshots in the same
directory. 3DS, refunds, deployed Redis, and production payments remain untested.
Rehearsal processes were stopped afterward. To resume this local sandbox, use two
terminals (the CLI profile already has credentials; do not run `stripe login`):

```sh
npm run dev -- --hostname 127.0.0.1 --port 3105
```

```sh
npm exec --yes --package=@stripe/cli -- stripe --config .artifacts/stripe/config.toml listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to http://127.0.0.1:3105/api/webhooks/stripe
```

The sandbox rehearsal itself does not authorize release or production payment
configuration. Sunny's later conditional integration approval is recorded in
`docs/handoffs/E.md`; the 23:30 final-commit cutoff still applies.

## References

Original implementation; no sample source copied. API behavior was checked against
[Stripe hosted Checkout](https://docs.stripe.com/checkout/quickstart),
[fulfillment](https://docs.stripe.com/checkout/fulfillment.md?ui=full-page),
[webhook signatures](https://docs.stripe.com/events/manage-webhook-endpoints), and
[test cards](https://docs.stripe.com/testing), plus the installed Next.js 16.4.5 docs.
