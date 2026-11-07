import { z } from "zod";
import type { CountResult, StockGroupId } from "@/lib/types";
import { groupId as groupIdSchema } from "@/lib/validation";
import {
  DISAGREE_CONFIDENCE,
  DISAGREE_DELTA,
  clampCount,
  groupOrder,
} from "./rules";

// Strict structured-output schema: every key required, optional values are
// nullable. One fixed key per stock group, so the model can't skip, repeat or
// invent a group.
const groupCount = z.object({
  count: z.number().int(),
  confidence: z.number(),
  note: z.string().nullable(),
});
export const aiCountSchema = z.object({
  scene: z.string(),
  raised: groupCount,
  cake: groupCount,
  specialty: groupCount,
  filled_bars: groupCount,
  notes: z.string().nullable(),
});
export type AiCount = z.infer<typeof aiCountSchema>;

const groupNames: Record<StockGroupId, string> = {
  raised: "Raised",
  cake: "Cake",
  specialty: "Specialty",
  filled_bars: "Filled & bars",
};

const clean = (s: string | null | undefined, max: number) =>
  (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Model output → contract CountResult. Clamps counts and confidences and folds
// per-group notes into the single `notes` string.
export function toCountResult(ai: AiCount): CountResult {
  const groups = groupOrder.map((groupId) => {
    const g = ai[groupId];
    const confidence = Number.isFinite(g.confidence)
      ? Math.min(1, Math.max(0, g.confidence))
      : 0;
    return { groupId, count: clampCount(g.count), confidence };
  });
  const notes = [
    clean(ai.notes, 200),
    ...groupOrder
      .filter((id) => clean(ai[id].note, 1))
      .map((id) => `${groupNames[id]}: ${clean(ai[id].note, 120)}`),
  ].filter(Boolean);
  return {
    groups,
    total: groups.reduce((sum, g) => sum + g.count, 0),
    notes: notes.join(" · ").slice(0, 600),
  };
}

// Attach a second model's counts; any group off by more than DISAGREE_DELTA
// gets its confidence lowered so the UI highlights it.
export function withSecondOpinion(
  primary: CountResult,
  model: string,
  second: CountResult,
): CountResult {
  const groups = second.groups.map(({ groupId, count }) => ({ groupId, count }));
  let agrees = true;
  const merged = primary.groups.map((g) => {
    const other = groups.find((s) => s.groupId === g.groupId);
    if (other && Math.abs(other.count - g.count) > DISAGREE_DELTA) {
      agrees = false;
      return { ...g, confidence: Math.min(g.confidence, DISAGREE_CONFIDENCE) };
    }
    return g;
  });
  return {
    ...primary,
    groups: merged,
    secondOpinion: { model, groups, agrees },
  };
}

// Contract shape of the route response (tests and the eval check against it).
export const countResultSchema = z
  .object({
    groups: z
      .array(
        z.object({
          groupId: groupIdSchema,
          count: z.number().int().min(0),
          confidence: z.number().min(0).max(1),
        }),
      )
      .length(4),
    total: z.number().int().min(0),
    notes: z.string(),
    secondOpinion: z
      .object({
        model: z.string(),
        groups: z.array(
          z.object({
            groupId: groupIdSchema,
            count: z.number().int().min(0),
          }),
        ),
        agrees: z.boolean(),
      })
      .optional(),
  })
  .strict();
