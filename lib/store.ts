import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import menu from "@/data/menu.json";
import { today } from "./time";
import { countsSchema, orderSchema, statusSchema } from "./validation";
import type { Inventory, Level, MenuItem, Order, StockGroupId } from "./types";
import { totalCents, type PreorderInput } from "./preorder";
import { json } from "./http";
export const stockGroups: StockGroupId[] = [
  "raised",
  "cake",
  "specialty",
  "filled_bars",
];
type Stock = {
  updatedAt: string;
  source: Inventory["source"];
  counts: Record<StockGroupId, number>;
  soldOutToggle: boolean;
};
const initialStock = (): Stock => ({
  updatedAt: new Date().toISOString(),
  source: "manual",
  counts: { raised: 20, cake: 20, specialty: 20, filled_bars: 20 },
  soldOutToggle: false,
});
function redis() {
  if (process.env.UPSTASH_REDIS_REST_URL) return Redis.fromEnv();
  if (process.env.VERCEL)
    throw new Error("Configure Upstash Redis before deploying");
  return null;
}
const dataDir = path.join(process.cwd(), "data");
async function read<T>(key: string, fallback: () => T): Promise<T> {
  const db = redis();
  if (db) return (await db.get<T>(`fresh:${key}`)) ?? fallback();
  try {
    return JSON.parse(
      await readFile(path.join(dataDir, `${key}.local.json`), "utf8"),
    );
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback();
    throw e;
  }
}
async function write(key: string, value: unknown) {
  const db = redis();
  if (db) {
    await db.set(`fresh:${key}`, value);
    return;
  }
  await mkdir(dataDir, { recursive: true });
  const file = path.join(dataDir, `${key}.local.json`);
  const tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2));
  await rename(tmp, file);
}
// Serialize local read-modify-write operations; Redis uses atomic hash/JSON updates.
let pending: Promise<unknown> = Promise.resolve();
function serial<T>(action: () => Promise<T>): Promise<T> {
  const result = pending.then(action);
  pending = result.catch(() => {});
  return result;
}
export async function getMenu(): Promise<MenuItem[]> {
  return structuredClone(menu) as MenuItem[];
}
export async function listOrders({ date }: { date?: string } = {}): Promise<
  Order[]
> {
  const db = redis();
  const orders = db
    ? Object.values(
        (await db.hgetall<Record<string, Order>>("fresh:orders")) ?? {},
      )
    : await read<Order[]>("orders", () => []);
  return orders
    .filter((o) => !date || o.pickupDate === date)
    .sort((a, b) =>
      (a.pickupDate + a.pickupTime + a.createdAt).localeCompare(
        b.pickupDate + b.pickupTime + b.createdAt,
      ),
    );
}
const level = (n: number): Level =>
  n === 0 ? "sold_out" : n <= 6 ? "low" : "plenty";
export async function getInventory(): Promise<Inventory> {
  const [stock, orders] = await Promise.all([
    read<Stock>("inventory", initialStock),
    listOrders({ date: today() }),
  ]);
  const groups = stockGroups.map((groupId) => {
    const held = orders
      .filter((o) => o.status === "new")
      .reduce(
        (sum, o) =>
          sum +
          o.items
            .filter(
              (i) =>
                menu.find((m) => m.id === i.menuItemId)?.stockGroup === groupId,
            )
            .reduce((s, i) => s + i.qty, 0),
        0,
      );
    const count = stock.counts[groupId];
    const available = Math.max(0, count - held);
    return { groupId, count, held, available, level: level(available) };
  });
  const available = groups.reduce((s, g) => s + g.available, 0);
  return {
    updatedAt: stock.updatedAt,
    source: stock.source,
    groups,
    total: { available, level: level(available) },
    soldOutToggle: stock.soldOutToggle,
    shopSoldOut: stock.soldOutToggle || available === 0,
  };
}
async function changeStock(patch: {
  counts?: Partial<Stock["counts"]>;
  source?: Stock["source"];
  soldOutToggle?: boolean;
}) {
  const db = redis();
  const stamp = new Date().toISOString();
  if (db) {
    await db.eval(
      `local raw=redis.call('GET',KEYS[1]); local s; if raw then s=cjson.decode(raw) else s=cjson.decode(ARGV[1]) end; local p=cjson.decode(ARGV[2]); if p.counts then for k,v in pairs(p.counts) do s.counts[k]=v end end; if p.source then s.source=p.source end; if p.soldOutToggle~=nil then s.soldOutToggle=p.soldOutToggle end; s.updatedAt=ARGV[3]; redis.call('SET',KEYS[1],cjson.encode(s)); return 1`,
      ["fresh:inventory"],
      [JSON.stringify(initialStock()), JSON.stringify(patch), stamp],
    );
  } else {
    await serial(async () => {
      const s = await read<Stock>("inventory", initialStock);
      await write("inventory", {
        ...s,
        ...patch,
        counts: { ...s.counts, ...patch.counts },
        updatedAt: stamp,
      });
    });
  }
  return getInventory();
}
export async function setCounts(
  groups: { groupId: StockGroupId; count: number }[],
  source: Inventory["source"],
) {
  const parsed = countsSchema.parse({ groups, source });
  return changeStock({
    counts: Object.fromEntries(parsed.groups.map((g) => [g.groupId, g.count])),
    source,
  });
}
export async function setSoldOutToggle(on: boolean) {
  if (typeof on !== "boolean") throw new Error("Invalid toggle");
  return changeStock({ soldOutToggle: on });
}
export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "status">,
): Promise<Order> {
  const parsed = orderSchema.parse(input);
  const order: Order = {
    ...parsed,
    id: randomUUID().slice(0, 8).toUpperCase(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const db = redis();
  if (db) await db.hset("fresh:orders", { [order.id]: order });
  else
    await serial(async () => {
      const orders = await read<Order[]>("orders", () => []);
      await write("orders", [...orders, order]);
    });
  return order;
}
export async function updateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<Order | null> {
  statusSchema.parse(status);
  const db = redis();
  if (db) {
    const result = await db.eval<[string, string], string | Order | null>(
      `local raw=redis.call('HGET',KEYS[1],ARGV[1]); if not raw then return nil end; local o=cjson.decode(raw); o.status=ARGV[2]; local encoded=cjson.encode(o); redis.call('HSET',KEYS[1],ARGV[1],encoded); return encoded`,
      ["fresh:orders"],
      [id, status],
    );
    return result
      ? typeof result === "string"
        ? JSON.parse(result)
        : result
      : null;
  }
  return serial(async () => {
    const orders = await read<Order[]>("orders", () => []);
    const order = orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    await write("orders", orders);
    return order;
  });
}
export async function resetStore() {
  const db = redis();
  if (db) {
    await db.del("fresh:orders");
    await db.del("fresh:checkouts");
    await write("inventory", initialStock());
  } else
    await serial(async () => {
      await write("orders", []);
      await write("checkouts", {});
      await write("inventory", initialStock());
    });
}

// All public order mutations stay in this storage boundary. Redis performs the
// stock check and insert in one script; local JSON uses the same serial queue.
type StoredPreorder = Order & { requestFingerprint: string };
export type CheckoutDraft = {
  id: string;
  input: PreorderInput;
  amountTotal: number;
  fingerprint: string;
  expiresAt: number;
};
const fingerprint = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function createPreorder(
  input: PreorderInput,
  key: string,
  now = new Date(),
): Promise<Order> {
  const order: StoredPreorder = {
    ...input,
    id: key.toUpperCase(),
    source: "web",
    status: "new",
    createdAt: now.toISOString(),
    payment: {
      method: "pay_at_pickup",
      status: "unpaid",
      amountTotal: totalCents(input),
      currency: "usd",
    },
    requestFingerprint: fingerprint(input),
  };
  const required: Partial<Record<StockGroupId, number>> = {};
  const groupByItem = Object.fromEntries(menu.map((m) => [m.id, m.stockGroup]));
  for (const item of input.items) {
    const group = groupByItem[item.menuItemId] as StockGroupId;
    required[group] = (required[group] ?? 0) + item.qty;
  }
  const db = redis();
  if (db) {
    const result = await db.eval<string[], string | StoredPreorder>(
      `
      local incoming=cjson.decode(ARGV[1])
      local existing=redis.call('HGET',KEYS[1],incoming.id)
      if existing then
        if cjson.decode(existing).requestFingerprint~=incoming.requestFingerprint then return 'conflict' end
        return existing
      end
      if incoming.pickupDate==ARGV[2] then
        local stock=cjson.decode(redis.call('GET',KEYS[2]) or ARGV[3])
        if stock.soldOutToggle then return 'stock' end
        local needed=cjson.decode(ARGV[4]); local groups=cjson.decode(ARGV[5]); local held={}
        for _,raw in ipairs(redis.call('HVALS',KEYS[1])) do
          local o=cjson.decode(raw)
          if o.pickupDate==ARGV[2] and o.status=='new' then
            for _,item in ipairs(o.items) do
              local g=groups[item.menuItemId]
              if g and g~=cjson.null then held[g]=(held[g] or 0)+item.qty end
            end
          end
        end
        for g,qty in pairs(needed) do if qty>stock.counts[g]-(held[g] or 0) then return 'stock' end end
      end
      redis.call('HSET',KEYS[1],incoming.id,ARGV[1]); return ARGV[1]
    `,
      ["fresh:orders", "fresh:inventory"],
      [
        JSON.stringify(order),
        today(now),
        JSON.stringify(initialStock()),
        JSON.stringify(required),
        JSON.stringify(groupByItem),
      ],
    );
    if (result === "stock")
      throw json(
        {
          error:
            "There aren't enough donuts left for today. Try fewer or choose tomorrow.",
        },
        409,
      );
    if (result === "conflict")
      throw json(
        {
          error:
            "This request was already used for a different order. Start a new order.",
        },
        409,
      );
    return typeof result === "string" ? JSON.parse(result) : result;
  }
  return serial(async () => {
    const orders = await read<StoredPreorder[]>("orders", () => []);
    const existing = orders.find((o) => o.id === order.id);
    if (existing) {
      if (existing.requestFingerprint !== order.requestFingerprint)
        throw json(
          {
            error:
              "This request was already used for a different order. Start a new order.",
          },
          409,
        );
      return existing;
    }
    if (input.pickupDate === today(now)) {
      const stock = await read<Stock>("inventory", initialStock);
      const held: Partial<Record<StockGroupId, number>> = {};
      for (const o of orders.filter(
        (o) => o.pickupDate === today(now) && o.status === "new",
      )) {
        for (const item of o.items) {
          const group = groupByItem[item.menuItemId] as StockGroupId | null;
          if (group) held[group] = (held[group] ?? 0) + item.qty;
        }
      }
      if (
        stock.soldOutToggle ||
        stockGroups.some(
          (g) =>
            (required[g] ?? 0) > Math.max(0, stock.counts[g] - (held[g] ?? 0)),
        )
      ) {
        throw json(
          {
            error:
              "There aren't enough donuts left for today. Try fewer or choose tomorrow.",
          },
          409,
        );
      }
    }
    await write("orders", [...orders, order]);
    return order;
  });
}

export async function saveCheckoutDraft(
  input: PreorderInput,
  key: string,
  now = new Date(),
): Promise<CheckoutDraft> {
  const draft: CheckoutDraft = {
    id: key,
    input,
    fingerprint: fingerprint(input),
    amountTotal: totalCents(input),
    expiresAt: Math.floor(now.getTime() / 1000) + 3600,
  };
  const db = redis();
  const saved = db
    ? await (async () => {
        await db.hsetnx("fresh:checkouts", key, draft);
        return (await db.hget<CheckoutDraft>("fresh:checkouts", key))!;
      })()
    : await serial(async () => {
        const drafts = await read<Record<string, CheckoutDraft>>(
          "checkouts",
          () => ({}),
        );
        if (drafts[key]) return drafts[key];
        drafts[key] = draft;
        await write("checkouts", drafts);
        return draft;
      });
  if (saved.fingerprint !== draft.fingerprint)
    throw json(
      {
        error:
          "This checkout was already used for a different order. Start a new order.",
      },
      409,
    );
  return saved;
}

export async function getCheckoutDraft(
  id: string,
): Promise<CheckoutDraft | null> {
  const db = redis();
  return db
    ? db.hget<CheckoutDraft>("fresh:checkouts", id)
    : ((await read<Record<string, CheckoutDraft>>("checkouts", () => ({})))[
        id
      ] ?? null);
}

export async function getCheckoutOrder(id: string): Promise<Order | null> {
  const db = redis();
  const orderId = `S-${id.toUpperCase()}`;
  return db
    ? db.hget<Order>("fresh:orders", orderId)
    : ((await read<Order[]>("orders", () => [])).find(
        (o) => o.id === orderId,
      ) ?? null);
}

export async function completeCheckout(
  draft: CheckoutDraft,
  sessionId: string,
): Promise<Order> {
  const order: Order = {
    ...draft.input,
    id: `S-${draft.id.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    source: "web",
    status: "new",
    payment: {
      method: "stripe_sandbox",
      status: "paid",
      currency: "usd",
      amountTotal: draft.amountTotal,
      sessionId,
    },
  };
  const db = redis();
  const saved = db
    ? await (async () => {
        await db.hsetnx("fresh:orders", order.id, order);
        return (await db.hget<Order>("fresh:orders", order.id))!;
      })()
    : await serial(async () => {
        const orders = await read<Order[]>("orders", () => []);
        const existing = orders.find((o) => o.id === order.id);
        if (existing) return existing;
        await write("orders", [...orders, order]);
        return order;
      });
  if (saved.payment?.sessionId !== sessionId)
    throw new Error("Checkout already fulfilled by a different session");
  return saved;
}

const publicRequests = new Map<string, { count: number; expires: number }>();
export async function consumePublicRequest(
  key: string,
  limit: number,
  now = Date.now(),
): Promise<boolean> {
  const db = redis();
  if (db) {
    const count = await db.eval<[], number>(
      `local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n`,
      [`fresh:limit:${key}`],
      [],
    );
    return count <= limit;
  }
  for (const [k, value] of publicRequests)
    if (value.expires <= now) publicRequests.delete(k);
  const bucket = publicRequests.get(key) ?? { count: 0, expires: now + 60_000 };
  bucket.count++;
  publicRequests.set(key, bucket);
  return bucket.count <= limit;
}
