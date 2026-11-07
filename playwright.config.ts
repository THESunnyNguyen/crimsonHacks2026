import { defineConfig } from "@playwright/test";
import path from "node:path";

const url = process.env.DONUT_DEMO_URL;
const evidence = process.env.DONUT_DEMO_EVIDENCE;
if (!url || !/^http:\/\/127\.0\.0\.1:\d+$/.test(url) || !evidence || !process.env.DONUT_DEMO_PIN) {
  throw new Error("Use npm run test:demo: acceptance tests only run against its disposable loopback server.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7000 },
  outputDir: path.join(evidence, "browser"),
  reporter: [["list"], ["json", { outputFile: path.join(evidence, "playwright.json") }]],
  use: {
    baseURL: url,
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    timezoneId: "America/Denver",
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
