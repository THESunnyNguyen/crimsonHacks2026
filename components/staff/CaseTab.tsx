"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { groupNames, levelLabel } from "@/content/site";
import type { CountResult, Inventory, StockGroupId } from "@/lib/types";
import { groupOrder } from "@/lib/vision/rules";
import {
  Unauthorized,
  countPhoto,
  fetchInventory,
  publishCounts,
  setSoldOut,
} from "./case/api";
import { ago, caseCopy, sourceNames } from "./case/copy";
import { ManualPanel } from "./case/ManualPanel";
import { ReviewPanel, type Draft } from "./case/ReviewPanel";
import { shrinkPhoto } from "./case/shrinkPhoto";

export type CaseTabProps = {
  pin: string;
  onUnauthorized: () => void;
};

type Phase =
  | { kind: "idle" }
  | { kind: "counting"; preview: string }
  | {
      kind: "review";
      preview: string;
      result: CountResult;
      draft: Draft;
      seconds: string;
    }
  | { kind: "error"; message: string };

const CLIENT_TIMEOUT_MS = 30000;
const POLL_MS = 5000;

const countsOf = (inv: Inventory): Draft =>
  Object.fromEntries(
    groupOrder.map((id) => [
      id,
      inv.groups.find((g) => g.groupId === id)?.count ?? 0,
    ]),
  ) as Draft;

export function CaseTab({ pin, onUnauthorized }: CaseTabProps) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [manual, setManual] = useState<{ draft: Draft; dirty: boolean } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [, setTick] = useState(0); // re-render "updated N min ago"
  const fileInput = useRef<HTMLInputElement>(null);
  const manualRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<string | null>(null);

  const fail = useCallback(
    (e: unknown): string | null => {
      if (e instanceof Unauthorized) {
        onUnauthorized();
        return null;
      }
      return e instanceof Error ? e.message : caseCopy.publishFailed;
    },
    [onUnauthorized],
  );

  const applyInventory = useCallback((inv: Inventory, resetManual = false) => {
    setInventory(inv);
    setLoadError(false);
    setManual((m) =>
      resetManual || !m?.dirty ? { draft: countsOf(inv), dirty: false } : m,
    );
  }, []);

  // Live stock: load now, then poll every 5s (contract). Manual edits in
  // progress are never overwritten by a poll.
  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        const inv = await fetchInventory();
        if (!stopped) applyInventory(inv);
      } catch {
        if (!stopped) setLoadError(true);
      }
      if (!stopped) setTick((t) => t + 1);
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [applyInventory]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const setPreview = (url: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
  };
  useEffect(
    () => () => {
      abortRef.current?.abort();
      setPreview(null);
    },
    [],
  );

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort("timeout"), CLIENT_TIMEOUT_MS);
    const preview = URL.createObjectURL(file);
    setPreview(preview);
    setPhase({ kind: "counting", preview });
    const started = performance.now();
    try {
      const result = await countPhoto(pin, await shrinkPhoto(file), controller.signal);
      const draft = Object.fromEntries(
        groupOrder.map((id) => [
          id,
          result.groups.find((g) => g.groupId === id)?.count ?? 0,
        ]),
      ) as Draft;
      setPhase({
        kind: "review",
        preview,
        result,
        draft,
        seconds: ((performance.now() - started) / 1000).toFixed(1),
      });
    } catch (e) {
      if (controller.signal.aborted && controller.signal.reason !== "timeout")
        return; // cancelled or replaced by a newer photo
      const message =
        controller.signal.reason === "timeout"
          ? caseCopy.timeout
          : typeof navigator !== "undefined" && !navigator.onLine
            ? caseCopy.offline
            : fail(e);
      if (message === null) return;
      setPreview(null);
      setPhase({ kind: "error", message });
      manualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      clearTimeout(timer);
      if (abortRef.current === controller) abortRef.current = null;
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setPreview(null);
    setPhase({ kind: "idle" });
  }

  async function publishPhoto() {
    if (phase.kind !== "review") return;
    setBusy(true);
    try {
      applyInventory(await publishCounts(pin, phase.draft, "photo"), true);
      setPreview(null);
      setPhase({ kind: "idle" });
      setToast(caseCopy.published);
    } catch (e) {
      const message = fail(e);
      if (message !== null) setToast(`${caseCopy.publishFailed} (${message})`);
    } finally {
      setBusy(false);
    }
  }

  async function publishManual() {
    if (!manual) return;
    setBusy(true);
    try {
      applyInventory(await publishCounts(pin, manual.draft, "manual"), true);
      if (phase.kind === "error") setPhase({ kind: "idle" });
      setToast(caseCopy.published);
    } catch (e) {
      const message = fail(e);
      if (message !== null) setToast(`${caseCopy.publishFailed} (${message})`);
    } finally {
      setBusy(false);
    }
  }

  async function toggleSoldOut() {
    if (!inventory) return;
    const on = !inventory.soldOutToggle;
    setBusy(true);
    try {
      const inv = await setSoldOut(pin, on);
      setInventory(inv);
      setToast(on ? caseCopy.soldOutToastOn : caseCopy.soldOutToastOff);
    } catch (e) {
      const message = fail(e);
      if (message !== null) setToast(`${caseCopy.publishFailed} (${message})`);
    } finally {
      setBusy(false);
    }
  }

  const counting = phase.kind === "counting";
  return (
    <section className="space-y-6 pb-24">
      <div>
        <h2 className="font-display text-2xl">{caseCopy.heading}</h2>
        <p className="text-sm text-cocoa/70">{caseCopy.intro}</p>
      </div>

      <LiveSummary inventory={inventory} loadError={loadError} />

      {phase.kind !== "review" && (
        <div className="space-y-3">
          <label
            className={`flex min-h-20 w-full cursor-pointer items-center justify-center rounded-theme bg-cocoa px-6 text-2xl font-bold text-cream focus-within:ring-4 focus-within:ring-frosting ${counting ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={counting}
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
            {phase.kind === "error" ? caseCopy.snapAgain : caseCopy.snap}
          </label>
          {counting && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-theme bg-cocoa/5 p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img
                src={phase.preview}
                alt={caseCopy.photoAlt}
                className="h-16 w-16 shrink-0 rounded-theme object-cover"
              />
              <span
                aria-hidden
                className="h-6 w-6 shrink-0 animate-spin rounded-full border-4 border-cocoa/20 border-t-cocoa"
              />
              <span className="flex-1 font-bold">{caseCopy.counting}</span>
              <button
                type="button"
                onClick={cancel}
                className="min-h-11 rounded-theme px-3 underline"
              >
                {caseCopy.cancel}
              </button>
            </div>
          )}
          {phase.kind === "error" && (
            <div role="alert" className="rounded-theme border-4 border-frosting p-3">
              <p className="font-bold">{caseCopy.countFailed}</p>
              <p>{phase.message}</p>
              <p className="mt-1 text-sm">{caseCopy.useManual}</p>
            </div>
          )}
        </div>
      )}

      {phase.kind === "review" && (
        <ReviewPanel
          preview={phase.preview}
          result={phase.result}
          draft={phase.draft}
          seconds={phase.seconds}
          inventory={inventory}
          busy={busy}
          onChange={(id: StockGroupId, n: number) =>
            setPhase((p) =>
              p.kind === "review" ? { ...p, draft: { ...p.draft, [id]: n } } : p,
            )
          }
          onPublish={publishPhoto}
          onDiscard={cancel}
        />
      )}

      {inventory && manual && (
        <>
          <hr className="border-cocoa/15" />
          <ManualPanel
            ref={manualRef}
            inventory={inventory}
            draft={manual.draft}
            dirty={manual.dirty}
            busy={busy}
            onChange={(id, n) =>
              setManual((m) =>
                m && { draft: { ...m.draft, [id]: n }, dirty: true },
              )
            }
            onPublish={publishManual}
            onReset={() => applyInventory(inventory, true)}
          />
          <SoldOutToggle
            on={inventory.soldOutToggle}
            busy={busy}
            onToggle={toggleSoldOut}
          />
        </>
      )}

      <div aria-live="polite" className="fixed inset-x-0 bottom-4 flex justify-center px-4">
        {toast && (
          <p className="max-w-md rounded-theme bg-cocoa px-5 py-3 text-center font-bold text-cream shadow-lg">
            {toast}
          </p>
        )}
      </div>
    </section>
  );
}

function LiveSummary({
  inventory,
  loadError,
}: {
  inventory: Inventory | null;
  loadError: boolean;
}) {
  if (!inventory)
    return (
      <p className="text-sm">{loadError ? caseCopy.loadFailed : caseCopy.loading}</p>
    );
  return (
    <div className="rounded-theme bg-cocoa/5 p-3 text-sm">
      <p className="font-bold">
        {caseCopy.live}
        {inventory.shopSoldOut && ` · ${caseCopy.soldOutHeading}`}
      </p>
      <ul className="mt-1 grid grid-cols-2 gap-x-3">
        {inventory.groups.map((g) => (
          <li key={g.groupId}>
            {groupNames[g.groupId]}: {levelLabel(g.level, g.available)}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-cocoa/70">
        {caseCopy.updated(ago(inventory.updatedAt), sourceNames[inventory.source])}
        {loadError && ` · ${caseCopy.loadFailed}`}
      </p>
    </div>
  );
}

function SoldOutToggle({
  on,
  busy,
  onToggle,
}: {
  on: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-theme border-2 border-cocoa/15 p-3">
      <div>
        <p id="soldout-label" className="font-bold">
          {caseCopy.soldOutHeading}
        </p>
        <p className="text-sm text-cocoa/70">
          {on ? caseCopy.soldOutOn : caseCopy.soldOutOff}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="soldout-label"
        disabled={busy}
        onClick={onToggle}
        className={`relative h-11 w-20 shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? "bg-cocoa" : "bg-cocoa/20"}`}
      >
        <span
          className={`absolute top-1 h-9 w-9 rounded-full bg-cream shadow transition-all ${on ? "left-10" : "left-1"}`}
        />
      </button>
    </div>
  );
}
