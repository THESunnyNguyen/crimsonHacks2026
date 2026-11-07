# Lane workflow handoff

- Branch: `project-worktree-review-b3420790`
- Base commit: `3f0b12a832ab35ad5f5b7d4e79ad7c790005bea2`
- Snapshot commit: `166804f5bb311f7418fcc0c2cc41b48ee4b84d4c`
- Refreshed: 2026-11-07T04:00:04.238Z
- Worktree: `/Users/sunnynguyen/.paradev/worktrees/crimsonHacks2026/review-current-state-project-b3420790`

## Committed changes since base
```text
.agents/skills/THIRD_PARTY.md                      |   14 +
 .agents/skills/lane-handoff/SKILL.md               |   30 +
 .agents/skills/playwright-cli/LICENSE              |  201 ++
 .agents/skills/playwright-cli/NOTICE               |    5 +
 .agents/skills/playwright-cli/SKILL.md             |  493 +++
 .../references/element-attributes.md               |   23 +
 .../playwright-cli/references/playwright-tests.md  |   39 +
 .../playwright-cli/references/pr-attachments.md    |   60 +
 .../playwright-cli/references/request-mocking.md   |   87 +
 .../playwright-cli/references/running-code.md      |  245 ++
 .../references/session-management.md               |  227 ++
 .../playwright-cli/references/storage-state.md     |  278 ++
 .../playwright-cli/references/test-generation.md   |  433 +++
 .../skills/playwright-cli/references/tracing.md    |  146 +
 .../playwright-cli/references/video-recording.md   |  216 ++
 .agents/skills/react-best-practices/AGENTS.md      | 3810 ++++++++++++++++++++
 .agents/skills/react-best-practices/README.md      |  123 +
 .agents/skills/react-best-practices/SKILL.md       |  149 +
 .agents/skills/react-best-practices/metadata.json  |   15 +
 .../skills/react-best-practices/rules/_sections.md |   46 +
 .../skills/react-best-practices/rules/_template.md |   28 +
 .../rules/advanced-effect-event-deps.md            |   56 +
 .../rules/advanced-event-handler-refs.md           |   55 +
 .../rules/advanced-init-once.md                    |   42 +
 .../rules/advanced-use-latest.md                   |   39 +
 .../react-best-practices/rules/async-api-routes.md |   38 +
 .../rules/async-cheap-condition-before-await.md    |   37 +
 .../rules/async-defer-await.md                     |   82 +
 .../rules/async-dependencies.md                    |   51 +
 .../react-best-practices/rules/async-parallel.md   |   28 +
 .../rules/async-suspense-boundaries.md             |   99 +
 .../rules/bundle-analyzable-paths.md               |   63 +
 .../rules/bundle-barrel-imports.md                 |   60 +
 .../rules/bundle-conditional.md                    |   31 +
 .../rules/bundle-defer-third-party.md              |   49 +
 .../rules/bundle-dynamic-imports.md                |   35 +
 .../react-best-practices/rules/bundle-preload.md   |   50 +
 .../rules/client-event-listeners.md                |   74 +
 .../rules/client-localstorage-schema.md            |   71 +
 .../rules/client-passive-event-listeners.md        |   48 +
 .../react-best-practices/rules/client-swr-dedup.md |   56 +
 .../react-best-practices/rules/js-batch-dom-css.md |  107 +
 .../rules/js-cache-function-results.md             |   80 +
 .../rules/js-cache-property-access.md              |   28 +
 .../react-best-practices/rules/js-cache-storage.md |   70 +
 .../rules/js-combine-iterations.md                 |   32 +
 .../react-best-practices/rules/js-early-exit.md    |   50 +
 .../rules/js-flatmap-filter.md                     |   60 +
 .../react-best-practices/rules/js-hoist-regexp.md  |   45 +
 .../react-best-practices/rules/js-index-maps.md    |   37 +
 .../rules/js-length-check-first.md                 |   49 +
 .../react-best-practices/rules/js-min-max-loop.md  |   82 +
 .../rules/js-request-idle-callback.md              |  105 +
 .../rules/js-set-map-lookups.md                    |   24 +
 .../rules/js-tosorted-immutable.md                 |   57 +
 .../rules/rendering-activity.md                    |   26 +
 .../rules/rendering-animate-svg-wrapper.md         |   47 +
 .../rules/rendering-conditional-render.md          |   40 +
 .../rules/rendering-content-visibility.md          |   38 +
 .../rules/rendering-hoist-jsx.md                   |   46 +
 .../rules/rendering-hydration-no-flicker.md        |   82 +
 .../rules/rendering-hydration-suppress-warning.md  |   30 +
 .../rules/rendering-resource-hints.md              |   85 +
 .../rules/rendering-script-defer-async.md          |   68 +
 .../rules/rendering-svg-precision.md               |   28 +
 .../rules/rendering-usetransition-loading.md       |   75 +
 .../rules/rerender-defer-reads.md                  |   39 +
 .../rules/rerender-dependencies.md                 |   45 +
 .../rules/rerender-derived-state-no-effect.md      |   40 +
 .../rules/rerender-derived-state.md                |   29 +
 .../rules/rerender-functional-setstate.md          |   74 +
 .../rules/rerender-lazy-state-init.md              |   58 +
 .../rules/rerender-memo-with-default-value.md      |   38 +
 .../react-best-practices/rules/rerender-memo.md    |   44 +
 .../rules/rerender-move-effect-to-event.md         |   45 +
 .../rules/rerender-no-inline-components.md         |   82 +
 .../rules/rerender-simple-expression-in-memo.md    |   35 +
 .../rules/rerender-split-combined-hooks.md         |   64 +
 .../rules/rerender-transitions.md                  |   40 +
 .../rules/rerender-use-deferred-value.md           |   59 +
 .../rules/rerender-use-ref-transient-values.md     |   73 +
 .../rules/server-after-nonblocking.md              |   73 +
 .../rules/server-auth-actions.md                   |   96 +
 .../react-best-practices/rules/server-cache-lru.md |   41 +
 .../rules/server-cache-react.md                    |   76 +
 .../rules/server-dedup-props.md                    |   65 +
 .../rules/server-hoist-static-io.md                |  149 +
 .../rules/server-no-shared-module-state.md         |   50 +
 .../rules/server-parallel-fetching.md              |   83 +
 .../rules/server-parallel-nested-fetching.md       |   34 +
 .../rules/server-serialization.md                  |   38 +
 .agents/skills/web-design-guidelines/SKILL.md      |   39 +
 .claude/skills/lane-handoff                        |    1 +
 .claude/skills/playwright-cli                      |    1 +
 .claude/skills/react-best-practices                |    1 +
 .claude/skills/web-design-guidelines               |    1 +
 .codex/config.toml                                 |    3 +
 .mcp.json                                          |   10 +-
 .nvmrc                                             |    1 +
 eslint.config.mjs                                  |    5 +
 package-lock.json                                  | 1423 +++++++-
 package.json                                       |   19 +-
 playwright.config.ts                               |   28 +
 scripts/demo-test.mjs                              |  156 +
 tests/e2e/demo.spec.ts                             |  135 +
 105 files changed, 12385 insertions(+), 31 deletions(-)
```

## Working tree at snapshot
```text
M .claude/agents/harden.md
 M .claude/agents/lane-00.md
 M .claude/agents/lane-a.md
 M .claude/agents/lane-b.md
 M .claude/agents/lane-c.md
 M .claude/agents/lane-d.md
 M .claude/agents/lane-e.md
 M .claude/agents/lane-f.md
 M .claude/agents/reviewer.md
 M .gitignore
 M AGENTS.md
 M README.md
 M docs/tasks/REVIEW.md
 M scripts/kickoff.sh
 M scripts/merge-task.sh
 M scripts/setup-worktree.sh
?? .github/
?? .paradev/
?? docs/PROJECT_REVIEW.md
?? docs/WORKFLOW.md
?? docs/handoffs/
?? scripts/handoff.mjs
?? scripts/process.mjs
?? scripts/test.mjs
?? scripts/verify.mjs
?? tests/workflow/
```

<!-- Agent-maintained progress below; refresh preserves this section. -->

## Scope
User authorized relevant workflow improvements, parallel agents and Paradev.
This branch starts from integrated skeleton `3f0b12a`. Do not alter main's six
existing doc edits or A's uncommitted feature. No production push or merge is
part of this workflow task. Full worktree review: `docs/PROJECT_REVIEW.md`.

## Implemented
- Recursive tests, compact verification with durable logs, base-SHA handoffs.
- Merge helper verifies a pending merge and aborts only its own failed merge.
- Setup preserves env/data and rejects copying remote Redis settings.
- Updated lane/reviewer prompts, CI, Node22 selection, local Paradev config.
- Locked Playwright CLI/test and Next DevTools MCP; repo Vercel/Playwright skills
  and custom lane-handoff skill. See `docs/WORKFLOW.md` for sources and advisory.
- Isolated browser tests for photo correction/publish, sold-out state, and notes
  draft/save. Only AI endpoints mocked; auth, persistence and polling are real.

## Validation
- Full `npm run verify` passed lint, all 13 tests and production build:
  `.artifacts/verify/1794023929293-747d0e/result.json`.
- All 3 browser tests passed on disposable A+B+C source. Current skeleton
  correctly fails all 3 missing feature checks. Evidence copied here:
  `.artifacts/demo-validation/integrated-pass/` and `skeleton-negative/`.
- Final demo cleanup fix passed 3 focused timeout/signal fixtures, preserving an
  unrelated sentinel process. Parent ESLint passed after integration.
  Evidence: `.artifacts/demo-validation/process-cleanup/cleanup-result.json`.
- Independent read-only workflow review: no blockers. Eight workflow tests pass;
  env preservation, paths with spaces, merge/handoff preservation and stubborn
  grandchild termination verified. Parent result.json records interruption.
- Next DevTools stdio and live runtime discovery, project metadata, routes passed.
  Evidence `.artifacts/devtools-*.json`. Playwright CLI opened the menu. Own
  dev server and named workflow-smoke browser session are stopped.
- Custom skill validator passed. Upstream skills preserved unmodified (including
  upstream whitespace); source and license notices recorded.

## Agents and commits
- demo_checks completed: `533ff28`, `358bce5`; cherry-picked as `3ec7352`,
  `752db52`. Worker worktree: sibling `workflow-demo-checks`. Own temporary
  package/lock copies, node_modules symlink and artifacts remain there for now.
- workflow_review completed read-only; fixtures/processes cleaned up.
- Tooling committed as `166804f`; workflow scripts/docs commit follows.
- No parent verification/server process remains running.

## Remaining workflow steps
1. Commit remaining scripts/docs/config on this branch.
2. Create a throwaway local Paradev workspace from this branch; inspect Workspace
   Setup output, fix if necessary, then archive only that new test workspace.
   Project `5e1b7ab9-f88f-42be-b31c-4c793dd603ec`.
3. Clean up only the completed demo worker's disposable worktree after retaining
   its evidence here; both worker commits already integrated.
4. Update this handoff with setup result and final commit state, then report.

## Resume notes
Use Node22: `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin/node`.
Some agent shells select `/usr/local/bin/node` v20.11.0; prepend Node22's bin
path. `.nvmrc` and package engines now declare22. Original generated next-env.d.ts
was restored after dev-server testing. Jev/output rewriting were deliberately
deferred. Real AI evaluation and product integration remain separate work.
