# Vision count eval (lane A)

**Status:** the demo-photo eval is still pending. Sunny's three demo pictures (#1 full, #2 a few left, #3 empty), shot on his phone, are not in the repo yet. Nothing below measures accuracy on the shop's donuts. Don't put a "±N" accuracy claim on the slide until the real table exists.

## How to run (real demo photos)
1. Put the photos in `test-images/` (e.g. `1-full.jpg`, `2-few.jpg`, `3-empty.jpg`). Shoot them the way they'll be shot on stage.
2. Copy `test-images/expected.example.json` to `test-images/expected.json` and fill in the true per-group counts.
3. Run `npx tsx scripts/eval-count.ts --models gpt-6-astra,gpt-6.1-terra,gpt-6-luna --runs 3` and paste the two tables below.

The script uses the same pipeline as `POST /api/inventory/count` (sharp resize to ≤1024px, the same prompt and strict schema). It reads `OPENAI_API_KEY` from the shell or `.env`. `--dir <folder>` points it at another photo set, and `--synthetic` runs the generated drawings.

## 1. One real photo, not from the shop (pipeline check only, 2026-11-06 21:12 MST)
- **Photo:** `test-images/real/commons-box-of-doughnuts.jpg`, 960×720 JPEG, sha256 `a8b3ce501a70584404f8f6cd4f07acf8a412581d0e4b6f1c467622bf290c7a78`.
- **Source:** https://commons.wikimedia.org/wiki/File:Box_of_doughnuts_(5533414164).jpg. The 960px thumbnail was downloaded from `https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Box_of_doughnuts_%285533414164%29.jpg/960px-Box_of_doughnuts_%285533414164%29.jpg`.
- **Author / license:** "Amy from Newburgh, NY", via Flickr, CC BY 2.0. Attribution: "Box of doughnuts" by Amy from Newburgh, NY, CC BY 2.0, resized. It is used for evaluation only and is not shown on the site.
- **Labels:** hand-labelled by the coding agent: raised 7, cake 1, specialty 1, filled_bars 3 (total 12). These labels are uncertain:
  - The French cruller doesn't clearly map to any of our groups. It's labelled specialty because it's knobby.
  - Raised vs cake for the glazed and frosted rings is a judgment call from appearance.
  - The pink item cut off at the left edge was counted as raised.
  - Only the total of 12 is firm.
- One photo is limited evidence, not a benchmark.

| Model | raised 7 | cake 1 | spec 1 | fill/bar 3 | Total (12) | Latency (2 runs) |
|---|---|---|---|---|---|---|
| gpt-6-astra | 5, 5 | 5, 3 | 0, 1 | 2, 3 | 12, 12 | 17.1s, 22.8s |
| gpt-6.1-terra | 5, 5 | 4, 4 | 0, 0 | 3, 3 | 12, 12 | 6.7s, 7.5s |
| gpt-6-luna | 7, 7 | 2, 2 | 3, 3 | 1, 1 | 13, 13 | 13.7s, 19.2s |

What this run shows, with the limits above:
- Totals were right or off by 1.
- Raised vs cake split the most, so staff confirmation on those rows matters.
- Luna and terra flagged 4 of their 6 wrong groups with confidence < 0.8. Astra flagged 0 of 6.
- **Latency:** only terra was under the 8s target on this real photo. Astra took 17–23s, so on similar photos it will miss the 8s target. The route gives up after 25s and the UI falls back to manual.
- Recommendation, pending the shop photos: consider `VISION_MODEL=gpt-6.1-terra` with `VISION_SECOND_MODEL=gpt-6-astra`. The second opinion is capped at 8s, so it will often be dropped as "late". Re-decide once the real demo photos are in.

## 2. Synthetic drawings (pipeline and latency only, not accuracy)
`test-images/synthetic/fixtures.ts` generates flat vector drawings: a full box of 12, a few left (3 cake + 1 fritter), and an empty box. 2 runs each, 2026-11-06, images at 1568px before the cap changed to 1024px:

| Model | Groups exact | Photos exact | Latency median / max | Under 8s |
|---|---|---|---|---|
| gpt-6-astra | 100% | 6/6 | 4.3s / 6.1s | 6/6 |
| gpt-6-luna | 83% | 4/6 | 4.3s / 5.0s | 6/6 |
| gpt-6.1-terra | 83% | 4/6 | 3.0s / 3.9s | 6/6 |

On the "few left" drawing, luna and terra called the cake rings raised. With `VISION_SECOND_MODEL=gpt-6.1-terra`, the live route flagged that disagreement as "Two models disagree".

## 3. Real demo photos: PENDING
Needs Sunny's three phone photos plus their true counts.
