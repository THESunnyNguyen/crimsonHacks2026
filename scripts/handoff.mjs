import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [lane, base] = process.argv.slice(2);
if (!lane || !base || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(lane)) {
  throw new Error("Usage: npm run handoff -- <lane> <base-ref-or-sha>");
}
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const baseSha = git("rev-parse", "--verify", "--end-of-options", `${base}^{commit}`);
const head = git("rev-parse", "HEAD");
git("merge-base", "--is-ancestor", baseSha, head);
const file = path.join("docs", "handoffs", `${lane}.md`);
await mkdir(path.dirname(file), { recursive: true });
const old = await readFile(file, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const marker = "<!-- Agent-maintained progress below; refresh preserves this section. -->";
if (old && !old.includes(marker)) {
  throw new Error(`Preserving existing ${file}: add the progress marker explicitly before refreshing it.`);
}
const progress = old.includes(marker) ? old.slice(old.indexOf(marker) + marker.length) : `

## Completed behavior
- Record observable results here.

## Checks and evidence
- Link the verification result and demo evidence; mark unrun checks explicitly.

## Remaining work / blockers
- Record unfinished acceptance criteria and contract decisions.

## Resume
- Record the exact next command or task.
`;
await writeFile(file, `# Lane ${lane} handoff

- Branch: \`${git("branch", "--show-current")}\`
- Base commit: \`${baseSha}\`
- Snapshot commit: \`${head}\`
- Refreshed: ${new Date().toISOString()}
- Worktree: \`${process.cwd()}\`

## Committed changes since base
\`\`\`text
${git("diff", "--stat", `${baseSha}...HEAD`) || "None"}
\`\`\`

## Working tree at snapshot
\`\`\`text
${git("status", "--short") || "Clean"}
\`\`\`

${marker}${progress}`);
console.log(`Updated ${file}; fill in progress and evidence before handing off.`);
