"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Inventory } from "@/lib/types";

const LiveContext = createContext<Inventory | null>(null);

// Polls GET /api/inventory every 5s and shares the result with the live sections.
export function LiveStock({
  initial,
  children,
}: {
  initial: Inventory;
  children: ReactNode;
}) {
  const [inventory, setInventory] = useState(initial);
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/inventory", { cache: "no-store" });
        if (res.ok) setInventory((await res.json()) as Inventory);
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return <LiveContext value={inventory}>{children}</LiveContext>;
}

export function useLiveInventory(): Inventory {
  const inventory = useContext(LiveContext);
  if (!inventory) throw new Error("useLiveInventory needs <LiveStock>");
  return inventory;
}

// Clock in ms, ticking every 10s. Null on the server and during hydration, so markup matches.
const subscribeClock = (onTick: () => void) => {
  const timer = setInterval(onTick, 10000);
  return () => clearInterval(timer);
};
const clockTick = () => Math.floor(Date.now() / 10000);
export function useNow(): number | null {
  const tick = useSyncExternalStore(subscribeClock, clockTick, () => null);
  return tick === null ? null : tick * 10000;
}
