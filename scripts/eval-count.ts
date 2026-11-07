// Vision count eval: runs photos through the same pipeline as
// POST /api/inventory/count (resize → prompt → strict schema → normalize) on
// one or more OpenAI models, and prints per-group error and latency.
//
//   npx tsx scripts/eval-count.ts                        # real photos: test-images/expected.json
//   npx tsx scripts/eval-count.ts --models gpt-6-astra,gpt-6-luna --runs 3
//   npx tsx scripts/eval-count.ts --synthetic            # generated drawings (pipeline/latency check only)
//
// Reads OPENAI_API_KEY (and VISION_MODEL for the default) from the environment
// or .env; variables already set in the shell win.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { TARGET_MS, countDonuts } from "@/lib/vision/count";
import { LOW_CONFIDENCE, groupOrder } from "@/lib/vision/rules";
import type { CountResult, StockGroupId } from "@/lib/types";
import { syntheticPhotos } from "@/test-images/synthetic/fixtures";

if (existsSync(".env")) process.loadEnvFile(".env");

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const synthetic = flag("synthetic");
const runs = Math.max(1, Number(option("runs") ?? 1));
const models = (
  option("models") ?? `${process.env.VISION_MODEL || "gpt-6-astra"},gpt-6-luna`
)
  .split(",")
  .map((m) => m.trim())
  .filter((m, i, all) => m && all.indexOf(m) === i);
const dir = option("dir") ?? "test-images";

const countsSchema = z.object({
  raised: z.number().int().min(0),
  cake: z.number().int().min(0),
  specialty: z.number().int().min(0),
  filled_bars: z.number().int().min(0),
});
const expectedSchema = z.object({
  photos: z
    .array(
      z.object({ file: z.string(), label: z.string(), counts: countsSchema }),
    )
    .min(1),
});
type Photo = {
  file: string;
  label: string;
  counts: Record<StockGroupId, number>;
  image: Buffer;
};

async function loadPhotos(): Promise<Photo[]> {
  if (synthetic) return syntheticPhotos();
  const manifest = path.join(dir, "expected.json");
  if (!existsSync(manifest)) {
    console.error(
      `No ${manifest}. Add the demo photos and their true counts first ` +
        `(format: test-images/expected.example.json, steps: docs/eval.md), ` +
        `or run with --synthetic for a pipeline/latency check.`,
    );
    process.exit(2);
  }
  const { photos } = expectedSchema.parse(
    JSON.parse(await readFile(manifest, "utf8")),
  );
  return Promise.all(
    photos.map(async (p) => ({
      ...p,
      image: await readFile(path.join(dir, p.file)),
    })),
  );
}

type Run = {
  model: string;
  photo: Photo;
  ms: number;
  result?: CountResult;
  error?: string;
};

const short: Record<StockGroupId, string> = {
  raised: "raised",
  cake: "cake",
  specialty: "spec",
  filled_bars: "fill/bar",
};
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "–");
const secs = (ms: number) => (ms / 1000).toFixed(1);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : 0;
};

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(2);
  }
  const photos = await loadPhotos();
  const set = synthetic ? "SYNTHETIC drawings (not real photos)" : `real photos in ${dir}/`;
  console.log(`Eval set: ${set} · ${photos.length} photos · ${runs} run(s) · models: ${models.join(", ")}\n`);

  const all: Run[] = [];
  for (const model of models)
    for (let r = 0; r < runs; r++)
      for (const photo of photos) {
        const t = Date.now();
        try {
          const { result } = await countDonuts(photo.image, { model, secondModel: "" });
          all.push({ model, photo, ms: Date.now() - t, result });
        } catch (e) {
          all.push({ model, photo, ms: Date.now() - t, error: e instanceof Error ? e.message : String(e) });
        }
        const last = all[all.length - 1];
        process.stderr.write(`  ${model} · ${photo.label}: ${last.error ? "ERROR" : `${secs(last.ms)}s`}\n`);
      }

  console.log("## Per photo\n");
  console.log(`| Model | Photo | ${groupOrder.map((g) => `${short[g]} (exp→got)`).join(" | ")} | Abs err | Latency |`);
  console.log(`|---|---|${groupOrder.map(() => "---").join("|")}|---|---|`);
  for (const run of all) {
    if (!run.result) {
      console.log(`| ${run.model} | ${run.photo.label} | ${groupOrder.map(() => "–").join(" | ")} | error: ${run.error} | ${secs(run.ms)}s |`);
      continue;
    }
    let abs = 0;
    const cells = groupOrder.map((g) => {
      const got = run.result!.groups.find((x) => x.groupId === g)!;
      const exp = run.photo.counts[g];
      abs += Math.abs(got.count - exp);
      const flag = got.confidence < LOW_CONFIDENCE ? " ⚑" : "";
      return `${exp}→${got.count}${got.count === exp ? "" : " ✗"}${flag}`;
    });
    console.log(`| ${run.model} | ${run.photo.label} | ${cells.join(" | ")} | ${abs} | ${secs(run.ms)}s |`);
  }
  console.log(`\n✗ = wrong count · ⚑ = confidence < ${LOW_CONFIDENCE} (row highlighted for staff)\n`);

  console.log("## Summary per model\n");
  console.log(`| Model | ${groupOrder.map((g) => `MAE ${short[g]}`).join(" | ")} | Groups exact | Groups ±1 | Photos exact | Wrong groups flagged | Errors | Latency median / max | Under ${TARGET_MS / 1000}s |`);
  console.log(`|---|${groupOrder.map(() => "---").join("|")}|---|---|---|---|---|---|---|`);
  for (const model of models) {
    const rs = all.filter((r) => r.model === model);
    const ok = rs.filter((r) => r.result);
    const diffs = (g: StockGroupId) =>
      ok.map((r) => Math.abs(r.result!.groups.find((x) => x.groupId === g)!.count - r.photo.counts[g]));
    const cells = ok.flatMap((r) =>
      groupOrder.map((g) => {
        const got = r.result!.groups.find((x) => x.groupId === g)!;
        return { err: Math.abs(got.count - r.photo.counts[g]), low: got.confidence < LOW_CONFIDENCE };
      }),
    );
    const wrong = cells.filter((c) => c.err > 0);
    const ms = rs.map((r) => r.ms);
    const mae = (g: StockGroupId) => {
      const d = diffs(g);
      return d.length ? (d.reduce((a, b) => a + b, 0) / d.length).toFixed(2) : "–";
    };
    console.log(
      `| ${model} | ${groupOrder.map(mae).join(" | ")} | ${pct(cells.filter((c) => c.err === 0).length, cells.length)} | ${pct(cells.filter((c) => c.err <= 1).length, cells.length)} | ${pct(ok.filter((r) => groupOrder.every((g) => r.result!.groups.find((x) => x.groupId === g)!.count === r.photo.counts[g])).length, rs.length)} | ${wrong.length ? `${wrong.filter((c) => c.low).length}/${wrong.length}` : "–"} | ${rs.length - ok.length} | ${secs(median(ms))}s / ${secs(Math.max(...ms))}s | ${ms.filter((m) => m < TARGET_MS).length}/${ms.length} |`,
    );
  }
  if (synthetic)
    console.log("\nSYNTHETIC set: proves the pipeline and latency, not accuracy on real donut photos.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
