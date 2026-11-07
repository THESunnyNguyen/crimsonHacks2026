#!/usr/bin/env bash
# Plain-terminal alternative to Paradev: one lane = one worktree + branch + agent.
# Usage: ./scripts/kickoff.sh <00|A|B|C|D|E|F|H> [claude|codex]
set -euo pipefail
id="${1:?usage: kickoff.sh <lane> [claude|codex]}"; tool="${2:-claude}"
root="$(git rev-parse --show-toplevel)"
brief="$(cd "$root/docs/tasks" && ls | grep "^${id}-" | head -1)"; [ -n "$brief" ] || { echo "no brief for $id"; exit 1; }
name="${brief%.md}"; branch="task/${name}"; wt="$(dirname "$root")/ch-worktrees/${name}"
if [ -n "$(git -C "$root" status --porcelain -- docs .claude AGENTS.md CLAUDE.md scripts)" ]; then
  echo "⚠️  Commit the plan first (agents branch from main): git add -A && git commit -m 'Lock plan' && git push"; exit 1
fi
mkdir -p "$(dirname "$wt")"
if [ ! -d "$wt" ]; then
  if git -C "$root" show-ref --quiet "refs/heads/${branch}"; then git -C "$root" worktree add "$wt" "$branch"
  else git -C "$root" worktree add -b "$branch" "$wt" main; fi
fi
cd "$wt" && ./scripts/setup-worktree.sh
prompt="Do docs/tasks/${brief}. First read AGENTS.md, docs/CONTRACTS.md and docs/DEMO.md. Only edit the files your lane owns. When Done-when passes, commit and report."
lower="$(echo "$id" | tr '[:upper:]' '[:lower:]')"
agent="lane-${lower}"; [ "$id" = "H" ] && agent="harden"
if [ "$tool" = "codex" ]; then exec codex -c model_reasoning_effort="high" "$prompt"; else exec claude --agent "$agent" "$prompt"; fi
