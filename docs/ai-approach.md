# AI Approach

## Tools Used
- Codex CLI (used to scaffold and implement features in this repo).
- Claude (referenced in the assessment prompt).  
  Note: explicit logs are not stored in the repo. This is included because the assessment prompt requests it.

## Overseer and Agent Workflow Pattern
The work followed a phase-based plan where an overseer (human) defined objectives and constraints,
and the agent executed tasks in small increments, verifying with tests when applicable. This is
consistent with the staged "Phase 1 ... Phase 11b" tasks recorded in the development prompts.

## Phase Plan (1 - 11b)
This table summarizes the phase scopes as implemented in this repository.

| Phase | Scope Summary |
| --- | --- |
| 1 | Baseline server test coverage |
| 2 | Employee repository (TDD) |
| 3 | Employee routes and controller (TDD) |
| 4 | Salary insights endpoints (TDD) |
| 5 | Seed script + performance test |
| 6 | Backend cleanup (asyncHandler extraction) |
| 7 | Dashboard wiring to insights summary |
| 8 | Employees directory page |
| 9 | Insights page |
| 10 | Backend countries endpoint + frontend filter enhancements |
| 11b | Header cleanup |

Note: Phase scope descriptions are derived from the development prompts and the resulting code changes.

## Prompting Principles Applied
- Small, testable increments with a clear Red -> Green -> Refactor cadence.
- Explicit acceptance criteria for each phase (routes, data shapes, UI behavior).
- Prefer production-grade defaults (consistent layering, clear error handling, DI).

## Human Judgment Overrides
Not explicitly recorded in the codebase. Where the assessment prompt required items that
were not directly inferable from the code, assumptions were called out in documentation.
