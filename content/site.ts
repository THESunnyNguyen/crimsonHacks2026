import type { Level, MenuItem, StockGroupId } from "@/lib/types";

// Public copy. Lane B expands this; facts come from docs/SHOP.md.
export const site = {
  name: "Fresh Donuts & Deli",
  tagline: "South Salt Lake · family-owned for 25 years",
  address: "2699 S State St, South Salt Lake, UT 84115",
  phone: "(801) 467-8322",
  phoneHref: "tel:+18014678322",
  hours: "Mon–Sat 5 AM–5 PM · Closed Sunday",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Fresh+Donuts+%26+Deli+2699+S+State+St+South+Salt+Lake+UT",
  openNow: "Open now",
  closed: "Closed",
  soldOutToday: "Sold out for today. Fresh again tomorrow at 5 AM.",
  caseHeading: "In the case now",
  menuHeading: "Menu",
  askAtCounter: "Ask at the counter",
  cakeToppings: "Peanut or coconut on any cake donut",
  footer: "Concept demo, not affiliated · Crimson Hacks 2026",
};

export const groupNames: Record<StockGroupId, string> = {
  raised: "Raised donuts",
  cake: "Cake donuts",
  specialty: "Fritters, rolls & croissants",
  filled_bars: "Filled & bars",
};

export const categoryNames: Record<MenuItem["category"], string> = {
  specialty: "Specialty",
  filled_bars: "Filled & bars",
  raised: "Raised",
  cake: "Cake",
  deli: "Deli",
};

export function levelLabel(level: Level, available: number): string {
  if (level === "sold_out") return "Sold out";
  if (level === "low") return `Only ${available} left`;
  return "Plenty";
}
