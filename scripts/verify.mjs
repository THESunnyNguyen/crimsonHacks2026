import { execFileSync } from "node:child_process";
import { spawnManaged } from "./process.mjs";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const exists = (file) => access(file).then(() => true, () => false);
const directory = path.join(".artifacts", "verify", `${Date.now()}-${randomUUID().slice(0, 6)}`);
await mkdir(directory, { recursive: true });
const report = {
  branch: git("branch", "--show-current"),
  commit: git("rev-parse", "HEAD"),
  workingTree: git("status", "--short"),
  startedAt: new Date().toISOString(),
  steps: [],
};
const commands = [["lint"], ["test"], ["build"]];
if (await exists("content/menu-copy.json") && await exists("scripts/gen-menu-assets.ts")) {
  commands.push(["gen:assets", "--", "--validate"]);
}
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "", OPENAI_API_KEY: "", VERCEL: "" };
for (const args of commands) {
  const log = path.join(directory, `${args[0].replaceAll(":", "-")}.log`);
  const output = createWriteStream(log);
  const started = Date.now();
  const code = await new Promise((resolve) => {
    const child = spawnManaged("npm", ["run", ...args], { env, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.pipe(output, { end: false });
    child.stderr.pipe(output, { end: false });
    child.on("error", (error) => output.write(`${error.message}\n`));
    child.on("close", (code) => {
      if (child.interruptedSignal) report.interrupted = child.interruptedSignal;
      output.end(() => resolve(child.interruptedSignal ? 1 : code ?? 1));
    });
  });
  report.steps.push({ command: `npm run ${args.join(" ")}`, code, seconds: (Date.now() - started) / 1000, log });
  console.log(`${code === 0 ? "PASS" : "FAIL"} ${report.steps.at(-1).command} (${report.steps.at(-1).seconds.toFixed(1)}s) — ${log}`);
  if (code !== 0) {
    console.error((await readFile(log, "utf8")).split("\n").slice(-60).join("\n"));
    process.exitCode = 1;
    break;
  }
}
report.finishedAt = new Date().toISOString();
report.passed = report.steps.length === commands.length && report.steps.every((step) => step.code === 0);
await writeFile(path.join(directory, "result.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Evidence: ${directory}/result.json`);
