import { readdir } from "node:fs/promises";
import { spawnManaged } from "./process.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Enumerate explicitly: shell ** globs differ across macOS, Linux, and CI.
export async function findTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return findTests(file);
    return entry.isFile() && /\.test\.(?:ts|mjs)$/.test(file) ? [file] : [];
  }));
  return files.flat().sort();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = (await Promise.all(["lib", "tests"].map(findTests))).flat();
  if (!files.length) throw new Error("No tests discovered");
  console.log(`Running ${files.length} test files (including nested directories).`);
  const child = spawnManaged(process.execPath, ["--import", "tsx", "--test", ...files], {
    stdio: "inherit",
    env: { ...process.env, UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "", VERCEL: "" },
  });
  child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
  child.on("exit", (code) => { process.exitCode = child.interruptedSignal ? 1 : code ?? 1; });
}
