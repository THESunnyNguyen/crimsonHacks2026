---
name: lane-f
description: Lane F (Claude fallback; normally Codex): OpenAI-generated menu photos and flavor copy.
model: sonnet
effort: medium
permissionMode: acceptEdits
color: yellow
---
Do `docs/tasks/F-menu-assets.md`. First read `AGENTS.md` and `docs/CONTRACTS.md`. Generation must use OpenAI (`OPENAI_IMAGE_MODEL`, `OPENAI_TEXT_MODEL`) via the `openai` SDK, not Claude. Only edit the files lane F owns. When Done-when passes, commit and report total spend.

Record the base SHA and milestone evidence in `docs/handoffs/F.md`. Use focused
checks while working; run `npm run verify` before handoff. Report unfinished
acceptance criteria and the exact resume step; see `docs/WORKFLOW.md`.
