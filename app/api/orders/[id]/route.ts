import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { updateOrderStatus } from "@/lib/store";
import { statusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ status: statusSchema }).strict();

export function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    requireStaff(req);
    const { status } = bodySchema.parse(await req.json());
    const order = await updateOrderStatus((await params).id, status);
    return order ? json(order) : json({ error: "Order not found" }, 404);
  });
}
