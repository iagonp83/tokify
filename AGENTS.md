# Tokify Agent Instructions

These instructions apply to the whole repository. They capture recurring working agreements for Codex sessions; use `CURRENT_SYSTEM_SNAPSHOT.md` and `docs/STRUCTURED_DIAGNOSTICS_MIGRATION.md` for deeper architecture and diagnostics state.

## Project Priorities

- Prioritize quality, scalability, architectural safety, maintainability, and correctness over speed.
- Prefer small, reversible checkpoints.
- Do not combine unrelated changes in one checkpoint.

## Hard Architectural Boundaries

- Preserve the flat CSS variable runtime contract.
- Do not introduce nested runtime token objects.
- Do not change runtime, resolver, import-export, PreviewCanvas, UI, or adapters unless explicitly requested.
- Do not introduce canonical IDs, child instance IDs, instance paths, path-derived CSS variables, or strict mode unless explicitly requested.
- Keep components library-agnostic. Do not encode React, DOM, CSS selector, or adapter semantics in the Component Model.

## Diagnostics Boundaries

- `validateComponent` currently keeps a public legacy `string[]` diagnostic API.
- `validateComponent` internals are migrated to `DiagnosticEnvelope` -> legacy string compatibility helpers for current rule families.
- `componentGraphValidation` is separate and currently returns its legacy diagnostic object shape with legacy message strings.
- Child-name hygiene warnings remain opt-in and unwired.
- `aggregateDiagnostics` remains coordinator-only and must not invoke validators.
- Do not introduce a structured public validation API unless explicitly requested.
- Do not mix `validateComponent`, `componentGraphValidation`, warning wiring, aggregate reporting, or public API work in one checkpoint unless explicitly requested.

## Workflow Expectations

- Audit before implementing when touching architecture-sensitive areas.
- Add formatter parity tests before migrating existing diagnostics internals.
- Preserve exact legacy message text and public return shapes during migrations.
- Keep rollback boundaries local.
- Do not commit without explicit approval.
- Report changed files, validation commands, and results after each checkpoint.

## Validation Expectations

- For source changes, run focused relevant tests first.
- Then run `npm test` when appropriate.
- Run `npm run check` for source changes.
- Run `git diff --check` before reporting completion.
- For docs-only changes, `git diff --check` is usually sufficient unless docs tooling exists.

## Documentation Expectations

- Update `CURRENT_SYSTEM_SNAPSHOT.md` when architecture state changes.
- Update `docs/STRUCTURED_DIAGNOSTICS_MIGRATION.md` when diagnostics migration state changes.
- Keep docs factual and aligned with current public behavior.
- Do not over-document implementation details in `AGENTS.md`; refer to existing docs instead.

## Git Expectations

- Keep commits focused and descriptive.
- Before commit, verify `git diff --name-only` and `git status --short` match the intended scope.
- After push, report commit hash, final `git status --short`, and HEAD/origin alignment.
