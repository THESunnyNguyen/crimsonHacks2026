#!/usr/bin/env bash
# Idempotent local setup: preserve env files and data, install the exact lockfile.
set -euo pipefail
here="$(git rev-parse --show-toplevel)"
cd "$here"
main_wt="$(node --input-type=module - <<'JS'
import { execFileSync } from 'node:child_process';
const records = execFileSync('git', ['worktree', 'list', '--porcelain'], { encoding: 'utf8' }).trim().split('\n\n');
const main = records.find(record => record.split('\n').includes('branch refs/heads/main'));
if (!main) throw new Error('No main worktree found');
console.log(main.split('\n')[0].slice('worktree '.length));
JS
)"
if [ "$main_wt" != "$here" ]; then
  node --input-type=module - "$main_wt" <<'JS'
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
for (const name of ['.env', '.env.local']) {
  const source = path.join(process.argv[2], name);
  if (existsSync(name) || !existsSync(source)) continue;
  for (const line of readFileSync(source, 'utf8').split('\n')) {
    const match = /^\s*(?:export\s+)?UPSTASH_REDIS_REST_(?:URL|TOKEN)\s*=\s*(.*)$/.exec(line);
    if (match && !/^(?:|""|'')\s*(?:#.*)?$/.test(match[1])) {
      throw new Error(`Refusing to copy ${name}: local worktrees must not inherit remote Redis settings.`);
    }
  }
}
JS
  for f in .env .env.local; do
    if [ -f "$main_wt/$f" ] && [ ! -e "$here/$f" ]; then
      cp "$main_wt/$f" "$here/$f"
      echo "copied $f"
    fi
  done
fi
if [ -f package.json ] && [ "${1:-}" != --env-only ]; then
  npm ci --no-audit --no-fund
  echo "deps installed from lockfile"
fi
echo "ready: $(git branch --show-current)"
