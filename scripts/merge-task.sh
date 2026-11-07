#!/usr/bin/env bash
# Run in the clean main checkout, after cross-review. Never pushes or deploys.
set -euo pipefail
branch="${1:?usage: merge-task.sh <reviewed-branch-or-sha>}"
cd "$(git rev-parse --show-toplevel)"
if [ "$(git branch --show-current)" != main ]; then
  echo "Run this command from the main worktree. No branch was changed." >&2
  exit 1
fi
for state in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply; do
  if [ -e "$(git rev-parse --git-path "$state")" ]; then
    echo "Finish the existing Git operation before merging; it was left untouched." >&2
    exit 1
  fi
done
if [ -n "$(git status --porcelain)" ]; then
  echo "Main must be clean before merging; preserve or commit existing changes first." >&2
  exit 1
fi
target="$(git rev-parse --verify --end-of-options "${branch}^{commit}")"
started_merge=false
abort_merge() {
  if [ "$started_merge" = true ] && git rev-parse -q --verify MERGE_HEAD >/dev/null; then
    git merge --abort
    echo "Verification failed; the pending merge was aborted." >&2
  fi
}
trap abort_merge EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
started_merge=true
git merge --no-ff --no-commit "$target"
if ! git rev-parse -q --verify MERGE_HEAD >/dev/null; then
  echo "Already integrated; no merge commit created."
  exit 0
fi
npm ci --no-audit --no-fund
npm run verify
git commit -m "Merge $branch"
trap - EXIT
echo "Verified and merged $target locally. No push or deployment was performed."
