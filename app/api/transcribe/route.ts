import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Stub: lane C replaces this with OpenAI transcription. Makes no AI call.
export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const audio = (await req.formData().catch(() => null))?.get("audio");
    if (!(audio instanceof Blob))
      return json({ error: "Missing audio file" }, 400);
    return json({
      text: "Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100",
    });
  });
}
