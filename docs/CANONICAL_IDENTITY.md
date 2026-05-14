# Canonical Identity

This document defines the future canonical identity model for Tokify.

This is a documentation checkpoint only. It does not activate canonical
identity, persisted identifiers, canonical name normalization, canonical graph
validation, instance runtime behavior, child runtime resolution, import/export
changes, adapter behavior, or runtime variable naming changes.

This checkpoint supersedes earlier planning shorthand that described canonical
IDs as derived from authored names. Future safe-name, slug, or diagnostic
helpers may still inspect authored names, but those helper outputs are not
canonical IDs.

## Current Active Model

Tokify remains authored-name-based today.

Current active behavior:

- schema `name` values remain authored names
- registry lookup remains authored-name-based
- component-type graph validation remains authored-name-based
- duplicate authored-name validation remains registry-local
- `composition.children[].component` references authored component names
- `composition.children[].name` identifies a child instance only within one
  parent schema's `composition.children` list
- import/export remains unchanged
- resolver behavior remains unchanged
- `runtimePlan` behavior remains unchanged
- flat CSS custom properties remain the runtime contract
- runtime variable names remain unchanged
- no canonical component IDs exist yet
- no canonical child instance IDs exist yet
- no canonical IDs are persisted yet
- no canonical collision, escaping, or normalization rules are enforced yet

Authored-name-only legacy data must continue to work.

## Identity Concepts

Tokify must keep several naming and identity concepts separate.

### Authored Names

Authored names are readable names written into schema and metadata by users,
generated component creation flows, or packages.

Current examples:

- `ComponentSchema.name`
- `composition.children[].component`
- `composition.children[].name`

Authored names are the active lookup and validation surface today. They are
human-facing schema data, not durable machine identity.

Authored names may later be renamed by users, generators, package updates, or
imported data migrations. A rename should not necessarily mean that the logical
component type or child occurrence changed.

### Canonical Component IDs

Canonical component IDs are future durable machine identities for component
types.

They should eventually identify the component type independently from its
authored display name. For example, a future component type could be renamed
from `Button` to `ActionButton` while keeping the same canonical component ID.

Canonical component IDs are not active yet.

### Canonical Child Instance IDs

Canonical child instance IDs are future durable identities for child
occurrences declared inside a parent component composition.

A child instance ID identifies the occurrence owned by the parent schema, not
the referenced component type. For example, `leadingIcon` and `trailingIcon`
could both reference the same future `Icon` component type while remaining
different child instances.

Canonical child instance IDs are not active yet.

### Future Instance Paths

Future instance paths are an addressing model for occurrences in a composition
tree. They are not identity.

Conceptual examples:

```txt
Button
Button.leadingIcon
Button.trailingIcon
Toolbar.primaryAction.icon
```

Paths may change when the composition structure changes. Durable identity
should live in canonical component IDs and canonical child instance IDs, not in
paths.

The `.` character remains reserved as the future semantic instance-path
delimiter. There is no enforcement yet.

### Runtime Variable Names

Runtime variable names are flat CSS custom property names.

Examples:

```txt
--button-background
--button-label-color
--input-radius
```

Runtime variable names are runtime contract names, not identity. They are not
component type IDs, child instance IDs, registry keys, schema IDs, graph nodes,
or import/export identifiers.

## Future Canonical Component IDs

Canonical component IDs should eventually become the durable machine identity
for component types.

Future component ID principles:

- component IDs should be opaque
- component IDs should be persisted when introduced
- component IDs should be stable across authored-name changes
- component IDs should not be derived from authored names
- component IDs should not be derived from slugs
- component IDs should not be derived from file names, import paths, generated
  React names, DOM tags, CSS selectors, or adapter output
- component IDs should not leak into runtime CSS variable names
- component IDs should not replace human-readable authored names in schema
  displays or diagnostics

Canonical component IDs are not active today. The registry still uses authored
names for lookup and duplicate authored-name validation.

## Future Canonical Child Instance IDs

Canonical child instance IDs should eventually become the durable machine
identity for child occurrences inside a parent composition.

Future child instance ID principles:

- child instance IDs should be separate from component type identity
- child instance IDs should identify parent-owned child occurrences
- child instance IDs should be stable across child authored-name changes when
  the semantic child occurrence is the same
- child instance IDs should be stable across moves when the move preserves the
  same semantic occurrence
- child instance IDs should allow repeated use of the same component type under
  different child instances
- child instance IDs should not be derived from child authored names
- child instance IDs should not leak into runtime CSS variable names

Repeated child component types must remain valid. A parent schema may declare
multiple child instances that all reference the same component type, provided
each child occurrence has its own child instance identity.

Canonical child instance IDs are not active today.

## Future Instance Paths

Future instance paths should address occurrences in a composition instance
tree. They should not be treated as durable identity.

Path principles:

- paths may change when component structure changes
- paths may change when a child moves to a different parent or position
- paths may change when authored path segments are renamed
- paths should be derived from semantic composition structure, not DOM
  structure
- paths should not be derived from React hierarchy, CSS selectors, adapter
  imports, generated code structure, or wrapper elements
- paths should support repeated use of the same component type under different
  child instances
- child instance IDs should remain stable across rename or move when the
  semantic child occurrence is the same

The `.` character remains reserved for future semantic path separation.
Current validation must not enforce this reservation yet.

## Runtime Variable Names

Flat CSS custom properties remain Tokify's runtime contract.

Current and future runtime naming principles:

- runtime variables remain flat
- runtime variables are not identity
- runtime variables are not canonical component IDs
- runtime variables are not canonical child instance IDs
- runtime variables are not canonical graph keys
- canonical IDs must not leak into runtime CSS variable names
- runtime variables should stay readable and compatible with the existing flat
  naming contract
- no runtime naming changes are part of this checkpoint

Current examples remain valid:

```txt
--button-background
--button-label-color
--button-icon-color
--input-radius
```

Root slot variables still omit `root`, and non-root slot variables still include
the slot name. Existing runtime emission and preview consumption behavior stays
unchanged.

## Canonicalization Risks

Canonical identity must not be introduced through partial name normalization.
The following risks require an explicit future migration design before
activation.

### Renames

Authored names can change while the logical component type or child occurrence
remains the same. Deriving identity from authored names would incorrectly turn
renames into identity changes.

### Collisions

Two authored names can collide after lowercasing, trimming, punctuation removal,
Unicode normalization, slug generation, or escaping. Collision detection needs
a deliberate compatibility strategy and must begin as warnings before errors.

### Escaping

Names that are safe for schema display may be unsafe for paths, CSS variables,
file systems, URLs, or package identifiers. Escaping for one target must not be
mistaken for durable identity.

### Case Sensitivity

`Button`, `button`, and `BUTTON` may be distinct or equivalent depending on the
target system. Canonical identity must not rely on accidental case behavior.

### Whitespace

Leading, trailing, repeated, and non-breaking whitespace can create confusing
authored names. Trimming or collapsing whitespace is a display or diagnostic
concern until a migration explicitly activates stricter rules.

### Punctuation

Punctuation can affect slugs, paths, CSS variable names, package names, and
diagnostics differently. Punctuation normalization must not create implicit
canonical IDs.

### Reserved `.`

The `.` character is reserved as a future semantic instance-path delimiter.
Current data may still contain `.` because no enforcement exists yet. Future
phases should warn before rejecting names that use `.`.

### Import/Export Compatibility

Existing import/export payloads are authored-name-only and must continue to
work. Any future persisted IDs require a dual-read and backward-compatible
import/export strategy.

### User-Authored Components

Users may rename, duplicate, copy, import, and package components. Future
identity must preserve user intent without silently merging components that only
look similar after normalization.

### Generated Components

Generated components may receive names from prompts, templates, or compiler
heuristics. Generated names are convenient labels, not durable identity.

### External Packages

Packages may contain overlapping authored names, package-specific naming
rules, versioned updates, or renamed components. Future canonical IDs must be
able to distinguish package-owned component identity from local authored names.

## Migration Principles

There is no active migration in this checkpoint.

Future migration principles:

- legacy authored-name-only data must continue to work
- canonical IDs may be introduced only with an explicit migration plan
- migration should use a dual-read and backward-compatible strategy
- existing import/export payloads should remain readable
- new persisted IDs should be additive before they become required
- warning-only diagnostics should precede hard errors for future-safe naming
  risks
- canonical IDs should become persisted opaque data, not regenerated name
  derivatives
- diagnostics should distinguish display-name issues from identity issues
- migration must define behavior for user-authored components, generated
  components, and external package components

Possible future safe-name or diagnostic helpers may be useful, but they must be
named as helpers for warnings, display, or migration planning. They must not be
treated as canonical IDs.

## Relationship To Graph Validation

The current graph validator remains authored-name-only.

Current graph validator behavior:

- graph nodes are authored component names
- graph edges come from `composition.children[].component`
- diagnostics are metadata-only
- duplicate authored-name validation remains registry-local
- graph validation remains separate from `validateComponent(schema)` unless a
  caller explicitly invokes graph validation
- graph validation does not affect resolver behavior, runtime planning, runtime
  emission, preview rendering, import/export, adapters, or schemas

Do not make graph validation half-canonical. A mixed model where some graph
logic uses authored names and other graph logic uses provisional canonical
derivatives would create migration risk without providing durable identity.

Future canonical-aware graph validation requires a deliberate migration phase.
That phase must define persisted IDs, legacy fallback behavior, diagnostics,
import/export compatibility, and the transition from authored-name graph keys
to canonical graph keys.

## Explicit Non-Goals

This checkpoint does not introduce:

- active canonical IDs
- persisted IDs
- canonical name normalization
- canonical collision enforcement
- canonical escaping rules
- schema shape changes
- import/export shape changes
- resolver changes
- runtime changes
- `runtimePlan` changes
- graph validator changes
- registry behavior changes
- instance runtime behavior
- child runtime resolution
- `PreviewCanvas` changes
- adapter changes
- runtime variable naming changes
- validation warnings
- validation errors
- migration behavior

## Recommended Future Phases

Recommended sequence:

1. Keep this docs-only checkpoint as the current canonical identity planning
   boundary.
2. Later, optionally add planning helpers for safe names or diagnostics. Name
   them as safe-name, display-name, or diagnostic candidates, not canonical IDs.
3. Later, add warning-only collision and future-safe naming risk detection.
4. Later, write an explicit migration strategy for persisted identity,
   authored-name-only legacy data, import/export compatibility, generated
   components, user-authored components, and external packages.
5. Later, introduce persisted opaque canonical IDs only when user-authored,
   generated, and package component workflows require durable identity.
6. Later, migrate graph validation deliberately to canonical-aware graph keys
   after persisted IDs and backward-compatible fallbacks exist.

Do not activate canonical identity through registry lookup, graph validation,
runtime planning, runtime variable names, import/export, adapters, or preview
behavior before the migration strategy exists.
