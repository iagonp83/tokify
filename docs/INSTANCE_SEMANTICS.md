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
- import/export remains unchanged
- resolver behavior remains unchanged
- `runtimePlan` remains unchanged
- `PreviewCanvas` behavior remains unchanged
- adapter behavior remains unchanged

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

## Explicit Non-Goals

This checkpoint does not introduce:

- implementation changes
- runtime recursion
- child runtime resolution
- instance runtime behavior
- instance-specific runtime styling
- graph validator rewrites
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
- nested runtime token objects
- validation warnings
- validation errors

## Recommended Future Phases

Recommended sequence:

1. Keep this docs-only checkpoint as the current instance semantics boundary.
2. Later, add metadata-only validation for future-safe child naming risks, if
   needed, starting with warnings rather than errors.
3. Later, optionally add inactive child instance ID fields only behind an
   explicit migration and compatibility plan.
4. Much later, add instance-tree tooling that stays separate from
   component-type graph validation.
5. Treat runtime composition as separate future work, after identity,
   migration, graph, import/export, and adapter boundaries are deliberately
   designed.

Do not activate runtime instance behavior, child runtime resolution, path-based
runtime variable names, or canonical identity as part of instance semantics
planning.
