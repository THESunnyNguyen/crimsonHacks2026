# Lane B: Public site
**Tool:** Claude Code · Opus 5.5 · effort medium · agent `lane-b` · **reviewed by Codex**
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md` (levels rule, menu), `docs/SHOP.md`, `docs/DEMO.md` 0:30 and 1:10–1:35.
**Owns:** `app/page.tsx`, `components/public/*` (except `PreorderForm.tsx`), `content/site.ts`, `public/img/illustrations/*`.

## Sections
1. **Hero:** "Fresh Donuts & Deli," "South Salt Lake · family-owned for 25 years," today's hours, **Open now / Closed / Sold out today** pill.
2. **In the case now:** 4 group cards (group photo from menu-copy if present) (Raised · Cake · Fritters, rolls & croissants · Filled & bars) with a level badge; show "Only N left" when 1–6; "Updated 2 min ago · by camera/staff." Poll every 5s; **animate changes** (judges watch this). `shopSoldOut` → big warm banner "Sold out for today. Fresh again tomorrow at 5 AM."
3. **Menu:** item cards with photo + description from `content/menu-copy.json` (lane F; fall back to SVG when missing; small "Illustration" label on generated photos), grouped like the real menu board (Specialty $3.49 · Filled & bars $2.59 · Raised $1.65 · Cake $1.65 with flavor options; "Peanut or coconut on any cake donut"; Deli: "Ask at the counter").
4. **Our story:** short family story (copy in `content/site.ts`; Sunny edits names later) plus the Tribune quote, credited.
5. **Visit:** address, tap-to-call (801) 467-8322, hours, **Get directions** (Maps link in SHOP.md).
6. Leave an empty `<section id="preorder" />` (lane E mounts there). **Footer:** "Concept demo · Crimson Hacks 2026."

## Design
If available, use the **better-ui** skill for surfaces, shadows and radii, and the **animate** skill for the live-stock change animation. Polish comes after the sections work.
Warm retro bakery: cream, cocoa, frosting pink, rounded donut shapes, hand-lettered display font. **Theme tokens only**, and all copy in `content/site.ts`, so Sunny can restyle and rewrite later. Mobile-first (judges use phones). No Tribune photos on the site. Generated photos come from lane F; your SVG donut illustrations are the fallback.

## Done when
Looks great at 375px and on desktop; a curl `PUT` to inventory animates in within 5s; Lighthouse is fine; no console errors.
