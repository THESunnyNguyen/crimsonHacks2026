import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

test("handoff refresh preserves progress and refuses to overwrite an older format", (t) => {
  const repo = mkdtempSync(path.join(tmpdir(), "donut-handoff-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Test"); git("config", "user.email", "test@example.invalid");
  git("-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "--allow-empty", "-qm", "base");
  const run = () => spawnSync(process.execPath, [path.resolve("scripts/handoff.mjs"), "A", "HEAD"], { cwd: repo, encoding: "utf8" });
  assert.equal(run().status, 0);
  const file = path.join(repo, "docs/handoffs/A.md");
  writeFileSync(file, readFileSync(file, "utf8") + "\nHuman checkpoint: keep this.\n");
  assert.equal(run().status, 0);
  assert.match(readFileSync(file, "utf8"), /Human checkpoint: keep this/);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, "Old format: important unfinished work\n");
  assert.notEqual(run().status, 0);
  assert.equal(readFileSync(file, "utf8"), "Old format: important unfinished work\n");
});
