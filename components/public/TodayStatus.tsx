"use client";

import { site } from "@/content/site";
import { useLiveInventory, useNow } from "./LiveStock";
import { statusAt, type ShopStatus } from "./hours";

// Open / Closed / Sold out pill plus today's hours. Uses the server's status until the browser clock is ready.
export function TodayStatus({ initial }: { initial: ShopStatus }) {
  const inventory = useLiveInventory();
  const now = useNow();
  const { open, sunday } = now === null ? initial : statusAt(new Date(now));
  const pill = !open
    ? site.closed
    : inventory.shopSoldOut
      ? site.soldOutPill
      : site.openNow;
  const hours = sunday ? site.closedSunday : open ? site.openToday : site.hours;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="rounded-full bg-frosting px-4 py-1 font-bold">{pill}</p>
      <p className="text-sm font-bold">{hours}</p>
    </div>
  );
}
