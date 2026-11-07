# Launch board

| Phase | Time | Run | Tool · model · effort | Reviewed by |
|---|---|---|---|---|
| 1 Lock | 6:50–7:15 | Sunny reads `DEMO.md` + `CONTRACTS.md`, commits, pushes | human | — |
| Critique | 7:15–7:25 | Read-only risk pass on CONTRACTS + DEMO | strongest OpenAI reasoning model | Sunny |
| 2 Skeleton | 7:25–8:00 | **00** alone | Claude Code · Opus 5.5 · high | Sunny |
| 3 Fan-out | 8:00–9:30 | **A** first, then **B**, **C**, **F** | A: Claude Opus high · B: Claude Opus medium · C: Codex high · F: Codex medium | A, B ← Codex · C, F ← Claude |
| Mini-wave | 9:30–10:00 | **D**, **E** only if main is demoable | D: Claude Sonnet 5.5 high · E: Codex medium | D ← Codex · E ← Claude |
| 5 Harden | 10:00–10:30 | **H** alone | Codex high, then Claude `reviewer` | Claude |
| Freeze | 10:30 | `quickfix` only | Claude Haiku 5.5 low | — |

Merges to main: **~8:45 · ~9:20 · ~10:00 · ~10:30**. Process: `REVIEW.md`. Ownership: `docs/CONTRACTS.md`.
Concurrency cap: **2 Claude Opus lanes (A, B) + 2 Codex lanes (C, F)**. Codex runs on the OpenAI API credits, so it doesn't share Claude's rate limits.

---

# Paradev: step by step

## Step 0: one-time setup (7:15, ~10 min, while the critique runs)
1. **Commit and push the plan** from your main checkout: `git add -A && git commit -m "Lock plan" && git push`
2. **Local `.env`** in the main checkout: `STAFF_PIN`, `OPENAI_API_KEY`, and the model names (already filled in). **Leave out the `UPSTASH_*` vars locally**, so every worktree uses its own JSON files and agents never write to production data.
3. **Codex on API credits:** sign Codex in with your OpenAI API key, not your ChatGPT account (`codex login` has an API-key option; or export `OPENAI_API_KEY` in the shell Paradev launches from). Default effort in `~/.codex/config.toml`: `model_reasoning_effort = "high"`.
4. **Paradev:** add the repo. Set the workspace **setup script** to `./scripts/setup-worktree.sh`. Make **terminal presets** (launch commands):
   - `claude --agent lane-00` · `claude --agent lane-a` · `claude --agent lane-b` · `claude --agent lane-d` · `claude --agent reviewer`
   - `codex` (lanes C, E, F, H) · `codex -c model_reasoning_effort="medium"` (E, F)
5. **Network:** lanes A, C and F call the AI APIs from scripts. Allow network/shell when the agent asks (Codex: approve leaving the sandbox for those commands).
6. **Vercel + Upstash (human, in the browser):** import the GitHub repo in Vercel; add **Upstash Redis** from the Vercel Marketplace; add env vars in Vercel (including `UPSTASH_*`). This can wait until the skeleton is pushed.

## Step 1: critique pass (7:15–7:25)
New Paradev workspace `critique` → Codex (strongest model, effort high) → paste:
> Read AGENTS.md, docs/CONTRACTS.md, docs/DEMO.md and docs/tasks/*. Don't edit files. Find only the problems that would cause bugs, merge conflicts or a failed live demo in a parallel build where each lane owns separate files. Max 10 items, most severe first, each with a one-line fix. Don't redesign anything.

Apply only the fixes you understand (edit on main), commit, push. Delete the workspace.

## Step 2: skeleton (7:25–8:00)
1. Workspace `00-skeleton` → preset `claude --agent lane-00` → first message:
   > Do docs/tasks/00-skeleton.md. First read AGENTS.md, docs/CONTRACTS.md and docs/DEMO.md. When Done-when passes, commit and report.
2. Watch it. Answer questions fast. Meanwhile: finish Vercel setup, text your friend, shoot your 3 donut-box pictures.
3. Review in Paradev's **Changes** view (quick look: does `/staff` render with two tabs, and does `/` show the real menu?). Run it in the in-app browser.
4. Merge to main from the main checkout: `./scripts/merge-task.sh <skeleton-branch>` → `git push` → Vercel deploys → run `npm run seed` against prod → open the URL on your phone. **The QR code URL is now fixed:** put it on slide 2.

## Step 3: fan out (8:00–9:30), all workspaces from the new main
Create in this order (A first; it's the riskiest):
| Workspace | Preset | First message |
|---|---|---|
| `A-vision` | `claude --agent lane-a` | `Do docs/tasks/A-vision-confirm.md. First read AGENTS.md, docs/CONTRACTS.md and docs/DEMO.md. Only edit the files your lane owns. When Done-when passes, commit and report.` → then drop your 3 pictures + `expected.json` into its `test-images/` |
| `B-site` | `claude --agent lane-b` | same, with `B-public-site.md` |
| `C-orders` | `codex` | same, with `C-order-board.md` |
| `F-assets` | `codex -c model_reasoning_effort="medium"` | same, with `F-menu-assets.md` |

While they run:
- **Watch A the most.** Check its eval table as soon as it exists. If counts are bad by 8:45, simplify (total + levels only) rather than sink time.
- Each workspace runs its own `npm run dev`; Paradev detects the port, so preview each in the in-app browser. Use **Design mode** on B to point at elements you want changed.
- When an agent stalls or drifts: comment on its diff lines in **Changes** (that goes straight back to the agent), or tell it to re-read its brief.

## Step 4: cross-review and merge (≈ every 45 min: 8:45, 9:20)
For each lane that reports done:
1. In **that** workspace, open a second agent session of the *other* tool: Codex for A/B, `claude --agent reviewer` for C/F. Paste the prompt from `REVIEW.md`.
2. **FIX FIRST** → paste the list to the authoring agent → re-review only if the fixes were big.
3. **MERGE** → main checkout: `./scripts/merge-task.sh <branch>` → `git push` → phone check on the production URL.
4. Broken? `git revert -m 1 HEAD && git push`, immediately. Main stays demoable.
5. Tell the still-running lanes: `git merge main`, then continue.
Suggested merge order: **F** (no-risk assets) → **B** → **C** → **A** (or A first if it's solid early; it's the demo's core).

## Step 5: 9:30 checkpoint, mini-wave
Is the DEMO.md golden path working end to end on the production URL?
- **Yes** → workspaces `D-casecam` (`claude --agent lane-d`) and `E-preorder` (`codex -c model_reasoning_effort="medium"`). Same first-message pattern. Hard stop: merged by 10:00 or dropped.
- **No** → no new lanes. Point agents at what's broken.

## Step 6: harden and freeze (10:00–10:30)
1. Workspace `H-harden` → `codex` → `Do docs/tasks/H-harden.md …`
2. Then `claude --agent reviewer` on its branch → merge → push.
3. **10:30 freeze.** Only `claude --agent quickfix` on main for copy, prices, nudges. Close all other workspaces.
4. 11:00: run `npm run seed:demo`, rehearse DEMO.md twice, record the backup video.

---

## Without Paradev (plain terminals)
```bash
./scripts/kickoff.sh 00            # Claude preset, own worktree + branch
./scripts/kickoff.sh A
./scripts/kickoff.sh C codex
./scripts/merge-task.sh task/A-vision-confirm
```
