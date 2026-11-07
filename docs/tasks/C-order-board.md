# Lane C: Phone-order board + notes → AI order
**Tool:** Codex · reasoning effort high · **reviewed by Claude** (`reviewer` agent)
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md` (Order, held rule), `docs/DEMO.md` 1:50–2:15.
**Owns:** `components/staff/OrdersTab.tsx`, `components/staff/orders/*`, `app/api/orders/parse/route.ts`, `app/api/transcribe/route.ts`, `lib/parse/*`, `scripts/parse-samples.ts`.

## 1. Order board (replace the stub `OrdersTab.tsx`)
- Date switcher (Today / Tomorrow). Cards sorted by pickup time: time, name, items (qty × name/option), notes, source badge (📞 staff/notes, 🌐 web).
- Tap the status chip to advance **New → Ready (boxed) → Picked up**; a small menu has Cancel. Hint text: "New orders are held from the case."
- Poll every 5s; highlight and chime on new cards (for web pre-orders in the demo).
- **New order** form: name, phone, pickup date/time, item picker (menu grouped, qty steppers, option select), notes → `POST /api/orders` (`source:"staff_form"`).

## 2. `🎙 From call notes`
- Textarea plus a **hold-to-talk mic button**: record with `MediaRecorder` → `POST /api/transcribe` (`TRANSCRIBE_MODEL`, staff-only, ≤ 60s / 10 MB) → text into the textarea. This works on iPhone Safari, where the Web Speech API is unreliable. Typing always works too. → **Draft with AI** → `POST /api/orders/parse` → pre-fills the form for review → Save with `source:"notes"`.
- `/api/orders/parse` (replace the stub): `textJSON` with `PARSE_MODEL`, the menu list, and today's date/time from `lib/time.ts`. Map fuzzy names ("fritters," "glazed," "old fashioned maple"), "a dozen" = 12, "tomorrow," "7:30" → 07:30. Anything unmatched goes in `notes`; never drop info. zod-validated.
- `scripts/parse-samples.ts`: 6 messy samples, including the DEMO.md line, with expected outputs; all pass.

## Done when
On the deployed preview: the demo line parses into a correct draft in < 3s; Save → card appears; a today `New` order lowers public `available`; Ready restores it.
