import type { Inventory, Level, MenuItem, StockGroupId } from "@/lib/types";

// Public copy. Sunny edits this file to restyle wording; facts come from docs/SHOP.md.
export const site = {
  name: "Fresh Donuts & Deli",
  tagline: "South Salt Lake · family-owned for 25 years",
  address: "2699 S State St, South Salt Lake, UT 84115",
  phone: "(801) 467-8322",
  phoneHref: "tel:+18014678322",
  hours: "Mon–Sat 5 AM–5 PM · Closed Sunday",
  openToday: "Open today until 5 PM",
  closedSunday: "Closed Sunday · back Monday at 5 AM",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Fresh+Donuts+%26+Deli+2699+S+State+St+South+Salt+Lake+UT",
  openNow: "Open now",
  closed: "Closed",
  soldOutPill: "Sold out today",
  soldOutToday: "Sold out for today. Fresh again tomorrow at 5 AM.",
  nav: [
    { href: "#preorder", label: "Preorder" },
    { href: "#case", label: "In the case" },
    { href: "#menu", label: "Menu" },
    { href: "#story", label: "Our story" },
    { href: "#visit", label: "Visit" },
  ],
  caseHeading: "In the case now",
  caseNote: "Live from the case. Counts update when staff snap a photo.",
  menuHeading: "Menu",
  menuNote: "Prices are each. Ask at the counter about deli sandwiches.",
  askAtCounter: "Ask at the counter",
  deliSandwichImage: {
    src: "/img/menu/deli-sandwich.webp",
    alt: "An illustrative deli sandwich on a golden roll with layered fillings and crisp greens",
  },
  cakeToppings: "Peanut or coconut on any cake donut",
  storyHeading: "Our Story",
  photos: {
    front: {
      src: "/img/shop/front.webp",
      alt: "Fresh Donuts & Deli storefront on State Street in South Salt Lake",
    },
    kitchen: {
      src: "/img/shop/untitled-design.webp",
      alt: "Donuts being prepared in the Fresh Donuts & Deli kitchen",
    },
  },
  storyParagraphs: [
    "Hi! We're Wilson and Brenda, the husband-and-wife team behind Fresh Donuts & Deli! We opened our little donut shop in South Salt Lake back in 1999 with one simple goal: to make fresh, delicious donuts that people would love.",
    "For over 25 years, we've been waking up before sunrise to make our donuts from scratch, using a recipe we've spent years perfecting. What started as a small family business has grown into something truly special, thanks to our amazing customers and community. We were even named one of Yelp's Top 100 Donut Shops in the country in 2023!",
    "We're so grateful for everyone who has supported us over the years, whether you've been stopping by since day one or you're visiting for the first time. We can't wait to share a fresh donut with you!",
  ],
  visitHeading: "Visit us",
  directions: "Get directions",
  callLabel: "Call",
  footer: "Concept demo, not affiliated · Crimson Hacks 2026",
  illustrationLabel: "Illustration",
  sourceLabels: {
    photo: "camera",
    casecam: "camera",
    manual: "staff",
  } satisfies Record<Inventory["source"], string>,
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
