# Fresh Donuts & Deli — three-minute demo

Run of show for Sunny. The click sequence follows `docs/DEMO.md`; optional Case
Cam and customer pre-orders are omitted. Target finish: **3:00**. Rehearse aloud
with a timer; the timings below are cues, not a measured rehearsal result.

## Before the timer

- Laptop: public site in one tab; `/staff` → Orders in another, already unlocked.
- Phone: `/staff` → Case, already unlocked. Keep the full, low and empty box
  pictures within reach. Confirm their expected counts before presenting.
- Monitor: four slides — family/shop, problem + QR, how it works, close. Use
  a permitted family photo or the shop name in text; no Tribune photos.
- Put the **verified public URL** in the QR. Test it on Sunny's phone over mobile
  data. Do not put a placeholder URL on the slide.
- Ask the coordinator to reset the intended demo environment. `npm run seed:demo`
  resets the local worktree by default; do not run it blindly against remote
  storage. Begin with Plenty in every group and one sample order.
- Keep the hotspot ready and the downloaded backup video open locally. Turn
  notifications off. Set volume deliberately; the board may chime.
- The hero uses Denver opening hours. At tonight's rehearsal it correctly says
  **Closed**; don't change the clock or claim the shop is currently open.

## Exact cues and spoken lines

| Time | Sunny does | Sunny says |
| --- | --- | --- |
| 0:00–0:20 | Slide 1: shop/family | “My best friend's parents came from Cambodia and have run Fresh Donuts & Deli in South Salt Lake for about 25 years. This is a family business people love. We wanted useful AI to fit into their day.” |
| 0:20–0:30 | Slide 2: problem + QR | “Customers can drive over after the donuts sell out. Phone orders become scraps of paper. Scan this to see what changes.” |
| 0:30–0:50 | Public tab: hero → In the case now → menu → story → Get directions; return to case | “Here's the menu, real prices, the shop's story, and directions. Generated menu pictures are labeled Illustration. This section shows what's available right now.” |
| 0:50–1:00 | Phone: Snap the case → full-box picture; wait for counts | “Staff start with something familiar: take a photo of the case.” |
| 1:00–1:10 | Point to group confidence; correct one count with +/−; Confirm & publish | “The AI counts by type. The owner checks it, corrects it, and decides when to publish.” |
| 1:10–1:20 | Public tab: point to changed cards and camera update label | “Your phones update automatically. Counting alone never changes the public stock; confirmation does.” |
| 1:20–1:35 | Phone: Snap low-box picture; verify cake count is 3; Confirm & publish. Show public Cake card | “Now there are only three cake donuts left. Low stock shows the number, so people can decide before making the trip.” |
| 1:35–1:50 | Phone: Snap empty-box picture; confirm all four groups are 0; publish. Show public sold-out banner | “And when the case is empty, the site says sold out. No more wasted trips.” |
| 1:50–2:10 | Laptop staff tab: Orders → From call notes → type prepared line below → Draft with AI → review → Save order | “During a rush, messy phone notes become a clean draft. Staff check the name, pickup time, and quantities before saving. No sticky notes.” |
| 2:10–2:15 | Tomorrow board: point to Maria's 7:30 card; New → Ready (boxed) | “Tomorrow's orders, in pickup order. This one's boxed and ready.” |
| 2:15–2:45 | Slide 3: photo → OpenAI → structured counts → staff check → live site; notes → draft → save | “OpenAI turns a photo or messy notes into structured information. Staff stay in control. Today's unboxed orders are held from the public stock. We test the publish and save boundaries separately from live model accuracy. If AI is unavailable, staff can still enter counts and orders by hand.” |
| 2:45–3:00 | Slide 4: shop name + public URL | “The owners never need to see an API key. Their interface is a camera and a short form. That's our approach to democratizing AI for a Utah small business: help people serve customers. Best Commerce Hack and Best Use of AI.” |

Paste/type this exact call note (typing is the dependable stage path; use the
microphone only after testing it on the actual phone):

> Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100

Check the draft before Save: Maria; tomorrow in America/Denver; 07:30;
12 glazed; 2 fritters; phone 801-555-0100. Do not announce a successful parse
until the form actually contains those values. The draft is unsaved until Save.

## If something slows down

- **Count is wrong:** correct it in the review panel and say, “This is why the
  owner confirms.” Don't conceal a correction to make the model appear better.
- **Counting fails or consumes the next cue:** switch to manual counts and
  publish the known picture counts. Say, “When AI is unavailable, staff can
  still update the case.” Keep the full → low → empty sequence.
- **Parsing fails:** create the same order with New order; say, “Staff can enter
  it directly too.” Show Save and Ready. Don't claim a manual entry was AI.
- **Public polling is slow:** give it one five-second polling cycle. Point to the
  phone's publish confirmation while waiting; never say judges' phones updated
  before observing an update yourself.
- **Network fails:** try the hotspot once, then play the downloaded video. Say,
  “Here's our recorded walkthrough.” If the video's banner says fixture AI,
  add, “This rehearsal uses fixed AI responses; the real interface and saving
  behavior are shown.” A fixture video does not demonstrate model accuracy.

## Evidence language

Do not say “within ±N,” “under five seconds,” or “accurate on our test photos”
without measured evidence in `docs/eval.md`. A single real photo with uncertain
group labels is a limited case study, not a benchmark. Keep any measured result
specific to its photo, model and run. The current spoken script makes no numeric
accuracy or latency claim.

Ready/boxed stock accounting is awaiting Sunny's decision. The script only
claims that today's **unboxed** orders are held. Maria's demo order is tomorrow;
advancing it must not be described as changing today's available stock.
