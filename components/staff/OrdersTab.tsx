"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuItem, Order } from "@/lib/types";
import { denverContext } from "@/lib/parse/dates";
import { ApiError, staffFetch } from "./orders/api";
import { makeChime } from "./orders/chime";
import { CallNotes, type OrderDraft } from "./orders/CallNotes";
import { copy } from "./orders/content";
import { OrderCard } from "./orders/OrderCard";
import { OrderForm, type OrderFormValues } from "./orders/OrderForm";

export type OrdersTabProps = {
  pin: string;
  onUnauthorized: () => void;
};

type Day = "today" | "tomorrow";
type Panel =
  | { kind: "notes" }
  | { kind: "form"; key: number; initial: OrderFormValues }
  | null;

const pollMs = 5000;

function blankForm(pickupDate: string): OrderFormValues {
  return {
    customerName: "",
    phone: "",
    pickupDate,
    pickupTime: "",
    items: [],
    notes: "",
    source: "staff_form",
  };
}

function fromDraft(draft: OrderDraft): OrderFormValues {
  return {
    customerName: draft.customerName,
    phone: draft.phone ?? "",
    pickupDate: draft.pickupDate,
    pickupTime: draft.pickupTime,
    items: draft.items.map((i) => ({
      menuItemId: i.menuItemId,
      qty: i.qty,
      option: i.option ?? "",
    })),
    notes: draft.notes ?? "",
    source: "notes",
  };
}

export function OrdersTab({ pin, onUnauthorized }: OrdersTabProps) {
  const [day, setDay] = useState<Day>("today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [sound, setSound] = useState<"off" | "on" | "unavailable">("off");
  const chime = useRef<(() => void) | null>(null);
  // Ids already on screen for one pickup date, so only true arrivals alert.
  const known = useRef<{ date: string; ids: Set<string> } | null>(null);
  const formSeq = useRef(0);
  const unauthorized = useRef(onUnauthorized);
  useEffect(() => {
    unauthorized.current = onUnauthorized;
  }, [onUnauthorized]);

  const { date, tomorrow } = denverContext();
  const pickupDate = day === "today" ? date : tomorrow;
  const menuById = useMemo(
    () => new Map(menu.map((m) => [m.id, m])),
    [menu],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/menu", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items: MenuItem[]) => {
        if (!cancelled) setMenu(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const next = await staffFetch<Order[]>(
          pin,
          `/api/orders?date=${pickupDate}`,
        );
        if (cancelled) return;
        const previous = known.current;
        const ids = new Set(next.map((o) => o.id));
        if (previous && previous.date === pickupDate) {
          const arrived = next
            .filter((o) => o.status === "new" && !previous.ids.has(o.id))
            .map((o) => o.id);
          if (arrived.length > 0) {
            setHighlight((h) => new Set([...h, ...arrived]));
            setAnnouncement(copy.newArrival);
            chime.current?.();
          }
        }
        known.current = { date: pickupDate, ids };
        setOrders(next);
        setLoaded(true);
        setLoadFailed(false);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          unauthorized.current();
          return;
        }
        setLoaded(true);
        setLoadFailed(true);
      }
      if (!cancelled) timer = setTimeout(poll, pollMs);
    }

    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pin, pickupDate, refresh]);

  async function setStatus(order: Order, status: Order["status"]) {
    setBusyId(order.id);
    setNotice("");
    try {
      const updated = await staffFetch<Order>(pin, `/api/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      setHighlight((h) => {
        const next = new Set(h);
        next.delete(order.id);
        return next;
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        unauthorized.current();
        return;
      }
      setNotice(copy.statusError);
    } finally {
      setBusyId(null);
    }
  }

  function toggleSound() {
    if (sound === "on") {
      chime.current = null;
      setSound("off");
      return;
    }
    // Created inside the tap so iOS allows audio to start.
    const play = makeChime();
    if (!play) {
      setSound("unavailable");
      return;
    }
    chime.current = play;
    setSound("on");
    play();
  }

  function openForm(initial: OrderFormValues) {
    formSeq.current += 1;
    setPanel({ kind: "form", key: formSeq.current, initial });
  }

  function saved(order: Order) {
    setPanel(null);
    // Staff's own save is not an arrival: keep it out of the alert set.
    if (known.current) known.current.ids.add(order.id);
    if (order.pickupDate === date) setDay("today");
    else if (order.pickupDate === tomorrow) setDay("tomorrow");
    setRefresh((r) => r + 1);
  }

  return (
    <section aria-labelledby="orders-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="orders-heading" className="font-display text-2xl">
          {copy.title}
        </h2>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={sound === "on"}
          className="min-h-11 px-2 text-sm underline"
        >
          {sound === "on" ? copy.chimeOn : copy.chimeOff}
        </button>
      </div>
      {sound === "unavailable" && (
        <p className="text-sm">{copy.chimeUnavailable}</p>
      )}
      <p className="text-sm font-bold">{copy.hint}</p>
      <p className="text-xs">{copy.polling}</p>

      <div role="group" aria-label={copy.date} className="flex gap-2">
        {(["today", "tomorrow"] as const).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={day === d}
            onClick={() => setDay(d)}
            className={`min-h-11 flex-1 rounded-theme px-4 font-bold ${day === d ? "bg-cocoa text-cream" : "bg-frosting"}`}
          >
            {d === "today" ? copy.today : copy.tomorrow}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => openForm(blankForm(pickupDate))}
          className="min-h-11 rounded-theme bg-cocoa px-3 font-bold text-cream"
        >
          {copy.newOrder}
        </button>
        <button
          type="button"
          onClick={() => setPanel({ kind: "notes" })}
          className="min-h-11 rounded-theme border-2 border-cocoa px-3 font-bold"
        >
          {copy.fromNotes}
        </button>
      </div>

      {panel?.kind === "notes" && (
        <CallNotes
          pin={pin}
          onDraft={(draft) => openForm(fromDraft(draft))}
          onClose={() => setPanel(null)}
          onUnauthorized={onUnauthorized}
        />
      )}
      {panel?.kind === "form" && (
        <OrderForm
          key={panel.key}
          pin={pin}
          menu={menu}
          initial={panel.initial}
          onSaved={saved}
          onClose={() => setPanel(null)}
          onUnauthorized={onUnauthorized}
        />
      )}

      {loadFailed && (
        <div role="alert" className="space-y-2">
          <p className="font-bold">{copy.loadError}</p>
          <button
            type="button"
            onClick={() => setRefresh((r) => r + 1)}
            className="min-h-11 rounded-theme border-2 border-cocoa px-4 font-bold"
          >
            {copy.retry}
          </button>
        </div>
      )}
      {notice && (
        <p role="alert" className="font-bold">
          {notice}
        </p>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {!loaded ? (
        <p>{copy.loading}</p>
      ) : orders.length === 0 ? (
        !loadFailed && <p>{copy.empty}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              menuById={menuById}
              highlighted={highlight.has(order.id)}
              busy={busyId === order.id}
              onStatus={(status) => void setStatus(order, status)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
