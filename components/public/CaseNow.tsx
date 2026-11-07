"use client";

import { useEffect, useRef, useState } from "react";
import { groupNames, levelLabel, site } from "@/content/site";
import type { Inventory, Level, StockGroupId } from "@/lib/types";
import { menuCopy } from "./copy";
import { useLiveInventory, useNow } from "./LiveStock";
import { Picture } from "./Picture";
import type { Shape } from "./Illustration";

const groupShapes: Record<StockGroupId, Shape> = {
  raised: "ring",
  cake: "ring",
  specialty: "roll",
  filled_bars: "filled",
};

const levelStyle: Record<Level, string> = {
  plenty: "bg-frosting text-cocoa",
  low: "bg-accent-soft text-accent",
  sold_out: "bg-cocoa text-cream",
};

function ago(updatedAt: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - Date.parse(updatedAt)) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(updatedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Pulses when the available count changes, so a fresh photo is visible on the public site.
function GroupCard({ group }: { group: Inventory["groups"][number] }) {
  const copy = menuCopy[group.groupId];
  const [flash, setFlash] = useState(false);
  const seen = useRef(group.available);
  useEffect(() => {
    if (seen.current === group.available) return;
    seen.current = group.available;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 1500);
    return () => clearTimeout(timer);
  }, [group.available]);
  return (
    <li
      className={`space-y-2 rounded-theme border border-cocoa/15 bg-paper p-3 transition duration-700 motion-reduce:transition-none ${
        flash ? "scale-[1.03] ring-4 ring-frosting" : ""
      }`}
    >
      <Picture
        src={copy?.image}
        alt={copy?.imageAlt ?? groupNames[group.groupId]}
        shape={groupShapes[group.groupId]}
      />
      <h3 className="font-bold leading-tight">{groupNames[group.groupId]}</h3>
      <p
        className={`inline-block rounded-full px-3 py-1 text-sm font-bold transition-colors duration-700 ${levelStyle[group.level]}`}
      >
        {levelLabel(group.level, group.available)}
      </p>
    </li>
  );
}

export function CaseNow() {
  const inventory = useLiveInventory();
  const now = useNow();
  return (
    <section id="case" className="scroll-mt-6 space-y-4">
      <h2 className="font-display text-3xl text-accent sm:text-4xl">{site.caseHeading}</h2>
      <p className="text-sm text-cocoa/80">{site.caseNote}</p>
      {inventory.shopSoldOut && (
        <p className="rounded-theme bg-cocoa p-4 font-display text-xl text-cream">
          {site.soldOutToday}
        </p>
      )}
      <ul className="grid grid-cols-2 gap-3">
        {inventory.groups.map((group) => (
          <GroupCard key={group.groupId} group={group} />
        ))}
      </ul>
      <p className="text-sm text-cocoa/70">
        {now === null ? "Updated" : `Updated ${ago(inventory.updatedAt, now)}`} ·
        by {site.sourceLabels[inventory.source]}
      </p>
    </section>
  );
}
