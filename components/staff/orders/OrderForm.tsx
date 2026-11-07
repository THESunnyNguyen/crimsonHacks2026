"use client";

import { useState } from "react";
import type { MenuItem, Order } from "@/lib/types";
import { ApiError, staffFetch } from "./api";
import { copy } from "./content";

export type FormItem = { menuItemId: string; qty: number; option: string };

export type OrderFormValues = {
  customerName: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  items: FormItem[];
  notes: string;
  source: "staff_form" | "notes";
};

export type OrderFormProps = {
  pin: string;
  menu: MenuItem[];
  initial: OrderFormValues;
  onSaved: (order: Order) => void;
  onClose: () => void;
  onUnauthorized: () => void;
};

const field =
  "mt-1 min-h-11 w-full rounded-theme border-2 border-cocoa bg-cream px-3";
const categories = Object.keys(copy.groups) as (keyof typeof copy.groups)[];

export function OrderForm({
  pin,
  menu,
  initial,
  onSaved,
  onClose,
  onUnauthorized,
}: OrderFormProps) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const menuById = new Map(menu.map((m) => [m.id, m]));
  const isDraft = initial.source === "notes";

  function update(patch: Partial<OrderFormValues>) {
    setValues((v) => ({ ...v, ...patch }));
  }
  function setItem(index: number, patch: Partial<FormItem>) {
    update({
      items: values.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });
  }
  function addItem() {
    const first = menu.find((m) => m.stockGroup) ?? menu[0];
    if (!first) return;
    update({
      items: [...values.items, { menuItemId: first.id, qty: 1, option: "" }],
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const name = values.customerName.trim();
    if (!name || !values.pickupDate || !values.pickupTime) {
      setError(copy.fieldError);
      return;
    }
    if (
      values.items.length === 0 ||
      values.items.some((i) => !menuById.has(i.menuItemId) || i.qty < 1 || i.qty > 500)
    ) {
      setError(copy.itemError);
      return;
    }
    const phone = values.phone.trim();
    const notes = values.notes.trim();
    setSaving(true);
    try {
      const order = await staffFetch<Order>(pin, "/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: name,
          ...(phone ? { phone } : {}),
          pickupDate: values.pickupDate,
          pickupTime: values.pickupTime,
          items: values.items.map((i) => ({
            menuItemId: i.menuItemId,
            qty: i.qty,
            ...(i.option ? { option: i.option } : {}),
          })),
          ...(notes ? { notes } : {}),
          source: values.source,
        }),
      });
      onSaved(order);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized();
      setError(copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="space-y-4 rounded-theme border-2 border-cocoa bg-frosting/20 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">
          {isDraft ? copy.draftTitle : copy.formTitle}
        </h3>
        <button type="button" onClick={onClose} className="min-h-11 px-3 underline">
          {copy.close}
        </button>
      </div>
      {isDraft && <p className="text-sm">{copy.review}</p>}

      <label className="block">
        <span className="font-bold">{copy.customerName}</span>
        <input
          value={values.customerName}
          maxLength={100}
          onChange={(e) => update({ customerName: e.target.value })}
          className={field}
        />
      </label>
      <label className="block">
        <span className="font-bold">{copy.phone}</span>
        <input
          type="tel"
          inputMode="tel"
          value={values.phone}
          maxLength={40}
          onChange={(e) => update({ phone: e.target.value })}
          className={field}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="font-bold">{copy.date}</span>
          <input
            type="date"
            value={values.pickupDate}
            onChange={(e) => update({ pickupDate: e.target.value })}
            className={field}
          />
        </label>
        <label className="block">
          <span className="font-bold">{copy.time}</span>
          <input
            type="time"
            value={values.pickupTime}
            onChange={(e) => update({ pickupTime: e.target.value })}
            className={field}
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="font-bold">{copy.items}</legend>
        {values.items.map((item, index) => {
          const selected = menuById.get(item.menuItemId);
          return (
            <div
              key={index}
              className="space-y-2 rounded-theme border-2 border-cocoa/30 bg-cream p-3"
            >
              <select
                aria-label={copy.item}
                value={item.menuItemId}
                onChange={(e) => setItem(index, { menuItemId: e.target.value, option: "" })}
                className={field}
              >
                {categories.map((category) => {
                  const group = menu.filter((m) => m.category === category);
                  if (group.length === 0) return null;
                  return (
                    <optgroup key={category} label={copy.groups[category]}>
                      {group.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {selected?.options && (
                <select
                  aria-label={copy.option}
                  value={item.option}
                  onChange={(e) => setItem(index, { option: e.target.value })}
                  className={field}
                >
                  <option value="">{copy.noOption}</option>
                  {selected.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={copy.decrease}
                  disabled={item.qty <= 1}
                  onClick={() => setItem(index, { qty: item.qty - 1 })}
                  className="min-h-11 min-w-11 rounded-theme border-2 border-cocoa font-bold disabled:opacity-40"
                >
                  −
                </button>
                <output aria-label={copy.quantity} className="min-w-8 text-center font-bold">
                  {item.qty}
                </output>
                <button
                  type="button"
                  aria-label={copy.increase}
                  disabled={item.qty >= 500}
                  onClick={() => setItem(index, { qty: item.qty + 1 })}
                  className="min-h-11 min-w-11 rounded-theme border-2 border-cocoa font-bold disabled:opacity-40"
                >
                  +
                </button>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => update({ items: values.items.filter((_, i) => i !== index) })}
                  className="min-h-11 px-3 underline"
                >
                  {copy.remove}
                </button>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addItem}
          disabled={menu.length === 0}
          className="min-h-11 w-full rounded-theme border-2 border-dashed border-cocoa font-bold"
        >
          {copy.addItem}
        </button>
      </fieldset>

      <label className="block">
        <span className="font-bold">{copy.notes}</span>
        <textarea
          rows={3}
          maxLength={2000}
          value={values.notes}
          onChange={(e) => update({ notes: e.target.value })}
          className={field}
        />
      </label>

      {error && (
        <p role="alert" className="font-bold">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="min-h-11 w-full rounded-theme bg-cocoa px-4 font-bold text-cream disabled:opacity-50"
      >
        {saving ? copy.saving : copy.save}
      </button>
    </form>
  );
}
