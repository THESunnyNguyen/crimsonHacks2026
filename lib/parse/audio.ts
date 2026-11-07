export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_SECONDS = 60;

const multipartOverhead = 64 * 1024;

function tooLarge(): Response {
  return new Response(
    JSON.stringify({ error: "Audio must be 10 MB or smaller." }),
    { status: 413, headers: { "Content-Type": "application/json" } },
  );
}

// Browser recordings are decoded to mono PCM WAV before upload. Inspect actual
// frame data here instead of trusting a client-supplied duration or filename.
export function wavSeconds(bytes: Uint8Array): number {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (p: number) => String.fromCharCode(...bytes.subarray(p, p + 4));
  if (
    bytes.length < 44 ||
    tag(0) !== "RIFF" ||
    tag(8) !== "WAVE" ||
    v.getUint32(4, true) + 8 !== bytes.length
  )
    throw new Error("Use a complete WAV recording, or type the call notes.");

  let rate = 0;
  let align = 0;
  let dataBytes = 0;
  for (let p = 12; p + 8 <= bytes.length; ) {
    const size = v.getUint32(p + 4, true);
    const end = p + 8 + size;
    if (end > bytes.length) throw new Error("Incomplete audio recording.");
    if (tag(p) === "fmt ") {
      if (size < 16 || v.getUint16(p + 8, true) !== 1)
        throw new Error("PCM WAV audio required.");
      const channels = v.getUint16(p + 10, true);
      const sampleRate = v.getUint32(p + 12, true);
      const bits = v.getUint16(p + 22, true);
      rate = v.getUint32(p + 16, true);
      align = v.getUint16(p + 20, true);
      if (
        channels !== 1 ||
        bits !== 16 ||
        sampleRate < 8000 ||
        sampleRate > 96000 ||
        align !== (channels * bits) / 8 ||
        rate !== sampleRate * align
      )
        throw new Error("Invalid PCM audio format.");
    }
    if (tag(p) === "data") dataBytes += size;
    p = end + (size % 2);
  }
  if (!rate || !dataBytes || dataBytes % align)
    throw new Error("Empty or invalid audio recording.");
  return dataBytes / rate;
}

// Reads the body with a hard cap so an oversized upload is cut off while
// streaming, not after it has been buffered in full.
export async function boundedAudioForm(req: Request): Promise<FormData> {
  const limit = MAX_AUDIO_BYTES + multipartOverhead;
  if (Number(req.headers.get("content-length")) > limit) throw tooLarge();
  if (!req.body) throw new Error("Missing recording.");

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) {
        await reader.cancel();
        throw tooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return new Response(body, {
    headers: { "Content-Type": req.headers.get("content-type") || "" },
  }).formData();
}
