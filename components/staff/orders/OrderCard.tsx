"use client";

import { useState } from "react";
import type { MenuItem, Order } from "@/lib/types";
import { copy } from "./content";

export type OrderCardProps = {
  order: Order;
  menuById: Map<string, MenuItem>;
  highlighted: boolean;
  busy: boolean;
  onStatus: (status: Order["status"]) => void;
};

const next: Partial<Record<Order["status"], Order["status"]>> = {
  new: "ready",
  ready: "picked_up",
};

// "07:30" → "7:30 AM" for the card header.
function clock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function OrderCard({
  order,
  menuById,
  highlighted,
  busy,
  onStatus,
}: OrderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const advance = next[order.status];
  const open = order.status === "new" || order.status === "ready";

  return (
    <li
      className={`rounded-theme border-2 border-cocoa p-4 ${highlighted ? "bg-frosting" : "bg-cream"} ${open ? "" : "opacity-60"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-2xl">{clock(order.pickupTime)}</p>
          <p className="font-bold">
            {order.customerName}
            {order.phone && (
              <span className="ml-2 font-normal">{order.phone}</span>
            )}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>{copy.source[order.source]}</p>
          {order.payment && (
            <p className="font-bold">
              {order.payment.method === "stripe_sandbox"
                ? copy.sandboxPaid
                : copy.payAtPickup}
            </p>
          )}
          {highlighted && <p className="font-bold">{copy.highlighted}</p>}
        </div>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5">
        {order.items.map((item, i) => (
          <li key={`${item.menuItemId}-${i}`}>
            {item.qty} ×{" "}
            {menuById.get(item.menuItemId)?.name ?? item.menuItemId}
            {item.option && ` (${item.option})`}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-3 whitespace-pre-line text-sm">{order.notes}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={!advance || busy}
          onClick={() => advance && onStatus(advance)}
          className="min-h-11 flex-1 rounded-theme bg-cocoa px-3 font-bold text-cream disabled:bg-frosting disabled:text-cocoa"
        >
          {copy.status[order.status]}
        </button>
        {open && (
          <button
            type="button"
            aria-label={copy.actions}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="min-h-11 min-w-11 rounded-theme border-2 border-cocoa px-3 font-bold"
          >
            ⋯
          </button>
        )}
      </div>

      {menuOpen && open && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setMenuOpen(false);
            if (window.confirm(copy.cancelPrompt)) onStatus("cancelled");
          }}
          className="mt-2 min-h-11 w-full rounded-theme border-2 border-cocoa px-3 font-bold"
        >
          {copy.cancel}
        </button>
      )}
    </li>
  );
}
