# Instance Semantics

This document defines future instance-path and child-instance semantics for
Tokify.

This is a documentation checkpoint only. It does not activate runtime instance
behavior, child runtime resolution, child instance IDs, canonical IDs, instance
path serialization, graph/runtime coupling, import/export changes, adapter
behavior, or runtime variable naming changes.

Core principle:

```txt
ID = who it is
Path = where it is
```

Identity and addressing must stay separate. A stable child instance identity
should answer "which occurrence is this?" An instance path should answer "where
is this occurrence currently addressed?"

## Current Active Model

Tokify does not have runtime component instances yet.

Current active behavior:

- `composition.children` remains metadata-only
- child entries are parent-owned child instance metadata
- child entries reference component types by authored name through
  `composition.children[].component`
- child entries use `composition.children[].name` as the authored child
  instance name within one parent schema
- child names remain authored metadata
- child names are not canonical IDs
- child names are not runtime variable names
- child names are not active instance paths
- child names remain parent-scoped
- child instance names are unique only within one parent schema's
  `composition.children` list
- repeated child component types are allowed under different child names
- the component-type graph validator remains component-type-only
- graph validator keys remain authored component type names
- duplicate authored-name validation remains registry-local
- there is no child runtime resolution
- there is no instance runtime
- there is no runtime recursion
- there are no active canonical component IDs
- there are no active child instance IDs
- runtime variable names remain flat and path-independent
- import/export preserves authored child names
- import/export remains unchanged
- resolver behavior remains unchanged
- `runtimePlan` remains unchanged
- `PreviewCanvas` behavior remains unchanged
- adapter behavior remains unchanged
- there are no current validation behavior changes

Current child metadata can describe that a parent schema has a child occurrence.
It does not instantiate the child, resolve the child, render the child, emit
child-specific variables, serialize instance paths, or create adapter output.

## Concepts

Tokify must keep identity, addressing, validation, runtime naming, and ordering
as separate concepts.

### Component Type Identity

Component type identity identifies a reusable component definition, such as
`Button`, `Input`, or a future `Icon`.

Today, component type identity is represented by authored component names in
schemas, registry lookup, and graph validation. Future canonical component IDs
should identify reusable component types durably, but they are not active yet.

Component type identity is not a child occurrence, instance path, runtime
variable name, DOM node, React component name, CSS selector, adapter import, or
generated file path.

### Child Instance Identity

Child instance identity identifies a parent-owned occurrence of a child
component type.

For example, a future `leadingIcon` occurrence and `trailingIcon` occurrence
could both reference the same `Icon` component type while remaining different
child instances.

Future child instance identity should be represented by stable opaque child
instance IDs. Those IDs are not active yet.

### Authored Child Instance Names

Authored child instance names are human-readable names in
`composition.children[].name`.

Today, authored child instance names are the active parent-local metadata
identifier for child entries. They are readable schema data, not durable
machine identity.

Authored child instance names may help form future display paths or diagnostics,
but they should not become canonical child instance IDs.

### Instance Paths

Instance paths are future addresses for occurrences in a composition instance
tree.

Conceptual examples:

```txt
Button
Button.leadingIcon
Button.trailingIcon
Toolbar.primaryAction.icon
```

Instance paths are addresses, not identity. They describe where an occurrence
is addressed in a particular structure. They should not be used as component
IDs, child instance IDs, graph identity, runtime variable names, import/export
identity, or adapter identity.

### Graph Validation Keys

Current graph validation keys are authored component type names.

The current graph validator builds a component-type dependency graph from
registry entries and `composition.children[].component` references. It does not
build an instance tree and does not validate instance paths.

Graph keys are not child instance identities, instance paths, runtime variable
names, DOM paths, or adapter paths.

### Runtime Variable Names

Runtime variable names are flat CSS custom property names.

Examples:

```txt
--button-background
--button-label-color
--input-radius
```

Runtime variable names are runtime contract names, not identity or addressing.
They must remain decoupled from instance paths.

### Ordering Semantics

Ordering describes future sequence, such as render order, adapter output order,
or authoring display order.

Ordering is not identity. Array index, visual order, render order, and adapter
sequence must not become child instance identity or durable path identity.

## Future-Safe Child Naming Warnings

Future-safe child naming warnings are a planned metadata hygiene policy for
`composition.children[].name`.

They are not active today. Current child names remain authored metadata. They
are parent-scoped, preserved by import/export, and are not canonical IDs,
runtime variable names, or active instance paths. Repeated child component
types remain valid under different child names.

Future warning candidates:

- reserved `.` because it is planned as the future semantic instance-path
  delimiter
- leading or trailing whitespace that can make names look identical in UI or
  diagnostics
- repeated whitespace that can create visually ambiguous names
- tabs or newlines that can make names hard to display, diff, serialize, or
  read in diagnostics
- duplicate normalized sibling names, such as names that match after trimming,
  whitespace collapsing, punctuation handling, or other future display-safe
  normalization
- case-only sibling collisions, such as `icon` and `Icon`, where future tools
  or target systems may disagree on case sensitivity
- punctuation-heavy or path-unsafe names that may be awkward for display paths,
  machine paths, files, URLs, packages, or diagnostics
- empty or ambiguous display names that are technically present but not useful
  to humans

Future severity model:

- this phase is documentation-only
- a later phase may add warning-only metadata diagnostics
- warnings must not fail import, build, schema validation, graph validation,
  resolution, runtime emission, preview rendering, or adapter output
- hard errors should exist only after a canonical identity and path migration
  strategy exists
- strict mode, if ever added, must be opt-in and backward-compatible

Compatibility rules:

- existing authored child names must not be broken by this policy
- import must not silently normalize child names
- export must not silently normalize child names
- original authored names must be preserved unless the user explicitly migrates
  them
- future warning helpers must report risks without changing source data
- warning-only diagnostics must not become implicit canonical identity,
  instance path, runtime variable, graph, or adapter behavior

## Warning-Only Metadata Diagnostics Architecture

Warning-only metadata diagnostics are future planning only. They do not exist
as active behavior yet.

The diagnostic envelope and aggregate diagnostics boundary are documented in
[`DIAGNOSTIC_CONTRACT.md`](./DIAGNOSTIC_CONTRACT.md).

The planned warning catalog is documented in
[`WARNING_CATALOG.md`](./WARNING_CATALOG.md).

Future diagnostics should keep these conceptual layers separate:

- schema validation
- graph validation
- metadata hygiene diagnostics
- future canonical/path diagnostics
- aggregate diagnostics coordination

Validators own rules. An aggregate diagnostics layer may coordinate output, but
it must not become monolithic validation logic.

### Schema Validation Layer

Schema validation checks schema correctness.

`validateComponent` remains the schema correctness boundary. It may validate
shape, required fields, local slot references, duplicate local metadata names,
non-empty child names, non-empty component references, and optional
registry-backed child reference checks when explicit registry context is
provided.

`validateComponent` should not become future-path, canonical identity, or
future-safe naming warning logic. Future warnings should remain separate and
opt-in initially.

Schema validation errors affect schema validity. Future metadata warnings do
not.

### Graph Validation Layer

Graph validation remains component-type-only.

The graph validator validates:

- unknown child component references
- direct self-reference
- indirect component-type cycles

The graph validator does not validate:

- child naming hygiene
- instance paths
- canonical IDs
- runtime semantics
- runtime variable naming
- child instance IDs
- adapter behavior

Graph validation should not be rewritten to host naming warnings. Child naming
warnings are metadata hygiene, not graph traversal.

### Metadata Hygiene Diagnostics Layer

Metadata hygiene diagnostics are future warning-only checks for authored
metadata that remains valid but may be risky for future tooling.

Future warning categories include:

- child name whitespace risks
- reserved `.`
- normalized sibling collisions
- case-only sibling collisions
- path-unsafe punctuation
- empty or ambiguous names

Metadata hygiene warnings are non-blocking and non-mutating. They do not change
runtime behavior, resolver behavior, import/export behavior, graph validation,
or schema validity.

### Canonical And Path Diagnostics Layer

Canonical and path diagnostics are future warning-only checks for migration
readiness. Canonical identity remains inactive.

Warnings must not activate canonical IDs, create shadow identity, or cause
authored names to become identity. Names remain human-authored labels.

Paths remain future addresses, not identity. No instance paths are generated in
this checkpoint, and future display paths or machine paths must not become
durable identity by accident.

### Aggregate Diagnostics Coordination

The current aggregate diagnostics coordinator accepts already-created
diagnostics from independent producers and keeps coordination separate from
validator and warning-helper rule ownership.

Future aggregate reporting should prefer:

- a shared diagnostic envelope
- a severity taxonomy with `error` and `warning`
- deterministic ordering
- stable diagnostic codes
- clear layer/source metadata
- predictable layer ordering
- optional aggregate reporting for callers that want one combined result

Shared formatting does not imply merged validator responsibilities. The
aggregate layer coordinates output; it does not own schema validation, graph
validation, metadata hygiene rules, canonical/path diagnostics, resolver
behavior, runtime behavior, import/export behavior, or adapter behavior.

Conceptual layer ordering should keep blocking correctness checks separate from
advisory warnings:

1. schema validation errors
2. optional registry-backed schema validation errors
3. component-type graph validation errors
4. metadata hygiene warnings
5. future canonical/path migration warnings

### Compatibility And Runtime Isolation

Future warnings must not:

- break imports
- mutate exports
- fail builds by default
- fail runtime behavior by default
- fail imports by default
- invalidate existing authored names
- inspect resolved styles
- inspect runtime variable emission
- inspect `runtimePlan`
- affect CSS variable naming
- affect resolver fallback chains
- affect runtime variable consumption
- introduce adapter-specific validation in core

Existing authored names remain valid. Warnings are advisory until explicit
migration tooling and migration policy exist.

### Future Strict Mode

Strict mode remains future-only.

If introduced, strict mode must be opt-in and backward-compatible. It requires
migration tooling first. Warnings may later be promoted selectively, but default
mode must remain permissive.

## Future Child Instance Identity

Future child instance IDs should identify child occurrences durably.

Future child instance ID principles:

- child instance IDs should be stable and opaque
- child instance IDs should be separate from component type identity
- child instance IDs should identify parent-owned child occurrences
- repeated child component types must be supported
- rename should not inherently destroy identity
- reorder should not inherently destroy identity
- move or reparent operations should not inherently destroy identity when the
  semantic child occurrence is the same
- child instance IDs should not be derived from authored child names
- child instance IDs should not be derived from array indexes
- child instance IDs should not be derived from instance paths
- child instance IDs should not leak into runtime CSS variable names

A child instance ID answers "which occurrence is this?" The referenced
component type answers "what reusable definition does this occurrence use?"

Child instance IDs are not active yet.

## Future Instance Paths

Future instance paths should address occurrences in a composition instance
tree.

Path principles:

- paths are addresses, not identity
- paths may change after rename
- paths may change after move or reparent
- paths may change when structure changes
- paths should remain separate from runtime variable naming
- paths should not be derived from DOM structure, React hierarchy, CSS
  selectors, adapter imports, generated code structure, or wrapper elements
- paths should not be used as graph validation keys
- paths should not be serialized into import/export payloads until a dedicated
  migration phase exists

The `.` character remains reserved as a future semantic instance-path
delimiter. Current validation must not enforce this reservation yet.

Future path work should distinguish display paths from machine paths:

- display paths may be readable and derived from authored names for diagnostics
  or UI
- machine paths may need escaping, stable segment rules, or persisted metadata
  for tooling
- neither display paths nor machine paths should be treated as durable identity

Future-safe child naming warnings may help display path readability, but they
do not generate instance paths. Future machine paths may use IDs, safe
segments, or another deliberate addressing strategy. Paths remain addresses,
not identity.

## Ordering Semantics

Ordering may eventually matter for render or adapter sequence. It must not
become identity.

Ordering principles:

- ordering may affect visual, render, authoring, or adapter sequence later
- ordering should be treated as mutable structure
- reordering the same semantic child occurrence should preserve child instance
  identity
- array indexes should not become child instance IDs
- array indexes should not become durable path segments
- path semantics should avoid index-based identity

If future rendering or adapter work needs ordering, it should consume ordering
as a separate structural concern. It should not infer identity from position.

## Relationship To Graph Validation

The current graph validator remains component-type-only.

Current graph validator behavior:

- graph nodes are authored component type names
- graph edges come from `composition.children[].component`
- diagnostics are metadata-only
- unknown references, direct self-reference, and indirect component-type cycles
  are detected at the component-type graph level
- duplicate authored-name validation remains registry-local
- single-schema validation remains separate from whole-registry graph
  validation

The graph validator does not:

- build an instance tree
- validate instance paths
- validate child instance IDs
- perform child runtime resolution
- perform resolver recursion
- generate runtime variables
- consume `runtimePlan`
- consume `PreviewCanvas`
- consume adapter output
- change import/export behavior

Do not couple graph validation to runtime behavior. A component-type graph is a
metadata validation tool, not an instance runtime.

Future child naming warnings are child metadata hygiene. They should not be
merged into component-type graph traversal and should not require a graph
validator rewrite.

## Relationship To Canonical Identity

Canonical identity planning is documented in:

```txt
docs/CANONICAL_IDENTITY.md
```

Future canonical component IDs should identify reusable component types.
Future child instance IDs should identify parent-owned child occurrences.
These identities must not be collapsed together.

Examples:

- one canonical component ID may identify the reusable `Icon` type
- two child instance IDs may identify `leadingIcon` and `trailingIcon`
  occurrences that both reference that same `Icon` type

Canonical IDs remain inactive. There are no active canonical component IDs,
canonical child instance IDs, canonical graph keys, or persisted identity
migrations in this checkpoint.

Future-safe names are not canonical IDs. Naming warning helpers must not be
called canonical ID helpers, and authored names must not become identity.
Future child instance IDs remain separate from authored child names and from
future-safe display or path segments.

## Relationship To Runtime Variable Naming

The flat CSS custom property runtime contract remains unchanged.

Current examples remain valid:

```txt
--button-background
--button-label-color
--button-icon-color
--input-radius
```

Runtime naming principles:

- runtime variables remain flat
- runtime variables remain path-independent
- runtime variables are not identity
- runtime variables are not instance paths
- runtime variables are not child instance IDs
- runtime variables are not canonical component IDs
- runtime variables are not graph validation keys
- no path-derived runtime variables should be introduced
- no path-expanded runtime variable names should be introduced
- no nested runtime token objects should be introduced

Avoid path-expanded CSS variables such as:

```txt
--toolbar-primaryAction-icon-button-background
--button-leadingIcon-icon-color
```

Future instance-aware styling, if ever added, should prefer scoped
reassignment of the existing flat variable contract over path-expanded variable
names. For example, a future runtime could assign the same flat component or
slot variables inside a scoped instance boundary instead of generating a global
variable name that encodes the full instance path.

This checkpoint does not introduce instance-aware styling.

Future-safe child naming policy has no runtime effect. It must not alter
runtime variable generation, runtime variable consumption, scoped variable
assignment, `runtimePlan`, or emitted CSS custom properties.

## Migration And Risk Notes

Future instance semantics require careful migration design before activation.

### Rename Instability

Authored child names can change while the semantic occurrence remains the same.
Identity derived from names would make harmless renames destructive.

### Reorder Instability

Array order can change for authoring, display, or adapter needs. Identity
derived from indexes would make reorder operations destructive.

### Path Invalidation

Paths may change after rename, move, reparent, or structure edits. Durable data
must not depend on paths as if they were identity.

### Duplicate Sibling Names

Current validation rejects duplicate child names within one parent schema's
`composition.children` list. Future display paths, machine paths, package
merges, and migration tooling still need explicit collision strategies,
especially when normalization or escaping is introduced.

### Escaping

Readable names may be unsafe in paths, CSS variables, files, URLs, or package
metadata. Escaped strings for one target must not become identity.

### Reserved `.`

The `.` character is reserved as the future semantic instance-path delimiter.
No enforcement exists yet, so future phases should introduce warnings before
errors for names that rely on `.` as ordinary content.

### Runtime Naming Leakage

Instance paths must not leak into runtime variable names. Path-expanded CSS
variables would break the flat runtime contract and create unnecessary
renaming, reparenting, and compatibility risks.

### Adapter Leakage

Adapter output order, import paths, generated file names, JSX structure, DOM
structure, and CSS selectors must not define child instance identity or
instance paths.

### Import/Export Compatibility

Existing import/export payloads do not serialize instance paths or child
instance IDs. Future serialization requires an explicit migration plan,
dual-read compatibility, and legacy authored-name-only support.

### Future-Safe Naming Warnings

Warning-only diagnostics can help users find names that may be risky for future
display paths, machine paths, migration tooling, or package boundaries. They
must remain advisory until a migration policy exists. They must preserve the
original authored child names and must not silently normalize imported or
exported data.

## Explicit Non-Goals

This checkpoint does not introduce:

- implementation changes
- runtime recursion
- child runtime resolution
- instance runtime behavior
- instance-specific runtime styling
- graph validator rewrites
- aggregate diagnostics behavior beyond pure coordination
- schema breaking changes
- schema-breaking naming rules
- resolver changes
- runtime changes
- `runtimePlan` changes
- registry behavior changes
- schema changes
- import/export changes
- `PreviewCanvas` changes
- adapter changes
- child instance ID activation
- canonical ID activation
- instance path serialization
- path-derived CSS variables
- path-expanded runtime variable names
- nested runtime token objects
- validation warnings
- validation errors
- strict mode
- adapter-specific naming rules
- adapter-specific validation in core

## Recommended Future Phases

Recommended sequence:

1. Keep this docs-only checkpoint as the current instance semantics boundary.
2. Keep future-safe child naming policy documentation-only in this phase.
3. Later, add warning-only metadata diagnostics for future-safe child naming
   risks.
4. Keep the diagnostic contract and aggregate coordinator isolated from
   validators, runtime, resolver, and import/export behavior.
5. Later, add structured diagnostics internally while preserving legacy string
   output.
6. Later, add opt-in warning collection based on the planned warning catalog
   without changing schema validity,
   graph validation, runtime behavior, import/export, or adapters.
7. Later, add optional aggregate reporting beyond pure coordination without
   owning validator rules.
8. Later, add migration tooling before hard errors.
9. Later, consider optional strict mode only after a migration policy exists,
   and keep strict mode opt-in and backward-compatible.
10. Later, optionally add inactive child instance ID fields only behind an
   explicit migration and compatibility plan.
11. Much later, add instance-tree tooling that stays separate from
   component-type graph validation.
12. Treat runtime composition as separate future work, after identity,
   migration, graph, import/export, and adapter boundaries are deliberately
   designed.

Do not activate runtime instance behavior, child runtime resolution, path-based
runtime variable names, or canonical identity as part of instance semantics
planning.
