import { handle, json } from "@/lib/http";
import { parsePreorder } from "@/lib/preorder";
import { limitPublicRequest, requestKey } from "@/lib/preorder-request";
import { startSandboxCheckout, sandboxCheckoutStatus } from "@/lib/stripe";

export function POST(req: Request) {
  return handle(async () => {
    await limitPublicRequest(req);
    return json(
      await startSandboxCheckout(
        parsePreorder(await req.json()),
        requestKey(req),
      ),
      201,
    );
  });
}

export function GET(req: Request) {
  return handle(async () => {
    await limitPublicRequest(req, 40, "checkout-status");
    const id = new URL(req.url).searchParams.get("session_id") ?? "";
    if (!/^cs_test_[a-zA-Z0-9_]{10,200}$/.test(id))
      return json({ error: "Invalid sandbox checkout" }, 400);
    return json(await sandboxCheckoutStatus(id));
  });
}
