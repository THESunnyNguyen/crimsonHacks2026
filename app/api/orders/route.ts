import { requireStaff } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { createOrder, listOrders } from "@/lib/store";
import { dateSchema, orderSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return handle(async () => {
    requireStaff(req);
    const date = new URL(req.url).searchParams.get("date");
    return json(
      await listOrders({ date: date ? dateSchema.parse(date) : undefined }),
    );
  });
}

export function POST(req: Request) {
  return handle(async () => {
    requireStaff(req);
    return json(await createOrder(orderSchema.parse(await req.json())), 201);
  });
}
