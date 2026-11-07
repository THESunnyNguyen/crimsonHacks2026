import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import Stripe from "stripe";
import { parsePreorder, totalCents } from "./preorder";
import { pickupTimes, tomorrow } from "./pickup";
import { today } from "./time";

const friday = new Date("2026-11-06T15:00:00Z"); // 8 AM Denver, after DST ends.
const input = {
  customerName: "Demo Customer",
  phone: "801-555-0100",
  pickupDate: "2026-11-07",
  pickupTime: "07:30",
  items: [
    { menuItemId: "raised-glazed", qty: 6 },
    { menuItemId: "cake-old-fashioned", qty: 6 },
  ],
};

test("preorders validate the menu, quantity, phone, Denver dates, hours, Sunday and lead time", () => {
  assert.equal(totalCents(parsePreorder(input, friday)), 1980);
  for (const change of [
    { phone: "abc" },
    { phone: "-------" },
    { customerName: " " },
    { pickupDate: "2026-11-08" },
    { pickupDate: "2026-11-06", pickupTime: "08:00" },
    { pickupTime: "17:00" },
    { items: [{ menuItemId: "deli-sandwich", qty: 1 }] },
    { items: [{ menuItemId: "fritter", qty: 37 }] },
    { items: [{ menuItemId: "fritter", qty: 1, option: "not on menu" }] },
    {
      items: [
        { menuItemId: "raised-glazed", qty: 20 },
        { menuItemId: "raised-glazed", qty: 20 },
      ],
    },
    { payment: { status: "paid" } },
    { amountTotal: 1 },
    { source: "staff_form" },
  ])
    assert.throws(() => parsePreorder({ ...input, ...change }, friday));
  assert.equal(pickupTimes("2026-11-06", friday)[0], "08:15");
  assert.equal(pickupTimes("2026-11-06", friday).at(-1), "16:45");
  assert.deepEqual(
    pickupTimes("2026-11-08", new Date("2026-11-07T16:00:00Z")),
    [],
  );
  assert.equal(tomorrow(new Date("2026-11-07T02:00:00Z")), "2026-11-07");
  assert.equal(
    pickupTimes("2026-03-09", new Date("2026-03-08T10:00:00Z"))[0],
    "05:00",
  );
});

test("preorder persistence and Stripe sandbox lifecycle (fixture transport, real signatures)", async (t) => {
  assert.ok(
    !process.env.UPSTASH_REDIS_REST_URL,
    "Never run against production storage",
  );
  const original = process.cwd();
  const directory = await mkdtemp(path.join(os.tmpdir(), "donut-preorder-"));
  const env = { ...process.env };
  process.chdir(directory);
  Object.assign(process.env, {
    STRIPE_SECRET_KEY: "sk_test_fixture",
    STRIPE_WEBHOOK_SECRET: "whsec_fixture",
    APP_BASE_URL: "http://127.0.0.1:3105",
  });
  try {
    const store = await import("./store");
    const payments = await import("./stripe");
    const webhook = await import("../app/api/webhooks/stripe/route");
    await t.test(
      "competing same-day orders cannot oversell; retries do not duplicate",
      async () => {
        await store.resetStore();
        await store.setCounts([{ groupId: "raised", count: 6 }], "manual");
        const orderInput = {
          ...input,
          pickupDate: today(),
          items: [{ menuItemId: "raised-glazed", qty: 6 }],
        };
        const attempts = await Promise.allSettled([
          store.createPreorder(orderInput, randomUUID()),
          store.createPreorder(orderInput, randomUUID()),
        ]);
        assert.equal(
          attempts.filter((r) => r.status === "fulfilled").length,
          1,
        );
        assert.equal((await store.getInventory()).groups[0].available, 0);
        const key = randomUUID();
        const saved = await store.createPreorder(input, key, friday);
        const again = await store.createPreorder(input, key, friday);
        assert.equal(saved.id, again.id);
        await assert.rejects(
          store.createPreorder(
            { ...input, customerName: "Changed" },
            key,
            friday,
          ),
          (e) => e instanceof Response && e.status === 409,
        );
        assert.equal((await store.listOrders()).length, 2);
        await store.setSoldOutToggle(true);
        await assert.rejects(
          store.createPreorder(orderInput, randomUUID()),
          (e) => e instanceof Response && e.status === 409,
        );
      },
    );

    await t.test("combined flavors share the same stock group", async () => {
      await store.resetStore();
      await store.setCounts([{ groupId: "raised", count: 5 }], "manual");
      await assert.rejects(
        store.createPreorder(
          {
            ...input,
            pickupDate: today(),
            items: [
              { menuItemId: "raised-glazed", qty: 3 },
              { menuItemId: "raised-maple", qty: 3 },
            ],
          },
          randomUUID(),
        ),
        (e) => e instanceof Response && e.status === 409,
      );
      assert.equal((await store.listOrders()).length, 0);
    });

    await t.test(
      "checkout charges server prices, requires tomorrow, and remains off the board until a signed paid event",
      async () => {
        await store.resetStore();
        let params = new URLSearchParams();
        let idempotency = "";
        let fixture: Stripe.Checkout.Session;
        const stripe = new Stripe("sk_test_fixture", {
          httpClient: Stripe.createFetchHttpClient(async (_url, init) => {
            if (init?.method === "POST") {
              params = new URLSearchParams(String(init.body));
              idempotency =
                new Headers(init.headers).get("idempotency-key") ?? "";
              fixture = {
                id: "cs_test_fixture_checkout_123",
                object: "checkout.session",
                livemode: false,
                mode: "payment",
                url: "https://checkout.stripe.com/c/pay/cs_test_fixture_checkout_123",
                currency: "usd",
                amount_total: 1980,
                payment_status: "unpaid",
                status: "open",
                client_reference_id: params.get("client_reference_id"),
                metadata: {
                  preorderId: params.get("metadata[preorderId]")!,
                  fingerprint: params.get("metadata[fingerprint]")!,
                },
              } as unknown as Stripe.Checkout.Session;
            }
            return Response.json(fixture);
          }),
        });
        const key = randomUUID();
        await assert.rejects(
          payments.startSandboxCheckout(
            { ...input, pickupDate: "2026-11-06" },
            key,
            stripe,
            friday,
          ),
          (e) => e instanceof Response && e.status === 400,
        );
        const checkout = await payments.startSandboxCheckout(
          input,
          key,
          stripe,
          friday,
        );
        assert.equal(
          checkout.url,
          "https://checkout.stripe.com/c/pay/cs_test_fixture_checkout_123",
        );
        assert.equal(
          params.get("line_items[0][price_data][unit_amount]"),
          "165",
        );
        assert.equal(params.get("line_items[0][quantity]"), "6");
        assert.equal(params.get("allowed_payment_method_types[0]"), "card");
        assert.equal(params.get("adaptive_pricing[enabled]"), "false");
        assert.equal(idempotency, `preorder-${key}`);
        assert.equal((await store.listOrders()).length, 0);
        assert.equal(await payments.fulfillSandboxCheckout(fixture!), null);
        assert.equal(
          (await payments.sandboxCheckoutStatus(fixture!.id, stripe)).state,
          "unpaid",
        );
        fixture = { ...fixture!, status: "expired" };
        assert.equal(
          (await payments.sandboxCheckoutStatus(fixture.id, stripe)).state,
          "expired",
        );
        assert.equal((await store.listOrders()).length, 0);
        fixture = { ...fixture, status: "complete", payment_status: "paid" };
        assert.equal(
          (await payments.sandboxCheckoutStatus(fixture.id, stripe)).state,
          "confirming",
        );
        assert.equal(
          (await store.listOrders()).length,
          0,
          "Returning to success cannot mark an order paid",
        );
        const send = (
          session: Stripe.Checkout.Session,
          signatureValid = true,
        ) => {
          const payload = JSON.stringify({
            id: "evt_fixture",
            object: "event",
            type: "checkout.session.completed",
            livemode: session.livemode,
            data: { object: session },
          });
          const signature = stripe.webhooks.generateTestHeaderString({
            payload,
            secret: signatureValid ? "whsec_fixture" : "whsec_wrong",
          });
          return webhook.POST(
            new Request("http://localhost/api/webhooks/stripe", {
              method: "POST",
              headers: { "stripe-signature": signature },
              body: payload,
            }),
          );
        };
        assert.equal((await send(fixture, false)).status, 400);
        assert.equal((await send({ ...fixture, amount_total: 1 })).status, 400);
        assert.equal((await send({ ...fixture, livemode: true })).status, 400);
        assert.equal((await store.listOrders()).length, 0);
        const deliveries = await Promise.all([
          send(fixture),
          send(fixture),
          send(fixture),
        ]);
        assert.ok(deliveries.every((r) => r.status === 200));
        const [paid] = await store.listOrders();
        assert.equal((await store.listOrders()).length, 1);
        assert.equal(paid.payment?.method, "stripe_sandbox");
        assert.equal(paid.payment?.status, "paid");
        assert.equal(paid.payment?.amountTotal, 1980);
        await store.updateOrderStatus(paid.id, "ready");
        await send(fixture);
        assert.equal(
          (await store.listOrders())[0].status,
          "ready",
          "Webhook replay must not reset fulfillment",
        );
        const status = await payments.sandboxCheckoutStatus(fixture.id, stripe);
        assert.equal(status.state, "confirmed");
        assert.equal("customerName" in status.order!, false);
        assert.equal("phone" in status.order!, false);
        await assert.rejects(
          payments.startSandboxCheckout(
            { ...input, phone: "801-555-9999" },
            key,
            stripe,
            friday,
          ),
          (e) => e instanceof Response && e.status === 409,
        );
      },
    );

    await t.test(
      "configuration fails closed for missing or live Stripe keys",
      () => {
        assert.equal(payments.stripeSandboxEnabled(), true);
        for (const key of ["rk_test_fixture", "rkcs_test_fixture"]) {
          process.env.STRIPE_SECRET_KEY = key;
          assert.equal(payments.stripeSandboxEnabled(), true);
        }
        for (const key of [
          "",
          "sk_live_not_allowed",
          "rk_live_not_allowed",
          "rkcs_live_not_allowed",
          "invalid_test_key",
        ]) {
          process.env.STRIPE_SECRET_KEY = key;
          assert.equal(payments.stripeSandboxEnabled(), false);
          assert.throws(
            payments.sandboxStripe,
            (e) => e instanceof Response && e.status === 503,
          );
        }
        process.env.STRIPE_SECRET_KEY = "sk_test_fixture";
        process.env.APP_BASE_URL = "javascript:alert(1)";
        assert.equal(payments.stripeSandboxEnabled(), false);
        process.env.APP_BASE_URL = "http://127.0.0.1:3105";
      },
    );

    await t.test("public requests are limited to five per minute", async () => {
      const key = randomUUID();
      for (let i = 0; i < 5; i++)
        assert.equal(await store.consumePublicRequest(key, 5, 1000), true);
      assert.equal(await store.consumePublicRequest(key, 5, 1000), false);
      assert.equal(await store.consumePublicRequest(key, 5, 61_000), true);
    });
    await t.test(
      "origin checks accept the browser Host behind Next's local URL reconstruction",
      async () => {
        const { limitPublicRequest } = await import("./preorder-request");
        const request = new Request("http://localhost:3105/api/preorder", {
          headers: { host: "127.0.0.1:3105", origin: "http://127.0.0.1:3105" },
        });
        await limitPublicRequest(request);
        await assert.rejects(
          limitPublicRequest(
            new Request(request, {
              headers: {
                host: "127.0.0.1:3105",
                origin: "https://elsewhere.example",
              },
            }),
          ),
          (e) => e instanceof Response && e.status === 403,
        );
      },
    );
  } finally {
    for (const key of [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "APP_BASE_URL",
    ]) {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }
    process.chdir(original);
    await rm(directory, { recursive: true, force: true });
  }
});
