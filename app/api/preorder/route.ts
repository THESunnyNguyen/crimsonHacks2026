import { handle, json } from "@/lib/http";
import { parsePreorder } from "@/lib/preorder";
import { limitPublicRequest, requestKey } from "@/lib/preorder-request";
import { createPreorder } from "@/lib/store";
import { publicReceipt } from "@/lib/stripe";

export function POST(req: Request) {
  return handle(async () => {
    await limitPublicRequest(req);
    const input = parsePreorder(await req.json());
    return json(
      publicReceipt(await createPreorder(input, requestKey(req))),
      201,
    );
  });
}
