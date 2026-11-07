"use client";

import { useEffect, useState } from "react";
import { CaseTab } from "@/components/staff/CaseTab";
import { OrdersTab } from "@/components/staff/OrdersTab";
import { today } from "@/lib/time";

const pinKey = "fresh:staffPin";
type Tab = "case" | "orders";

function readPin(): string | null {
  try {
    return localStorage.getItem(pinKey);
  } catch {
    return null;
  }
}
function savePin(pin: string | null) {
  try {
    if (pin) localStorage.setItem(pinKey, pin);
    else localStorage.removeItem(pinKey);
  } catch {}
}
// No dedicated auth route in the contract: a staff-only GET doubles as the check.
async function checkPin(pin: string | null): Promise<boolean> {
  if (!pin) return false;
  try {
    const res = await fetch(`/api/orders?date=${today()}`, {
      headers: { "x-staff-pin": pin },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function StaffPage() {
  const [pin, setPin] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("case");
  useEffect(() => {
    const stored = readPin();
    checkPin(stored).then((ok) => {
      if (ok) setPin(stored);
      else savePin(null);
      setChecking(false);
    });
  }, []);
  const signOut = () => {
    savePin(null);
    setPin(null);
  };
  if (checking) return <p>Loading…</p>;
  if (!pin)
    return (
      <PinGate
        onSuccess={(p) => {
          savePin(p);
          setPin(p);
        }}
      />
    );
  return (
    <main>
      <nav className="mb-4 flex gap-2" role="tablist">
        {(["case", "orders"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-11 flex-1 rounded-theme px-4 font-bold ${tab === t ? "bg-cocoa text-cream" : "bg-frosting"}`}
          >
            {t === "case" ? "Case" : "Orders"}
          </button>
        ))}
        <button onClick={signOut} className="min-h-11 px-3 text-sm underline">
          Lock
        </button>
      </nav>
      {tab === "case" ? (
        <CaseTab pin={pin} onUnauthorized={signOut} />
      ) : (
        <OrdersTab pin={pin} onUnauthorized={signOut} />
      )}
    </main>
  );
}

function PinGate({ onSuccess }: { onSuccess: (pin: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    if (await checkPin(value)) onSuccess(value);
    else setError("That PIN didn't work. Try again.");
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="mt-16 space-y-4 text-center">
      <h1 className="font-display text-3xl">Staff</h1>
      <label className="block">
        <span className="block">Enter staff PIN</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-40 rounded-theme border-2 border-cocoa bg-cream p-3 text-center text-2xl tracking-widest"
          autoFocus
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button
        disabled={busy || value === ""}
        className="min-h-11 rounded-theme bg-cocoa px-6 font-bold text-cream disabled:opacity-50"
      >
        {busy ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
