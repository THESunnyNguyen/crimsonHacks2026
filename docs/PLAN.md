# Plan: AI for Fresh Donuts & Deli

> Builder: Sunny (solo) + AI agents, in **Paradev** (Claude Code + Codex, one worktree each). Locked 7:10 PM.

## One-liner
My best friend's parents have run Fresh Donuts & Deli in South Salt Lake for ~25 years. It's called the best in Salt Lake County, but it has no website, it sells out before close, and phone orders live on paper. We give the shop a website with a live "in the case now" view that staff update by **snapping a photo**, plus an order board where **AI turns messy call notes into clean orders**.

**Theme:** democratizing AI. The owners never see an API key; the interface is a camera and a text box.

**Demo:** `docs/DEMO.md` (click by click). **Contracts:** `docs/CONTRACTS.md`. **Menu:** `docs/menu.seed.json` (real prices).

## Decisions log
| Topic | Decision |
|---|---|
| Devices | Laptop = public site + staff app · Sunny's phone = camera (`/staff` Case tab) · judges' phones = public site via QR · monitor 2 = slides |
| Vision input | Phone photo of **a picture of a donut box** (3 prepared: full / few left / empty) |
| Vision output | Counts per **stock group** (raised, cake, specialty, filled & bars) + confidence. Public shows **level only**, plus the exact number when 1–6 left. |
| Menu | Real names and prices from Sunny (see CONTRACTS) |
| Lanes | 3 code lanes 7:45–9:30 (A vision+confirm · B public site · C order board) + **F menu assets** (a small OpenAI generation script, low review load). Mini-wave 9:30–10:00 (D Case Cam · E pre-order) **only if main is demoable**. |
| Tools | Skeleton, A, B, D = Claude Code · C, E, F, H = Codex. Cross-review: Codex reviews Claude's lanes; Claude reviews Codex's. |
| App AI | **OpenAI API only** ($250 credits): vision counting (`gpt-6-astra`), order parsing (`gpt-6-luna`), transcription (`gpt-transcribe`), menu copy + photos (lane F). No Anthropic API in the app; Claude Code is only a coding agent. |
| Codex auth | **ChatGPT subscription** first. If it hits its limits, switch to the API key with `codex -m gpt-6-luna` (20M tokens/day; `gpt-6.1-sol` is capped at 1.35M/day). The app uses the API key. |
| Generated photos | Labeled "Illustration" on the site; real photos from the family replace them later |
| Deploy | Vercel auto-deploys from GitHub: push to `main` = production (the QR URL); branches get preview URLs. |
| Storage | Upstash Redis on Vercel; JSON files locally. |
| Skills | `jmo-workflow` plugin (user scope): **better-ui** + **animate** for lane B / D polish; **codex** skill for Claude→Codex reviews. Skip interview, agentation, supabase/neon/stripe. |
| Look | Warm retro bakery via theme tokens (restyle later). |
| Footer | "Concept demo, Crimson Hacks 2026" until the family OKs it, then "Built for the ___ family." |

## Order of operations
| Time | Phase | Who | Output |
|---|---|---|---|
| 6:50–7:15 | **1. Lock target** | Sunny only | Read DEMO.md + CONTRACTS.md, fix anything wrong, commit, push |
| 7:15–7:25 | Critique pass | Strongest OpenAI model, read-only | ≤ 10 bug/merge/demo risks in CONTRACTS + DEMO; accept only clear fixes, commit |
| 7:25–8:00 | **2. Walking skeleton** | 1 agent: `00` (Claude Opus, high) | Repo, framework, all routes stubbed with real shapes, real menu seeded, pages render, deployed. Merge to main. |
| 8:00–9:30 | **3. Fan out** | Paradev lanes: **A** (start first, watch closest), **B**, **C**, + **F** (assets) | Merge to main at ~8:45 and ~9:20; main always demoable |
| 8:45, 9:20 | **4. Cross-review** at each merge | Codex ↔ Claude | Review the branch before merging (`docs/tasks/REVIEW.md`) |
| 9:30–10:00 | Mini-wave (optional) | D, E | Merge by 10:00 or drop |
| 10:00–10:30 | **5. Harden** | 1 agent: `H` (Codex high) + Claude review | Golden-path bugs + security only |
| 10:30 | **Freeze** | | Fixes, copy, polish only |
| 11:00 | Rehearse ×2, record backup video | Sunny | |
| 11:30 | Keyboards down, slip in, demo running by 11:35 | | |

## Prize targeting
**Best Commerce Hack** (helps a real local shop sell and serve) · **Best Use of AI** (vision → confirm → live; notes → order) · Best Overall / Best Design.

## Human to-dos
- [ ] Text the friend: permission, owners' names, a quote, how phone orders work today
- [ ] Prepare 3 donut-box pictures (full / few left / empty), ideally your own photos
- [ ] Keys in `.env`; GitHub repo connected to Vercel; Upstash Redis added
- [ ] 6:45 + 7:30 Redo talks → notes into the "how it's built" slide
