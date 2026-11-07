# Shared contracts (locked 7:10 PM; every agent codes against this)

Changes need Sunny's OK. Ambiguity here becomes merge conflicts later.

### Preorder + sandbox extension (feature branch, authorized by Sunny)

Sunny requested implementation of working preorders and Stripe sandbox checkout
on a separate branch, to push later. This extension owns the E files plus
`lib/preorder*`, `lib/pickup.ts`, `lib/stripe.ts`, the necessary storage/type
additions, checkout/webhook/return routes, preorder copy, the staff payment label,
Stripe dependency/env names, and related tests/docs. Sunny subsequently authorized
integration into main after cross-review and passing checks, before the 23:30 cutoff.

- Public orders: priced donuts only, 1–36 total, required name/phone, today or
  tomorrow, Mon–Sat 05:00–16:45 in 15-minute slots, at least 15 minutes ahead.
- `POST /api/preorder` retains the planned body; requires a UUID
  `Idempotency-Key` header. Returns a **public receipt**, not customer contact
  details: `{ id, pickupDate, pickupTime, items, payment }`.
- Same-day stock validation and insertion are atomic. Orders still use
  `source: "web"`, `status: "new"`. Existing staff routes remain PIN-protected.
- Optional `Order.payment`: `{ method: "pay_at_pickup" | "stripe_sandbox",
  status: "unpaid" | "paid", amountTotal: number, currency: "usd", sessionId?: string }`.
  Amounts are integer cents. Fulfillment status remains separate. Store-internal
  request fingerprints prevent a reused idempotency key from changing an order.
- `POST /api/checkout`: same body/header, **tomorrow only**, returns `{ url }`.
  Saves a durable draft, then creates a card-only Stripe sandbox Checkout Session.
  Drafts are not orders and do not hold inventory. Checkout expires after one hour.
- `POST /api/webhooks/stripe`: verifies the raw-body Stripe signature and rejects
  live events; a completed, paid session with matching order metadata, amount and
  currency creates one order. Replays preserve the existing fulfillment status.
- `GET /api/checkout?session_id=cs_test_...`: returns
  `{ state: "unpaid" | "expired" | "confirming" | "confirmed", order?: receipt }`.
  It verifies with Stripe and only reports confirmed after webhook persistence.
  No public endpoint lists customer names or phone numbers.
- Creation routes share a 5/minute/IP limit; status checks allow 40/minute/IP.
  Redis limits are shared across instances; local development uses one process bucket.
- Env: `STRIPE_SECRET_KEY` (sandbox `sk_test_`, `rk_test_`, or temporary `rkcs_test_`), `STRIPE_WEBHOOK_SECRET`,
  `APP_BASE_URL` (exact site origin). Missing configuration disables card checkout;
  pay-at-pickup continues working. Live keys are intentionally unsupported.
- These are concept-demo orders and test payments. Tax, actual merchant operations,
  refunds, and same-day card reservations are outside this branch's scope.

## Menu (seed: `docs/menu.seed.json`, real prices from Sunny)
- Prices: specialty (fritters, cinnamon rolls, cream cheese croissants) **$3.49** · filled donuts & buttermilk bars **$2.59** · regular raised & cake donuts **$1.65**.
- Cake donuts can get **peanut or coconut** topping (menu note, no price change).
- Deli sandwiches: `price: null` → display "Ask at the counter".

## Menu copy and photos (generated with OpenAI, lane F)
`content/menu-copy.json`, keyed by `MenuItem.id` **and** stock `groupId`:
```ts
type MenuCopy = Record<string, {
  description: string;   // ≤ 18 words, appetizing, no claims we can't back (no "award-winning recipe since 1920")
  image: string;         // "/img/menu/<id>.webp" or "/img/groups/<groupId>.webp", 1024px, webp, ≤ 200 KB
  imageAlt: string;
}>;
```
Lane B renders these if present and falls back to SVG illustrations if a key is missing. Every generated photo shows a small **"Illustration"** label on the site, so customers aren't misled about what the real donuts look like.

## Stock groups (what the camera tracks)
The vision model counts **groups**, not individual flavors, because that's realistic from a photo.
| groupId | Name on site | What it looks like (also used in the vision prompt) |
|---|---|---|
| `raised` | Raised donuts | light, puffy ring donuts with a hole; glaze, maple, chocolate, sugar, blueberry |
| `cake` | Cake donuts | denser ring donuts; cracked "old fashioned" edges or smooth cake; may have frosting, peanuts, coconut |
| `specialty` | Fritters, rolls & croissants | knobby irregular fritters, spiral cinnamon rolls, croissants |
| `filled_bars` | Filled & bars | round donuts with no hole (filled), rectangular buttermilk bars |

## Levels (public display rule)
`available` 0 → **Sold out** · 1–6 → **Running low**, and show the number: "Only 4 left" · ≥7 → **Plenty** (no number shown).
The total level uses the same rule on the sum. `shopSoldOut` = every group's available is 0, or the staff toggle is on.

## Types (`lib/types.ts`)
```ts
type StockGroupId = "raised" | "cake" | "specialty" | "filled_bars";
type Level = "plenty" | "low" | "sold_out";

type MenuItem = {
  id: string; name: string;
  category: "specialty" | "filled_bars" | "raised" | "cake" | "deli";
  stockGroup: StockGroupId | null;
  price: number | null;        // null = "Ask at the counter"
  options?: string[];
};

type Inventory = {
  updatedAt: string;           // ISO
  source: "photo" | "manual" | "casecam";
  groups: {
    groupId: StockGroupId;
    count: number;             // physically in the case (last confirmed photo / manual)
    held: number;              // computed: qty of TODAY's orders with status "new" in this group
    available: number;         // computed: max(0, count - held)
    level: Level;              // computed from available
  }[];
  total: { available: number; level: Level };
  shopSoldOut: boolean;
  soldOutToggle: boolean;      // staff override
};

type Order = {
  id: string;                  // short, e.g. "A7K2"
  customerName: string; phone?: string;
  pickupDate: string;          // "YYYY-MM-DD" America/Denver
  pickupTime: string;          // "HH:MM" 24h
  items: { menuItemId: string; qty: number; option?: string }[];
  notes?: string;
  status: "new" | "ready" | "picked_up" | "cancelled";
  // new = taken, not boxed yet → held (subtracted from public stock)
  // ready = boxed and set aside → out of the case, no longer subtracted
  source: "staff_form" | "notes" | "web";
  createdAt: string;
};

type CountResult = {           // response of /api/inventory/count; NOT saved
  groups: { groupId: StockGroupId; count: number; confidence: number }[];  // confidence 0..1
  total: number;
  notes: string;               // e.g. "photo is a printed picture; 2 donuts partly hidden"
  secondOpinion?: { model: string; groups: { groupId: StockGroupId; count: number }[]; agrees: boolean };
};
```

## Storage (`lib/store.ts`, owned by 00)
`lib/ai.ts`: **OpenAI only** (`openai` SDK). `visionJSON(image, prompt, schema, { model? })`, `textJSON(prompt, schema, { model? })`, `transcribe(audio)`. No Anthropic API calls anywhere in the app.
`getMenu()`, `getInventory()` (always returns computed fields), `setCounts(groups: {groupId,count}[], source)`, `setSoldOutToggle(on)`, `listOrders({date?})`, `createOrder(o)`, `updateOrderStatus(id, status)`.
Upstash Redis when `UPSTASH_REDIS_REST_URL` is set (Vercel); JSON files in `data/` otherwise. Nobody else touches storage directly.

## API routes
| Method | Route | Body → Response | Auth | Lane |
|---|---|---|---|---|
| GET | `/api/menu` | → `MenuItem[]` | public | 00 |
| GET | `/api/inventory` | → `Inventory` | public | 00 |
| PUT | `/api/inventory` | `{ groups:{groupId,count}[], source }` or `{ soldOutToggle }` → `Inventory` | staff | 00 |
| POST | `/api/inventory/count` | multipart `image` → `CountResult` | staff | A (00 stubs it with fake counts) |
| GET | `/api/orders?date=` | → `Order[]` | staff | 00 |
| POST | `/api/orders` | `Order` minus id/createdAt/status → `Order` | staff | 00 |
| PATCH | `/api/orders/:id` | `{ status }` → `Order` | staff | 00 |
| POST | `/api/orders/parse` | `{ text }` → draft `Order` fields (unsaved) | staff | C (00 stubs it) |
| POST | `/api/transcribe` | multipart `audio` → `{ text }` (`TRANSCRIBE_MODEL`) | staff | C |
| POST | `/api/preorder` | `{ customerName, phone, pickupDate, pickupTime, items, notes? }` → `Order` (source web) | public, validated + rate-limited | E |

Staff auth: header `x-staff-pin` must equal `STAFF_PIN`; otherwise 401. Errors: `{ error: string }` with 4xx/5xx.
Clients poll `GET /api/inventory` and `GET /api/orders` every **5s**.

## Env vars (`.env.example`)
```
STAFF_PIN=                       # 4 digits
OPENAI_API_KEY=                  # Sunny's $250 hackathon credits; the ONLY AI key the app uses
VISION_MODEL=gpt-6-astra         # flagship, image input: donut counting
PARSE_MODEL=gpt-6-luna           # fast: notes → order
VISION_SECOND_MODEL=             # optional second-opinion count; blank = off
TRANSCRIBE_MODEL=gpt-transcribe  # phone-order dictation
OPENAI_TEXT_MODEL=gpt-6-astra    # menu copy (build-time, lane F)
OPENAI_IMAGE_MODEL=gpt-image-2.5-sunburst  # menu photos (build-time, lane F)
UPSTASH_REDIS_REST_URL=          # ⚠️ set ONLY in Vercel, never in local .env
UPSTASH_REDIS_REST_TOKEN=        # ⚠️ same: local worktrees use JSON files
CASECAM_MIN_CONFIDENCE=0.8
```
Model IDs come from OpenAI's docs as of Nov 6 2026. Skeleton (00) **verifies them with `GET /v1/models`** using the key and swaps in the closest listed ID if one is missing.

## Theme tokens
All colors, fonts and radii are CSS variables in `app/globals.css` (`--color-cream`, `--color-cocoa`, `--color-frosting`, `--font-display`, `--font-body`, `--radius`), mapped in Tailwind. **No hardcoded hex or font names in components.**

## Folder layout and ownership
| Lane | Owns |
|---|---|
| 00 skeleton | `package.json`/lockfile, configs, `app/layout.tsx`, `app/globals.css`, `lib/*` (types, store, ai, time, auth), `data/*`, `app/api/menu`, `app/api/inventory/route.ts`, `app/api/orders/route.ts`, `app/api/orders/[id]`, `app/staff/page.tsx` + `app/staff/layout.tsx` (PIN gate + two tabs that render `<CaseTab/>` and `<OrdersTab/>`), `scripts/seed.ts`, `.env.example`, README |
| A vision + confirm | `components/staff/CaseTab.tsx`, `components/staff/case/*`, `app/api/inventory/count/route.ts`, `lib/vision/*`, `scripts/eval-count.ts`, `test-images/*`, `docs/eval.md` |
| B public site | `app/page.tsx`, `components/public/*` (except `PreorderForm.tsx`), `content/site.ts`, `public/img/illustrations/*` |
| C order board | `components/staff/OrdersTab.tsx`, `components/staff/orders/*`, `app/api/orders/parse/route.ts`, `app/api/transcribe/route.ts`, `lib/parse/*`, `scripts/parse-samples.ts` |
| F menu assets (OpenAI) | `scripts/gen-menu-assets.ts`, `content/menu-copy.json`, `public/img/menu/*`, `public/img/groups/*` |
| D case cam (mini-wave) | `app/staff/cam/*`, `components/cam/*` |
| E pre-order (mini-wave) | `app/api/preorder/route.ts`, `components/public/PreorderForm.tsx`, plus **one mount line** in `app/page.tsx` |
| H harden | Golden-path bug and security fixes anywhere, after the 10:00 merge |
Need a change outside your lane? Stop and tell Sunny.
