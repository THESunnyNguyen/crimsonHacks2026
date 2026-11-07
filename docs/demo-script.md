# Fresh Donuts & Deli: three-minute pitch

**Owner and speaker:** Sunny. Sunny operates the laptop, phone, and slides. Judges only scan the public QR. No helper is required.

**Timing:** problem **0:00–0:15 (15s)** → live demo **0:15–1:45 (90s)** → how it is built + AI **1:45–2:30 (45s)** → impact **2:30–3:00 (30s)**. This retimes [DEMO.md](DEMO.md) to the requested beats while preserving its core click order. Quoted lines below are spoken copy. Bracketed instructions are not spoken.

**Evidence status:** this pitch worktree contains planning documents, with no runnable app or `docs/eval.md` at drafting. UI labels come from DEMO.md and lane briefs. Rehearse against the integrated deployment before claiming a feature works. The core script assumes lanes A, B, and C have passed that rehearsal. Optional lanes D/E are excluded by default.

## Before the timer

- Monitor 2: the four slides in [pitch/slides.md](pitch/slides.md). Keep slide 2 and its QR visible throughout the live demo.
- Laptop browser: **① public `/`**, narrow window or phone view; **② `/staff`**, PIN already entered, **Orders** open. Have `/staff` **Case** available on the laptop for a phone failure.
- Phone: the same deployment's `/staff`, PIN already entered, **Case** tab open. Allow camera access beforehand. Charge both devices and have a cable ready.
- Props, in order: **#1 full box**, **#2 a few left**, **#3 empty**. These are pictures of donuts, as specified in DEMO.md. Say so on stage. Hand-count them first. To get the scripted low-stock result, #2 must depict **three cake donuts** with no cake holds affecting availability. Otherwise say the verified number actually shown.
- Run `npm run seed:demo` on the app instance used for rehearsal, as directed in DEMO.md. Verify the intended demo deployment actually has **Plenty** in all groups, one sample order, no conflicting holds, and the sold-out override off. A local JSON seed does not reset Vercel Redis. Ask the integrator for the authorized deployed reset procedure if needed.
- Have the exact call note ready to paste: `Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100`. Use this fictional customer on the projected screen.
- Verify Orders has **Today / Tomorrow** (lane C), and the new tomorrow order appears after Save. Confirm the pickup date resolves in **America/Denver**.
- **[NEED FROM SUNNY]** Final public HTTPS URL and a QR tested from another phone. Use the same deployment on every device. A QR to localhost will not work for judges.
- Hotspot ready. If the phone is also the hotspot, its battery failure removes that connection too; the laptop needs venue Wi-Fi, another hotspot, or the offline recording. Backup video downloaded locally, playable without a network, paused at the start in an accessible tab/player. **[NEED FROM SUNNY]** Record the full confirmed golden path around 11:00 PM, after integration. Keep the three source pictures on the laptop too.
- At this late-night event, the shop is closed. DEMO.md's hero cue “Open now” is conditional on actual hours. Show the real open/closed status. The empty-state line about 5 AM is only appropriate when the next opening is actually 5 AM.

## Timed run of show

| Time | Who / screen | Exact action | Sunny says |
| --- | --- | --- | --- |
| **0:00–0:09** | Sunny / slide 1 | Show the shop photo and story. | “My best friend's parents came from Cambodia. They've run Fresh Donuts & Deli in South Salt Lake for about 25 years.” |
| **0:09–0:15** | Sunny / slide 2; judges / phones | Advance to problems + **public QR**. Judges may scan now. | “No website to check what's left. Phone orders on paper. Scan this.” |
| **0:15–0:28** | Sunny / laptop ① | Scroll **hero** (real open/closed status) → **In the case now** (all Plenty) → **menu with photos** → **story** → **Get directions**. Show the directions button without leaving the demo tab. | “Menu, prices, story, directions. ‘In the case now’ shows what staff last confirmed. Watch it change.” |
| **0:28–0:43** | Sunny / phone **Case** | Tap **📷 Snap the case** → photograph picture **#1 full box** → accept the camera photo → wait about 5s for results. Start the slow-model fallback at 8s. | “For this demo, I'm photographing a prepared picture. In the shop, staff photograph the case.” |
| **0:43–0:53** | Sunny / phone | Show the **per-group results and confidence** → demonstrate **+/−** on one row, leaving the final count equal to the hand count → **Confirm & publish**. | “The AI proposes counts by group. Staff can correct every count before publishing.” |
| **0:53–0:58** | Sunny / laptop ①; judges / public site | Return attention to **In the case now**. Allow one **5-second poll** for the confirmed values and update timestamp. | [After it changes:] “The public page just updated.” |
| **0:58–1:10** | Sunny / phone, then laptop ① | **📷 Snap the case** → picture **#2 a few left** → review → **Confirm & publish**. Show **Cake donuts: Only 3 left** when that is the actual confirmed availability. | “A few left: customers see the actual low-stock number.” |
| **1:10–1:22** | Sunny / phone, then laptop ① | **📷 Snap the case** → picture **#3 empty** → review all four groups at zero → **Confirm & publish**. Show **Sold out for today, fresh again at 5 AM**, subject to the next-opening check above. | “An empty case becomes a sold-out notice before someone makes the trip.” |
| **1:22–1:40** | Sunny / laptop ② **Orders** | Click **🎙 From call notes** → **type or paste** `Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100` → **Draft with AI** → review the filled form (Maria, tomorrow 07:30, 12 glazed, 2 fritters, phone) → **Save**. Typing is an explicit DEMO.md option and is the default for this short run. | “The phone rings mid-rush. Messy notes become a draft order. Staff check it, then save.” |
| **1:40–1:45** | Sunny / laptop ② | Choose **Tomorrow** if needed → show the new card sorted by pickup time → tap its status chip **New → Ready**. | “Tomorrow's pickups, in one place. Ready means boxed.” |
| **1:45–2:05** | Sunny / slide 3 | Advance to the pipeline: **camera → OpenAI vision → strict JSON → confidence gate / human confirm → live site**. | “A photo goes to OpenAI vision. Strict JSON and schema validation constrain four group counts and confidence. Low confidence flags human review. Staff correct and confirm every photo before publishing. Next.js on Vercel serves the app.” |
| **2:05–2:18** | Sunny / slide 3 | Point to the storage / orders note. | “Redis stores confirmed counts. The public page polls every five seconds. Today's new orders hold stock. OpenAI also turns call notes into drafts that staff review and save.” |
| **2:18–2:30** | Sunny / slide 3 | Use the verified evaluation line below, or the default line here. | **Default without results:** “We compare model counts with hand counts on full, low, and empty pictures, and measure latency. Results need verification. Next, real-case testing with the family.” |
| **2:30–3:00** | Sunny / slide 4 | Show impact and the two prize names. Stop at 3:00. | “For customers, the goal is fewer wasted trips. For the family, less typing while serving a line. The owners never see an API key. Their interface is a camera and a text box. We built for a real Utah shop, with a family pilot ahead. That's democratizing AI. Best Commerce Hack and Best Use of AI.” |

**Evaluation replacement, only after checking `docs/eval.md`:** “On [N] hand-counted photos, [MODEL] achieved [DEFINED ERROR] with [DEFINED LATENCY]-second responses. We chose it over [COMPARISON MODEL] for [MEASURED REASON]. Real-case testing comes next.” **[NEED FROM SUNNY]** Actual model IDs, sample count, error metric/values, and latency measurement. Keep the filled line to about 30 words. Replace the entire default evaluation line, do not add time or read placeholders. Put the full two-model comparison in slide notes and judge answers.

**Story check:** “about 25 years” follows the brief's approximate figure, originally reported as of 2024. **[NEED FROM SUNNY]** Family approval and the preferred duration/story wording. If still unconfirmed, say “My best friend's parents run Fresh Donuts & Deli in South Salt Lake” and omit the duration and migration detail. A family quote may replace a sentence, never lengthen the opening.

## Failure cues: line + action

The 90-second path budgets roughly **5s per model count**, as in DEMO.md, with camera and polling time around it. Confirm that pace in rehearsal. Use a fallback once the failure is clear, and omit later repeated photo shots if a delay consumes their slot. Keep the **1:45** architecture transition and **3:00** finish. A recording must be introduced as a recording. Do not imply a failed or manual update was live AI output.

| Failure / trigger | Sunny says | Sunny does |
| --- | --- | --- |
| **Wi-Fi down**: a page or publish request fails | “The venue connection dropped. I'll switch networks. If it stays down, here's our recorded demo.” | Connect the laptop and phone to the prepared hotspot. Try the current action once. If connectivity is still unavailable after about 5s, play the **downloaded local backup video** from the corresponding point and narrate it. Judges' QR pages require their own working connection. A localhost server alone cannot make OpenAI work offline. |
| **Model wrong**: counts differ from the hand count | “That count needs a correction. This is why staff confirm before anything goes live.” | On the result rows, use **+/−** to enter the hand-counted values → **Confirm & publish** → show the public update. Never publish a known wrong count for the sake of the script. |
| **Model slow or failed**: no usable count after **8s**, or an error | “The AI is taking too long. Staff can still update the case manually.” | Use the **manual +/− controls on the Case screen**, set the verified values for the current picture, and publish using the screen's manual save/publish control. Label the result as manual. Do not apply a late AI result over it. If the pending UI blocks manual controls, switch to the pre-opened laptop Case screen; if that is blocked too, use the recording. Skip remaining repeated photo shots if needed. |
| **Order parser slow/wrong**: no correct draft after roughly **3s** | “Staff can review the draft or enter the order directly.” | Correct an editable draft before **Save**. If no draft arrives, use **New order**, fill the same fictional customer's date/time and items, then save. If that would pass 1:45, show the seeded board, explain the fallback, and move to slide 3. |
| **Phone dies / camera unavailable** | “The phone's out. The same staff screen works on the laptop.” | On laptop ② open **Case** → **📷 Snap the case** → select the matching prepared image file → review → **Confirm & publish**. Show laptop ①'s update, then restore laptop ② to **Orders**. This becomes a file-upload demo. If uploads are unavailable, use manual Case controls; if the laptop is unavailable too, use the recording on a prepared second device, or continue with slides and disclose that no live demo is available. |
| **Public update late**: no visible change after one poll | “The public page checks every five seconds.” | Verify publish succeeded, wait only within the current slot, then refresh laptop ① once. If it still fails, show the confirmed staff state, explain the public update failed, and continue. Do not claim judges' phones updated without seeing an update. |

The exact label of the **manual** save control is not specified in DEMO.md. **[NEED FROM SUNNY]** Confirm it in the integrated UI and replace that descriptive cue before rehearsal. The phone file picker and manual fallback also need one rehearsal on the actual browser.

## Optional features and final handoff

- **Case Cam (lane D):** use only after Sunny confirms it shipped and has been rehearsed. DEMO.md permits replacing the two later photo shots with Case Cam. It can publish automatically only when every group's confidence meets the configured threshold. If used, change “Staff correct and confirm every photo before publishing” to “The manual photo flow requires confirmation; Case Cam uses a confidence gate.” The core script stays with human confirmation.
- **Hold a dozen (lane E):** DEMO.md makes this conditional. It is omitted from the 90-second core path. Include only by replacing an existing demo action with a rehearsed, equally short sequence. After the empty-case demo, choose tomorrow if today is sold out. Never let an unrehearsed judge submission push the architecture beat past 1:45.
- **[NEED FROM SUNNY]** Family permission, approved photos, verified shop story and phone-order workflow, an exact approved family quote if available.
- **[NEED FROM SUNNY]** Notes from the 6:45 / 7:30 Redo talks, including speaker and actual wording, for a replacement architecture sentence. No attributed talk claims are invented here.
- **[NEED FROM SUNNY]** Final deployment URL / QR, A/B/C integration check, actual manual-save label, evaluation numbers, and optional-lane go/no-go.
- **Sunny's remaining event actions:** buy/bring demo donuts if desired; rehearse twice and record the offline backup around 11:00; keyboards down and team slip at **11:30 PM**; table with demo running at **11:35 PM**. Lane P's requested work cutoff is **10:15 PM Mountain**. No app verification or video recording is claimed by these documents.

Sources: [DEMO.md](DEMO.md), [PLAN.md](PLAN.md), [SHOP.md](SHOP.md), [EVENT.md](EVENT.md), [contracts](CONTRACTS.md), and [lane A](tasks/A-vision-confirm.md) / [lane C](tasks/C-order-board.md) briefs. Judge answers: [pitch/judge-qa.md](pitch/judge-qa.md).
