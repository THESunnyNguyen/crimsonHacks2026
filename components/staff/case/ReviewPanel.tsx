"use client";

import type { CountResult, Inventory, StockGroupId } from "@/lib/types";
import { LOW_CONFIDENCE, disagreesOn, groupOrder } from "@/lib/vision/rules";
import { CountRow } from "./CountRow";
import { caseCopy } from "./copy";

export type Draft = Record<StockGroupId, number>;

export type ReviewPanelProps = {
  preview: string;
  result: CountResult;
  draft: Draft;
  seconds: string;
  inventory: Inventory | null;
  busy: boolean;
  onChange: (groupId: StockGroupId, count: number) => void;
  onPublish: () => void;
  onDiscard: () => void;
};

export function ReviewPanel({
  preview,
  result,
  draft,
  seconds,
  inventory,
  busy,
  onChange,
  onPublish,
  onDiscard,
}: ReviewPanelProps) {
  const total = groupOrder.reduce((sum, id) => sum + draft[id], 0);
  return (
    <section aria-labelledby="review-heading" className="space-y-3">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
        <img
          src={preview}
          alt={caseCopy.photoAlt}
          className="h-20 w-20 shrink-0 rounded-theme object-cover"
        />
        <div>
          <h3 id="review-heading" className="font-display text-xl">
            {caseCopy.reviewHeading}
          </h3>
          <p className="text-sm text-cocoa/70">{caseCopy.countedIn(seconds)}</p>
        </div>
      </div>
      {result.notes && (
        <p className="rounded-theme bg-cocoa/5 p-3 text-sm">{result.notes}</p>
      )}
      <ul className="space-y-3">
        {groupOrder.map((id) => {
          const g = result.groups.find((x) => x.groupId === id);
          const disagree = disagreesOn(result, id);
          const low = !g || g.confidence < LOW_CONFIDENCE;
          const second = result.secondOpinion?.groups.find(
            (x) => x.groupId === id,
          );
          return (
            <CountRow
              key={id}
              groupId={id}
              count={draft[id]}
              held={inventory?.groups.find((x) => x.groupId === id)?.held ?? 0}
              onChange={(n) => onChange(id, n)}
              flagged={low || disagree}
              disabled={busy}
            >
              {(low || disagree) && (
                <p className="mt-1 text-sm font-bold">
                  {disagree ? caseCopy.disagree : caseCopy.lowConfidence}
                  {g && (
                    <span className="font-normal">
                      {" "}
                      · {Math.round(g.confidence * 100)}% sure
                    </span>
                  )}
                </p>
              )}
              {disagree && second && result.secondOpinion && (
                <p className="text-sm">
                  {caseCopy.secondSays(result.secondOpinion.model, second.count)}
                </p>
              )}
            </CountRow>
          );
        })}
      </ul>
      <p className="text-center font-bold">{caseCopy.total(total)}</p>
      {total === 0 && (
        <p className="rounded-theme bg-frosting/30 p-3 text-center font-bold">
          {caseCopy.allZero}
        </p>
      )}
      <button
        type="button"
        onClick={onPublish}
        disabled={busy}
        className="min-h-14 w-full rounded-theme bg-cocoa px-6 text-xl font-bold text-cream disabled:opacity-50"
      >
        {busy ? caseCopy.publishing : caseCopy.publish}
      </button>
      <button
        type="button"
        onClick={onDiscard}
        disabled={busy}
        className="min-h-11 w-full rounded-theme px-4 underline disabled:opacity-50"
      >
        {caseCopy.discard}
      </button>
    </section>
  );
}
