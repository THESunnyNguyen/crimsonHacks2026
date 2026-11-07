import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const script = path.resolve("scripts/merge-task.sh");
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "donut-merge-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, "main checkout");
  const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  execFileSync("git", ["init", "-q", "-b", "main", repo]);
  git("config", "user.name", "Workflow test");
  git("config", "user.email", "test@example.invalid");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", path.join(root, "no-hooks"));
  writeFileSync(path.join(repo, "base"), "base");
  git("add", "."); git("commit", "-qm", "base");
  const before = git("rev-parse", "HEAD");
  git("checkout", "-qb", "feature");
  writeFileSync(path.join(repo, "feature"), "feature");
  git("add", "."); git("commit", "-qm", "feature");
  const target = git("rev-parse", "HEAD");
  git("checkout", "-q", "main");
  const bin = path.join(root, "bin"); mkdirSync(bin);
  writeFileSync(path.join(bin, "npm"), '#!/bin/sh\nif [ "$1" = "$TEST_FAIL_STEP" ]; then exit 9; fi\nexit 0\n');
  chmodSync(path.join(bin, "npm"), 0o755);
  const run = (cwd = repo, extra = {}) => spawnSync("bash", [script, "feature"], { cwd, encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, ...extra } });
  return { root, repo, git, before, target, run };
}

test("rejects a lane worktree without changing either branch", (t) => {
  const f = fixture(t);
  const lane = path.join(f.root, "lane");
  f.git("worktree", "add", "-qb", "review", lane, "main");
  const result = f.run(lane);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /main worktree/);
  assert.equal(f.git("rev-parse", "main"), f.before);
  assert.equal(f.git("rev-parse", "review"), f.before);
});
for (const step of ["ci", "run"]) test(`aborts the merge when npm ${step} fails`, (t) => {
  const f = fixture(t);
  assert.notEqual(f.run(f.repo, { TEST_FAIL_STEP: step }).status, 0);
  assert.equal(f.git("rev-parse", "HEAD"), f.before);
  assert.equal(f.git("status", "--porcelain"), "");
});
test("preserves dirty main and refuses to merge", (t) => {
  const f = fixture(t);
  writeFileSync(path.join(f.repo, "base"), "user edit");
  assert.notEqual(f.run().status, 0);
  assert.equal(f.git("rev-parse", "HEAD"), f.before);
  assert.match(f.git("diff"), /user edit/);
});
test("preserves an existing merge even when its index has no diff", (t) => {
  const f = fixture(t);
  f.git("branch", "empty-branch");
  f.git("commit", "--allow-empty", "-qm", "main empty commit");
  f.git("checkout", "-q", "empty-branch");
  f.git("commit", "--allow-empty", "-qm", "branch empty commit");
  f.git("checkout", "-q", "main");
  f.git("merge", "--no-ff", "--no-commit", "empty-branch");
  assert.equal(f.git("status", "--porcelain"), "");
  const pending = f.git("rev-parse", "MERGE_HEAD");
  assert.notEqual(f.run().status, 0);
  assert.equal(f.git("rev-parse", "MERGE_HEAD"), pending);
});
test("commits a verified merge, then treats a repeated merge as a no-op", (t) => {
  const f = fixture(t);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.git("rev-parse", "HEAD^2"), f.target);
  const merged = f.git("rev-parse", "HEAD");
  assert.equal(f.run().status, 0);
  assert.equal(f.git("rev-parse", "HEAD"), merged);
});
