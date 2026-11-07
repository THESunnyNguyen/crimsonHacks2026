#!/usr/bin/env bash
# Plain-terminal alternative to Paradev: one lane = one worktree + branch + agent.
# Usage: ./scripts/kickoff.sh <00|A|B|C|D|E|F|H> [claude|codex] [base-ref]
set -euo pipefail
id="${1:?usage: kickoff.sh <lane> [claude|codex] [base-ref]}"; tool="${2:-claude}"; base="${3:-main}"
case "$id" in 00|A|B|C|D|E|F|H) ;; *) echo "Unknown lane: $id" >&2; exit 1;; esac
case "$tool" in claude|codex) ;; *) echo "Unknown tool: $tool" >&2; exit 1;; esac
root="$(git rev-parse --show-toplevel)"
base_sha="$(git rev-parse --verify --end-of-options "${base}^{commit}")"
brief="$(cd "$root/docs/tasks" && printf '%s\n' "$id"-*.md)"; [ -f "$root/docs/tasks/$brief" ] || { echo "no brief for $id"; exit 1; }
name="${brief%.md}"; branch="task/${name}"; wt="$(dirname "$root")/ch-worktrees/${name}"
if [ -n "$(git -C "$root" status --porcelain -- docs .claude AGENTS.md CLAUDE.md scripts)" ]; then
  echo "Commit shared instructions before starting a new lane; preserve unrelated changes." >&2; exit 1
fi
mkdir -p "$(dirname "$wt")"
if [ ! -d "$wt" ]; then
  if git -C "$root" show-ref --quiet "refs/heads/${branch}"; then git -C "$root" worktree add "$wt" "$branch"
  else git -C "$root" worktree add -b "$branch" "$wt" "$base_sha"; fi
fi
cd "$wt" && ./scripts/setup-worktree.sh
if [ -f scripts/handoff.mjs ] && [ ! -f "docs/handoffs/$id.md" ]; then
  npm run handoff -- "$id" "$base_sha"
fi
prompt="Complete docs/tasks/${brief}. Follow AGENTS.md and relevant contract sections. Use docs/handoffs/$id.md if present; base reference for a new lane: $base_sha. Only edit owned files. Verify observable acceptance criteria, update the handoff at milestones, and commit verified increments. Before handoff run npm run verify; record evidence and remaining work. No main merge or deployment unless separately authorized."
lower="$(echo "$id" | tr '[:upper:]' '[:lower:]')"
agent="lane-${lower}"; [ "$id" = "H" ] && agent="harden"
if [ "$tool" = "codex" ]; then exec codex -c model_reasoning_effort="high" "$prompt"; else exec claude --agent "$agent" "$prompt"; fi
