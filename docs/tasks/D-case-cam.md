# Lane D (mini-wave 9:30–10:00, only if main is demoable): Case Cam
**Tool:** Claude Code · Sonnet 5.5 · effort high · agent `lane-d` · **reviewed by Codex**
**Read first:** `AGENTS.md`, `docs/CONTRACTS.md`. **Owns:** `app/staff/cam/*`, `components/cam/*`.

- Full-screen camera preview (`getUserMedia`, rear camera). Status: "Next check in 0:24 · Last: Raised Plenty, Cake 3 · published ✓".
- Interval: **20s (demo)** / 5 min / 15 min; **Check now**; pause. Wake Lock if available.
- Each tick: frame → JPEG → `POST /api/inventory/count`. If every confidence ≥ `CASECAM_MIN_CONFIDENCE`, `PUT` with `source:"casecam"`; otherwise show "Needs a human look" and don't publish.
- Skip the call when the frame barely changed (cheap pixel diff).
- Link to it from the Case tab only via a URL (`/staff/cam`); don't edit lane A files.

**Done when:** pointed at picture #1 then #3, the public site goes Plenty → Sold out with no taps.
