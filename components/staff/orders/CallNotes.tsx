"use client";

import { useEffect, useRef, useState } from "react";
import type { Order } from "@/lib/types";
import { ApiError, staffFetch } from "./api";
import { copy } from "./content";
import {
  RecordingLimitError,
  recordingWav,
  startRecording,
} from "./recording";

// An unsaved draft from /api/orders/parse, ready to review in the order form.
export type OrderDraft = Omit<Order, "id" | "status" | "createdAt">;

type Phase = "idle" | "preparing" | "recording" | "transcribing";

const phaseLabel: Record<Phase, string> = {
  idle: copy.hold,
  preparing: copy.preparing,
  recording: copy.recording,
  transcribing: copy.transcribing,
};

export type CallNotesProps = {
  pin: string;
  onDraft: (draft: OrderDraft) => void;
  onClose: () => void;
  onUnauthorized: () => void;
};

export function CallNotes({
  pin,
  onDraft,
  onClose,
  onUnauthorized,
}: CallNotesProps) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");
  // Refs rather than state: pointer and timer callbacks must see the live hold.
  const holding = useRef(false);
  const session = useRef<{ stop: () => Promise<Blob> } | null>(null);

  // Leaving the panel mid-hold must release the microphone.
  useEffect(() => {
    return () => {
      holding.current = false;
      void session.current?.stop();
    };
  }, []);

  async function startHold() {
    if (holding.current) return;
    holding.current = true;
    setError("");
    setPhase("preparing");
    try {
      const recording = await startRecording(() => {
        setError(copy.audioLimit);
        void finishHold();
      });
      if (!holding.current) {
        // Released while the microphone was opening: discard the take.
        await recording.stop();
        setPhase("idle");
        return;
      }
      session.current = recording;
      setPhase("recording");
    } catch {
      holding.current = false;
      setPhase("idle");
      setError(copy.micError);
    }
  }

  async function finishHold() {
    if (!holding.current) return;
    holding.current = false;
    const recording = session.current;
    session.current = null;
    if (!recording) {
      setPhase("idle");
      return;
    }
    setPhase("transcribing");
    try {
      const wav = await recordingWav(await recording.stop());
      const form = new FormData();
      form.append("audio", new File([wav], "call.wav", { type: "audio/wav" }));
      const { text: spoken } = await staffFetch<{ text: string }>(
        pin,
        "/api/transcribe",
        { method: "POST", body: form },
      );
      setText((current) =>
        [current.trim(), spoken.trim()].filter(Boolean).join(" "),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return onUnauthorized();
      const tooLong =
        e instanceof RecordingLimitError ||
        (e instanceof ApiError && e.status === 413);
      setError(tooLong ? copy.tooLong : copy.audioError);
    } finally {
      setPhase("idle");
    }
  }

  async function draft() {
    setDrafting(true);
    setError("");
    try {
      const result = await staffFetch<OrderDraft>(pin, "/api/orders/parse", {
        method: "POST",
        body: JSON.stringify({ text: text.trim() }),
      });
      onDraft(result);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return onUnauthorized();
      setError(copy.draftError);
    } finally {
      setDrafting(false);
    }
  }

  const busy = drafting || phase === "transcribing";

  return (
    <section className="space-y-3 rounded-theme border-2 border-cocoa p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">{copy.fromNotes}</h3>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 px-3 underline"
        >
          {copy.close}
        </button>
      </div>

      <label className="block">
        <span className="font-bold">{copy.callNotes}</span>
        <textarea
          rows={4}
          maxLength={1500}
          value={text}
          placeholder={copy.placeholder}
          aria-describedby="call-notes-help"
          onChange={(e) => setText(e.target.value)}
          className="mt-1 w-full rounded-theme border-2 border-cocoa bg-cream p-3"
        />
      </label>
      <p id="call-notes-help" className="text-sm">
        {copy.notesHelp}
      </p>

      <button
        type="button"
        disabled={busy}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          void startHold();
        }}
        onPointerUp={() => void finishHold()}
        onPointerCancel={() => void finishHold()}
        onContextMenu={(e) => e.preventDefault()}
        className={`min-h-11 w-full touch-none rounded-theme border-2 border-cocoa px-4 font-bold select-none disabled:opacity-50 ${phase === "recording" ? "bg-frosting" : "bg-cream"}`}
      >
        🎙 {phaseLabel[phase]}
      </button>

      <button
        type="button"
        disabled={busy || phase !== "idle" || !text.trim()}
        onClick={draft}
        className="min-h-11 w-full rounded-theme bg-cocoa px-4 font-bold text-cream disabled:opacity-50"
      >
        {drafting ? copy.drafting : copy.draft}
      </button>

      {error && (
        <p role="alert" className="font-bold">
          {error}
        </p>
      )}
    </section>
  );
}
