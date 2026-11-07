"use client";

import { useEffect, useState } from "react";
import { groupNames, levelLabel, site } from "@/content/site";
import type { Inventory } from "@/lib/types";

export type BasicStockProps = { initial: Inventory };

// Placeholder live stock list; lane B replaces it. Polls every 5s per contract.
export function BasicStock({ initial }: BasicStockProps) {
  const [inventory, setInventory] = useState(initial);
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/inventory", { cache: "no-store" });
        if (res.ok) setInventory(await res.json());
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section aria-live="polite">
      <h2 className="font-display text-2xl">{site.caseHeading}</h2>
      {inventory.shopSoldOut && (
        <p className="mt-2 font-bold">{site.soldOutToday}</p>
      )}
      <ul className="mt-2 space-y-1">
        {inventory.groups.map((g) => (
          <li key={g.groupId}>
            {groupNames[g.groupId]}: {levelLabel(g.level, g.available)}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-sm text-cocoa/70">
        Updated {new Date(inventory.updatedAt).toLocaleTimeString("en-US")} ·{" "}
        {inventory.source}
      </p>
    </section>
  );
}
