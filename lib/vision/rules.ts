// Client-safe counting rules shared by the count route and the Case tab.
import type { CountResult, Level, StockGroupId } from "@/lib/types";

export const groupOrder: StockGroupId[] = [
  "raised",
  "cake",
  "specialty",
  "filled_bars",
];

// Visual descriptions from docs/CONTRACTS.md; also used in the vision prompt.
export const groupLooks: Record<StockGroupId, string> = {
  raised:
    "light, puffy ring donuts with a hole; glaze, maple, chocolate, sugar, blueberry",
  cake: 'denser ring donuts; cracked "old fashioned" edges or smooth cake; may have frosting, peanuts, coconut',
  specialty:
    "knobby irregular fritters, spiral cinnamon rolls, croissants",
  filled_bars:
    "round donuts with no hole (filled), rectangular buttermilk bars",
};

export const LOW_CONFIDENCE = 0.8; // rows below this are highlighted
export const DISAGREE_DELTA = 1; // second opinion differs by more than this → flag
export const DISAGREE_CONFIDENCE = 0.5; // confidence a flagged row is lowered to
export const MAX_COUNT = 500;

// Same rule as the public site (CONTRACTS "Levels").
export function levelFor(available: number): Level {
  if (available <= 0) return "sold_out";
  if (available <= 6) return "low";
  return "plenty";
}

export function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(MAX_COUNT, Math.max(0, Math.round(n)));
}

export function disagreesOn(
  result: CountResult,
  groupId: StockGroupId,
): boolean {
  const second = result.secondOpinion?.groups.find((g) => g.groupId === groupId);
  const first = result.groups.find((g) => g.groupId === groupId);
  return !!second && !!first && Math.abs(second.count - first.count) > DISAGREE_DELTA;
}
