# Engineering Principles

Tokify prioritizes quality, scalability, architectural safety,
maintainability, and correctness over speed.

There is no rush. The project should always choose the safest path that allows
the defined functionality to be completed solidly.

## Execution Priorities

- Prefer quality over speed.
- Prefer scalability over shortcuts.
- Prefer architectural safety over fast feature delivery.
- Avoid rushed implementation, especially around compiler, resolver, runtime,
  export, adapter, and schema boundaries.
- Keep phases small and scoped.
- Change one main architectural layer per phase when possible.
- Use planning-only phases before risky implementation.
- Use architecture audits before high-risk phases.
- Preserve backward compatibility unless a migration phase explicitly changes
  that contract.

## Phase Boundaries

Avoid mixing changes across these layers in the same phase unless explicitly
justified:

- resolver behavior
- `runtimePlan`
- runtime emission
- runtime consumption
- `PreviewCanvas`
- import/export
- adapters
- schemas
- UI

When a phase must touch more than one layer, document why the coupling is
necessary and keep the behavioral surface as small as possible.

## Verification

- Add or update tests for behavior changes.
- Run the relevant verification commands before closing a behavior-changing
  phase.
- Keep documentation synchronized when architectural boundaries change.
- Prefer small commits and pushes after stable checkpoints.
- Treat passing tests and builds as a checkpoint, not as permission to broaden
  scope.

## Stable Architecture Rules

- Keep runtime CSS variables flat.
- Keep `runtimePlan` additive, metadata-only, non-mutating, and value-free.
- Keep the resolver schema-first.
- Keep adapters downstream from the Component Model and compiler contracts.
- Keep runtime emission and runtime consumption separate.
- Keep `PreviewCanvas` as a target-specific consumer, not the universal runtime
  backend.
- Preserve import/export compatibility unless an explicit migration phase says
  otherwise.

## Working Method

Future ChatGPT/Codex sessions should favor careful sequencing:

1. Inspect the current implementation and tests.
2. Confirm the architectural boundary for the phase.
3. Plan before implementation when risk is high.
4. Make the smallest behavior-preserving extraction or change that satisfies
   the phase goal.
5. Verify with focused tests and broader checks when source behavior changes.
6. Update documentation when the project contract or boundary changes.
7. Stop at a stable checkpoint before starting the next architectural layer.
