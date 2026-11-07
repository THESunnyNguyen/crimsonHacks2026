#!/usr/bin/env bash
# Merge a reviewed lane branch into main and prove the build passes. Usage: ./scripts/merge-task.sh <branch>
set -euo pipefail
branch="${1:?usage: merge-task.sh <branch>}"
cd "$(git rev-parse --show-toplevel)"
git checkout main && git pull --ff-only 2>/dev/null || true
git merge --no-ff "$branch" -m "Merge $branch"
[ -f package.json ] && npm install --silent && npm run build
echo "✅ merged $branch. Now: git push → check the production URL → run that lane's DEMO.md steps."
echo "   Broken? git revert -m 1 HEAD && git push"
