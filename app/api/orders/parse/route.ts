import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { today } from "@/lib/time";
import { orderSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ text: z.string().trim().min(1).max(4000) });

// Stub: lane C replaces this with OpenAI parsing. Returns a fixed, valid draft.
export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const { text } = bodySchema.parse(await req.json());
    const tomorrow = today(new Date(Date.now() + 24 * 60 * 60 * 1000));
    return json(
      orderSchema.parse({
        customerName: "Maria",
        phone: "801-555-0100",
        pickupDate: tomorrow,
        pickupTime: "07:30",
        items: [
          { menuItemId: "raised-glazed", qty: 12 },
          { menuItemId: "fritter", qty: 2 },
        ],
        notes: `Stub draft (AI not connected). Original notes: ${text}`.slice(
          0,
          2000,
        ),
        source: "notes",
      }),
    );
  });
}
