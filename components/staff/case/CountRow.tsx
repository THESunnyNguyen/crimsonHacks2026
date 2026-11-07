"use client";

import { groupNames, levelLabel } from "@/content/site";
import type { Level, StockGroupId } from "@/lib/types";
import { MAX_COUNT, clampCount, levelFor } from "@/lib/vision/rules";
import { caseCopy } from "./copy";

const chipStyle: Record<Level, string> = {
  plenty: "bg-cocoa text-cream",
  low: "bg-frosting text-cocoa",
  sold_out: "border-2 border-cocoa text-cocoa",
};

export function LevelChip({ available }: { available: number }) {
  const level = levelFor(available);
  return (
    <span
      className={`inline-block rounded-theme px-3 py-1 text-sm font-bold whitespace-nowrap ${chipStyle[level]}`}
    >
      {levelLabel(level, available)}
    </span>
  );
}

export type CountRowProps = {
  groupId: StockGroupId;
  count: number;
  held: number;
  onChange: (count: number) => void;
  flagged?: boolean;
  children?: React.ReactNode; // confidence / disagreement notes
  disabled?: boolean;
};

export function CountRow({
  groupId,
  count,
  held,
  onChange,
  flagged,
  children,
  disabled,
}: CountRowProps) {
  const name = groupNames[groupId];
  const available = Math.max(0, count - held);
  const step = "h-14 w-14 shrink-0 rounded-theme text-3xl font-bold leading-none disabled:opacity-40";
  return (
    <li
      className={`rounded-theme p-3 ${flagged ? "border-4 border-frosting bg-frosting/20" : "border-2 border-cocoa/15"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{name}</p>
          {held > 0 && (
            <p className="text-sm text-cocoa/70">{caseCopy.held(held)}</p>
          )}
        </div>
        <LevelChip available={available} />
      </div>
      {children}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(clampCount(count - 1))}
          disabled={disabled || count <= 0}
          aria-label={caseCopy.less(name)}
          className={`${step} bg-cocoa/10`}
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_COUNT}
          value={count}
          disabled={disabled}
          aria-label={caseCopy.countLabel(name)}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(clampCount(Number(e.target.value)))}
          className="h-14 w-full min-w-0 rounded-theme border-2 border-cocoa/30 bg-cream text-center font-display text-3xl"
        />
        <button
          type="button"
          onClick={() => onChange(clampCount(count + 1))}
          disabled={disabled || count >= MAX_COUNT}
          aria-label={caseCopy.more(name)}
          className={`${step} bg-cocoa text-cream`}
        >
          +
        </button>
      </div>
    </li>
  );
}
