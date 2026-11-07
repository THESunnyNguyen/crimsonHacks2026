# Likely judge questions

For Redo's commerce / AI Ops engineers, sales engineer, staff engineer, and VP Eng, as listed in [EVENT.md](../EVENT.md). These are anticipated questions, not attributed statements. Answers reflect the repo's contracts and briefs; this pitch worktree has no app code or evaluation results, so verify shipped behavior before answering in the present tense.

| Likely question | One-line answer | Repo grounding |
| --- | --- | --- |
| Why this Utah shop, and where is the commerce value? | My best friend's parents run it in South Salt Lake, and the goal is fewer wasted trips plus one phone-order board, with business impact still to measure. | [PLAN](../PLAN.md), [SHOP](../SHOP.md), [DEMO](../DEMO.md) |
| Why AI, and why count groups instead of flavors? | Photos propose counts for four visually broader groups and notes become order drafts, reducing entry work while staff keep manual control. | [PLAN](../PLAN.md), [CONTRACTS](../CONTRACTS.md), [C](../tasks/C-order-board.md) |
| What stops a wrong count, and is confidence an accuracy score? | JSON validation checks structure, confidence below 0.8 flags review rather than calibrated accuracy, and the core flow saves nothing until staff confirm. | [CONTRACTS](../CONTRACTS.md), [A](../tasks/A-vision-confirm.md) |
| How accurate and fast is it, and why that model? | Verified results are pending the two-model, hand-counted evaluation; under 8s is the target, and these staged demo pictures still need real-case follow-up. | [A](../tasks/A-vision-confirm.md), [DEMO](../DEMO.md) |
| How live is “live,” and how do holds work? | Clients poll every 5s and compute available as max(0, confirmed count minus today's new-order holds), with tomorrow's orders excluded from today's holds. | [CONTRACTS](../CONTRACTS.md) |
| Could Ready make stock reappear or two orders oversell? | Ready releases the hold, so staff must update the physical count after boxing; atomic reservation protection and automatic count deduction are not established by these docs. | [CONTRACTS](../CONTRACTS.md), [C](../tasks/C-order-board.md) |
| What happens when OpenAI or the network fails? | Manual counts and order entry cover AI failures while connectivity remains, and the event demo falls back to a clearly labeled offline recording if the network fails. | [DEMO](../DEMO.md), [A](../tasks/A-vision-confirm.md), [C](../tasks/C-order-board.md) |
| How is it built, and what is the security boundary? | The contract specifies Next.js/TypeScript on Vercel, Redis or local JSON storage, server-side OpenAI helpers, and PIN-authenticated staff routes, which is a demo boundary needing production hardening. | [AGENTS](../../AGENTS.md), [CONTRACTS](../CONTRACTS.md), [H](../tasks/H-harden.md) |
| What personal data reaches the model, and what does it cost? | Call-note parsing can include a name and phone number, so retention, production privacy terms, and measured cost per update still need review rather than an invented claim. | [DEMO](../DEMO.md), [CONTRACTS](../CONTRACTS.md), [PLAN](../PLAN.md) |
| Is the family using it, and what comes next? | This is a concept demo with a family pilot ahead, where we would test real-case photos, correction effort, and usefulness during service. | [SHOP](../SHOP.md), [PLAN](../PLAN.md) |

**[NEED FROM SUNNY]** Replace the accuracy answer with the checked `docs/eval.md` result: “On [N] photos, [MODEL] had [DEFINED ERROR] and [DEFINED LATENCY], versus [COMPARISON RESULT], so we chose it for [MEASURED REASON].” Confirm the family's permission and current adoption status before updating the pilot answer.

**Scope reminders:** AI in the app is **OpenAI only**; coding agents are separate from the runtime. Do not claim Case Cam, public preorders, a second model, exact model IDs, automatic overselling prevention, production readiness, or a family endorsement unless Sunny confirms the integrated result. Generated menu photos must carry the contract's **Illustration** label.
