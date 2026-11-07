import { requireStaff } from "@/lib/auth";
import { transcribe } from "@/lib/ai";
import { handle, json } from "@/lib/http";
import {
  boundedAudioForm,
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
  wavSeconds,
} from "@/lib/parse/audio";

export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    let form: FormData;
    try {
      form = await boundedAudioForm(req);
    } catch (e) {
      if (e instanceof Response) throw e;
      return json(
        { error: "Invalid audio upload. Try recording again or type the notes." },
        400,
      );
    }
    const audio = form.get("audio");
    if (!(audio instanceof File) || audio.size === 0)
      return json({ error: "Missing audio file" }, 400);
    if (audio.size > MAX_AUDIO_BYTES)
      return json({ error: "Audio must be 10 MB or smaller." }, 413);
    let seconds: number;
    try {
      seconds = wavSeconds(new Uint8Array(await audio.arrayBuffer()));
    } catch (e) {
      return json({ error: (e as Error).message }, 400);
    }
    if (seconds > MAX_AUDIO_SECONDS)
      return json({ error: "Recordings must be 60 seconds or shorter." }, 413);
    return json({ text: await transcribe(audio) });
  });
}
