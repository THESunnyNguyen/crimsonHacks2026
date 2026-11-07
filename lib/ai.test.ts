import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { textJSON, transcribe, visionJSON } from "./ai";

test("blank model settings fall back and browser blob recordings get an audio filename", async () => {
  const originalFetch = globalThis.fetch;
  const names = [
    "OPENAI_API_KEY",
    "PARSE_MODEL",
    "VISION_MODEL",
    "TRANSCRIBE_MODEL",
  ];
  const previous = names.map((n) => process.env[n]);
  process.env.OPENAI_API_KEY = "test-only";
  for (const name of names.slice(1)) process.env[name] = "";
  const seen: string[] = [];
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    if (request.url.endsWith("/audio/transcriptions")) {
      const form = await request.formData();
      const file = form.get("file") as File;
      assert.equal(file.name, "audio.mp4");
      assert.equal(file.type, "audio/mp4");
      assert.equal(form.get("model"), "gpt-transcribe");
      return Response.json({ text: "Maria tomorrow" });
    }
    const body = await request.json();
    seen.push(body.model);
    return Response.json({
      id: "test",
      object: "response",
      created_at: 0,
      status: "completed",
      model: body.model,
      output: [
        {
          type: "message",
          id: "msg",
          status: "completed",
          role: "assistant",
          content: [
            { type: "output_text", text: '{"ok":true}', annotations: [] },
          ],
        },
      ],
    });
  };
  try {
    assert.deepEqual(await textJSON("check", z.object({ ok: z.boolean() })), {
      ok: true,
    });
    assert.deepEqual(
      await visionJSON(
        "data:image/jpeg;base64,AA==",
        "check",
        z.object({ ok: z.boolean() }),
      ),
      { ok: true },
    );
    assert.deepEqual(seen, ["gpt-6-luna", "gpt-6-astra"]);
    assert.equal(
      await transcribe(
        new File([new Uint8Array([1, 2])], "blob", {
          type: "audio/mp4;codecs=mp4a.40.2",
        }),
      ),
      "Maria tomorrow",
    );
  } finally {
    globalThis.fetch = originalFetch;
    names.forEach((n, i) => {
      if (previous[i] === undefined) delete process.env[n];
      else process.env[n] = previous[i];
    });
  }
});
