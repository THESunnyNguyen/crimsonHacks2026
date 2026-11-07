import { handle, json } from "@/lib/http";
import { sandboxStripe, fulfillSandboxCheckout } from "@/lib/stripe";

export const runtime = "nodejs";

export function POST(req: Request) {
  return handle(async () => {
    const stripe = sandboxStripe();
    const signature = req.headers.get("stripe-signature");
    if (!signature) return json({ error: "Stripe signature required" }, 400);
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        await req.text(),
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch {
      return json({ error: "Invalid Stripe signature" }, 400);
    }
    if (event.livemode)
      return json({ error: "Only sandbox events are accepted" }, 400);
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillSandboxCheckout(event.data.object);
    }
    return json({ received: true });
  });
}
