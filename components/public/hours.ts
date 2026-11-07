import { isOpenNow } from "@/lib/time";

export type ShopStatus = { open: boolean; sunday: boolean };

const zone = "America/Denver";

// Same clock rules as lib/time.ts, so server and browser agree on open/closed.
export function statusAt(now: Date): ShopStatus {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
  }).format(now);
  return { open: isOpenNow(now), sunday: weekday === "Sun" };
}
