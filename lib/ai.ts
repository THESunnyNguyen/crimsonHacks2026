import OpenAI, { toFile } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { ResponseInput } from "openai/resources/responses/responses";
function client() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 1 }); }
async function structured<T>(input: ResponseInput, schema: z.ZodType<T>, model: string): Promise<T> {
  const api = client();
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await api.responses.parse({ model, input, text: { format: zodTextFormat(schema, "result") } });
      if (response.status !== "completed" || response.output_parsed == null) throw new Error("AI returned no complete structured result; please retry or enter manually");
      return schema.parse(response.output_parsed);
    } catch (e) { if (attempt === 0 && (e instanceof SyntaxError || e instanceof z.ZodError)) continue; throw e; }
  }
  throw new Error("Unable to parse AI result");
}
export function textJSON<T>(prompt: string, schema: z.ZodType<T>, options: { model?: string } = {}): Promise<T> {
  return structured([{ role: "user", content: [{ type: "input_text", text: prompt }] }], schema, options.model ?? process.env.PARSE_MODEL ?? "gpt-6-luna");
}
export async function visionJSON<T>(image: string | Blob | Buffer, prompt: string, schema: z.ZodType<T>, options: { model?: string } = {}): Promise<T> {
  const url = typeof image === "string" ? image : `data:${image instanceof Blob ? image.type || "image/jpeg" : "image/jpeg"};base64,${(image instanceof Blob ? Buffer.from(await image.arrayBuffer()) : image).toString("base64")}`;
  return structured([{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: url, detail: "high" }] }], schema, options.model ?? process.env.VISION_MODEL ?? "gpt-6-astra");
}
export async function transcribe(audio: File | Blob | Buffer): Promise<string> {
  const file = audio instanceof File ? audio : await toFile(audio, audio instanceof Blob && audio.type.includes("mp4") ? "audio.mp4" : "audio.webm");
  const result = await client().audio.transcriptions.create({ model: process.env.TRANSCRIBE_MODEL ?? "gpt-transcribe", file });
  return result.text;
}
