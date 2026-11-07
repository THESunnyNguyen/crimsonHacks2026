import test from "node:test";
import assert from "node:assert/strict";
import menu from "@/data/menu.json";
import { nextDate, denverContext } from "./parse/dates";
import {
  DraftError,
  normalizeDraft,
  parseOrder,
  type AiOrder,
} from "./parse/order";
import {
  boundedAudioForm,
  MAX_AUDIO_BYTES,
  wavSeconds,
} from "./parse/audio";
import type { MenuItem } from "./types";

const shopMenu = menu as MenuItem[];
const demoLine =
  "Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100";

const complete: AiOrder = {
  customerName: "Maria",
  phone: "801-555-0100",
  pickupDate: "2026-11-07",
  pickupTime: "07:30",
  items: [
    { menuItemId: "raised-glazed", qty: 12, option: null },
    { menuItemId: "fritter", qty: 2, option: null },
  ],
  notes: null,
};

test("nextDate advances whole calendar days across month, year and leap boundaries", () => {
  assert.equal(nextDate("2026-03-07"), "2026-03-08");
  assert.equal(nextDate("2026-11-01"), "2026-11-02");
  assert.equal(nextDate("2026-12-31"), "2027-01-01");
  assert.equal(nextDate("2028-02-28"), "2028-02-29");
  assert.equal(nextDate("2027-02-28"), "2027-03-01");
});

test("tomorrow is the Denver calendar date, not the UTC date", () => {
  // 23:30 MST on Nov 5 in Denver, already Nov 6 in UTC.
  assert.deepEqual(denverContext(new Date("2026-11-06T06:30:00Z")), {
    date: "2026-11-05",
    tomorrow: "2026-11-06",
    time: "23:30",
  });
  // 11:00 MST on Nov 6.
  assert.deepEqual(denverContext(new Date("2026-11-06T18:00:00Z")), {
    date: "2026-11-06",
    tomorrow: "2026-11-07",
    time: "11:00",
  });
  // Evening before the Mar 8, 2026 DST change still advances one calendar day.
  assert.deepEqual(denverContext(new Date("2026-03-08T05:30:00Z")), {
    date: "2026-03-07",
    tomorrow: "2026-03-08",
    time: "22:30",
  });
});

test("normalizeDraft keeps the original call notes and omits absent optional fields", () => {
  const draft = normalizeDraft(
    { ...complete, notes: "Extra napkins." },
    demoLine,
    new Date("2026-11-06T18:00:00Z"),
  );
  assert.deepEqual(draft, {
    customerName: "Maria",
    phone: "801-555-0100",
    pickupDate: "2026-11-07",
    pickupTime: "07:30",
    items: [
      { menuItemId: "raised-glazed", qty: 12 },
      { menuItemId: "fritter", qty: 2 },
    ],
    notes: `Extra napkins.\n\nOriginal call notes:\n${demoLine}`,
    source: "notes",
  });
});

test("normalizeDraft defaults a missing date to today in Denver and repairs HH:MM", () => {
  const draft = normalizeDraft(
    {
      ...complete,
      phone: null,
      pickupDate: null,
      pickupTime: "7:05",
      items: [{ menuItemId: "cake-old-fashioned", qty: 1, option: " Maple " }],
    },
    "old fashioned maple",
    new Date("2026-11-06T06:30:00Z"),
  );
  assert.equal(draft.pickupDate, "2026-11-05");
  assert.equal(draft.pickupTime, "07:05");
  assert.equal("phone" in draft, false);
  assert.deepEqual(draft.items, [
    { menuItemId: "cake-old-fashioned", qty: 1, option: "Maple" },
  ]);
});

test("normalizeDraft drops blank options instead of saving empty strings", () => {
  const draft = normalizeDraft(
    {
      ...complete,
      items: [{ menuItemId: "raised-glazed", qty: 1, option: "  " }],
    },
    "one glazed",
  );
  assert.deepEqual(draft.items, [{ menuItemId: "raised-glazed", qty: 1 }]);
});

test("normalizeDraft fails clearly when name or time is missing", () => {
  assert.throws(
    () => normalizeDraft({ ...complete, customerName: null }, "x"),
    DraftError,
  );
  assert.throws(
    () => normalizeDraft({ ...complete, pickupTime: null }, "x"),
    DraftError,
  );
});

test("normalizeDraft rejects unknown menu items rather than inventing them", () => {
  assert.throws(
    () =>
      normalizeDraft(
        { ...complete, items: [{ menuItemId: "pie", qty: 1, option: null }] },
        "a pie",
      ),
    DraftError,
  );
});

test("normalizeDraft never silently truncates a long call", () => {
  assert.throws(
    () =>
      normalizeDraft(
        { ...complete, notes: "x".repeat(1200) },
        "y".repeat(1500),
      ),
    DraftError,
  );
});

function modelReply(output: unknown) {
  return Response.json({
    id: "test",
    object: "response",
    created_at: 0,
    status: "completed",
    model: "gpt-6-luna",
    output: [
      {
        type: "message",
        id: "msg",
        status: "completed",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: JSON.stringify(output),
            annotations: [],
          },
        ],
      },
    ],
  });
}

async function withModel<T>(
  output: unknown,
  run: (prompts: string[]) => Promise<T>,
): Promise<T> {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  const prompts: string[] = [];
  process.env.OPENAI_API_KEY = "test-only";
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const body = await request.json();
    prompts.push(JSON.stringify(body.input));
    return modelReply(output);
  };
  try {
    return await run(prompts);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
}

test("parseOrder turns the demo call line into a reviewable draft", async () => {
  await withModel(complete, async (prompts) => {
    const draft = await parseOrder(
      demoLine,
      shopMenu,
      new Date("2026-11-06T18:00:00Z"),
    );
    assert.equal(draft.customerName, "Maria");
    assert.equal(draft.pickupDate, "2026-11-07");
    assert.equal(draft.pickupTime, "07:30");
    assert.equal(draft.source, "notes");
    assert.match(draft.notes ?? "", /Original call notes:\nMaria 7:30 tomorrow/);
    assert.match(prompts[0], /tomorrow 2026-11-07/);
    assert.match(prompts[0], /Today 2026-11-06/);
  });
});

test("parseOrder maps a model reply with missing name to DraftError", async () => {
  await withModel({ ...complete, customerName: null }, async () => {
    await assert.rejects(parseOrder(demoLine, shopMenu), DraftError);
  });
});

test("parseOrder maps a schema-invalid model reply to DraftError", async () => {
  await withModel({ nope: true }, async () => {
    await assert.rejects(parseOrder(demoLine, shopMenu), DraftError);
  });
});

function wav({
  channels = 1,
  bits = 16,
  rate = 8000,
  samples = 8000,
}: {
  channels?: number;
  bits?: number;
  rate?: number;
  samples?: number;
} = {}): Uint8Array {
  const align = (channels * bits) / 8;
  const size = samples * align;
  const buffer = new ArrayBuffer(44 + size);
  const v = new DataView(buffer);
  const tag = (offset: number, text: string) =>
    [...text].forEach((c, i) => v.setUint8(offset + i, c.charCodeAt(0)));
  tag(0, "RIFF");
  v.setUint32(4, 36 + size, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, channels, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * align, true);
  v.setUint16(32, align, true);
  v.setUint16(34, bits, true);
  tag(36, "data");
  v.setUint32(40, size, true);
  return new Uint8Array(buffer);
}

test("wavSeconds measures mono PCM from frame data", () => {
  assert.equal(wavSeconds(wav({ samples: 16000 })), 2);
});

test("wavSeconds rejects stereo, non-PCM-looking, truncated and non-WAV input", () => {
  assert.throws(() => wavSeconds(wav({ channels: 2 })), /Invalid PCM/);
  assert.throws(() => wavSeconds(wav({ bits: 8 })), /Invalid PCM/);
  assert.throws(() => wavSeconds(wav().slice(0, 100)), /complete WAV/);
  assert.throws(
    () => wavSeconds(new TextEncoder().encode("not a recording at all, sorry!!")),
    /complete WAV/,
  );
});

test("boundedAudioForm stops reading an oversized upload with 413", async () => {
  const chunk = new Uint8Array(1024 * 1024);
  let sent = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= MAX_AUDIO_BYTES + 512 * 1024) return controller.close();
      sent += chunk.length;
      controller.enqueue(chunk);
    },
  });
  const req = new Request("http://localhost/api/transcribe", {
    method: "POST",
    body,
    duplex: "half",
    headers: { "Content-Type": "multipart/form-data; boundary=x" },
  } as RequestInit);
  await assert.rejects(boundedAudioForm(req), (e: unknown) => {
    assert.ok(e instanceof Response);
    assert.equal(e.status, 413);
    return true;
  });
});
