import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { countResultSchema } from "./schema";

const envNames = [
  "STAFF_PIN",
  "OPENAI_API_KEY",
  "VISION_MODEL",
  "VISION_SECOND_MODEL",
  "UPSTASH_REDIS_REST_URL",
];

function aiReply(model: string, payload: unknown) {
  return Response.json({
    id: "test",
    object: "response",
    created_at: 0,
    status: "completed",
    model,
    output: [
      {
        type: "message",
        id: "msg",
        status: "completed",
        role: "assistant",
        content: [
          { type: "output_text", text: JSON.stringify(payload), annotations: [] },
        ],
      },
    ],
  });
}
const group = (count: number, confidence = 0.95) => ({
  count,
  confidence,
  note: null,
});

test("POST /api/inventory/count: auth, validation, strict OpenAI request, second opinion, errors, nothing saved", async () => {
  const previous = envNames.map((n) => process.env[n]);
  const originalFetch = globalThis.fetch;
  const originalCwd = process.cwd();
  const temp = await mkdtemp(path.join(os.tmpdir(), "count-route-"));
  const logs = { error: console.error, info: console.info };
  console.error = () => {};
  console.info = () => {};
  process.env.STAFF_PIN = "4321";
  process.env.OPENAI_API_KEY = "test-only";
  process.env.VISION_MODEL = "vision-main";
  delete process.env.VISION_SECOND_MODEL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  process.chdir(temp);

  type Sent = {
    model: string;
    text: { format: { type: string; strict: boolean } };
    input: { content: { type: string; image_url?: string; detail?: string }[] }[];
  };
  const requests: { model: string; body: Sent }[] = [];
  let mode: "ok" | "fail" = "ok";
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    assert.ok(request.url.endsWith("/responses"), request.url);
    const body = (await request.json()) as Sent;
    requests.push({ model: body.model, body });
    if (mode === "fail")
      return Response.json(
        { error: { message: "model is down: internal detail" } },
        { status: 400 },
      );
    return aiReply(body.model, {
      scene: "a printed picture of a donut box",
      raised: group(6),
      cake: group(body.model === "vision-second" ? 7 : 3, 0.9),
      specialty: group(2, 0.6),
      filled_bars: group(0),
      notes: "Photo of a printed picture.",
    });
  };
  const { POST } = await import("../../app/api/inventory/count/route");
  const jpeg = await sharp({
    create: { width: 4000, height: 3000, channels: 3, background: "#e0b080" },
  })
    .jpeg()
    .toBuffer();
  const send = (form: FormData | null, pin?: string) =>
    POST(
      new Request("http://localhost/api/inventory/count", {
        method: "POST",
        headers: pin ? { "x-staff-pin": pin } : {},
        body: form ?? undefined,
      }),
    );
  const withImage = (blob: Blob, name = "case.jpg") => {
    const form = new FormData();
    form.set("image", blob, name);
    return form;
  };
  const photo = () => withImage(new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" }));

  try {
    // Auth fails closed before any AI call.
    assert.equal((await send(photo())).status, 401);
    assert.equal((await send(photo(), "0000")).status, 401);
    assert.equal(requests.length, 0);

    // Input validation.
    const missing = await send(new FormData(), "4321");
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { error: "Missing image file" });
    assert.equal((await send(null, "4321")).status, 400);
    const text = await send(
      withImage(new Blob(["hello"], { type: "text/plain" }), "a.txt"),
      "4321",
    );
    assert.equal(text.status, 415);
    const garbage = await send(
      withImage(new Blob(["not really a jpeg"], { type: "image/jpeg" })),
      "4321",
    );
    assert.equal(garbage.status, 415);
    assert.match((await garbage.json()).error, /by hand/);
    const huge = await send(
      withImage(new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/jpeg" })),
      "4321",
    );
    assert.equal(huge.status, 413);
    assert.equal(requests.length, 0);

    // Success: strict structured output, resized high-detail JPEG, contract shape.
    const ok = await send(photo(), "4321");
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("cache-control"), "no-store");
    assert.match(ok.headers.get("server-timing") ?? "", /vision;dur=\d+/);
    const result = await ok.json();
    assert.ok(countResultSchema.safeParse(result).success);
    assert.deepEqual(result, {
      groups: [
        { groupId: "raised", count: 6, confidence: 0.95 },
        { groupId: "cake", count: 3, confidence: 0.9 },
        { groupId: "specialty", count: 2, confidence: 0.6 },
        { groupId: "filled_bars", count: 0, confidence: 0.95 },
      ],
      total: 11,
      notes: "Photo of a printed picture.",
    });
    assert.equal(requests.length, 1);
    const sent = requests[0].body;
    assert.equal(sent.model, "vision-main");
    assert.equal(sent.text.format.type, "json_schema");
    assert.equal(sent.text.format.strict, true);
    const image = sent.input[0].content.find((c) => c.type === "input_image");
    assert.equal(image?.detail, "high");
    const url = image?.image_url ?? "";
    assert.ok(url.startsWith("data:image/jpeg;base64,"));
    const [, b64] = url.split("base64,");
    const meta = await sharp(Buffer.from(b64, "base64")).metadata();
    assert.deepEqual([meta.width, meta.height], [1024, 768]);

    // Second opinion: both models called, cake disagrees (3 vs 7) → flagged.
    process.env.VISION_SECOND_MODEL = "vision-second";
    requests.length = 0;
    const two = await (await send(photo(), "4321")).json();
    assert.deepEqual(requests.map((r) => r.model).sort(), ["vision-main", "vision-second"]);
    assert.equal(two.secondOpinion.model, "vision-second");
    assert.equal(two.secondOpinion.agrees, false);
    assert.equal(two.groups[1].confidence, 0.5);
    assert.equal(two.groups[1].count, 3);
    assert.ok(countResultSchema.safeParse(two).success);

    // Second model down: primary still answers.
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}"));
      if (body.model === "vision-second")
        return Response.json({ error: { message: "nope" } }, { status: 400 });
      return realFetch(input, init);
    };
    const solo = await send(photo(), "4321");
    assert.equal(solo.status, 200);
    assert.equal((await solo.json()).secondOpinion, undefined);
    globalThis.fetch = realFetch;
    delete process.env.VISION_SECOND_MODEL;

    // Primary failure → usable error JSON for the manual fallback, no internals.
    mode = "fail";
    const failed = await send(photo(), "4321");
    assert.equal(failed.status, 502);
    const err = await failed.json();
    assert.match(err.error, /by hand/);
    assert.doesNotMatch(err.error, /internal detail/);

    // No key configured → 503, no AI call.
    delete process.env.OPENAI_API_KEY;
    requests.length = 0;
    assert.equal((await send(photo(), "4321")).status, 503);
    assert.equal(requests.length, 0);

    // Counting never writes the store.
    assert.deepEqual(await readdir(temp), []);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = logs.error;
    console.info = logs.info;
    process.chdir(originalCwd);
    await rm(temp, { recursive: true, force: true });
    envNames.forEach((n, i) => {
      if (previous[i] === undefined) delete process.env[n];
      else process.env[n] = previous[i];
    });
  }
});
