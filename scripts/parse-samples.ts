// Live check of the notes → draft parser against messy phone-call samples.
// Calls the real model (PARSE_MODEL), so it needs OPENAI_API_KEY:
//   npx tsx --env-file=.env scripts/parse-samples.ts
import { DraftError, parseOrder } from "../lib/parse/order";
import { getMenu } from "../lib/store";
import type { MenuItem } from "../lib/types";

// Fixed clock: Friday 2026-11-06 11:00 in Denver, so "tomorrow" is 2026-11-07.
const now = new Date("2026-11-06T18:00:00Z");

type Expected = {
  name?: string;
  phone?: string;
  pickupDate?: string;
  pickupTime?: string;
  items?: { menuItemId: string; qty: number; option?: string }[];
  notesInclude?: string[];
  draftError?: true;
};

const samples: { text: string; expect: Expected }[] = [
  {
    // The line from docs/DEMO.md 1:50.
    text: "Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100",
    expect: {
      name: "Maria",
      phone: "801-555-0100",
      pickupDate: "2026-11-07",
      pickupTime: "07:30",
      items: [
        { menuItemId: "raised-glazed", qty: 12 },
        { menuItemId: "fritter", qty: 2 },
      ],
    },
  },
  {
    text: "bob chen wants 6 old fashioned maple for 4:15 pm today",
    expect: {
      name: "Bob Chen",
      pickupDate: "2026-11-06",
      pickupTime: "16:15",
      items: [{ menuItemId: "cake-old-fashioned", qty: 6, option: "Maple" }],
    },
  },
  {
    text: "Jenny, half dozen glazed and a half dozen chocolate, 9 am tomorrow",
    expect: {
      name: "Jenny",
      pickupDate: "2026-11-07",
      pickupTime: "09:00",
      items: [
        { menuItemId: "raised-glazed", qty: 6 },
        { menuItemId: "raised-chocolate", qty: 6 },
      ],
    },
  },
  {
    // Peanuts are a topping, not a listed option: keep the base item, note it.
    text: "Ken: 10 old fashioned with peanuts, 7:30 am tomorrow",
    expect: {
      name: "Ken",
      pickupDate: "2026-11-07",
      pickupTime: "07:30",
      items: [{ menuItemId: "cake-old-fashioned", qty: 10 }],
      notesInclude: ["peanut"],
    },
  },
  {
    text: "Leah 3 fritters and 2 buttermilk bars, pickup 5:30 pm tomorrow, nut free please",
    expect: {
      name: "Leah",
      pickupDate: "2026-11-07",
      pickupTime: "17:30",
      items: [
        { menuItemId: "fritter", qty: 3 },
        { menuItemId: "buttermilk-bar", qty: 2 },
      ],
      notesInclude: ["nut"],
    },
  },
  {
    // No name: never invent a customer, so the draft must fail clearly.
    text: "dozen glazed tomorrow at 8",
    expect: { draftError: true },
  },
];

function sameItems(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function check(
  draft: Awaited<ReturnType<typeof parseOrder>>,
  expect: Expected,
  original: string,
): string[] {
  const problems: string[] = [];
  const want = (field: string, got: unknown, value: unknown) => {
    if (got !== value) problems.push(`${field}: got ${JSON.stringify(got)}, want ${JSON.stringify(value)}`);
  };
  if (expect.name !== undefined) want("customerName", draft.customerName, expect.name);
  if (expect.phone !== undefined) want("phone", draft.phone, expect.phone);
  if (expect.pickupDate !== undefined) want("pickupDate", draft.pickupDate, expect.pickupDate);
  if (expect.pickupTime !== undefined) want("pickupTime", draft.pickupTime, expect.pickupTime);
  if (expect.items && !sameItems(draft.items, expect.items))
    problems.push(`items: got ${JSON.stringify(draft.items)}, want ${JSON.stringify(expect.items)}`);
  for (const word of expect.notesInclude ?? [])
    if (!(draft.notes ?? "").toLowerCase().includes(word))
      problems.push(`notes: missing "${word}"`);
  if (!(draft.notes ?? "").includes(original))
    problems.push("notes: original call text was not preserved");
  return problems;
}

async function main() {
  const menu: MenuItem[] = await getMenu();
  let failed = 0;
  for (const { text, expect } of samples) {
    const started = Date.now();
    let problems: string[];
    try {
      const draft = await parseOrder(text, menu, now);
      problems = expect.draftError ? ["expected a DraftError, got a draft"] : check(draft, expect, text);
    } catch (e) {
      problems =
        expect.draftError && e instanceof DraftError
          ? []
          : [`threw ${e instanceof Error ? e.message : String(e)}`];
    }
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    if (problems.length) failed++;
    console.log(`${problems.length ? "FAIL" : "PASS"} (${seconds}s) ${text}`);
    for (const problem of problems) console.log(`     ${problem}`);
  }
  console.log(`\n${samples.length - failed}/${samples.length} passed`);
  process.exitCode = failed ? 1 : 0;
}

main();
