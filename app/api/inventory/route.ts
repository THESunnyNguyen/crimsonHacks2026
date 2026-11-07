import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { getInventory, setCounts, setSoldOutToggle } from "@/lib/store";
import { inventorySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => json(await getInventory()));
}

export function PUT(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const body = inventorySchema.parse(await req.json());
    return json(
      "soldOutToggle" in body
        ? await setSoldOutToggle(body.soldOutToggle)
        : await setCounts(body.groups, body.source),
    );
  });
}
