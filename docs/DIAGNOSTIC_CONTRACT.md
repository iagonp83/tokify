# Diagnostic Contract

This document defines the diagnostic contract and aggregate diagnostics boundary
for Tokify.

The isolated diagnostic contract, aggregate coordinator, and child-name hygiene
diagnostics foundations now exist. They do not activate structured diagnostics
in validators, activate warning collection, rewrite validators, change current
string diagnostics, change import/export, change resolver/runtime behavior,
activate canonical IDs, activate child instance IDs, introduce instance paths,
or introduce adapter diagnostics.

## Current Active Model

Current validators remain unchanged.

Current diagnostics infrastructure:

- `src/compiler/diagnostics/diagnosticContract.ts` defines the stable
  diagnostic envelope, helper constructors, comparison, and deterministic sort
- `src/compiler/diagnostics/aggregateDiagnostics.ts` defines a pure aggregate
  coordinator for already-created diagnostic envelopes
- `src/compiler/diagnostics/childNameHygieneDiagnostics.ts` defines a pure
  opt-in producer for child-name hygiene warning envelopes

Active behavior:

- `validateComponent` remains schema correctness validation
- the component graph validator remains component-type-only
- warning collection remains planned but inactive in validation flows
- `collectChildNameHygieneDiagnostics(schema)` emits structured warnings only
  when called directly
- structured diagnostics infrastructure exists but is not wired into validators
  or public validation APIs
- aggregate diagnostics exists as a pure coordinator only
- current string diagnostics remain backward-compatible
- existing validation APIs remain valid
- no public behavior changes because of the diagnostics infrastructure

`validateComponent` currently owns schema-local correctness checks and optional
registry-backed child reference checks when explicit registry context is
provided. It should not become future-path, canonical identity, or warning
collection logic.

The component graph validator currently owns component-type graph diagnostics
for unknown references, direct self-reference, and indirect component-type
cycles. It remains separate from schema validation and from future metadata
hygiene warnings.

## Diagnostic Envelope

Structured diagnostics use a shared envelope in `diagnosticContract.ts`.

Implemented fields:

- `severity`
- `code`
- `message`
- `path`
- `layer`
- `source`
- deterministic `order` metadata
- optional `suggestions`

Field semantics:

- `severity` describes diagnostic classification, such as `error` or
  `warning`
- `code` is the stable machine-facing contract
- `message` is human-facing text
- `path` points to an authored schema or metadata location
- `layer` identifies the architectural domain
- `source` identifies the producing validator or checker
- deterministic ordering metadata supports stable output
- `suggestions` are optional advisory hints

The human-facing `message` may evolve. The machine-facing `code` should remain
stable once published.

The diagnostic `path` is not an instance path, runtime variable name, resolver
path, DOM path, adapter path, import path, or generated file path.

## Severity Taxonomy

Current severity values:

- `error`
- `warning`
- `info`

Severity does not imply runtime behavior. In particular, `warning` diagnostics
are non-blocking by default. A warning should not fail import, build,
resolution, runtime behavior, preview rendering, export, or adapter output.

Errors should continue to represent correctness failures owned by the relevant
validator. Warnings should represent advisory risks, compatibility concerns, or
future migration readiness signals.

## Diagnostic Code Philosophy

Diagnostic codes should be stable, namespaced, and machine-facing.

Code principles:

- use stable namespaced codes
- do not include dynamic values in codes
- do not reuse one code for different meanings
- do not rename codes casually after publication
- messages may evolve without changing the code
- codes should describe the domain rule, not the implementation function
- codes should remain meaningful if implementation files or helper names change

Suggested future code families:

- `SCHEMA_*`
- `REGISTRY_*`
- `GRAPH_*`
- `METADATA_*`
- `CANONICAL_*`
- `PATH_*`
- `COMPAT_*`

Examples of code intent, not active codes:

- `SCHEMA_CHILD_NAME_EMPTY`
- `GRAPH_COMPONENT_CYCLE`
- `METADATA_CHILD_NAME_RESERVED_DOT`
- `CANONICAL_NAME_COLLISION_RISK`
- `PATH_SEGMENT_UNSAFE`
- `COMPAT_LEGACY_AUTHORED_NAME_ONLY`

These examples are illustrative only. They do not create an active diagnostic
catalog.

## Diagnostic Path Semantics

Diagnostic paths should point to authored data locations.

Conceptually, prefer typed path segments:

```txt
["composition", "children", 0, "name"]
["composition", "children", 1, "component"]
["slots", 0]
["tokenBindings", 3, "target", "property"]
```

Path semantics:

- paths identify authored schema or metadata locations
- paths are not future instance paths
- paths are not runtime variable names
- paths are not resolver paths
- paths are not semantic token paths
- paths are not DOM, React, CSS selector, adapter, file, or generated-code
  paths
- numeric path indexes should sort numerically

String rendering may happen later. A future renderer may display a typed path
as a readable string, but the underlying diagnostic path should remain an
authored-data location.

If a diagnostic applies to a whole schema, registry, graph, or aggregate
context, the path may be omitted or point to the closest authored owner.

## Layer And Source Separation

`layer` and `source` should remain distinct.

`layer` describes the architectural domain. Current layer values are:

- `schema`
- `registry`
- `graph`
- `resolver`
- `runtime`
- `import`
- `export`
- `preview`
- `adapter`

`source` describes the producing validator, checker, or helper. Conceptual
examples:

- `validateComponent`
- `componentRegistry`
- `componentGraphValidation`
- `childNameHygiene`
- `canonicalReadiness`
- `pathReadiness`

Aggregate diagnostics must preserve provenance. A caller should be able to tell
which layer produced a diagnostic and which source emitted it.

Aggregate diagnostics do not own validator rules. They coordinate output from
the rule owners.

## Deterministic Ordering

Diagnostics are ordered deterministically by `sortDiagnostics`.

Implemented sort order:

1. `order.bucket`
2. `order.sequence`
3. severity rank
4. layer rank
5. `source.name`
6. `code`
7. authored-data `path`
8. `message` as the final tie-breaker

Ordering rules:

- avoid incidental traversal order dependencies
- sort numeric path indexes numerically
- sort string path segments consistently
- keep severity rank explicit rather than relying on enum declaration order
- keep layer rank explicit rather than relying on call order
- use message only as a final tie-breaker

Graph cycle diagnostics should eventually normalize cycle paths
deterministically. The same cycle should produce the same canonical diagnostic
path or subject ordering regardless of registry traversal order.

Deterministic ordering is an output stability concern. It must not change
validator ownership or validation behavior.

## Aggregate Diagnostics Boundary

`aggregateDiagnostics.ts` coordinates already-created diagnostic envelopes.

The current API accepts multiple diagnostic groups. A group may be either:

- a readonly diagnostic array
- an object with `diagnostics` plus optional group-level `layer` and `source`
  metadata

The coordinator currently:

- flattens multiple diagnostic groups
- delegates deterministic ordering to `sortDiagnostics`
- preserves diagnostic object references
- does not mutate input arrays or diagnostic objects
- accepts group-level `layer` and `source` metadata only as future-safe
  metadata, without behavioral interpretation

Aggregate diagnostics must not become monolithic validation logic.

Boundary rules:

- validators own rules
- aggregate diagnostics preserve validator provenance
- aggregate diagnostics may sort
- aggregate diagnostics do not currently format diagnostics
- aggregate diagnostics do not currently adapt structured diagnostics to legacy
  strings
- aggregate diagnostics must not mutate schema, registry, graph, runtime, or
  export data
- aggregate diagnostics must not inspect resolved styles or runtime output
- aggregate diagnostics must not activate warnings by default
- aggregate diagnostics must not change existing validation APIs

Any future aggregate API expansion must be additive. Existing calls such as
`validateComponent(schema)`, `validateComponent(schema, { registry })`, and the
current component graph validator API must remain valid unless a later explicit
migration changes that contract.

## Compatibility And String Migration

Current string diagnostics must remain backward-compatible.

Migration principles:

- structured diagnostics should be additive when introduced
- do not rewrite messages and introduce structure in the same risky migration
- existing tests should not break due to diagnostic migration
- legacy string rendering may later be produced from structured diagnostics
- existing callers that consume strings should keep working during migration
- new structured diagnostics should preserve enough information to render the
  legacy string shape where needed

A safe migration path may introduce internal structured diagnostics first, then
render current string diagnostics from that structure. That migration should be
tested carefully and kept separate from rule changes.

## Isolation Guarantees

Future diagnostics must not:

- inspect resolved styles
- inspect runtimePlan emission
- affect resolver fallback chains
- affect runtime variable naming
- mutate import/export
- activate canonical IDs
- activate child instance IDs
- introduce instance paths
- introduce path-derived runtime variables
- add adapter-specific validation in core
- change `PreviewCanvas`
- change adapters
- change runtime emission
- change runtime consumption
- change `runtimePlan`

Diagnostic paths are authored-data paths. They are not runtime paths and must
not become a bridge into runtime naming.

## Optional Suggestions

Suggestions are optional and advisory.

Suggestion principles:

- suggestions are not operations
- suggestions must not mutate data
- suggestions must not become codemods
- suggestions must not become design operations
- suggestions must not imply automatic migration
- suggestions should be safe to ignore

If suggestions ever need to become codemods, design operations, or migrations,
that must happen through a separate explicit layer with its own safety rules,
review path, and user confirmation model.

## Relationship To Existing Boundaries

The diagnostic contract must preserve existing architecture boundaries:

- schema validation remains separate from graph validation
- graph validation remains component-type-only
- metadata hygiene warnings remain advisory and opt-in
- planned warning families and exact first-phase child-name hygiene codes are
  documented in
  [`WARNING_CATALOG.md`](./WARNING_CATALOG.md)
- canonical identity remains inactive
- child instance IDs remain inactive
- paths remain addresses, not identity
- runtime variable names remain flat and path-independent
- adapters remain downstream from the Component Model

Shared diagnostic formatting does not imply shared rule ownership.

## Future Phases

Recommended order:

1. Keep the implemented diagnostic contract and aggregate coordinator isolated
   from validator/runtime/resolver/import-export behavior.
2. Later, introduce structured diagnostics internally for one narrow validator
   while preserving legacy string output.
3. Later, add opt-in warning collection for metadata hygiene.
4. Later, add aggregate reporting for collection, normalization, rendering, or
   legacy string adaptation if a caller needs one combined result.
5. Later, add migration reporting for canonical/path readiness.
6. Later, consider optional strict mode only after migration tooling exists.

Each phase should be additive and should avoid changing validator rules while
changing diagnostic representation.

## Explicit Non-Goals

This checkpoint does not introduce:

- validator rewrites
- graph validator rewrites
- warning activation
- diagnostic wiring into validators or public validation APIs
- aggregate diagnostics behavior beyond pure coordination
- import/export changes
- resolver changes
- runtime changes
- `runtimePlan` changes
- `PreviewCanvas` changes
- canonical ID activation
- child instance ID activation
- child instance runtime
- instance path generation
- path-derived runtime variables
- nested runtime token objects
- adapter diagnostics
- adapter-specific validation in core
- strict mode
