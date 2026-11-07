# Demo script: click by click (3:00)

## Stage setup
| Screen | Shows |
|---|---|
| **Monitor 2** | Slides: photos, the why, the plot (`P-pitch` lane) |
| **Laptop** | Browser, two tabs: **① Public site** (DevTools phone view or narrow window) · **② `/staff`** (Orders tab open, PIN already entered) |
| **Sunny's phone** | `/staff`, **Case** tab, PIN already entered: the camera |
| **Judges' phones** | Public site via the QR code on slide 2 |
| **Props** | 3 donut-box pictures (printed, or on a tablet): **#1 full box** · **#2 a few left** (≤6 in one group) · **#3 empty box** |

Reset before going on: run `npm run seed:demo` (stock: Plenty everywhere; orders: 1 sample). Hotspot on. Backup video open in a tab.

## Script
| Time | Screen | Click / action | Say |
|---|---|---|---|
| 0:00 | Slide 1 | Shop photo | "My best friend's parents came from Cambodia and have run Fresh Donuts & Deli for 25 years. The Tribune says some call it the best in Utah." |
| 0:20 | Slide 2 | Problems + **QR code** | "No website. Sold out by early afternoon, and you can't know before you drive over. Phone orders on paper. Scan this." |
| 0:30 | Laptop ① | Scroll: hero (**Open now**) → **In the case now** (all Plenty) → menu with photos → story → **Get directions** | "Menu, prices, story, directions. And this section is live." |
| 0:50 | Phone | Case tab → **📷 Snap the case** → photo of picture **#1** → wait ~5s | "Staff don't type anything. They take a photo." |
| 1:00 | Phone | Results list (per group, confidence highlighted) → tweak one with **+/−** → **Confirm & publish** | "The AI counts by type. A human confirms, because the owner is always in control." |
| 1:10 | Laptop ① + judges' phones | Section updates by itself; "Updated just now · camera" | "Your phones just updated." |
| 1:20 | Phone | Snap **#2** → Confirm | Site shows **"Cake donuts: Only 3 left."** "Low stock shows a real number, so people know to hurry." |
| 1:35 | Phone | Snap **#3** → Confirm | Big **"Sold out for today, fresh again at 5 AM"** banner. "No more wasted trips." |
| 1:50 | Laptop ② | Orders tab → **🎙 From call notes** → hold mic and say (or type): *"Maria 7:30 tomorrow a dozen glazed and 2 fritters 801-555-0100"* → **Draft with AI** → form fills → **Save** | "The phone rings mid-rush. Messy notes in, clean order out. No sticky notes." |
| 2:10 | Laptop ② | New card on the board, sorted by pickup time; tap **New → Ready** | "Everything for tomorrow morning, in one place." |
| 2:15 | *[if lane E shipped]* Judges' phones | "Hold a dozen" → judge submits → card pops on Laptop ② | "Customers can hold a dozen too, pay at pickup." |
| 2:15–2:45 | Slide 3 | How it's built | "Photo → OpenAI vision → strict JSON → confidence check and human confirm → live site. Orders held from stock until boxed. Eval: within ±N on our test photos." |
| 2:45 | Slide 4 | Close | "The owners never see an API key. The interface is a camera. That's what democratizing AI looks like. Best Commerce Hack, Best Use of AI." |

## Fallbacks
- AI call fails or is slow → **+/−** manual adjust on the same screen (say "and when the AI's down, it still works").
- Wi-Fi dies → phone hotspot; worst case, play the backup video.
- *[if lane D shipped]* swap 1:20–1:35 for Case Cam auto-snapping the pictures.
