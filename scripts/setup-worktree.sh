#!/usr/bin/env bash
# Paradev workspace setup: copy git-ignored env files from the main checkout, install deps.
set -euo pipefail
main_wt="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
here="$(git rev-parse --show-toplevel)"
if [ "$main_wt" != "$here" ]; then
  for f in .env .env.local; do [ -f "$main_wt/$f" ] && cp "$main_wt/$f" "$here/$f" && echo "copied $f"; done
fi
[ -f package.json ] && npm install --silent && echo "deps installed"
echo "ready: $(git branch --show-current)"
