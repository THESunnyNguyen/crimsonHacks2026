// Server only: photo → bounded JPEG → OpenAI strict counts → CountResult. Never saves.
import sharp from "sharp";
import { visionJSON } from "@/lib/ai";
import type { CountResult } from "@/lib/types";
import { countPrompt } from "./prompt";
import { aiCountSchema, toCountResult, withSecondOpinion, type AiCount } from "./schema";

export const MAX_SIDE = 1568;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const TARGET_MS = 8000;
const PRIMARY_TIMEOUT_MS = 25000;

export class VisionError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type VisionCall = (image: Buffer, model: string) => Promise<AiCount>;
const openaiCall: VisionCall = (image, model) =>
  visionJSON(image, countPrompt, aiCountSchema, { model });

export type CountTiming = {
  model: string;
  resizeMs: number;
  primaryMs: number;
  secondModel?: string;
  secondMs?: number;
  secondStatus?: "ok" | "failed" | "late";
  totalMs: number;
  width: number;
  height: number;
  bytes: number;
};

// Auto-rotate from EXIF, fit inside MAX_SIDE×MAX_SIDE, re-encode as JPEG.
export async function prepareImage(
  input: Buffer,
): Promise<{ jpeg: Buffer; width: number; height: number }> {
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return { jpeg: data, width: info.width, height: info.height };
  } catch {
    throw new VisionError(
      "Couldn't read that photo. Try a JPEG or PNG, or set the counts by hand.",
      415,
    );
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | "late"> {
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    promise,
    new Promise<"late">((resolve) => {
      timer = setTimeout(() => resolve("late"), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

export async function countDonuts(
  photo: Buffer,
  options: {
    model?: string;
    secondModel?: string;
    call?: VisionCall;
    primaryTimeoutMs?: number;
    secondBudgetMs?: number;
  } = {},
): Promise<{ result: CountResult; timing: CountTiming }> {
  const call = options.call ?? openaiCall;
  const model = options.model || process.env.VISION_MODEL || "gpt-6-astra";
  const second =
    options.secondModel ?? (process.env.VISION_SECOND_MODEL || "").trim();
  const secondModel = second && second !== model ? second : undefined;
  if (!options.call && !process.env.OPENAI_API_KEY)
    throw new VisionError(
      "AI counting isn't set up. Set the counts by hand.",
      503,
    );

  const start = Date.now();
  const { jpeg, width, height } = await prepareImage(photo);
  const resizeMs = Date.now() - start;

  const timed = async (m: string) => {
    const t = Date.now();
    const ai = await call(jpeg, m);
    return { result: toCountResult(ai), ms: Date.now() - t };
  };
  // Both calls start together; the second opinion never blocks past the
  // primary answer or the latency target, whichever is later.
  const primaryP = timed(model);
  const secondP = secondModel ? timed(secondModel) : undefined;
  secondP?.catch(() => {});

  let primary: Awaited<typeof primaryP>;
  try {
    const p = await withTimeout(
      primaryP,
      options.primaryTimeoutMs ?? PRIMARY_TIMEOUT_MS,
    );
    if (p === "late")
      throw new VisionError(
        "Counting took too long. Try again, or set the counts by hand.",
        504,
      );
    primary = p;
  } catch (e) {
    if (e instanceof VisionError) throw e;
    console.error(
      "Vision count failed:",
      e instanceof Error ? e.message : "Unknown error",
    );
    throw new VisionError(
      "The AI couldn't count this photo. Try again, or set the counts by hand.",
      502,
    );
  }

  let result = primary.result;
  const timing: CountTiming = {
    model,
    resizeMs,
    primaryMs: primary.ms,
    totalMs: 0,
    width,
    height,
    bytes: jpeg.length,
  };
  if (secondP && secondModel) {
    timing.secondModel = secondModel;
    const budget = options.secondBudgetMs ?? TARGET_MS;
    const remaining = Math.max(0, start + budget - Date.now());
    try {
      const s = await withTimeout(secondP, remaining);
      if (s === "late") timing.secondStatus = "late";
      else {
        timing.secondStatus = "ok";
        timing.secondMs = s.ms;
        result = withSecondOpinion(result, secondModel, s.result);
      }
    } catch (e) {
      timing.secondStatus = "failed";
      console.error(
        "Second-opinion count failed:",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  }
  timing.totalMs = Date.now() - start;
  return { result, timing };
}
