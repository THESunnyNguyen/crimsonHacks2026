import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { findTests } from "../../scripts/test.mjs";

test("discovers nested TypeScript tests without including browser specs", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "donut-discovery-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "vision"));
  for (const file of ["base.test.ts", "vision/count.test.ts", "flow.spec.ts"]) await writeFile(path.join(root, file), "");
  assert.deepEqual((await findTests(root)).map((file) => path.relative(root, file)), ["base.test.ts", "vision/count.test.ts"]);
});
