# Fresh Donuts & Deli: four-slide content

Four slides total. Monitor 2 carries the story while the laptop carries the demo. Speaker lines and exact clicks live in [demo-script.md](../demo-script.md). Notes and `[NEED FROM SUNNY]` markers below are production instructions, not text to project.

## Slide 1: Fresh Donuts & Deli

**Display:** 0:00–0:09.

**On slide**

> Fresh Donuts & Deli
>
> A family donut shop in South Salt Lake
>
> My best friend's parents. About 25 years behind the counter.

**Visual:** one large real shop or family photo. Keep the title and story readable beside it. **[NEED FROM SUNNY]** Permission-cleared family/shop photo and approval of the personal story, names if desired, and approximate years in business. Until verified, shorten the last line to “My best friend's parents run this shop.”

**Optional quote:** **[NEED FROM SUNNY]** One exact, approved family sentence about the daily problem, with the speaker's preferred attribution. Replace the last story line with it. Omit the quote entirely if none arrives.

**Speaker notes:** Sunny explains the personal connection. The brief says the owners emigrated from Cambodia. Confirm that they want that detail shared before using it. No invented family dialogue or measured business outcomes.

**Source notes:** [SHOP.md](../SHOP.md), [PLAN.md](../PLAN.md). SHOP.md attributes recognition to Salt Lake Tribune coverage (September 30, 2024) and Mashed via iHeart (2022). Optional credibility copy, if Sunny wants it: “Featured by The Salt Lake Tribune in 2024.” Keep “best” claims attributed rather than presenting an official award. Prefer family photos. If a Tribune photo is used in slides under the lane brief, show **“Photo: Bethany Baker / The Salt Lake Tribune”** visibly and retain the source URL from SHOP.md. Do not move it onto the website.

## Slide 2: Know what's left before the drive

**Display:** 0:09–1:45. Leave the QR visible throughout the live demo.

**On slide**

> Know what's left before the drive
>
> No website to check the case
>
> A sellout can mean a wasted trip
>
> Phone orders live on paper
>
> Scan to see the public site
>
> [LARGE QR TO FINAL PUBLIC URL]
>
> [READABLE PUBLIC URL]

**Visual:** the QR should dominate the available space and have a clear quiet border. Test it from the back of the room. **[NEED FROM SUNNY]** Final public HTTPS URL. Generate the actual QR only after that URL is confirmed, and test it from a separate phone. Use the public `/` route, not `/staff`, localhost, or a preview requiring login. This Markdown contains the placement specification, not a working QR.

**Speaker notes:** Say “Scan this,” then begin the public-page scroll. The phone-order workflow and specific sellout time still need family confirmation. The default wording avoids claiming the shop sells out at a measured time every day. No payment or reservation guarantee is implied by the public inventory.

**Source notes:** [DEMO.md](../DEMO.md), [SHOP.md](../SHOP.md), [PLAN.md](../PLAN.md). Public stock is a confirmed snapshot refreshed by polling, not a continuous sensor feed.

## Slide 3: How the case reaches the site

**Display:** 1:45–2:30.

**On slide**

> How the case reaches the site
>
> Camera → OpenAI vision → strict JSON → confidence gate / human confirm → live site
>
> Four stock groups. Staff correct and publish.
>
> Next.js + TypeScript on Vercel
>
> Redis in production. Public updates checked every 5 seconds.
>
> Call notes → OpenAI draft → staff review → order board
>
> Today's new orders subtract held quantities from available stock.

**Visual:** the requested camera-to-site pipeline is the main element. Put the implementation and order notes below in smaller supporting text. If the slide becomes crowded, keep the pipeline and hold rule on the slide and move the stack/order-parsing lines into speaker notes.

**Speaker notes:**

- The confidence gate in the core demo is a **review cue**, followed by human confirmation for every photo. Lane A highlights rows below **0.8**. Strict JSON and schema validation constrain structure. They do not prove a count is correct, and a model confidence score is not a measured accuracy percentage.
- Inventory persists only after confirmation. The counting endpoint returns an unsaved proposal. Call-note parsing also produces an unsaved draft. Show these as two separate uses of OpenAI.
- Available stock is `max(0, physical count − today's new-order holds)`. Tomorrow's sample order does not reduce today's public count. **Ready** releases a hold when boxed. Staff must keep physical counts current after removing donuts. Do not imply automatic physical-count deduction or proven prevention of overselling.
- **[NEED FROM SUNNY]** Eval numbers from `docs/eval.md`: selected actual model ID, comparison model, number of photos, defined per-group error, and measured latency. Insert one concise evidence line only after checking the results: “On [N] hand-counted photos: [DEFINED ERROR]; [DEFINED LATENCY] seconds.” Until then, omit numerical claims and say “Staged-photo evaluation still needs verification.” The lane's **<8s** counting and **<3s** parsing goals are targets, not results.
- **[NEED FROM SUNNY]** Redo-talk notes from Brendon at 6:45 and Cody at 7:30. Replace a generic architecture sentence with one accurately attributed takeaway and its connection to this design. Do not guess their vocabulary or imply endorsement.
- Optional Case Cam has a different gate: every confidence must meet `CASECAM_MIN_CONFIDENCE` before automatic publish. Mention it only if it shipped and passed rehearsal. Optional second-opinion counting is also excluded from default claims.

**Source notes:** [CONTRACTS.md](../CONTRACTS.md), [lane A](../tasks/A-vision-confirm.md), [lane C](../tasks/C-order-board.md), [lane D](../tasks/D-case-cam.md). These describe intended behavior. This pitch branch has no app implementation to verify. Actual model IDs are checked by the integration owner, so the slide intentionally says “OpenAI vision” without promising a model name.

## Slide 4: AI the family can use

**Display:** 2:30–3:00.

**On slide**

> AI the family can use
>
> Customers check the case before the trip.
>
> Staff confirm a photo and review an order draft.
>
> Next: test with the family in the real shop.
>
> Best Commerce Hack
>
> Best Use of AI
>
> Concept demo, not affiliated.

**Visual:** generous space for the close and the two prize names. No extra feature list. A second distinct family photo can be used if approved, but is not necessary.

**Speaker notes:** Sunny closes with “The owners never see an API key. Their interface is a camera and a text box.” Frame fewer wasted trips and less typing as the intended impact. The family pilot has not been demonstrated in this worktree. Avoid revenue, time-savings, adoption, or accuracy percentages until measured.

**Source notes:** [PLAN.md](../PLAN.md) for democratizing AI and prize targeting, [EVENT.md](../EVENT.md) for the official **Best Commerce Hack** and **Best Use of AI** names, and [AGENTS.md](../../AGENTS.md) for the concept-demo disclosure.

## Sunny's assembly checklist

- **[NEED FROM SUNNY]** Approved photo(s), permission, verified family story, and optional exact family quote.
- **[NEED FROM SUNNY]** Final public URL, generated QR, and scan test from a separate phone.
- **[NEED FROM SUNNY]** Actual Redo-talk notes and checked evaluation numbers. Remove unresolved placeholders from the projected slides rather than reading them.
- Check slide 3 against the integrated app and rehearse the 15s / 90s / 45s / 30s timing. Keep the slide count at four. This deliverable is slide content in Markdown, not an exported presentation.
