# Structured Diagnostics Migration

This document defines the migration plan from legacy string diagnostics to
internal structured `DiagnosticEnvelope` diagnostics.

The isolated legacy formatter foundation now exists as compatibility
infrastructure. This plan still does not introduce validator migrations,
validator wiring, public validation APIs, runtime behavior, resolver behavior,
`runtimePlan` behavior, runtime emission, import/export behavior,
`PreviewCanvas` behavior, canonical IDs, child instance IDs, instance paths,
path-derived runtime variables, strict mode, or blocking warnings.

## Current Boundary

Current public validator behavior remains legacy-compatible:

- `validateComponent` returns its current legacy string diagnostics
- the component graph validator returns its current legacy string diagnostics
- warning diagnostics remain opt-in and non-blocking
- aggregate diagnostics remains coordinator-only
- the legacy formatter exists, but is not wired into validators or public
  validation APIs

Structured diagnostics are an internal migration layer first. They should make
diagnostics easier to sort, format, test, and aggregate without changing public
validator behavior until a later explicit API phase.

## Layering Model

Structured diagnostics migration should keep these layers separate:

- **producer layer**: validators and warning helpers create
  `DiagnosticEnvelope` objects for rules they own
- **formatter layer**: converts envelopes to legacy strings for compatibility
- **aggregate layer**: combines and sorts already-created envelopes
- **renderer layer**: displays diagnostics in UI, reports, logs, or developer
  tooling
- **public API layer**: preserves existing return shapes until explicitly
  migrated

Rule producers must not format public strings directly once migrated.
Formatters must not own validation rules. Renderers must not infer validation
meaning. Aggregate diagnostics must not invoke validators or mutate envelopes.

The current formatter layer is implemented in:

```txt
src/compiler/diagnostics/legacyDiagnosticFormatter.ts
```

It exposes:

```ts
formatDiagnosticAsLegacyString(diagnostic)
formatDiagnosticsAsLegacyStrings(diagnostics)
```

## Compatibility Strategy

Legacy string diagnostics remain the public compatibility contract during
migration.

The intended compatibility path is:

```txt
DiagnosticEnvelope -> legacy string
```

String-to-envelope reconstruction is intentionally rejected. Legacy strings are
too lossy to recover stable codes, layers, sources, authored-data paths,
ordering metadata, and suggestions safely.

During migration, a validator may internally produce envelopes and immediately
format them back to the exact legacy strings expected by existing callers.
Only after parity is proven should the validator's internals switch fully to
structured production.

The current legacy formatter maps each `DiagnosticEnvelope` to exactly
`diagnostic.message`. It intentionally ignores severity, code, path, layer,
source, order metadata, and suggestions. Batch formatting preserves input
order, does not sort, does not mutate input diagnostics, returns a new array,
and returns `[]` for empty input.

## Validator Ownership

Validators own rule production for their domains.

`validateComponent` owns schema-local correctness rules only. Its structured
diagnostics may eventually cover local slot references, part metadata, child
metadata shape, slot relation correctness, duplicate local metadata, and
already-supported optional registry-backed child reference checks. It must not
own graph traversal, child-name hygiene warnings, canonical readiness,
resolver behavior, runtime behavior, import/export behavior, or adapter
behavior.

The component graph validator owns component-type graph rules only. Its
structured diagnostics may eventually cover unknown component references,
direct self-reference, and indirect component-type cycles. It must not own
schema shape checks, duplicate authored-name registry validation, child-name
hygiene warnings, instance paths, canonical IDs, runtime behavior, resolver
behavior, import/export behavior, or adapters.

Warning producers own advisory warning rules only. For example,
`collectChildNameHygieneDiagnostics(schema)` owns first-phase child-name
hygiene warnings and remains opt-in. Warning producers must not affect
`valid`, block imports/builds, or become implicit schema validation.

Aggregate diagnostics owns coordination only. It may sort and combine
already-created envelopes. It must not call validators, normalize validator
output, format messages, render UI, adapt to legacy strings, activate
warnings, or change public validation APIs.

## Normalization, Formatting, Rendering

Normalization belongs to the producer that owns the rule. For example,
child-name whitespace normalization belongs to child-name hygiene diagnostics.
Graph cycle normalization belongs to the graph validator. A shared formatter
must not invent or reinterpret rule normalization.

Formatting belongs to a dedicated formatter layer. Formatters convert
`DiagnosticEnvelope` values into legacy strings or later display strings. They
must preserve legacy string parity during migration and should not mutate
diagnostics or input schemas.

The current legacy formatter is pure compatibility infrastructure. It performs
`DiagnosticEnvelope -> legacy string` conversion only. It does not parse legacy
strings, reconstruct envelopes, own validation rules, call validators, call
aggregate diagnostics, render UI, inspect runtime or resolver output, or
introduce import/export, `PreviewCanvas`, adapter, canonical ID, child instance
ID, instance path, or path-derived runtime variable behavior.

Rendering belongs outside validators. UI, CLI, reports, logs, and adapters may
render formatted diagnostics later, but validators should not know about those
targets.

Conversion boundaries:

- envelope to legacy string is allowed for compatibility
- envelope to richer rendered output is allowed outside validators
- string to envelope is rejected
- aggregate diagnostics does not format or render

## Determinism Guarantees

Migration must preserve deterministic output.

Each migrated rule needs:

- a stable diagnostic code
- a stable severity
- a stable layer
- a stable source name
- an authored-data path target
- deterministic `order.bucket` and `order.sequence`
- stable formatter behavior for legacy string parity

Diagnostic codes are machine-facing contracts. They must not include dynamic
values, must not be casually renamed, and must not be reused for different
meanings.

Diagnostic paths remain authored-data paths. They are not runtime paths,
resolver paths, DOM paths, adapter paths, import paths, generated file paths,
canonical IDs, child instance IDs, or instance paths.

Ordering must not depend on incidental traversal order. Producers should use
explicit ordering metadata. Aggregate diagnostics may call `sortDiagnostics`
over already-created envelopes.

## Safe Migration Phases

Closed phase:

- **Formatter foundation**: a small formatter layer now renders
  `DiagnosticEnvelope` values to legacy strings without changing validators.

Recommended future phases:

1. **Formatter parity tests**: prove envelope-to-string rendering matches
   current legacy strings exactly for one target rule family.
2. **Validator-local internal structured migration**: migrate one validator or
   one rule family internally while preserving the validator's public return
   shape and legacy strings.
3. **Optional structured public APIs later**: after validator-local parity and
   compatibility are proven, consider additive structured diagnostic access
   without removing legacy behavior.

Each phase should be independently reversible. Do not combine message rewrites,
rule changes, public API changes, and representation migration in one phase.

## Testing Requirements

Before a validator swaps internals to structured diagnostics, tests should
cover:

- envelope fields for each migrated rule
- exact diagnostic codes
- exact severity/layer/source values
- authored-data path targets
- deterministic order metadata
- legacy string parity from formatter output
- no input mutation
- no warning activation by default
- validator ownership boundaries
- no dependency on runtime, resolver, import/export, `PreviewCanvas`, adapters,
  DOM, React, CSS selectors, generated files, canonical IDs, child instance
  IDs, instance paths, or path-derived runtime variables
- aggregate diagnostics sorting without rule ownership

Parity tests are required before swapping any existing validator internals.

## Rollback Safety

Rollback must stay validator-local.

A migrated validator should be reversible by restoring its previous internal
diagnostic production path while preserving the same public API. Rollback must
not require runtime, resolver, import/export, `PreviewCanvas`, adapter,
canonical identity, or instance-path changes.

Keep legacy string behavior available until a later explicit public API
migration decides otherwise.

## Dangerous Patterns

Avoid:

- aggregate diagnostics invoking validators
- validators importing formatter/rendering/UI code
- validators importing resolver/runtime/import/export/PreviewCanvas/adapters
- formatters owning validation rules
- producers returning strings as their internal migration output
- reconstructing envelopes from legacy strings
- changing diagnostic messages while changing representation
- activating warnings inside schema or graph validation by default
- making warnings affect `valid`
- deriving runtime variables from diagnostic paths
- introducing canonical IDs or instance paths through diagnostics
- normalizing authored names during diagnostics
- adding adapter-specific diagnostic behavior in core

## Explicit Non-Goals

Beyond the isolated formatter foundation, this migration plan does not
introduce:

- validator migration
- validator wiring
- public validation API changes
- runtime changes
- resolver changes
- `runtimePlan` changes
- runtime emission changes
- import/export changes
- `PreviewCanvas` changes
- adapter changes
- canonical IDs
- child instance IDs
- instance paths
- path-derived runtime variables
- strict mode
