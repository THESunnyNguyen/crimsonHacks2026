# Lane workflow handoff

- Branch: `project-worktree-review-b3420790`
- Base commit: `3f0b12a832ab35ad5f5b7d4e79ad7c790005bea2`
- Snapshot commit: `d529d1a9e18a1c1d4bdafe4f9880aedd87e5ed54`
- Refreshed: 2026-11-07T04:01:52.500Z
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
 .claude/agents/harden.md                           |    3 +-
 .claude/agents/lane-00.md                          |    5 +-
 .claude/agents/lane-a.md                           |    5 +-
 .claude/agents/lane-b.md                           |    5 +-
 .claude/agents/lane-c.md                           |    5 +-
 .claude/agents/lane-d.md                           |    5 +-
 .claude/agents/lane-e.md                           |    5 +-
 .claude/agents/lane-f.md                           |    4 +
 .claude/agents/reviewer.md                         |    5 +-
 .claude/skills/lane-handoff                        |    1 +
 .claude/skills/playwright-cli                      |    1 +
 .claude/skills/react-best-practices                |    1 +
 .claude/skills/web-design-guidelines               |    1 +
 .codex/config.toml                                 |    3 +
 .github/workflows/verify.yml                       |   28 +
 .gitignore                                         |    8 +
 .mcp.json                                          |   10 +-
 .nvmrc                                             |    1 +
 .paradev/config.toml                               |   17 +
 AGENTS.md                                          |   17 +-
 README.md                                          |   10 +-
 docs/PROJECT_REVIEW.md                             |   58 +
 docs/WORKFLOW.md                                   |  118 +
 docs/handoffs/workflow.md                          |  207 ++
 docs/tasks/REVIEW.md                               |    2 +-
 eslint.config.mjs                                  |    5 +
 package-lock.json                                  | 1423 +++++++-
 package.json                                       |   19 +-
 playwright.config.ts                               |   28 +
 scripts/demo-test.mjs                              |  156 +
 scripts/handoff.mjs                                |   56 +
 scripts/kickoff.sh                                 |   18 +-
 scripts/merge-task.sh                              |   45 +-
 scripts/process.mjs                                |   40 +
 scripts/setup-worktree.sh                          |   38 +-
 scripts/test.mjs                                   |   30 +
 scripts/verify.mjs                                 |   49 +
 tests/e2e/demo.spec.ts                             |  135 +
 tests/workflow/discovery.test.mjs                  |   14 +
 tests/workflow/handoff.test.mjs                    |   25 +
 tests/workflow/merge.test.mjs                      |   78 +
 tests/workflow/setup.test.mjs                      |   30 +
 134 files changed, 13279 insertions(+), 67 deletions(-)
```

## Working tree at snapshot
```text
M README.md
 M docs/handoffs/workflow.md
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
- Fresh Paradev workspace from clean commit `d529d1a` installed 467 packages,
  copied missing local env, and passed lint, all 13 tests and production build
  on Node22.23.4. Evidence retained in `.artifacts/paradev-setup/verify/result.json`
  and `.artifacts/paradev-setup/verified-terminal.json`.
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
  `752db52`. Temporary worker worktree was removed after copying evidence here
  and confirming all three committed files matched. Worker branch retained.
- workflow_review completed read-only; fixtures/processes cleaned up.
- Tooling committed as `166804f`; workflow scripts/docs committed as `d529d1a`.
- No parent verification/server process remains running.

## Completion and next product steps
Workflow implementation and validation are complete on this branch. Paradev
test workspace `d89a68c4-46b4-48e9-840f-927339c8503a` passed and was archived
successfully with no warnings. No original worktree was removed.

For the next product session, read `docs/PROJECT_REVIEW.md`, inspect current Git
state, and resume A's uncommitted lane work or cross-review B/C. Resolve the
Ready/boxed stock contract with Sunny before changing shared semantics. The
workflow becomes available to other lanes when these commits are integrated
into their base; no main merge or production push has been performed here.

## Resume notes
Use Node22: `/Users/sunnynguyen/.nvm/versions/node/v22.23.4/bin/node`.
Some agent shells select `/usr/local/bin/node` v20.11.0; prepend Node22's bin
path. `.nvmrc` and package engines now declare22. Original generated next-env.d.ts
was restored after dev-server testing. Jev/output rewriting were deliberately
deferred. Real AI evaluation and product integration remain separate work.
