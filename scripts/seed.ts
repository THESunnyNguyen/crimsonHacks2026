import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const { resetStore, createOrder, getInventory } = await import("../lib/store");
  const { today } = await import("../lib/time");
  await resetStore();
  await createOrder({ customerName: "Maria (sample)", pickupDate: today(), pickupTime: "09:30", items: [{ menuItemId: "raised-glazed", qty: 2 }], source: "staff_form", notes: "Sample order for the demo" });
  console.log(`Seeded ${process.env.UPSTASH_REDIS_REST_URL ? "Redis" : "local JSON"}: 20 per group, one sample order. Available: ${(await getInventory()).total.available}`);
}
main().catch(e => { console.error(e instanceof Error ? e.message : "Seed failed"); process.exitCode=1; });
