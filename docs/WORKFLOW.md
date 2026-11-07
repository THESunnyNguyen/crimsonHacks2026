# Lane workflow

## Start and resume

Use the committed integrated skeleton as the base for a lane, not a stale
plan-only `main`. Record the chosen base SHA in `docs/handoffs/<lane>.md`:

```sh
npm ci
npm run handoff -- A <base-sha>
npm run dev -- --port 3101
```

Ports by convention: A 3101, B 3102, C 3103, F 3104, integration 3110. Check
availability and use another port if occupied; don't stop another lane's server.
Record the actual port in the handoff. Refresh it after meaningful milestones,
including partial completion, so another session can resume after a usage limit.
The snapshot SHA predates the handoff commit itself; inspect both on resume.

`scripts/setup-worktree.sh` installs the lockfile and copies local env files only
when absent. Each worktree keeps its own ignored JSON data. Never copy production
Redis credentials into local worktrees.

Paradev reads `.paradev/config.toml`: install runs `npm ci`, setup copies missing
local env files, and the Run menu offers Dev and Verify terminals. Next.js picks
an available local port; record the actual URL. This setup targets local
worktrees; cloud credentials should be configured separately.

## Verify

- `npm test`: recursively discovers `lib/**/*.test.ts` and `tests/**/*.test.mjs`.
- `npm run verify`: lint, tests, production build (including TypeScript), and
  offline asset validation when F is present. Stops on failure. Full logs and a
  JSON result live in `.artifacts/verify/`; only failures print a log tail.
- `npm run test:demo`: three browser acceptance checks in a disposable copy of
  this worktree with fixture AI responses and real local persistence. Requires
  A/B/C to be integrated; missing UI is a failure, never a skipped green result.
  Install the browser once with `npx playwright install chromium`.

During development, use focused tests or Next.js runtime compilation diagnostics.
Run the full verification once before handoff, then rerun affected checks after
fixes. Live AI evaluations remain separate: `scripts/eval-count.ts` and
`scripts/parse-samples.ts` need credentials and real inputs. The demo tests do
not establish model accuracy, latency, microphone support, or deployed Redis.

## Prompt

```text
Complete lane <X> from docs/tasks/<brief>.
Base commit: <SHA>. Worktree: <path>. Dev port: <port>.
Follow AGENTS.md and the relevant CONTRACTS.md sections.
Keep edits within lane ownership. Report contract conflicts and continue
independent work. Implement the observable acceptance criteria.
Run affected checks during development; npm run verify before handoff.
Update docs/handoffs/<lane>.md at milestones with evidence, remaining work,
and the exact resume step. Distinguish mocked checks from live evaluations.
Commit verified increments. Report unverified acceptance criteria explicitly.
Do not merge to main or deploy unless the user authorized that action.
```

## Review and integrate

Record the base SHA, review `git diff <base>...HEAD`, `git diff`,
`git diff --cached`, and `git ls-files --others --exclude-standard`. Review lane
ownership on its own changes; inherited F assets in B are not B ownership drift.
Codex reviews Claude lanes; Claude reviews Codex lanes. Record the reviewed SHA.

Sync main deliberately before integration. From its clean checkout, invoke the
new `scripts/merge-task.sh <reviewed-sha>` (use an absolute path to this version
when main still has the old helper). The helper never switches branches, pulls,
or pushes. It makes a pending merge, runs `npm ci` and `npm run verify`, then
commits. Conflicts/check failures abort the pending merge. After A/B/C combine,
run `npm run test:demo` before a production push and rehearse on the real phone.

## Agent tools

Next.js DevTools MCP 0.4.0 is a locked dev dependency. `.mcp.json` configures
Claude Code; `.codex/config.toml` configures Codex in trusted project sessions.
After `npm ci`, reopen the agent session if the new tools aren't listed. Use
`nextjs_index`, verify `get_project_metadata`, then call tools on the lane's
explicit port. `get_errors` needs relevant browser sessions; `get_routes` and
`get_compilation_issues` can inspect the server directly.

Playwright CLI 0.1.23 is available as `npm run browser -- <command>`. Use a named
session (`-s=lane-a`) to isolate browsers. Keep the existing Playwright MCP for
sessions that already use it. Browser automation for test fixtures uses fresh
browser contexts, never the user's signed-in browser profile.

The DevTools package pins an old MCP SDK; `package.json` overrides that dependency
to 1.32.2. Its own Zod 3 dependency still has an upstream audit advisory
([GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)); it is
development-only and used over local stdio. Do not expose this tool server as a
public service. App Zod remains on the separately locked 4.6.x version. Revisit
this dependency when DevTools updates; don't force a Zod major override because
the tool's schema introspection uses Zod 3 internals.

Repo skills live in `.agents/skills`; `.claude/skills` symlinks make the same
instructions available to Claude. Use React performance guidance for relevant
changes and web design guidelines for explicit UI reviews. They supplement
project acceptance criteria, not expand every task into a redesign.

## Sources

- [Vercel agent skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62):
  `react-best-practices` and `web-design-guidelines`, copied unmodified at that
  revision; upstream MIT licensing applies. These are third-party development
  instructions, not app code written for the hackathon. That revision declares
  MIT in its README and contains no standalone license file; provenance is
  recorded in `.agents/skills/THIRD_PARTY.md`.
- [Next.js DevTools MCP](https://nextjs.org/docs/app/guides/mcp).
- [Microsoft Playwright CLI](https://github.com/microsoft/playwright-cli).
  The bundled `playwright-cli` skill is copied from locked `@playwright/cli`
  0.1.23 and its Playwright dependency; upstream Apache-2.0 licensing applies.
  Its license and Playwright notice are included beside the skill.
- Custom workflow scripts and fixture tests were written for this project.

Jev and automatic shell-output rewriting are deferred. Measure the simpler
workflow first; app AI remains OpenAI-only as contracted.
