import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { randomInt } from "node:crypto";

if (Number(process.versions.node.split(".")[0]) < 22) {
  throw new Error("Demo checks require Node.js 22 or newer (see README). Select Node 22, then rerun npm run test:demo.");
}

// Never accepts an existing server URL. All mutation happens in a disposable
// snapshot; the caller's .env and data/*.local.json are deliberately excluded.
const root = await realpath(process.cwd());
const evidenceRoot = path.join(root, ".artifacts", "demo");
await mkdir(evidenceRoot, { recursive: true });
const evidence = await mkdtemp(path.join(evidenceRoot, "run-"));
const app = path.join(evidence, "app");
await mkdir(app);
const processes = new Set();
let interrupted = false;
const env = Object.fromEntries(
  ["PATH", "HOME", "TMPDIR", "TMP", "TEMP", "SystemRoot", "LANG", "LC_ALL", "CI"]
    .filter((key) => process.env[key] !== undefined)
    .map((key) => [key, process.env[key]]),
);
Object.assign(env, {
  NEXT_TELEMETRY_DISABLED: "1",
  STAFF_PIN: String(randomInt(1000, 10000)),
  OPENAI_API_KEY: "",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
  VERCEL: "",
});

function launch(args, cwd, logName) {
  const log = createWriteStream(path.join(evidence, logName));
  const child = spawn(process.execPath, args, {
    cwd, env, detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  processes.add(child);
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  const done = new Promise((resolve) => {
    child.on("error", (error) => log.write(`${error.message}\n`));
    child.on("close", (code) => {
      processes.delete(child);
      log.end(() => resolve(code ?? 1));
    });
  });
  return { child, done };
}

function signal(child, value) {
  try {
    if (process.platform === "win32") child.kill(value);
    else process.kill(-child.pid, value);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

async function stop() {
  const owned = [...processes];
  for (const child of owned) signal(child, "SIGTERM");
  for (let i = 0; i < 30 && owned.some((child) => processes.has(child)); i++) await pause(100);
  for (const child of owned) if (processes.has(child)) signal(child, "SIGKILL");
}

for (const name of ["SIGINT", "SIGTERM"]) process.once(name, () => {
  interrupted = true;
  process.exitCode = name === "SIGINT" ? 130 : 143;
  void stop();
});

async function checked(args, cwd, logName, timeoutMs = 180_000) {
  const { child, done } = launch(args, cwd, logName);
  let force;
  const timer = setTimeout(() => {
    signal(child, "SIGTERM");
    force = setTimeout(() => { if (processes.has(child)) signal(child, "SIGKILL"); }, 3000);
  }, timeoutMs);
  const code = await done;
  clearTimeout(timer);
  clearTimeout(force);
  if (interrupted || code !== 0) {
    const tail = (await readFile(path.join(evidence, logName), "utf8")).split("\n").slice(-45).join("\n");
    throw new Error(`${logName} failed (exit ${code}).\n${tail}`);
  }
}

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

const result = { startedAt: new Date().toISOString(), source: root, fixtureAI: true, passed: false };
try {
  console.log(`Demo evidence: ${path.relative(root, evidence)}`);
  for (const entry of ["app", "components", "lib", "content", "public", "data", "package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts"]) {
    await cp(path.join(root, entry), path.join(app, entry), {
      recursive: true,
      filter: (file) => !/\.(?:local\.json|tmp)$/.test(file),
    });
  }
  const modules = await realpath(path.join(root, "node_modules"));
  await symlink(modules, path.join(app, "node_modules"), process.platform === "win32" ? "junction" : "dir");
  // A shared node_modules link must remain inside Turbopack's filesystem root.
  let bundleRoot = root;
  while (path.relative(bundleRoot, modules).startsWith(`..${path.sep}`)) bundleRoot = path.dirname(bundleRoot);
  await cp(path.join(root, "next.config.ts"), path.join(app, "demo-next.config.ts"));
  await writeFile(path.join(app, "next.config.ts"), `import original from "./demo-next.config";\nexport default { ...original, turbopack: { ...original.turbopack, root: ${JSON.stringify(bundleRoot)} } };\n`);
  console.log("Building disposable app (no production credentials)…");
  await checked([path.join(modules, "next/dist/bin/next"), "build"], app, "build.log");
  const port = await freePort();
  const baseURL = `http://127.0.0.1:${port}`;
  const { child } = launch([path.join(modules, "next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], app, "server.log");
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (interrupted || child.exitCode !== null || child.signalCode !== null) throw new Error("Disposable server stopped before becoming ready");
    try {
      const response = await fetch(`${baseURL}/api/inventory`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await pause(200);
  }
  if (!ready) throw new Error("Disposable server did not become ready; see server.log");
  Object.assign(env, { DONUT_DEMO_URL: baseURL, DONUT_DEMO_PIN: env.STAFF_PIN, DONUT_DEMO_EVIDENCE: evidence });
  console.log("Running 3 browser acceptance checks with fixture AI and real local writes…");
  await checked([path.join(modules, "@playwright/test/cli.js"), "test", "--config", path.join(root, "playwright.config.ts")], root, "tests.log", 150_000);
  result.passed = true;
  console.log("PASS: photo confirmation, sold-out publishing, and call-notes order saving.");
} catch (error) {
  result.error = error.message;
  console.error(error.message);
  process.exitCode ||= 1;
} finally {
  await stop();
  await rm(app, { recursive: true, force: true });
  result.finishedAt = new Date().toISOString();
  await writeFile(path.join(evidence, "result.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(`Full logs and browser evidence: ${path.relative(root, evidence)}`);
}
