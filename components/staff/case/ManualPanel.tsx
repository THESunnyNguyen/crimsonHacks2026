"use client";

import { forwardRef } from "react";
import type { Inventory, StockGroupId } from "@/lib/types";
import { groupOrder } from "@/lib/vision/rules";
import { CountRow } from "./CountRow";
import { caseCopy } from "./copy";
import type { Draft } from "./ReviewPanel";

export type ManualPanelProps = {
  inventory: Inventory;
  draft: Draft;
  dirty: boolean;
  busy: boolean;
  onChange: (groupId: StockGroupId, count: number) => void;
  onPublish: () => void;
  onReset: () => void;
};

export const ManualPanel = forwardRef<HTMLElement, ManualPanelProps>(
  function ManualPanel(
    { inventory, draft, dirty, busy, onChange, onPublish, onReset },
    ref,
  ) {
    return (
      <section
        ref={ref}
        tabIndex={-1}
        aria-labelledby="manual-heading"
        className="space-y-3 outline-none"
      >
        <div>
          <h3 id="manual-heading" className="font-display text-xl">
            {caseCopy.manualHeading}
          </h3>
          <p className="text-sm text-cocoa/70">{caseCopy.manualIntro}</p>
        </div>
        <ul className="space-y-3">
          {groupOrder.map((id) => (
            <CountRow
              key={id}
              groupId={id}
              count={draft[id]}
              held={inventory.groups.find((g) => g.groupId === id)?.held ?? 0}
              onChange={(n) => onChange(id, n)}
              disabled={busy}
            />
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPublish}
            disabled={busy || !dirty}
            className="min-h-14 flex-1 rounded-theme bg-cocoa px-6 text-lg font-bold text-cream disabled:opacity-40"
          >
            {busy
              ? caseCopy.publishing
              : dirty
                ? caseCopy.manualPublish
                : caseCopy.manualUnchanged}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              disabled={busy}
              className="min-h-14 rounded-theme px-4 underline"
            >
              {caseCopy.manualReset}
            </button>
          )}
        </div>
      </section>
    );
  },
);
