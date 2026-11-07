import type { Order } from "@/lib/types";
import { money, pickupLabel } from "@/lib/pickup";
import { preorderCopy as copy } from "@/content/preorder";

export type Receipt = Pick<
  Order,
  "id" | "pickupDate" | "pickupTime" | "items" | "payment"
>;

export function PreorderReceipt({ order }: { order: Receipt }) {
  return (
    <div
      role="status"
      className="space-y-3 rounded-theme border-2 border-cocoa bg-frosting p-5"
    >
      <h3 className="font-display text-2xl">
        {order.payment?.method === "stripe_sandbox"
          ? copy.confirmed
          : copy.held}
      </h3>
      <p className="font-bold">
        {pickupLabel(order.pickupDate, order.pickupTime)} · {copy.denverTime}
      </p>
      <p>
        {copy.reference}:{" "}
        <strong>#{order.id.replace(/^S-/, "").slice(0, 8)}</strong>
      </p>
      <p>
        {order.items.reduce((sum, i) => sum + i.qty, 0)} {copy.donuts} ·{" "}
        {money(order.payment?.amountTotal ?? 0)} ·{" "}
        {order.payment?.method === "stripe_sandbox"
          ? copy.paidSandbox
          : copy.pickup}
      </p>
      <p className="text-sm">{copy.demo}</p>
    </div>
  );
}
