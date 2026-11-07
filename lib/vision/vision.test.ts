import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { zodTextFormat } from "openai/helpers/zod";
import {
  MAX_SIDE,
  VisionError,
  countDonuts,
  prepareImage,
  type VisionCall,
} from "./count";
import { countPrompt } from "./prompt";
import { disagreesOn, levelFor } from "./rules";
import {
  aiCountSchema,
  countResultSchema,
  toCountResult,
  type AiCount,
} from "./schema";

const g = (count: number, confidence = 0.95, note: string | null = null) => ({
  count,
  confidence,
  note,
});
const ai = (over: Partial<AiCount> = {}): AiCount => ({
  scene: "a donut box",
  raised: g(6),
  cake: g(3),
  specialty: g(2),
  filled_bars: g(1),
  notes: null,
  ...over,
});
const photo = (width: number, height: number) =>
  sharp({
    create: { width, height, channels: 3, background: "#d9a066" },
  })
    .png()
    .toBuffer();

test("AI schema is strict-compatible: every key required, nullable instead of optional", () => {
  const schema = zodTextFormat(aiCountSchema, "result").schema as {
    required: string[];
    additionalProperties: boolean;
    properties: Record<string, { required?: string[]; properties?: object }>;
  };
  assert.deepEqual(schema.required.sort(), [
    "cake",
    "filled_bars",
    "notes",
    "raised",
    "scene",
    "specialty",
  ]);
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.properties.raised.required?.sort(), [
    "confidence",
    "count",
    "note",
  ]);
  assert.equal(JSON.stringify(schema).includes('"optional"'), false);
});

test("prompt names every stock group with its look and covers pictures of pictures", () => {
  for (const id of ["raised", "cake", "specialty", "filled_bars"])
    assert.match(countPrompt, new RegExp(`- ${id}: `));
  assert.match(countPrompt, /printed picture/);
  assert.match(countPrompt, /empty box/i);
});

test("model output normalizes into the contract CountResult", () => {
  const result = toCountResult(
    ai({
      raised: g(-3, 1.4, "  2 hidden\n behind fritters "),
      cake: g(4, Number.NaN),
      specialty: g(9999, -1),
      filled_bars: g(2, 0.7, ""),
      notes: "Photo of a printed picture.",
    }),
  );
  assert.deepEqual(result.groups, [
    { groupId: "raised", count: 0, confidence: 1 },
    { groupId: "cake", count: 4, confidence: 0 },
    { groupId: "specialty", count: 500, confidence: 0 },
    { groupId: "filled_bars", count: 2, confidence: 0.7 },
  ]);
  assert.equal(result.total, 506);
  assert.equal(
    result.notes,
    "Photo of a printed picture. · Raised: 2 hidden behind fritters",
  );
  assert.equal("secondOpinion" in result, false);
  assert.ok(countResultSchema.safeParse(result).success);
  assert.equal(toCountResult(ai()).notes, "");
});

test("levels match the public display rule", () => {
  assert.equal(levelFor(0), "sold_out");
  assert.equal(levelFor(1), "low");
  assert.equal(levelFor(6), "low");
  assert.equal(levelFor(7), "plenty");
});

test("resize bounds the long side, keeps aspect, auto-rotates, never enlarges", async () => {
  const big = await prepareImage(await photo(4032, 3024));
  assert.equal(big.width, MAX_SIDE);
  assert.equal(big.height, 768);
  assert.equal((await sharp(big.jpeg).metadata()).format, "jpeg");
  // EXIF orientation 6 = rotated 90°: a landscape sensor image shot in portrait.
  const rotated = await sharp(await photo(3000, 2000))
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const upright = await prepareImage(rotated);
  assert.deepEqual([upright.width, upright.height], [683, MAX_SIDE]);
  const small = await prepareImage(await photo(640, 480));
  assert.deepEqual([small.width, small.height], [640, 480]);
  await assert.rejects(
    prepareImage(Buffer.from("not an image")),
    (e) => e instanceof VisionError && e.status === 415,
  );
});

test("count sends the resized JPEG to the configured model, and maps AI failures and timeouts to errors", async () => {
  let seen: { model: string; width?: number } | undefined;
  const call: VisionCall = async (image, model) => {
    seen = { model, width: (await sharp(image).metadata()).width };
    return ai();
  };
  const { result, timing } = await countDonuts(await photo(3000, 3000), {
    model: "m1",
    secondModel: "",
    call,
  });
  assert.deepEqual(seen, { model: "m1", width: MAX_SIDE });
  assert.equal(result.total, 12);
  assert.equal(timing.secondModel, undefined);
  await assert.rejects(
    countDonuts(await photo(10, 10), {
      secondModel: "",
      call: async () => {
        throw new Error("Upstream exploded with secret details");
      },
    }),
    (e) =>
      e instanceof VisionError &&
      e.status === 502 &&
      !e.message.includes("secret"),
  );
  await assert.rejects(
    countDonuts(await photo(10, 10), {
      secondModel: "",
      primaryTimeoutMs: 20,
      call: () => new Promise((r) => setTimeout(() => r(ai()), 200)),
    }),
    (e) => e instanceof VisionError && e.status === 504,
  );
});

test("second opinion runs in parallel, flags groups that differ by more than 1, and never blocks or fails the count", async () => {
  const delays: Record<string, number> = { main: 60, second: 60 };
  const answers: Record<string, AiCount> = {
    main: ai(),
    second: ai({ raised: g(7), cake: g(6), specialty: g(2), filled_bars: g(0) }),
  };
  const startedAt: Record<string, number> = {};
  const call: VisionCall = (_img, model) => {
    startedAt[model] = Date.now();
    return new Promise((resolve, reject) =>
      setTimeout(
        () =>
          answers[model] ? resolve(answers[model]) : reject(new Error("down")),
        delays[model],
      ),
    );
  };
  const image = await photo(100, 100);
  const both = await countDonuts(image, {
    model: "main",
    secondModel: "second",
    call,
  });
  assert.ok(
    Math.abs(startedAt.main - startedAt.second) < 20,
    "both calls start together, so latency is the slower call, not the sum",
  );
  const r = both.result;
  assert.equal(r.secondOpinion?.model, "second");
  assert.equal(r.secondOpinion?.agrees, false);
  // raised 6 vs 7 and filled 1 vs 0 are within 1; cake 3 vs 6 is not.
  assert.deepEqual(
    r.groups.map((x) => x.confidence),
    [0.95, 0.5, 0.95, 0.95],
  );
  assert.equal(disagreesOn(r, "cake"), true);
  assert.equal(disagreesOn(r, "raised"), false);
  assert.equal(r.total, 12, "counts stay the primary model's");
  assert.ok(countResultSchema.safeParse(r).success);

  answers.second = ai();
  const agree = await countDonuts(image, { model: "main", secondModel: "second", call });
  assert.equal(agree.result.secondOpinion?.agrees, true);

  delete answers.second;
  const failed = await countDonuts(image, { model: "main", secondModel: "second", call });
  assert.equal(failed.result.secondOpinion, undefined);
  assert.equal(failed.timing.secondStatus, "failed");

  answers.second = ai();
  delays.second = 400;
  const t = Date.now();
  const late = await countDonuts(image, {
    model: "main",
    secondModel: "second",
    secondBudgetMs: 100,
    call,
  });
  assert.ok(Date.now() - t < 250, "a slow second opinion is dropped at the budget");
  assert.equal(late.timing.secondStatus, "late");
  assert.equal(late.result.secondOpinion, undefined);

  const same = await countDonuts(image, { model: "main", secondModel: "main", call });
  assert.equal(same.timing.secondModel, undefined, "same model is not a second opinion");
});
