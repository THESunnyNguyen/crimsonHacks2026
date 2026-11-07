"use client";

import { useRef, useState, type FormEvent } from "react";
import type { MenuItem } from "@/lib/types";
import { today } from "@/lib/time";
import { money, pickupTimes, tomorrow } from "@/lib/pickup";
import { preorderCopy as copy } from "@/content/preorder";
import { useLiveInventory, useNow } from "./LiveStock";
import { PreorderReceipt, type Receipt } from "./PreorderReceipt";

const inputClass =
  "min-h-11 w-full rounded-theme border border-cocoa/30 bg-paper px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa";

export function PreorderForm({
  menu,
  stripeEnabled,
  initialNow,
}: {
  menu: MenuItem[];
  stripeEnabled: boolean;
  initialNow: string;
}) {
  const inventory = useLiveInventory();
  const clock = useNow();
  const now = new Date(clock ?? initialNow);
  const current = today(now);
  const next = tomorrow(now);
  const dates = [current, next].filter(
    (d) =>
      (d !== current || !inventory.shopSoldOut) &&
      pickupTimes(d, now).length > 0,
  );
  const [day, setDay] = useState("");
  const date = dates.includes(day) ? day : (dates[0] ?? "");
  const times = date ? pickupTimes(date, now) : [];
  const [time, setTime] = useState("");
  const pickupTime = times.includes(time) ? time : (times[0] ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [options, setOptions] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState("pay_at_pickup");
  const stripeSelected =
    payment === "stripe_sandbox" && stripeEnabled && date === next;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const attempt = useRef<{ body: string; key: string } | null>(null);
  const submitting = useRef(false);
  const donuts = menu.filter((m) => m.price !== null && m.stockGroup);
  const count = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const subtotal = donuts.reduce(
    (sum, m) => sum + Math.round(m.price! * 100) * (quantities[m.id] ?? 0),
    0,
  );
  const dozenTotal = ["raised-glazed", "cake-old-fashioned"].reduce(
    (sum, id) =>
      sum + Math.round((menu.find((m) => m.id === id)?.price ?? 0) * 100) * 6,
    0,
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (count < 1 || count > 36) {
      setError(copy.empty);
      return;
    }
    const fields = new FormData(event.currentTarget);
    const body = JSON.stringify({
      customerName: fields.get("customerName"),
      phone: fields.get("phone"),
      pickupDate: date,
      pickupTime,
      items: donuts
        .filter((m) => quantities[m.id] > 0)
        .map((m) => ({
          menuItemId: m.id,
          qty: quantities[m.id],
          ...(options[m.id] ? { option: options[m.id] } : {}),
        })),
      notes: fields.get("notes") || undefined,
    });
    const identity = `${stripeSelected}:${body}`;
    if (attempt.current?.body !== identity)
      attempt.current = { body: identity, key: crypto.randomUUID() };
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        stripeSelected ? "/api/checkout" : "/api/preorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": attempt.current.key,
          },
          body,
        },
      );
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 409) attempt.current = null;
        throw new Error(result.error ?? copy.error);
      }
      if (stripeSelected) window.location.assign(result.url);
      else setReceipt(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.error);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-theme border-2 border-cocoa bg-paper p-5 sm:p-7">
      <div className="space-y-2">
        <h2 id="preorder-heading" className="font-display text-3xl">
          {copy.title}
        </h2>
        <p>{copy.intro}</p>
        <p className="rounded-theme bg-frosting px-3 py-2 text-sm">
          {copy.demo}
        </p>
      </div>
      {receipt ? (
        <>
          <PreorderReceipt order={receipt} />
          <button
            type="button"
            className="min-h-11 font-bold underline"
            onClick={() => {
              setReceipt(null);
              setQuantities({});
              attempt.current = null;
            }}
          >
            {copy.another}
          </button>
        </>
      ) : !date ? (
        <p role="status">{copy.unavailable}</p>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
            <legend className="sr-only">{copy.choose}</legend>
            {inventory.shopSoldOut && (
              <p role="status" className="font-bold">
                {copy.soldOut}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setQuantities({ "raised-glazed": 6, "cake-old-fashioned": 6 });
                setOptions({});
              }}
              className="min-h-11 w-full rounded-theme border-2 border-cocoa bg-frosting px-4 py-3 text-left"
            >
              <span className="block font-bold">
                {copy.dozen} · {money(dozenTotal)}
              </span>
              <span className="text-sm">{copy.dozenDetail}</span>
            </button>
            <details className="rounded-theme border border-cocoa/20 p-3">
              <summary className="min-h-11 cursor-pointer py-2 font-bold">
                {copy.choose}
              </summary>
              <div className="divide-y divide-cocoa/15">
                {donuts.map((item) => (
                  <div key={item.id} className="space-y-2 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor={`qty-${item.id}`}>
                        <span className="block font-bold">{item.name}</span>
                        <span className="text-sm">
                          {money(Math.round(item.price! * 100))} {copy.each}
                        </span>
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        aria-label={`${item.name} quantity`}
                        type="number"
                        min="0"
                        max="36"
                        step="1"
                        inputMode="numeric"
                        value={quantities[item.id] || ""}
                        placeholder="0"
                        onChange={(e) =>
                          setQuantities((q) => ({
                            ...q,
                            [item.id]: Math.max(
                              0,
                              Math.min(36, Number(e.target.value) || 0),
                            ),
                          }))
                        }
                        className={`${inputClass} max-w-20`}
                      />
                    </div>
                    {(quantities[item.id] ?? 0) > 0 && item.options && (
                      <label className="block text-sm">
                        {item.name} {copy.option.toLowerCase()}
                        <select
                          value={options[item.id] ?? ""}
                          onChange={(e) =>
                            setOptions((o) => ({
                              ...o,
                              [item.id]: e.target.value,
                            }))
                          }
                          className={`${inputClass} mt-1`}
                        >
                          <option value="">{copy.standard}</option>
                          {item.options.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </details>
            {count > 0 && (
              <ul aria-label={copy.yourDonuts} className="space-y-1 text-sm">
                {donuts
                  .filter((m) => quantities[m.id] > 0)
                  .map((m) => (
                    <li key={m.id}>
                      {quantities[m.id]} × {m.name}
                      {options[m.id] ? ` (${options[m.id]})` : ""}
                    </li>
                  ))}
              </ul>
            )}
            <p className="text-sm">
              {copy.limit}
              <br />
              {copy.flavors}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="font-bold">{copy.date}</span>
                <select
                  value={date}
                  onChange={(e) => setDay(e.target.value)}
                  className={inputClass}
                >
                  {dates.map((d) => (
                    <option value={d} key={d}>
                      {d === current ? copy.today : copy.tomorrow} · {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-bold">{copy.time}</span>
                <select
                  value={pickupTime}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputClass}
                >
                  {times.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-bold">{copy.name}</span>
                <input
                  required
                  name="customerName"
                  autoComplete="name"
                  maxLength={100}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold">{copy.phone}</span>
                <input
                  required
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  minLength={7}
                  maxLength={40}
                  className={inputClass}
                />
              </label>
            </div>
            <p className="text-sm">{copy.timing}</p>
            <label className="block space-y-1">
              <span className="font-bold">{copy.notes}</span>
              <textarea
                name="notes"
                rows={2}
                maxLength={2000}
                className={inputClass}
              />
            </label>
            <fieldset className="space-y-2">
              <legend className="mb-2 font-bold">{copy.payment}</legend>
              <label className="flex min-h-11 items-center gap-3 rounded-theme border border-cocoa/20 p-3">
                <input
                  type="radio"
                  name="payment"
                  checked={!stripeSelected}
                  onChange={() => setPayment("pay_at_pickup")}
                />
                {copy.pickup}
              </label>
              <label
                className={`flex min-h-11 items-center gap-3 rounded-theme border border-cocoa/20 p-3 ${!stripeEnabled || date !== next ? "opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  disabled={!stripeEnabled || date !== next}
                  checked={stripeSelected}
                  onChange={() => setPayment("stripe_sandbox")}
                />
                {copy.sandbox}
              </label>
              <p className="text-sm">
                {stripeEnabled ? copy.sandboxHelp : copy.sandboxUnavailable}
              </p>
            </fieldset>
            <div className="flex items-center justify-between gap-3 border-t border-cocoa/20 pt-4 font-bold">
              <span>
                {copy.subtotal} · {count} {copy.donuts}
              </span>
              <span>{money(subtotal)}</span>
            </div>
            <p className="text-sm">{copy.tax}</p>
            <button
              disabled={busy || count < 1 || count > 36}
              className="min-h-12 w-full rounded-theme bg-cocoa px-4 py-3 font-bold text-cream disabled:opacity-50"
            >
              {busy
                ? stripeSelected
                  ? copy.redirecting
                  : copy.saving
                : stripeSelected
                  ? copy.checkout
                  : copy.hold}
            </button>
          </fieldset>
          {error && (
            <p
              role="alert"
              className="rounded-theme border border-accent bg-accent-soft p-3"
            >
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
