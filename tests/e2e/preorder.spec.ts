import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

const headers = { "x-staff-pin": process.env.DONUT_DEMO_PIN! };
test.beforeEach(async ({ context, request }) => {
  await context.addInitScript(() => {
    const RealDate = Date;
    const started = RealDate.now();
    const epoch = RealDate.parse("2026-11-06T15:00:00Z");
    // Browser clock matches the disposable server's test-only clock.
    class DemoDate extends RealDate {
      constructor(value?: string | number) {
        super(value === undefined ? epoch + RealDate.now() - started : value);
      }
      static now() {
        return epoch + RealDate.now() - started;
      }
    }
    globalThis.Date = DemoDate as DateConstructor;
  });
  await context.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === process.env.DONUT_DEMO_URL)
      await route.continue();
    else await route.abort();
  });
  await request.put("/api/inventory", {
    headers,
    data: {
      groups: ["raised", "cake", "specialty", "filled_bars"].map((groupId) => ({
        groupId,
        count: 20,
      })),
      source: "manual",
    },
  });
  await request.put("/api/inventory", {
    headers,
    data: { soldOutToggle: false },
  });
});

test("customer preorder appears on the staff board and reduces today's public stock", async ({
  page,
  context,
  request,
}, testInfo) => {
  await request.put("/api/inventory", {
    headers,
    data: {
      groups: [
        { groupId: "raised", count: 10 },
        { groupId: "cake", count: 10 },
      ],
      source: "manual",
    },
  });
  const staff = await context.newPage();
  await staff.goto("/staff");
  await staff.getByLabel("Enter staff PIN").fill(process.env.DONUT_DEMO_PIN!);
  await staff.getByRole("button", { name: "Unlock", exact: true }).click();
  await staff.getByRole("tab", { name: "Orders", exact: true }).click();
  await page.goto("/#preorder");
  await page.getByRole("button", { name: "Assorted dozen" }).click();
  await page.getByLabel("Your name").fill("Preorder Smoke Customer");
  await page.getByLabel("Phone number").fill("801-555-0123");
  await expect(page.getByLabel("Pickup day")).toHaveValue("2026-11-06");
  const responsePromise = page.waitForResponse(
    (r) => r.url().endsWith("/api/preorder") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Place demo preorder", exact: true })
    .click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const receipt = await response.json();
  await expect(
    page.getByRole("heading", { name: "Held for you", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#preorder")).toContainText("$19.80");
  await expect(
    staff.locator("li").filter({ hasText: "Preorder Smoke Customer" }),
  ).toContainText("Pay at pickup", { timeout: 6500 });
  const stock = await (await request.get("/api/inventory")).json();
  expect(
    stock.groups.find((g: { groupId: string }) => g.groupId === "raised")
      .available,
  ).toBe(4);
  expect(
    stock.groups.find((g: { groupId: string }) => g.groupId === "cake")
      .available,
  ).toBe(4);
  await expect(
    page
      .locator("#case li")
      .filter({
        has: page.getByRole("heading", { name: "Cake donuts", exact: true }),
      }),
  ).toContainText("Only 4 left", { timeout: 6500 });
  const replay = await request.post("/api/preorder", {
    headers: response.request().headers(),
    data: response.request().postDataJSON(),
  });
  expect((await replay.json()).id).toBe(receipt.id);
  const orders = await (await request.get("/api/orders", { headers })).json();
  expect(
    orders.filter(
      (o: { customerName: string }) =>
        o.customerName === "Preorder Smoke Customer",
    ),
  ).toHaveLength(1);
  await page
    .locator("#preorder")
    .screenshot({
      path: testInfo.outputPath("preorder-confirmation-mobile.png"),
    });
  await staff.screenshot({
    path: testInfo.outputPath("preorder-staff-board.png"),
  });
});

test("sold-out today offers tomorrow and rejects a direct same-day request", async ({
  page,
  request,
}) => {
  await request.put("/api/inventory", {
    headers,
    data: { soldOutToggle: true },
  });
  await page.goto("/#preorder");
  await expect(page.getByLabel("Pickup day")).toHaveValue("2026-11-07");
  await expect(page.locator("#preorder")).toContainText("Sold out today");
  const rejected = await request.post("/api/preorder", {
    headers: { "Idempotency-Key": randomUUID() },
    data: {
      customerName: "Sold out test",
      phone: "8015550123",
      pickupDate: "2026-11-06",
      pickupTime: "10:00",
      items: [{ menuItemId: "raised-glazed", qty: 1 }],
    },
  });
  expect(rejected.status()).toBe(409);
});

test("checkout UI redirects and waits for order confirmation (payment API fixture)", async ({
  page,
}, testInfo) => {
  await page.goto("/#preorder");
  await page.getByRole("button", { name: "Assorted dozen" }).click();
  await page.getByLabel("Pickup day").selectOption("2026-11-07");
  await page.getByLabel("Your name").fill("Stripe UI Fixture");
  await page.getByLabel("Phone number").fill("8015550123");
  await page.getByLabel("Try a test card with Stripe").check();
  const hosted = "https://checkout.stripe.com/c/pay/cs_test_browser_fixture";
  await page.route("**/api/checkout", async (route) => {
    expect(route.request().postDataJSON().pickupDate).toBe("2026-11-07");
    expect(route.request().postDataJSON()).not.toHaveProperty("amountTotal");
    expect(route.request().headers()["idempotency-key"]).toBeTruthy();
    await route.fulfill({ json: { url: hosted }, status: 201 });
  });
  await page.route(hosted, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Stripe navigation fixture — no payment processed</h1>",
    }),
  );
  await page
    .getByRole("button", {
      name: "Continue to Stripe test checkout",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(hosted);
  let checks = 0;
  await page.route("**/api/checkout?*", (route) =>
    route.fulfill({
      json:
        ++checks === 1
          ? { state: "confirming" }
          : {
              state: "confirmed",
              order: {
                id: "S-12345678",
                pickupDate: "2026-11-07",
                pickupTime: "07:30",
                items: [{ menuItemId: "raised-glazed", qty: 12 }],
                payment: {
                  method: "stripe_sandbox",
                  status: "paid",
                  amountTotal: 1980,
                  currency: "usd",
                },
              },
            },
    }),
  );
  await page.goto(
    `${process.env.DONUT_DEMO_URL}/order/return?session_id=cs_test_browser_fixture`,
  );
  await expect(page.getByRole("status")).toContainText(
    "Waiting for order confirmation",
  );
  await expect(
    page.getByRole("heading", { name: "Test payment confirmed", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("sandbox-confirmation-ui-fixture.png"),
  });
  await page.goto("/order/return?cancelled=1");
  await expect(
    page.getByRole("heading", { name: "Checkout cancelled", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Test payment confirmed", { exact: true }),
  ).toHaveCount(0);
});
