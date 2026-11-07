/**
 * Build-time OpenAI assets. Run: npm run gen:assets -- [--only ID] [--force]
 * Offline: --dry-run (plan/cost), --validate (all keys, copy, images).
 * Existing assets/copy are preserved unless forced; --only explicitly replaces
 * just that entry. An initial run requests ALL descriptions in one text call.
 * Deli convention approved by coordinator: empty image/imageAlt uses B's fallback.
 * Pricing snapshot: https://developers.openai.com/api/docs/pricing (2026-11-06).
 * Logs are usage-based estimates, never billing receipts. No SDK error bodies
 * are printed because request metadata can contain credentials.
 */
import { loadEnvConfig } from "@next/env";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import sharp from "sharp";
import { z } from "zod";
import { access, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const copyFile = path.join(root, "content/menu-copy.json");
const MAX_BYTES = 200_000; // decimal KB, stricter than 200 KiB
const SIZE = 1024;
const wordCount = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length;
const shortText = z.string().trim().min(1).refine(value => wordCount(value) <= 18, "Maximum 18 words");
const copyEntry = z.object({ description: shortText, image: z.string(), imageAlt: z.string() }).strict();
type Copy = Record<string, z.infer<typeof copyEntry>>;
type Subject = { id: string; name: string; details: string; image: string; imageAlt: string };

const details: Record<string, { prompt: string; alt: string }> = {
  fritter: { prompt: "one knobby, irregular golden-brown fritter, thin shiny glaze, craggy fried edges", alt: "A glazed fritter with golden, craggy edges" },
  "cinnamon-roll": { prompt: "one bakery cinnamon roll with a clear dark cinnamon spiral and a thin glaze", alt: "A glazed cinnamon roll with a dark cinnamon spiral" },
  "cream-cheese-croissant": { prompt: "one crescent-shaped flaky golden croissant with a visible pale cream cheese center", alt: "A flaky golden croissant with a cream cheese center" },
  filled: { prompt: "one plump round filled donut without a hole, lightly sugared, a small filling opening at the side; no cutaway", alt: "A round sugar-dusted filled donut without a hole" },
  "buttermilk-bar": { prompt: "one rectangular buttermilk bar with a cracked ridge down the center and a thin clear glaze", alt: "A rectangular glazed buttermilk bar with a cracked center" },
  "raised-glazed": { prompt: "one light puffy golden raised ring donut with a hole and a thin translucent sugar glaze", alt: "A puffy ring donut with translucent sugar glaze" },
  "raised-maple": { prompt: "one light puffy golden raised ring donut with a hole and smooth tan maple icing on top", alt: "A puffy ring donut topped with tan maple icing" },
  "raised-chocolate": { prompt: "one light puffy golden raised ring donut with a hole and glossy dark chocolate icing on top", alt: "A puffy ring donut topped with dark chocolate icing" },
  "raised-sugar": { prompt: "one light puffy golden raised ring donut with a hole coated in fine white granulated sugar, no icing", alt: "A golden raised ring donut coated in fine sugar" },
  "raised-blueberry": { prompt: "one light puffy golden raised ring donut with a hole and a subtle blueberry-purple glaze on top; no fruit props", alt: "A puffy ring donut topped with blueberry-purple glaze" },
  "cake-old-fashioned": { prompt: "one dense old-fashioned cake ring donut with a hole, pronounced cracked ridged edges and thin tan maple icing", alt: "An old-fashioned ring donut with cracked edges and maple icing" },
  "cake-double-chocolate": { prompt: "one dense dark chocolate cake ring donut with a hole and glossy chocolate frosting; visibly chocolate crumb", alt: "A dark chocolate cake ring donut with chocolate frosting" },
  "cake-white": { prompt: "one pale golden dense white cake ring donut with a hole, smooth top and vanilla-white frosting; no sprinkles", alt: "A golden white cake ring donut with smooth vanilla frosting" },
};
const groups = [
  { id: "raised", name: "Raised donuts", details: "three distinct light puffy ring donuts, all with holes: one clear glazed, one tan maple iced, one chocolate iced", imageAlt: "Three puffy raised donuts with glazed, maple, and chocolate tops" },
  { id: "cake", name: "Cake donuts", details: "three distinct dense cake ring donuts with holes: one cracked old-fashioned, one double chocolate, one vanilla-frosted white cake, no sprinkles", imageAlt: "Old-fashioned, double chocolate, and vanilla-frosted cake donuts" },
  { id: "specialty", name: "Fritters, rolls & croissants", details: "three separate pastries: one knobby glazed fritter, one spiral cinnamon roll, one flaky cream cheese croissant", imageAlt: "A glazed fritter, spiral cinnamon roll, and cream cheese croissant" },
  { id: "filled_bars", name: "Filled & bars", details: "two separate pastries: one plump sugar-dusted round filled donut with NO hole and one rectangular glazed buttermilk bar", imageAlt: "A round sugar-dusted filled donut beside a rectangular glazed buttermilk bar" },
];

// One style for every item and group; only the subject/count changes.
const STYLE = "Photorealistic close-up of [SUBJECT] on a cream-colored bakery paper liner, warm morning light, shallow depth of field, simple warm background, classic American neighborhood donut shop, no text, no logos, no people. Consistent editorial menu photography: soft light from upper left, warm cream and caramel palette, matte beige counter, camera at a 45-degree angle. Center the complete pastry with generous breathing room, no cropping, no plates, no utensils, no extra props. Natural handmade shapes and realistic edible textures.";

async function exists(file: string) {
  try { await access(file); return true; } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
async function saveJSON(copy: Copy) {
  await mkdir(path.dirname(copyFile), { recursive: true });
  await writeFile(`${copyFile}.tmp`, `${JSON.stringify(copy, null, 2)}\n`);
  await rename(`${copyFile}.tmp`, copyFile);
}
async function validateImage(file: string) {
  const meta = await sharp(file).metadata();
  const bytes = (await stat(file)).size;
  if (meta.format !== "webp" || meta.width !== SIZE || meta.height !== SIZE || bytes > MAX_BYTES)
    throw new Error(`Invalid image: ${path.relative(root, file)} (${meta.width}x${meta.height}, ${bytes} bytes)`);
  // Decode pixels too: metadata alone cannot detect a truncated payload.
  await sharp(file).raw().toBuffer();
  return bytes;
}
function validateCopy(copy: Copy, subjects: Subject[], complete: boolean) {
  const allowed = new Set(subjects.map(subject => subject.id));
  for (const id of Object.keys(copy)) if (!allowed.has(id)) throw new Error(`Unexpected copy key: ${id}`);
  for (const subject of subjects) {
    const entry = copy[subject.id];
    if (!entry && !complete) continue;
    const parsed = copyEntry.parse(entry);
    if (parsed.image !== subject.image || parsed.imageAlt !== subject.imageAlt)
      throw new Error(`Unexpected image path or alt for ${subject.id}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let only: string | undefined;
  const flags = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--only") {
      only = args[++index];
      if (!only || only.startsWith("--")) throw new Error("--only requires a menu or stock-group ID");
    } else if (["--force", "--validate", "--dry-run", "--help"].includes(arg)) flags.add(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (flags.has("--help")) {
    console.log("npm run gen:assets -- [--force] [--only ID] [--dry-run | --validate]\nDefault: preserve existing files. --only: replace only that entry/image. --validate and --dry-run: offline, no API calls.");
    return;
  }
  if (flags.has("--validate") && flags.has("--dry-run")) throw new Error("Choose --validate or --dry-run");
  const menu = z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), options: z.array(z.string()).optional() }))
    .parse(JSON.parse(await readFile(path.join(root, "docs/menu.seed.json"), "utf8")));
  const subjects: Subject[] = menu.map(item => {
    const spec = details[item.id];
    if (item.category !== "deli" && !spec) throw new Error(`Missing image direction for ${item.id}`);
    return {
      id: item.id, name: item.name,
      details: item.category === "deli" ? "Deli sandwiches; ask at the counter. No specific fillings or bread are confirmed." : `${spec.prompt}. Options: ${(item.options ?? []).join(", ") || "none specified"}`,
      image: item.category === "deli" ? "" : `/img/menu/${item.id}.webp`,
      imageAlt: item.category === "deli" ? "" : spec.alt,
    };
  }).concat(groups.map(group => ({ ...group, image: `/img/groups/${group.id}.webp` })));
  if (new Set(subjects.map(subject => subject.id)).size !== subjects.length) throw new Error("Duplicate subject IDs");
  if (only && !subjects.some(subject => subject.id === only)) throw new Error(`Unknown ID: ${only}`);
  let copy: Copy = await exists(copyFile) ? z.record(z.string(), copyEntry).parse(JSON.parse(await readFile(copyFile, "utf8"))) : {};
  validateCopy(copy, subjects, false);
  if (flags.has("--validate")) {
    validateCopy(copy, subjects, true);
    let bytes = 0;
    for (const subject of subjects.filter(subject => subject.image)) bytes += await validateImage(path.join(root, "public", subject.image));
    console.log(`Validated ${subjects.length} copy keys (all descriptions <=18 words), ${subjects.filter(subject => subject.image).length} 1024x1024 WebPs <=200 KB; ${bytes} bytes total. Deli uses empty image/imageAlt fallback.`);
    return;
  }
  const selected = subjects.filter(subject => !only || subject.id === only);
  const replace = flags.has("--force") || Boolean(only);
  const images: Subject[] = [];
  for (const subject of selected.filter(subject => subject.image)) {
    const file = path.join(root, "public", subject.image);
    if (replace || !await exists(file)) images.push(subject);
    else await validateImage(file);
  }
  const copyTargets = selected.filter(subject => replace || !copy[subject.id]);
  // Medium image estimate is a planning allowance, not a fixed model price.
  console.log(`Plan: ${images.length} image calls (1024x1024, medium), ${copyTargets.length ? 1 : 0} text call; estimated allowance $${(images.length * 0.10 + (copyTargets.length ? 0.20 : 0)).toFixed(2)} USD. Actual billing unavailable; usage estimates follow.\nImages: ${images.map(subject => subject.id).join(", ") || "none"}`);
  if (flags.has("--dry-run") || (!images.length && !copyTargets.length)) return;
  loadEnvConfig(root, false, { info() {}, error() {} });
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required in the ignored local env");
  const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-6-astra";
  const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 600_000, maxRetries: 0 });
  console.log(`Models: text=${textModel}, image=${imageModel}. Automatic paid-request retries disabled.`);
  let estimatedUSD = 0;
  let missingUsage = 0;
  let imageCalls = 0;
  let textCalls = 0;
  try {
    if (copyTargets.length) {
      // Keep refinements local: API structured-output schema uses plain strings.
      const schema = z.object(Object.fromEntries(copyTargets.map(subject => [subject.id, z.string()]))).strict();
      const result = await client.responses.parse({
        model: textModel,
        input: `Write one warm, specific, appetizing menu description per supplied ID, at most 18 whitespace-separated words each. Return only the exact JSON keys. No history, awards, health/dietary claims, invented fillings, or unconfirmed ingredients. Do not claim these illustrative images are actual shop photos. Deli: invite customers to ask at the counter. Cake donuts may have peanut or coconut toppings; do not imply all have them. Subjects: ${JSON.stringify(copyTargets.map(({ id, name, details }) => ({ id, name, details })))}`,
        text: { format: zodTextFormat(schema, "menu_descriptions") },
      });
      textCalls++;
      if (result.usage) {
        const estimate = (result.usage.input_tokens * 10 + result.usage.output_tokens * 50) / 1_000_000;
        if (textModel === "gpt-6-astra") estimatedUSD += estimate;
        else missingUsage++;
        console.log(`Copy usage: ${JSON.stringify(result.usage)}; ${textModel === "gpt-6-astra" ? `estimated $${estimate.toFixed(4)}` : "custom model cost unknown"}`);
      } else missingUsage++;
      if (result.status !== "completed" || !result.output_parsed) throw new Error("No completed structured copy returned");
      const descriptions = schema.parse(result.output_parsed);
      const next = { ...copy };
      for (const subject of copyTargets) next[subject.id] = copyEntry.parse({ description: descriptions[subject.id], image: subject.image, imageAlt: subject.imageAlt });
      validateCopy(next, subjects, false);
      copy = next;
      await saveJSON(copy);
      console.log(`Saved ${copyTargets.length} descriptions.`);
    }
    // Sequential calls avoid rate-limit bursts and make interruptions resumable.
    for (const subject of images) {
      console.log(`Generating ${subject.id}...`);
      const result = await client.images.generate({ model: imageModel, prompt: STYLE.replace("[SUBJECT]", subject.details), n: 1, size: "1024x1024", quality: "medium", output_format: "png" });
      imageCalls++;
      if (result.usage) {
        const usage = result.usage;
        const estimate = (usage.input_tokens_details.text_tokens * 5 + usage.input_tokens_details.image_tokens * 8 + usage.output_tokens * 30) / 1_000_000;
        if (imageModel === "gpt-image-2.5-sunburst") estimatedUSD += estimate;
        else missingUsage++;
        console.log(`${subject.id} usage: ${JSON.stringify(usage)}; ${imageModel === "gpt-image-2.5-sunburst" ? `estimated $${estimate.toFixed(4)}` : "custom model cost unknown"}`);
      } else missingUsage++;
      const data = result.data?.[0]?.b64_json;
      if (!data) throw new Error(`No base64 image returned for ${subject.id}`);
      const source = Buffer.from(data, "base64");
      let encoded: Buffer | undefined;
      for (const quality of [85, 75, 65, 55, 45, 35, 25]) {
        const candidate = await sharp(source).rotate().resize(SIZE, SIZE, { fit: "cover" }).webp({ quality, effort: 6 }).toBuffer();
        if (candidate.length <= MAX_BYTES) { encoded = candidate; break; }
      }
      if (!encoded) throw new Error(`Cannot compress ${subject.id} to <=200 KB`);
      const file = path.join(root, "public", subject.image);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(`${file}.tmp`, encoded);
      await validateImage(`${file}.tmp`);
      await rename(`${file}.tmp`, file);
      console.log(`Saved ${subject.image}: ${encoded.length} bytes`);
    }
    validateCopy(copy, subjects, !only);
    console.log("Generation complete. Inspect the images visually; run --validate before committing.");
  } finally {
    console.log(`This invocation: ${textCalls} text + ${imageCalls} image responses. Usage-based estimate: $${estimatedUSD.toFixed(4)} USD${missingUsage ? `; ${missingUsage} responses have unknown cost` : ""}. Actual billed spend is unavailable; check the OpenAI billing dashboard. Estimates exclude failed/timed-out requests and use uncached standard rates from the documented pricing snapshot.`);
  }
}

main().catch(error => {
  if (error instanceof OpenAI.APIError) console.error(`OpenAI request failed: status=${error.status ?? "unknown"}, code=${error.code ?? "unknown"}. Existing assets preserved; rerun to resume.`);
  else if (error instanceof z.ZodError) console.error(`Validation failed: ${JSON.stringify(error.issues)}`);
  else console.error(error instanceof Error ? error.message.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]") : "Asset generation failed");
  process.exitCode = 1;
});
