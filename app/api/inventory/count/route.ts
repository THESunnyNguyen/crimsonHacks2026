import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import type { CountResult } from "@/lib/types";

export const dynamic = "force-dynamic";

// Stub: lane A replaces this with the OpenAI vision count. Makes no AI call.
const fakeCount: CountResult = {
  groups: [
    { groupId: "raised", count: 12, confidence: 0.95 },
    { groupId: "cake", count: 3, confidence: 0.9 },
    { groupId: "specialty", count: 5, confidence: 0.6 },
    { groupId: "filled_bars", count: 8, confidence: 0.85 },
  ],
  total: 28,
  notes: "Stub count: AI not connected yet.",
};

export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const image = (await req.formData().catch(() => null))?.get("image");
    if (!(image instanceof Blob))
      return json({ error: "Missing image file" }, 400);
    return json(fakeCount);
  });
}
