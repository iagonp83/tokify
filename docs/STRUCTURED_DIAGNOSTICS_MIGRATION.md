# Structured Diagnostics Migration

This document defines the migration plan from legacy string diagnostics to
internal structured `DiagnosticEnvelope` diagnostics.

The isolated legacy formatter foundation now exists as compatibility
infrastructure, and validator-local internal structured migrations are closed
for `validateComponent` top-level schema presence diagnostics, variant-axis
diagnostics, token binding diagnostics, and composition slot relation local
reference diagnostics only. This plan still does not introduce broad validator
migration, global validator wiring, public validation APIs, runtime behavior,
resolver behavior, `runtimePlan` behavior, runtime emission, import/export
behavior, `PreviewCanvas` behavior, canonical IDs, child instance IDs, instance
paths, path-derived runtime variables, strict mode, or blocking warnings.

## Current Boundary

Current public validator behavior remains legacy-compatible:

- `validateComponent` returns its current legacy string diagnostics
- `validateComponent` internally migrates only its top-level schema presence
  diagnostics, variant-axis diagnostics, token binding diagnostics, and
  composition slot relation local reference diagnostics through validator-local
  helpers
- the migrated top-level schema presence codes are
  `SCHEMA_COMPONENT_NAME_REQUIRED`, `SCHEMA_ROOT_SLOT_REQUIRED`, and
  `SCHEMA_DEFAULT_STATE_REQUIRED`
- the migrated variant-axis codes are
  `SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS` and
  `SCHEMA_VARIANT_AXIS_INVALID_DEFAULT`
- the migrated token binding codes are
  `SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT`,
  `SCHEMA_TOKEN_BINDING_UNKNOWN_STATE`,
  `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS`, and
  `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION`
- the migrated composition slot relation local reference codes are
  `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT` and
  `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT`
- the component graph validator returns its current legacy string diagnostics
- warning diagnostics remain opt-in and non-blocking
- aggregate diagnostics remains coordinator-only
- the legacy formatter is used only by local validateComponent compatibility
  helpers and is not globally wired into validators or public validation APIs

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

Rule producers should not own broad rendering or public API formatting. A
validator-local compatibility bridge may immediately format its own envelopes
back to legacy strings while public validator APIs remain legacy-compatible.
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

`validateComponent` owns schema-local correctness rules only. Its current
internally structured rule families are top-level schema presence validation,
variant-axis validation, token binding validation, and composition slot relation
local reference validation. The local helpers create structured envelopes for
only:

- `SCHEMA_COMPONENT_NAME_REQUIRED`
- `SCHEMA_ROOT_SLOT_REQUIRED`
- `SCHEMA_DEFAULT_STATE_REQUIRED`
- `SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS`
- `SCHEMA_VARIANT_AXIS_INVALID_DEFAULT`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_STATE`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION`
- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT`
- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT`

They immediately format those envelopes back to legacy strings and return
`string[]` to the existing validator flow. Broader `validateComponent`
structured diagnostics may eventually cover composition part metadata, child
metadata shape, slot relation topology, duplicate local metadata, and
already-supported optional registry-backed child reference checks. It must not
own graph traversal, child-name hygiene warnings, canonical readiness, resolver
behavior, runtime behavior, import/export behavior, or adapter behavior.

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

## ValidateComponent Structured Slice Inventory

This checkpoint was documentation-only. It inventoried the
`validateComponent` legacy string diagnostics that were not yet internally
structured at the time of the inventory. Since then, the top-level schema
presence, variant-axis, token binding, and composition slot relation local
reference slices have closed. The current remaining inventory starts after the
closed entries below. This documentation checkpoint did not change
validator behavior, public APIs, graph validation, warning collection,
aggregate diagnostics, runtime, resolver, import/export, `PreviewCanvas`, or
adapters.

Currently internally structured and therefore excluded from future remaining
legacy migration slices:

- `SCHEMA_COMPONENT_NAME_REQUIRED`
- `SCHEMA_ROOT_SLOT_REQUIRED`
- `SCHEMA_DEFAULT_STATE_REQUIRED`
- `SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS`
- `SCHEMA_VARIANT_AXIS_INVALID_DEFAULT`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_STATE`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION`
- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT`
- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT`

Current legacy ordering in `validateComponent` is:

1. top-level schema presence checks
2. variant-axis checks, already internally structured, in `variants` array order
3. token binding checks, already internally structured, in `tokenBindings`
   array order, with condition checks in authored object entry order
4. composition slot relation local reference checks, already internally
   structured, in `slotRelations` array order
5. composition part local reference checks in `parts` array order
6. composition child shape, optional registry-backed reference, and local slot
   reference checks in `children` array order
7. slot relation topology checks, with self-reference diagnostics discovered
   before cycle diagnostics
8. duplicate `slotRelations`, duplicate `parts`, and duplicate `children`
   diagnostics, each in first repeated value discovery order

Rollback boundaries used below:

- **Presence helper rollback**: delete only the validator-local presence helper
  and restore the previous three top-level `errors.push(...)` branches.
- **Token binding helper rollback**: delete only the validator-local token
  binding helper and restore the previous token binding loop strings.
- **Composition slot relation local reference helper rollback**: delete only the
  validator-local slot relation local reference helper and restore the previous
  `slotRelations` branch strings.
- **Composition reference helper rollback**: delete only a future
  validator-local composition reference helper and restore the current `parts`
  or `children` branch strings.
- **Topology helper rollback**: restore `validateSlotRelationTopology` to
  constructing and returning the current legacy strings directly.
- **Duplicate helper rollback**: delete only the future duplicate metadata
  diagnostic helper and restore the current `findDuplicates(...).forEach`
  string branches.
- **Registry branch rollback**: restore the current optional
  `options.registry` child reference branch strings.

### Closed Since Inventory

#### Component Name Required

- Current legacy message: `Component name is required.`
- Current location/branch: validator-local presence helper branch,
  `if (!schema.name.trim())`
- Current deterministic ordering position: first possible diagnostic, before
  root slot, default state, variant-axis diagnostics, and every composition
  rule
- Rule family: top-level schema presence
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: presence helper rollback
- Parity test difficulty: low; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_COMPONENT_NAME_REQUIRED`
- Migration status: closed

#### Root Slot Required

- Current legacy message: `Component requires a "root" slot.`
- Current location/branch: validator-local presence helper branch,
  `if (!slotNames.has("root"))`
- Current deterministic ordering position: after component name, before default
  state and variant-axis diagnostics
- Rule family: top-level schema presence
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: presence helper rollback
- Parity test difficulty: low; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_ROOT_SLOT_REQUIRED`
- Migration status: closed

#### Default State Required

- Current legacy message: `Component requires a "default" state.`
- Current location/branch: validator-local presence helper branch,
  `if (!stateNames.has("default"))`
- Current deterministic ordering position: after component name and root slot,
  before variant-axis diagnostics
- Rule family: top-level schema presence
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: presence helper rollback
- Parity test difficulty: low; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_DEFAULT_STATE_REQUIRED`
- Migration status: closed

#### Token Binding Unknown Slot

- Current legacy message:
  `Token binding "{target}" references unknown slot "{slot}".`
- Current location/branch: validator-local token binding helper branch,
  `if (!slotNames.has(binding.slot))`
- Current deterministic ordering position: first diagnostic for each
  `tokenBindings` entry, after all top-level and variant-axis diagnostics, and
  before that binding's condition diagnostics
- Rule family: token binding local references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: token binding helper rollback
- Parity test difficulty: low to medium; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT`
- Migration status: closed

#### Token Binding Unknown State

- Current legacy message:
  `Token binding "{target}" references unknown state "{option}".`
- Current location/branch: validator-local token binding helper condition
  branch where `axisName === "state"` and `!stateNames.has(option)`
- Current deterministic ordering position: within the current binding's
  `Object.entries(binding.conditions ?? {})` order, after that binding's
  unknown-slot diagnostic if present, before later condition entries and before
  later token bindings
- Rule family: token binding local references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: token binding helper rollback
- Parity test difficulty: medium, because parity must preserve authored
  condition entry order and the `undefined` condition skip; parity coverage is
  closed
- `DiagnosticCode`: `SCHEMA_TOKEN_BINDING_UNKNOWN_STATE`
- Migration status: closed

#### Token Binding Unknown Variant Axis

- Current legacy message:
  `Token binding "{target}" references unknown variant axis "{axisName}".`
- Current location/branch: validator-local token binding helper condition
  branch where `variantAxes.get(axisName)` is missing
- Current deterministic ordering position: within the current binding's
  condition entry order, after the binding-level unknown-slot diagnostic if
  present, and before later condition entries and later token bindings
- Rule family: token binding local references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: token binding helper rollback
- Parity test difficulty: medium, because parity must preserve condition entry
  order and the early return that prevents an unknown-option diagnostic for the
  same condition; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS`
- Migration status: closed

#### Token Binding Unknown Variant Option

- Current legacy message:
  `Token binding "{target}" references unknown {axisName} option "{option}".`
- Current location/branch: validator-local token binding helper condition
  branch where a variant axis exists but does not include the selected option
- Current deterministic ordering position: within the current binding's
  condition entry order, after the binding-level unknown-slot diagnostic if
  present, and before later condition entries and later token bindings
- Rule family: token binding local references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: medium, because the human string embeds the authored
  axis name as grammar
- Rollback boundary: token binding helper rollback
- Parity test difficulty: medium, because tests must preserve condition order
  and axis-name interpolation; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION`
- Migration status: closed

#### Composition Slot Relation Unknown Slot

- Current legacy message:
  `Composition slot relation references unknown slot "{slot}".`
- Current location/branch: validator-local composition slot relation local
  reference helper branch,
  `if (!slotNames.has(relation.slot))`
- Current deterministic ordering position: first possible diagnostic for each
  `slotRelations` entry, after all token binding diagnostics and before the same
  relation's unknown-parent-slot diagnostic
- Rule family: composition local slot references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: composition slot relation local reference helper rollback
- Parity test difficulty: low; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT`
- Migration status: closed

#### Composition Slot Relation Unknown Parent Slot

- Current legacy message:
  `Composition slot relation references unknown parent slot "{parentSlot}".`
- Current location/branch: validator-local composition slot relation local
  reference helper branch,
  `if (relation.parentSlot && !slotNames.has(relation.parentSlot))`
- Current deterministic ordering position: second possible diagnostic for each
  `slotRelations` entry, after the same relation's unknown-slot diagnostic if
  present and before later relation entries
- Rule family: composition local slot references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: composition slot relation local reference helper rollback
- Parity test difficulty: low; parity coverage is closed
- `DiagnosticCode`: `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT`
- Migration status: closed

### Remaining Legacy Diagnostic Inventory

#### Composition Part Unknown Slot

- Current legacy message:
  `Composition part "{partName}" references unknown slot "{slot}".`
- Current location/branch: `validateComponent.ts:102`,
  `if (!slotNames.has(part.slot))`
- Current deterministic ordering position: after all slot relation local
  reference diagnostics and before composition child diagnostics
- Rule family: composition local slot references
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: composition reference helper rollback
- Parity test difficulty: low
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT`
- Recommended migration priority: P1, after top-level presence and before
  topology

#### Composition Child Name Required

- Current legacy message: `Composition child name is required.`
- Current location/branch: `validateComponent.ts:110`,
  `if (!child.name.trim())`
- Current deterministic ordering position: first possible diagnostic for each
  `children` entry, after part diagnostics and before component-reference,
  registry-backed, and child-slot diagnostics for the same child
- Rule family: composition child metadata shape
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: medium, because future child-name hygiene warnings
  are adjacent but must remain separate and opt-in
- Rollback boundary: composition reference helper rollback
- Parity test difficulty: low to medium, mainly to prove no warning activation
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED`
- Recommended migration priority: P2, after simpler schema-local reference
  families and without wiring child-name hygiene warnings

#### Composition Child Component Required

- Current legacy messages:
  `Composition child "{childName}" requires a component reference.` and
  `Composition child requires a component reference.`
- Current location/branch: `validateComponent.ts:114`,
  `if (!child.component.trim())`, with a message branch based on
  `child.name.trim()`
- Current deterministic ordering position: after the same child's blank-name
  diagnostic if present, before optional registry-backed child component checks
  and before the same child's unknown-slot diagnostic
- Rule family: composition child metadata shape
- Purely schema-local: yes
- Depends on registry: no for this branch
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: medium, because one rule has two legacy message
  shapes
- Rollback boundary: composition reference helper rollback
- Parity test difficulty: medium, because parity should cover both named and
  unnamed child branches
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED`
- Recommended migration priority: P2, after simpler schema-local reference
  families

#### Registry-Backed Composition Child Self-Reference

- Current legacy message:
  `Composition child "{childName}" cannot reference parent component "{schemaName}".`
- Current location/branch: `validateComponent.ts:122`, optional
  `options.registry && child.component.trim()` branch where
  `child.component === schema.name`
- Current deterministic ordering position: after blank child name and blank
  child component checks for the same child, before unknown registry component
  and before the same child's unknown-slot diagnostic
- Rule family: optional registry-backed composition child component references
- Purely schema-local: no
- Depends on registry: yes
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: medium, because a related direct self-reference rule
  also exists in the separate component-type graph validator with different
  wording
- Rollback boundary: registry branch rollback
- Parity test difficulty: medium
- Candidate `DiagnosticCode`: `REGISTRY_COMPOSITION_CHILD_SELF_REFERENCE`
- Recommended migration priority: deferred; do not include in the next
  schema-local slice

#### Registry-Backed Composition Child Unknown Component

- Current legacy message:
  `Composition child "{childName}" references unknown component "{componentName}".`
- Current location/branch: `validateComponent.ts:127`, optional
  `options.registry && child.component.trim()` branch where
  `!hasRegistryComponent(options.registry, child.component)`
- Current deterministic ordering position: after blank child name and blank
  child component checks for the same child, mutually exclusive with the
  registry-backed self-reference diagnostic, and before the same child's
  unknown-slot diagnostic
- Rule family: optional registry-backed composition child component references
- Purely schema-local: no
- Depends on registry: yes
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: medium, because a related unknown component rule also
  exists in the separate component-type graph validator with different wording
- Rollback boundary: registry branch rollback
- Parity test difficulty: medium
- Candidate `DiagnosticCode`: `REGISTRY_COMPOSITION_CHILD_UNKNOWN_COMPONENT`
- Recommended migration priority: deferred; do not include in the next
  schema-local slice

#### Composition Child Unknown Slot

- Current legacy message:
  `Composition child "{childName}" references unknown slot "{slot}".`
- Current location/branch: `validateComponent.ts:134`,
  `if (!slotNames.has(child.slot))`
- Current deterministic ordering position: last possible diagnostic for each
  `children` entry, after child shape and optional registry-backed component
  reference diagnostics for the same child
- Rule family: composition local slot references
- Purely schema-local: yes
- Depends on registry: no for this branch
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: composition reference helper rollback
- Parity test difficulty: low
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT`
- Recommended migration priority: P1, after top-level presence and before
  topology

#### Composition Slot Relation Self-Parent

- Current legacy message:
  `Composition slot relation "{slot}" cannot reference itself as parent.`
- Current location/branch: `validateComponent.ts:269`, inside
  `validateSlotRelationTopology`, after unknown slot and unknown parent slot
  relations have been skipped
- Current deterministic ordering position: after all direct composition child
  diagnostics and before slot relation cycle diagnostics and duplicate metadata
  diagnostics
- Rule family: schema-local slot relation topology
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no; this is local slot topology, not the
  component-type graph validator
- Depends on runtime/resolver/import-export: no
- Message stability risk: low to medium, because it is embedded in topology
  traversal and skips invalid local references first
- Rollback boundary: topology helper rollback
- Parity test difficulty: medium
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_SLOT_RELATION_SELF_PARENT`
- Recommended migration priority: P3, after simpler schema-local families

#### Composition Slot Relation Cycle

- Current legacy message:
  `Composition slot relations contain a cycle: {cyclePath}.`
- Current location/branch: `validateComponent.ts:287`,
  `findSlotRelationCycles(relations).forEach(...)`
- Current deterministic ordering position: after topology self-parent
  diagnostics and before duplicate metadata diagnostics; cycle ordering follows
  the discovered relation traversal order after duplicate relation slots are
  skipped
- Rule family: schema-local slot relation topology
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no; this is local slot topology, not the
  component-type graph validator
- Depends on runtime/resolver/import-export: no
- Message stability risk: high relative to other schema-local rules, because
  the cycle path text depends on traversal and cycle normalization behavior
- Rollback boundary: topology helper rollback
- Parity test difficulty: high
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_SLOT_RELATION_CYCLE`
- Recommended migration priority: P3, defer until simpler schema-local families
  are migrated

#### Duplicate Composition Slot Relation

- Current legacy message:
  `Composition slot relation "{slot}" is duplicated.`
- Current location/branch: `validateComponent.ts:143`,
  `findDuplicates(composition.slotRelations.map((relation) => relation.slot))`
- Current deterministic ordering position: after slot relation topology
  diagnostics and before duplicate composition part diagnostics
- Rule family: duplicate local composition metadata
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: duplicate helper rollback
- Parity test difficulty: low
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE`
- Recommended migration priority: P2, safe but not as foundational as the
  top-level presence slice

#### Duplicate Composition Part

- Current legacy message:
  `Composition part "{partName}" is duplicated.`
- Current location/branch: `validateComponent.ts:149`,
  `findDuplicates(composition.parts.map((part) => part.name))`
- Current deterministic ordering position: after duplicate slot relation
  diagnostics and before duplicate composition child diagnostics
- Rule family: duplicate local composition metadata
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: low
- Rollback boundary: duplicate helper rollback
- Parity test difficulty: low
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_PART_DUPLICATE`
- Recommended migration priority: P2, safe but not as foundational as the
  top-level presence slice

#### Duplicate Composition Child

- Current legacy message:
  `Composition child "{childName}" is duplicated.`
- Current location/branch: `validateComponent.ts:155`,
  `findDuplicates(composition.children.map((child) => child.name))`
- Current deterministic ordering position: after duplicate slot relation and
  duplicate part diagnostics; currently the last `validateComponent` diagnostic
  family
- Rule family: duplicate local composition metadata
- Purely schema-local: yes
- Depends on registry: no
- Depends on graph validation: no
- Depends on runtime/resolver/import-export: no
- Message stability risk: medium, because child-name hygiene warnings are
  adjacent but must remain separate and opt-in
- Rollback boundary: duplicate helper rollback
- Parity test difficulty: low to medium, mainly to prove no warning activation
- Candidate `DiagnosticCode`: `SCHEMA_COMPOSITION_CHILD_DUPLICATE`
- Recommended migration priority: P2, safe but should stay separate from
  child-name hygiene warning integration

### Closed Presence Structured Slice

The structured migration slice previously recommended by this inventory is now
closed. The migrated top-level schema presence family is:

- `SCHEMA_COMPONENT_NAME_REQUIRED`
- `SCHEMA_ROOT_SLOT_REQUIRED`
- `SCHEMA_DEFAULT_STATE_REQUIRED`

Why this slice was selected:

- it is tiny and purely schema-local
- it has no registry, graph validator, runtime, resolver, import/export,
  `PreviewCanvas`, or adapter dependency
- it is the first diagnostic block in `validateComponent`, so ordering parity is
  straightforward
- all three legacy messages are stable and already covered by existing public
  validation behavior
- rollback can delete only a validator-local presence helper and restore the
  previous `errors.push(...)` branches
- parity tests can cover exact legacy strings, field metadata, ordering before
  variant-axis diagnostics, no input mutation, and no public API change

The closed slice preserves the current public `string[]` return shape, avoids a
top-level structured diagnostics array, avoids `aggregateDiagnostics`, avoids
graph validator changes, and avoids warning integration. Presence diagnostics
remain ordered before the already-migrated variant-axis diagnostics.

### Closed Token Binding Structured Slice

The third validator-local internal structured migration is now closed. The
migrated token binding family is:

- `SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_STATE`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION`

This closed slice preserves the current public `string[]` return shape, avoids
a top-level structured diagnostics array, avoids `aggregateDiagnostics`, avoids
graph validator changes, avoids registry-backed check changes, and avoids
warning integration.

Token binding diagnostics remain ordered after top-level schema presence and
variant-axis diagnostics. The migrated helper preserves `tokenBindings` array
order, authored `Object.entries(binding.conditions ?? {})` order, unknown-slot
diagnostics before condition diagnostics for the same binding, unknown variant
axis early-return behavior, and the current skip behavior for `undefined`
condition entries.

### Closed Composition Slot Relation Local Reference Structured Slice

The fourth validator-local internal structured migration is now closed. The
migrated composition slot relation local reference family is:

- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT`
- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT`

This closed slice preserves the current public `string[]` return shape, avoids
a top-level structured diagnostics array, avoids `aggregateDiagnostics`, avoids
graph validator changes, avoids registry-backed check changes, avoids topology
diagnostic migration, and avoids warning integration.

Composition slot relation local reference diagnostics remain ordered after
top-level schema presence, variant-axis, and token binding diagnostics. The
migrated helper preserves `slotRelations` array order and same-relation
ordering where unknown-slot diagnostics appear before unknown-parent-slot
diagnostics.

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
  `DiagnosticEnvelope` values to legacy strings without changing public
  validator APIs.
- **Formatter parity tests for validateComponent variant axes**:
  byte-for-byte parity is proven for empty variant options, invalid variant
  defaults, ordering, formatter non-sorting, and empty-options short-circuit
  behavior.
- **First validator-local internal structured migration**:
  `validateComponent` variant-axis diagnostics now create
  `DiagnosticEnvelope` values internally and immediately format them back to
  legacy strings through `legacyDiagnosticFormatter`.
- **Presence formatter parity tests for validateComponent**:
  byte-for-byte parity is proven for component-name-required,
  root-slot-required, and default-state-required diagnostics, including
  ordering before variant-axis diagnostics.
- **Second validator-local internal structured migration**:
  `validateComponent` top-level schema presence diagnostics now create
  `DiagnosticEnvelope` values internally and immediately format them back to
  legacy strings through `legacyDiagnosticFormatter`.
- **Token binding formatter parity tests for validateComponent**:
  byte-for-byte parity is proven for unknown slot, unknown state, unknown
  variant axis, unknown variant option, token binding order, authored condition
  order, unknown-axis early return, and `undefined` condition skip behavior.
- **Third validator-local internal structured migration**:
  `validateComponent` token binding diagnostics now create
  `DiagnosticEnvelope` values internally and immediately format them back to
  legacy strings through `legacyDiagnosticFormatter`.
- **Composition slot relation local reference formatter parity tests for
  validateComponent**: byte-for-byte parity is proven for unknown slot, unknown
  parent slot, ordering after presence, variant-axis, and token binding
  diagnostics, `slotRelations` array order, same-relation unknown-slot before
  unknown-parent-slot order, formatter non-sorting, and formatter non-mutation.
- **Fourth validator-local internal structured migration**:
  `validateComponent` composition slot relation local reference diagnostics now
  create `DiagnosticEnvelope` values internally and immediately format them
  back to legacy strings through `legacyDiagnosticFormatter`.

Recommended future phases:

1. **Additional formatter parity tests**: prove envelope-to-string rendering
   matches current legacy strings exactly for the next target rule family.
2. **Additional validator-local internal structured migrations**: migrate one
   rule family at a time while preserving each validator's public return shape
   and legacy strings.
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
- validators importing formatter/rendering/UI code outside an explicit
  validator-local legacy compatibility bridge
- validators importing resolver/runtime/import/export/PreviewCanvas/adapters
- formatters owning validation rules
- producers returning only strings as their structured migration output
- reconstructing envelopes from legacy strings
- changing diagnostic messages while changing representation
- activating warnings inside schema or graph validation by default
- making warnings affect `valid`
- deriving runtime variables from diagnostic paths
- introducing canonical IDs or instance paths through diagnostics
- normalizing authored names during diagnostics
- adding adapter-specific diagnostic behavior in core

## Explicit Non-Goals

Beyond the isolated formatter foundation and the closed `validateComponent`
top-level schema presence, variant-axis, token binding, and composition slot
relation local reference validator-local migrations, this migration plan does
not introduce:

- broad validator migration
- global validator wiring
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
