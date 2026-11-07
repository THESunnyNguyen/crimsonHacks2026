"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { preorderCopy as copy } from "@/content/preorder";
import { PreorderReceipt, type Receipt } from "./PreorderReceipt";

export function CheckoutResult({
  sessionId,
  cancelled,
}: {
  sessionId: string;
  cancelled: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ message: string; order?: Receipt }>({
    message: copy.checking,
  });
  useEffect(() => {
    if (cancelled) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let polls = 0;
    async function check() {
      try {
        const response = await fetch(
          `/api/checkout?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const value = await response.json();
        if (!response.ok) throw new Error(value.error ?? copy.waiting);
        if (value.state === "confirmed") {
          setResult({ message: copy.confirmed, order: value.order });
          return;
        }
        if (value.state === "expired") {
          setResult({ message: copy.expired });
          return;
        }
        if (value.state === "unpaid") {
          setResult({ message: copy.unpaid });
          return;
        }
        if (++polls >= 12) {
          setResult({ message: copy.waiting });
          return;
        }
        setResult({ message: copy.confirming });
        timer = setTimeout(check, 2500);
      } catch (e) {
        if (!controller.signal.aborted)
          setResult({ message: e instanceof Error ? e.message : copy.waiting });
      }
    }
    void check();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [attempt, sessionId, cancelled]);

  return (
    <div className="space-y-5">
      {result.order && !cancelled ? (
        <PreorderReceipt order={result.order} />
      ) : (
        <div className="space-y-3 rounded-theme border-2 border-cocoa bg-paper p-6">
          <h1 className="font-display text-2xl">
            {cancelled ? copy.cancelled : copy.checking}
          </h1>
          <p role="status">
            {cancelled ? copy.cancelledDetail : result.message}
          </p>
          {!cancelled && (
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="min-h-11 rounded-theme border-2 border-cocoa px-4 font-bold"
            >
              {copy.retry}
            </button>
          )}
        </div>
      )}
      <Link
        href="/#preorder"
        className="inline-flex min-h-11 items-center font-bold underline"
      >
        {copy.back}
      </Link>
    </div>
  );
}
