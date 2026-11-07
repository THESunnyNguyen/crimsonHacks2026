import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

// Only AI responses are mocked. Auth, inventory writes, order writes, and the
// public site's five-second polling use the disposable production server.
const pin = process.env.DONUT_DEMO_PIN!;
const headers = { "x-staff-pin": pin };
const groups = ["raised", "cake", "specialty", "filled_bars"];
const photo = {
  name: "fixture.png", mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jxN0AAAAASUVORK5CYII=", "base64"),
};

async function inventory(request: APIRequestContext) {
  const response = await request.get("/api/inventory");
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function unlock(page: Page) {
  await page.goto("/staff");
  await page.getByLabel("Enter staff PIN").fill(pin);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Case", exact: true })).toBeVisible();
}

async function upload(page: Page, counts: number[]) {
  let calls = 0;
  await page.route("**/api/inventory/count", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().headers()["x-staff-pin"]).toBe(pin);
    calls++;
    await route.fulfill({ json: {
      groups: groups.map((groupId, index) => ({ groupId, count: counts[index], confidence: 0.95 })),
      total: counts.reduce((sum, count) => sum + count, 0),
      notes: "Deterministic UI fixture, not a live model evaluation.",
    } });
  });
  await page.locator('input[type="file"]').setInputFiles(photo);
  await expect(page.getByRole("heading", { name: "Check the counts" })).toBeVisible();
  expect(calls).toBe(1);
  return page.getByRole("region", { name: "Check the counts" });
}

test.beforeEach(async ({ request, context }) => {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.protocol === "http:" && url.origin === process.env.DONUT_DEMO_URL) await route.continue();
    else await route.abort();
  });
  const reset = await request.put("/api/inventory", {
    headers, data: { groups: groups.map((groupId) => ({ groupId, count: 20 })), source: "manual" },
  });
  expect(reset.ok()).toBeTruthy();
  expect((await request.put("/api/inventory", { headers, data: { soldOutToggle: false } })).ok()).toBeTruthy();
});

test("photo draft waits for confirmation, staff correction reaches the public site", async ({ page, context, request }, testInfo) => {
  const customer = await context.newPage();
  await customer.goto("/");
  const cake = customer.locator("#case li").filter({ has: customer.getByRole("heading", { name: "Cake donuts", exact: true }) });
  await expect(cake).toContainText("Plenty");
  await unlock(page);
  const before = await inventory(request);
  const review = await upload(page, [12, 3, 8, 9]);
  await expect(review.getByLabel("Cake donuts count", { exact: true })).toHaveValue("3");
  await review.getByRole("button", { name: "One more Cake donuts", exact: true }).click();
  await expect(review.getByLabel("Cake donuts count", { exact: true })).toHaveValue("4");
  expect(await inventory(request)).toEqual(before);
  await expect(cake).toContainText("Plenty");
  await review.getByRole("button", { name: "Confirm & publish", exact: true }).click();
  await expect(page.getByText("Live on the site.", { exact: true })).toBeVisible();
  const after = await inventory(request);
  expect(after.source).toBe("photo");
  expect(after.groups.find((group: { groupId: string }) => group.groupId === "cake").count).toBe(4);
  await expect(cake).toContainText("Only 4 left", { timeout: 6500 });
  await customer.screenshot({ path: testInfo.outputPath("confirmed-public-stock.png") });
});

test("confirming an empty photo publishes the sold-out banner", async ({ page, context, request }, testInfo) => {
  const customer = await context.newPage();
  await customer.goto("/");
  await expect(customer.locator("#case")).not.toContainText("Sold out for today.");
  await unlock(page);
  const review = await upload(page, [0, 0, 0, 0]);
  expect((await inventory(request)).shopSoldOut).toBe(false);
  await review.getByRole("button", { name: "Confirm & publish", exact: true }).click();
  await expect(page.getByText("Live on the site.", { exact: true })).toBeVisible();
  const after = await inventory(request);
  expect(after.shopSoldOut).toBe(true);
  expect(after.total.available).toBe(0);
  await expect(customer.locator("#case")).toContainText("Sold out for today.", { timeout: 6500 });
  await customer.screenshot({ path: testInfo.outputPath("sold-out-public-stock.png") });
});

test("call notes stay an unsaved draft until Save, then appear on tomorrow's board", async ({ page, request }, testInfo) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const next = new Date(`${today}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const tomorrow = next.toISOString().slice(0, 10);
  const text = "Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100";
  const draft = {
    customerName: "Maria", phone: "801-555-0100", pickupDate: tomorrow,
    pickupTime: "07:30", items: [{ menuItemId: "raised-glazed", qty: 12 }, { menuItemId: "fritter", qty: 2 }],
    notes: `Original call notes:\n${text}`, source: "notes",
  };
  await page.route("**/api/orders/parse", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ text });
    expect(route.request().headers()["x-staff-pin"]).toBe(pin);
    await route.fulfill({ json: draft });
  });
  await unlock(page);
  await page.getByRole("tab", { name: "Orders", exact: true }).click();
  await page.getByRole("button", { name: "From call notes" }).click();
  await page.getByLabel("Call notes", { exact: true }).fill(text);
  await page.getByRole("button", { name: "Draft with AI", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Review AI draft" })).toBeVisible();
  await expect(page.getByLabel("Customer name", { exact: true })).toHaveValue("Maria");
  await expect(page.getByRole("textbox", { name: "Pickup date", exact: true })).toHaveValue(tomorrow);
  await expect(page.getByLabel("Pickup time", { exact: true })).toHaveValue("07:30");
  const unsaved = await request.get("/api/orders", { headers });
  expect(unsaved.ok()).toBeTruthy();
  expect(await unsaved.json()).toEqual([]);
  await page.getByRole("button", { name: "Save order", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tomorrow", exact: true })).toHaveAttribute("aria-pressed", "true");
  const card = page.locator("li").filter({ hasText: "Maria" }).filter({
    has: page.getByRole("button", { name: "New → Ready (boxed)", exact: true }),
  });
  await expect(card).toContainText("7:30 AM");
  await expect(card).toContainText("12 ×");
  await expect(card).toContainText("2 ×");
  const saved = await request.get(`/api/orders?date=${tomorrow}`, { headers });
  expect(saved.ok()).toBeTruthy();
  expect(await saved.json()).toMatchObject([{ ...draft, status: "new" }]);
  await page.screenshot({ path: testInfo.outputPath("saved-tomorrow-order.png") });
});
