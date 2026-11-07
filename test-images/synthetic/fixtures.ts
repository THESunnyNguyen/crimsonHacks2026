// SYNTHETIC fixtures: flat vector drawings of donuts in a box, generated in
// memory with sharp. They exercise the pipeline end to end and give a latency
// number, but they are NOT the demo accuracy proof (that needs Sunny's real
// phone photos; see docs/eval.md).
import sharp from "sharp";
import type { StockGroupId } from "@/lib/types";

type Item =
  | "glazed"
  | "chocolate_raised"
  | "old_fashioned"
  | "peanut_cake"
  | "fritter"
  | "cinnamon_roll"
  | "filled"
  | "bar";

const groupOf: Record<Item, StockGroupId> = {
  glazed: "raised",
  chocolate_raised: "raised",
  old_fashioned: "cake",
  peanut_cake: "cake",
  fritter: "specialty",
  cinnamon_roll: "specialty",
  filled: "filled_bars",
  bar: "filled_bars",
};

const R = 62;
function draw(item: Item, x: number, y: number): string {
  switch (item) {
    case "glazed":
    case "chocolate_raised": {
      const top = item === "glazed" ? "#f3d7a6" : "#5b3420";
      return `<circle cx="${x}" cy="${y}" r="${R}" fill="#d9a35b"/>
        <circle cx="${x}" cy="${y}" r="${R - 6}" fill="${top}" opacity="0.92"/>
        <ellipse cx="${x - 22}" cy="${y - 28}" rx="16" ry="7" fill="#fff" opacity="0.35"/>
        <circle cx="${x}" cy="${y}" r="17" fill="#f6e8d6"/>`;
    }
    case "old_fashioned":
    case "peanut_cake": {
      const cracks = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return `<line x1="${x + Math.cos(a) * 38}" y1="${y + Math.sin(a) * 38}" x2="${x + Math.cos(a) * (R - 4)}" y2="${y + Math.sin(a) * (R - 4)}" stroke="#7a4a22" stroke-width="3"/>`;
      }).join("");
      const nuts =
        item === "peanut_cake"
          ? Array.from({ length: 22 }, (_, i) => {
              const a = i * 2.4;
              const d = 28 + ((i * 7) % 26);
              return `<circle cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" r="3.5" fill="#e9c27a"/>`;
            }).join("")
          : "";
      return `<circle cx="${x}" cy="${y}" r="${R - 4}" fill="#a8672f"/>${cracks}${nuts}
        <circle cx="${x}" cy="${y}" r="14" fill="#f6e8d6"/>`;
    }
    case "fritter": {
      const pts = Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const d = R + (i % 2 ? 6 : -10) + ((i * 13) % 9);
        return `${x + Math.cos(a) * d},${y + Math.sin(a) * d * 0.85}`;
      }).join(" ");
      return `<polygon points="${pts}" fill="#c98a43"/>
        <circle cx="${x - 18}" cy="${y - 10}" r="14" fill="#b07434"/>
        <circle cx="${x + 20}" cy="${y + 12}" r="16" fill="#b07434"/>
        <circle cx="${x + 5}" cy="${y - 25}" r="10" fill="#dca866"/>`;
    }
    case "cinnamon_roll": {
      let d = `M ${x} ${y}`;
      for (let t = 0; t < 22; t += 0.25)
        d += ` L ${x + Math.cos(t) * t * 2.7} ${y + Math.sin(t) * t * 2.7}`;
      return `<circle cx="${x}" cy="${y}" r="${R}" fill="#c47d3c"/>
        <path d="${d}" fill="none" stroke="#7b4219" stroke-width="5"/>
        <path d="M ${x - 40} ${y - 10} q 20 15 40 0 t 40 0" stroke="#fff" stroke-width="6" fill="none" opacity="0.8"/>`;
    }
    case "filled":
      return `<circle cx="${x}" cy="${y}" r="${R}" fill="#e2b36e"/>
        <circle cx="${x}" cy="${y}" r="${R - 4}" fill="#fbf4ea" opacity="0.75"/>
        <circle cx="${x + R - 12}" cy="${y}" r="9" fill="#b3263a"/>`;
    case "bar":
      return `<rect x="${x - 85}" y="${y - 35}" width="170" height="70" rx="22" fill="#d49a52"/>
        <rect x="${x - 80}" y="${y - 30}" width="160" height="60" rx="18" fill="#f1d29c" opacity="0.9"/>`;
  }
}

async function scene(items: Item[]): Promise<Buffer> {
  const cols = 4;
  const body = items
    .map((item, i) => {
      const x = 200 + (i % cols) * 270 + ((i * 17) % 23);
      const y = 210 + Math.floor(i / cols) * 210 + ((i * 11) % 19);
      return draw(item, x, y);
    })
    .join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="960">
    <rect width="1280" height="960" fill="#e9e2d6"/>
    <rect x="40" y="60" width="1200" height="840" rx="10" fill="#f2a7c3"/>
    <rect x="70" y="90" width="1140" height="780" fill="#f6e8d6"/>
    ${body}
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
}

const tally = (items: Item[]) => {
  const counts: Record<StockGroupId, number> = {
    raised: 0,
    cake: 0,
    specialty: 0,
    filled_bars: 0,
  };
  for (const item of items) counts[groupOf[item]]++;
  return counts;
};

const scenes: { file: string; label: string; items: Item[] }[] = [
  {
    file: "synthetic-full.jpg",
    label: "synthetic full box",
    items: [
      "glazed", "chocolate_raised", "glazed", "glazed",
      "old_fashioned", "peanut_cake", "old_fashioned", "fritter",
      "cinnamon_roll", "filled", "filled", "bar",
    ],
  },
  {
    file: "synthetic-few.jpg",
    label: "synthetic few left",
    items: ["old_fashioned", "peanut_cake", "old_fashioned", "fritter"],
  },
  { file: "synthetic-empty.jpg", label: "synthetic empty box", items: [] },
];

export async function syntheticPhotos() {
  return Promise.all(
    scenes.map(async (s) => ({
      file: s.file,
      label: s.label,
      counts: tally(s.items),
      image: await scene(s.items),
    })),
  );
}
