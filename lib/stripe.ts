import Stripe from "stripe";
import { json } from "./http";
import {
  getMenu,
  saveCheckoutDraft,
  getCheckoutDraft,
  completeCheckout,
  getCheckoutOrder,
} from "./store";
import type { PreorderInput } from "./preorder";
import { tomorrow } from "./pickup";
import type { Order } from "./types";

function checkoutOrigin(): string | null {
  try {
    const url = new URL(process.env.APP_BASE_URL ?? "");
    if (
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    return url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname))
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function stripeSandboxEnabled() {
  return !!(
    /^(?:sk|rk|rkcs)_test_/.test(process.env.STRIPE_SECRET_KEY ?? "") &&
    process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") &&
    checkoutOrigin()
  );
}

export function sandboxStripe() {
  if (!stripeSandboxEnabled())
    throw json(
      {
        error: "Sandbox checkout is unavailable. You can still pay at pickup.",
      },
      503,
    );
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    maxNetworkRetries: 2,
    timeout: 15_000,
  });
}

export async function startSandboxCheckout(
  input: PreorderInput,
  key: string,
  stripe = sandboxStripe(),
  now = new Date(),
) {
  if (input.pickupDate !== tomorrow(now))
    throw json(
      {
        error:
          "Sandbox card checkout is available for tomorrow's pickup. Choose pay at pickup for today.",
      },
      400,
    );
  const draft = await saveCheckoutDraft(input, key, now);
  if (draft.expiresAt <= Math.floor(now.getTime() / 1000) + 1800) {
    throw json(
      { error: "This checkout attempt has expired. Start a new order." },
      409,
    );
  }
  const menu = await getMenu();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      ui_mode: "hosted_page",
      allowed_payment_method_types: ["card"],
      adaptive_pricing: { enabled: false },
      client_reference_id: draft.id,
      metadata: { preorderId: draft.id, fingerprint: draft.fingerprint },
      line_items: draft.input.items.map((i) => {
        const item = menu.find((m) => m.id === i.menuItemId)!;
        return {
          quantity: i.qty,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price! * 100),
            product_data: {
              name: `${item.name}${i.option ? ` — ${i.option}` : ""}`,
            },
          },
        };
      }),
      expires_at: draft.expiresAt,
      success_url: `${checkoutOrigin()}/order/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${checkoutOrigin()}/order/return?cancelled=1`,
      custom_text: {
        submit: {
          message:
            "Concept demo — sandbox payment only. No real charge or shop order. Pickup details were collected on the website.",
        },
      },
    },
    { idempotencyKey: `preorder-${draft.id}` },
  );
  if (
    session.livemode ||
    !session.id.startsWith("cs_test_") ||
    !session.url?.startsWith("https://checkout.stripe.com/")
  )
    throw new Error("Expected a Stripe sandbox checkout session");
  return { url: session.url };
}

async function matchingDraft(session: Stripe.Checkout.Session) {
  if (session.livemode || !session.id.startsWith("cs_test_"))
    throw json({ error: "Only sandbox payments are accepted" }, 400);
  const id = session.metadata?.preorderId;
  if (!id) return null; // Ignore unrelated checkouts in the same sandbox.
  const draft = await getCheckoutDraft(id);
  if (!draft) throw json({ error: "Checkout order was not found" }, 409);
  if (
    session.client_reference_id !== draft.id ||
    session.metadata?.fingerprint !== draft.fingerprint ||
    session.amount_total !== draft.amountTotal ||
    session.currency !== "usd" ||
    session.mode !== "payment"
  ) {
    throw json({ error: "Checkout details do not match the order" }, 400);
  }
  return draft;
}

export async function fulfillSandboxCheckout(session: Stripe.Checkout.Session) {
  const draft = await matchingDraft(session);
  if (
    !draft ||
    session.payment_status !== "paid" ||
    session.status !== "complete"
  )
    return null;
  return completeCheckout(draft, session.id);
}

export function publicReceipt(order: Order) {
  return {
    id: order.id,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    items: order.items,
    payment: order.payment,
  };
}

export async function sandboxCheckoutStatus(
  id: string,
  stripe = sandboxStripe(),
) {
  const session = await stripe.checkout.sessions.retrieve(id);
  const draft = await matchingDraft(session);
  if (!draft) throw json({ error: "Checkout order was not found" }, 404);
  const order = await getCheckoutOrder(draft.id);
  if (
    order?.payment?.sessionId === session.id &&
    session.payment_status === "paid"
  )
    return { state: "confirmed" as const, order: publicReceipt(order) };
  return {
    state:
      session.status === "expired"
        ? ("expired" as const)
        : session.payment_status === "paid"
          ? ("confirming" as const)
          : ("unpaid" as const),
  };
}
