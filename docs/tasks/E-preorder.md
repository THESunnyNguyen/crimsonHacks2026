# Lane E (mini-wave 9:30–10:00, only if main is demoable): Hold a dozen (pay at pickup)
**Tool:** Codex · reasoning effort medium · **reviewed by Claude**
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md`. **Owns:** `app/api/preorder/route.ts`, `components/public/PreorderForm.tsx`, plus **one mount line** in `app/page.tsx` inside `#preorder`.

- `POST /api/preorder`: zod-validate; name and phone required; items from the menu; total ≤ 36; pickup within shop hours today or tomorrow; for today, each group's qty ≤ available; rate limit 5/min per IP; save `source:"web"`, `status:"new"`.
- Form: quick **Assorted dozen** button or pick items; pickup date/time; name; phone → confirmation card "Held for you · Sat 7:30 AM · pay at pickup · #A7K2". When sold out today, offer tomorrow only.
- Theme tokens only; friendly short copy.

**Done when:** a pre-order from a phone appears on `/staff` Orders within 5s, and today's public level drops accordingly.
