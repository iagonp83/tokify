# Current System Snapshot

## Stable State

The project is currently a React + TypeScript + Vite application.

The runtime token contract remains a flat CSS variable map. The system does not
emit nested runtime token objects.

Project-level execution principles are documented in
`docs/ENGINEERING_PRINCIPLES.md`. They are part of the project context for
future phases and prioritize quality, scalability, architectural safety,
maintainability, and correctness over speed.

Current stabilized areas:

- resolver system
- token resolver
- variant system
- namespace inheritance
- flat runtime token output
- Composition System Foundation
- Composition Resolver Integration
- Resolver Hardening
- Runtime Emission Integration milestone
- Runtime Consumption Safety Model
- Preview-local Runtime Consumption Policy Registry extraction
- Composition Phase 2A child metadata validation
- Composition graph semantics and instance identity planning
- Canonical identity and naming semantics planning
- Canonical Identity Planning Documentation Checkpoint
- Instance Path & Child Instance Semantics Documentation Checkpoint
- Future-safe Child Naming Warnings Planning Documentation Checkpoint
- Warning-only Metadata Diagnostics Architecture Documentation Checkpoint
- Warning Catalog Planning Documentation Checkpoint
- Child Name Hygiene Diagnostics API & Codes Planning Checkpoint
- Child Name Hygiene Diagnostics Foundation
- Structured Diagnostics Migration Planning Documentation Checkpoint
- Diagnostic Contract Planning Documentation Checkpoint
- Diagnostic Contract Foundation
- Diagnostic Aggregate Coordinator Foundation
- Legacy Diagnostic Formatter Foundation
- ValidateComponent Variant Diagnostic Formatter Parity Checkpoint
- First Internal Structured Validator Migration: validateComponent variant-axis
  diagnostics
- ValidateComponent Structured Slice Inventory Documentation Checkpoint
- ValidateComponent Presence Diagnostic Formatter Parity Checkpoint
- Second Internal Structured Validator Migration: validateComponent top-level
  schema presence diagnostics
- ValidateComponent Token Binding Diagnostic Formatter Parity Checkpoint
- Third Internal Structured Validator Migration: validateComponent token
  binding diagnostics
- ValidateComponent Composition Slot Relation Local Reference Formatter Parity
  Checkpoint
- Fourth Internal Structured Validator Migration: validateComponent composition
  slot relation local reference diagnostics
- ValidateComponent Composition Part Local Reference Formatter Parity Checkpoint
- Fifth Internal Structured Validator Migration: validateComponent composition
  part local reference diagnostics
- Component Registry Foundation Commit 1
- Registry-backed Composition Metadata Validation Commit 2
- Graph Validator Planning documentation boundary
- Pure Component-Type Graph Validator Commit 1

Automated regression tests cover:

- resolver behavior
- token resolver mappings and failures
- variant defaults and explicit selections
- schema-derived variant axes
- compound variant behavior through `tokenBindings.conditions`
- state-specific bindings
- namespace inheritance
- flat runtime output
- composition metadata validation
- child metadata blank-name and blank-component-reference validation
- baseline composition resolver behavior
- slot relation graph normalization
- conservative slot inheritance
- flat slot runtime planning metadata
- property registry lookup and style metadata
- registry-driven inheritance and runtime planning behavior
- slot relation self-reference and cycle validation
- runtimePlan provenance metadata
- runtime CSS variable emission helper behavior
- additive preview runtime variable wiring
- selective preview consumption of safe runtime variables
- preview-local runtime consumption policy behavior
- metadata-only component registry lookup and duplicate authored-name validation
- optional registry-backed composition child reference validation
- pure component-type graph validation for unknown references, direct
  self-reference, and indirect cycles
- graph validator separation from duplicate authored-name registry validation
- backward-compatible `validateComponent(schema)` behavior with graph validation
  kept separate
- stable diagnostic envelope creation and deterministic diagnostic sorting
- pure diagnostic aggregate coordination for already-created diagnostics
- isolated opt-in child-name hygiene diagnostics for first-phase structured
  warning envelopes
- isolated legacy diagnostic formatting from structured envelopes to legacy
  strings
- formatter parity coverage for validateComponent variant-axis diagnostics
- formatter parity coverage for validateComponent top-level schema presence
  diagnostics
- formatter parity coverage for validateComponent token binding diagnostics
- formatter parity coverage for validateComponent composition slot relation
  local reference diagnostics
- formatter parity coverage for validateComponent composition part local
  reference diagnostics
- validator-local structured migration coverage for validateComponent
  top-level schema presence, variant-axis, token binding, and composition slot
  relation local reference, and composition part local reference diagnostics
  while preserving public legacy strings

## Component Model Structure

The Component Model lives in `src/compiler/component-model/`.

Current files:

- `component.types.ts`
- `componentGraphValidation.ts`
- `button.schema.ts`
- `componentRegistry.ts`
- `compositionSlotRelations.ts`
- `input.schema.ts`
- `propertyRegistry.ts`
- `resolveComponent.ts`
- `runtimeEmission.ts`
- `runtimePlan.ts`
- `validateComponent.ts`
- `tokenResolver.ts`

The core schema shape is:

```ts
ComponentSchema = {
  composition?,
  editable,
  name,
  slots,
  states,
  tokenBindings,
  variants,
  version
}
```

Components are library-agnostic. They do not describe React, DOM, CSS classes,
or adapters. They describe:

- available slots
- supported states
- variant axes
- token bindings
- edit policy
- optional composition metadata

`ComponentKind` remains limited to:

- `card`
- `toolbar`
- `panel`

`ComponentNamespace` includes authored/reference namespaces:

- `button`
- `input`

`Button` and `Input` remain reference-mode components by default. They inherit
from the active `card`, `toolbar`, or `panel` skin and may receive optional
field-level overrides through `DesignState.componentTokens`.

Button is already multi-slot in schema terms:

- `root`
- `label`
- `icon`

Input currently uses only:

- `root`

## Composition Foundation And Resolver Integration

The Composition System Foundation is completed.

Composition Resolver Integration is completed at resolver level. Composition is
still schema/resolver-first, but the resolver now consumes slot relation
metadata for conservative, property-level slot inheritance and exposes additive
flat runtime planning metadata.

Slots are flat semantic addresses, not DOM structure. A slot may eventually map
to rendered output, but the schema does not encode tag names, wrappers, CSS
selectors, adapter details, or React structure.

Slot relations are flat semantic resolver relations, not DOM hierarchy. They do
not imply React nesting, wrapper elements, CSS selectors, adapter output, or
rendered child structure.

Optional composition metadata exists on `ComponentSchema` as `composition`.

Composition metadata can describe:

- slot relations
- parts
- child components

Composition metadata validation currently checks:

- slot relations reference existing slots
- slot relations do not reference themselves as parent
- slot relations do not form simple or multi-node cycles
- part metadata references existing slots
- child component metadata references existing slots
- child component metadata uses a non-empty child name
- child component metadata uses a non-empty component reference
- duplicate slot relation identifiers are rejected
- duplicate part identifiers are rejected
- duplicate child component identifiers are rejected
- when registry validation is explicitly enabled, child component references
  must point to known registry component authored names
- when registry validation is explicitly enabled, a component must not directly
  reference itself as a child component

Child component metadata exists as `composition.children` and is still
validation-only and metadata-only. It does not affect resolver behavior,
`runtimePlan`, runtime emission, `PreviewCanvas`, import/export, adapters, UI,
or rendering.

Semantically, `composition.children` declares parent-owned child instance
metadata. A child entry is associated with a flat parent slot; it is not inside
a DOM slot, React slot, JSX child position, wrapper element, CSS selector, or
adapter-specific insertion point.

Component type identity and child instance identity are separate:

- `component` references the child component type
- `name` identifies the child instance within the parent schema

Child instance names are unique only within one parent schema's
`composition.children` list. The same child component type may be repeated under
different child names.

Future composition graph semantics are planned as:

- a strict instance tree for future component instances
- an acyclic component-type dependency graph for schema references

Future instance paths should be semantic and derived from child instance names,
not DOM structure, React structure, selectors, generated code, or adapter
output.

The canonical identity planning boundary is documented in:

```txt
docs/CANONICAL_IDENTITY.md
```

That checkpoint supersedes earlier planning shorthand that described canonical
IDs as derived from authored names.

Canonical identity is not implemented. The active system remains
authored-name-based:

- schema names remain authored names
- registry lookup remains authored-name-based
- graph validator keys remain authored-name-only
- duplicate authored-name validation remains registry-local
- import/export remains unchanged
- runtime variable names remain unchanged
- no canonical IDs exist yet

Future canonical component IDs should be opaque, persisted, durable machine
identities for component types. They should be stable across authored-name
renames, should not be derived from authored names or slugs, and must not leak
into runtime CSS variable names.

Future canonical child instance IDs should be opaque, persisted, durable
identities for parent-owned child occurrences. They are separate from component
type identity, and repeated child component types must remain allowed under
different child instances.

Future instance paths are an addressing model, not identity. Paths may change
when structure changes, while child instance IDs should remain stable across a
rename or move when the semantic child occurrence is the same. The `.`
character remains reserved as the future semantic instance-path delimiter, but
no enforcement exists yet.

Runtime variable names remain flat CSS custom properties and are not identity.
Canonical IDs must not leak into runtime CSS variables, and this checkpoint
does not change runtime naming.

Future instance-path and child-instance semantics are documented in:

```txt
docs/INSTANCE_SEMANTICS.md
```

That checkpoint is documentation-only and follows the rule:

```txt
ID = who it is
Path = where it is
```

Composition children remain metadata-only. Child entries are parent-owned child
instance metadata, reference component types by authored name, and do not
trigger child runtime resolution, instance runtime behavior, runtime recursion,
import/export changes, `PreviewCanvas` changes, or adapter behavior.

Future child instance IDs should be stable, opaque identities for parent-owned
child occurrences. They are separate from component type identity, are not
active yet, and must allow repeated child component types under different child
instances.

Future instance paths are addresses, not identity. Paths may change after
rename, move, reparent, or structure edits. Display paths and future machine
paths must remain separate from durable identity, graph validation keys, and
runtime variable names. The `.` character remains reserved as the future
semantic instance-path delimiter, but no enforcement exists yet.

Ordering is structural sequence only. It may eventually affect render,
authoring, or adapter sequence, but array order and indexes must not become
child instance identity or durable path identity.

Runtime variable naming remains flat and path-independent. No path-derived or
path-expanded CSS variables should be introduced; future instance-aware styling,
if ever added, should prefer scoped reassignment of the existing flat variable
contract instead of encoding full instance paths into global variable names.

Future-safe child naming warning policy is documented in:

```txt
docs/INSTANCE_SEMANTICS.md
docs/COMPOSITION_SYSTEM.md
docs/WARNING_CATALOG.md
```

That checkpoint is documentation-only and does not change validation behavior.
Child names remain authored metadata, not canonical IDs, runtime variable
names, or active instance paths. Child names remain parent-scoped, repeated
child component types remain valid, and import/export preserves authored names.

Future warning-only diagnostics may eventually flag child naming risks such as
reserved `.`, leading or trailing whitespace, repeated whitespace, tabs,
newlines, duplicate normalized sibling names, case-only sibling collisions,
punctuation or path-unsafe names, and empty or ambiguous display names.

The planned warning catalog is documented in:

```txt
docs/WARNING_CATALOG.md
```

That checkpoint defines warning families for metadata hygiene and
canonical/path readiness, diagnostic code families, authored-data path targets,
warning severity expectations, non-blocking rationale, and explicit non-goals.
It does not activate validator wiring, graph validation wiring, strict mode,
canonical IDs, child instance IDs, instance paths, path-derived runtime
variables, or public behavior changes.

The isolated Child Name Hygiene Diagnostics Foundation now exists in:

```txt
src/compiler/diagnostics/childNameHygieneDiagnostics.ts
src/compiler/diagnostics/childNameHygieneDiagnostics.test.ts
```

It exposes:

```ts
collectChildNameHygieneDiagnostics(schema: ComponentSchema): DiagnosticEnvelope[]
```

The helper is pure and opt-in. It emits structured `DiagnosticEnvelope`
warnings only when called directly, returns no strings, does not mutate input,
does not call `validateComponent`, does not call the graph validator, and does
not call `aggregateDiagnostics` internally.

The implemented first-phase codes are:

- `METADATA_CHILD_NAME_LEADING_WHITESPACE`
- `METADATA_CHILD_NAME_TRAILING_WHITESPACE`
- `METADATA_CHILD_NAME_REPEATED_WHITESPACE`
- `METADATA_CHILD_NAME_TAB_OR_NEWLINE`
- `METADATA_CHILD_NAME_NORMALIZED_COLLISION`
- `METADATA_CHILD_NAME_CASE_COLLISION`
- `PATH_CHILD_NAME_RESERVED_DELIMITER`

The helper uses `severity: warning`, `layer: schema`, and
`source.name: childNameHygiene`. Diagnostic paths target authored schema
metadata at:

```txt
["composition", "children", childIndex, "name"]
```

It does not inspect resolver output, runtime output, `runtimePlan`, runtime
emission, import/export payloads, `PreviewCanvas`, adapters, DOM, React, CSS
selectors, generated files, canonical IDs, child instance IDs, instance paths,
or path-derived runtime variables.

Warnings must not fail import, build, schema validation, graph validation,
resolution, runtime emission, preview rendering, or adapter output. Hard errors
should exist only after a canonical identity and path migration strategy exists.
Strict mode, if ever added, must be opt-in and backward-compatible.

Future-safe names are not canonical IDs. Naming warning helpers must not be
called canonical ID helpers, names must not become identity, and future child
instance IDs remain separate from authored names and safe-name diagnostics.

Child naming warnings are child metadata hygiene. They should not be merged
into component-type graph traversal, and the graph validator remains
component-type-only.

Future-safe naming policy has no runtime effect. It must not introduce
path-derived CSS variables, path-expanded runtime variable names, nested
runtime token objects, or adapter-specific naming rules.

Warning-only metadata diagnostics architecture is documented in:

```txt
docs/INSTANCE_SEMANTICS.md
docs/COMPOSITION_SYSTEM.md
docs/WARNING_CATALOG.md
```

That checkpoint is documentation-only. It defines separate future conceptual
layers for schema validation, graph validation, metadata hygiene diagnostics,
future canonical/path diagnostics, and optional aggregate diagnostics
coordination.

Validators own rules. Aggregate diagnostics may coordinate output, but must not
become monolithic validation logic.

`validateComponent` remains schema correctness validation. It should not become
future-path, canonical identity, or future-safe naming warning logic.
Child-name hygiene warnings remain separate and opt-in.

The graph validator remains component-type-only. It validates unknown component
references, direct self-reference, and indirect component-type cycles. It does
not validate child naming hygiene, instance paths, canonical IDs, runtime
semantics, or runtime variable naming.

Metadata warning diagnostics are child metadata hygiene only. The isolated
child-name hygiene helper covers whitespace risks, reserved `.`, normalized
sibling collisions, and case-only collisions. Path-unsafe punctuation and empty
or ambiguous display-name warnings remain future work. Warnings are
non-blocking, non-mutating, do not change runtime behavior, and do not affect
schema validity.

Future canonical/path warnings must not activate canonical IDs, create shadow
identity, or make names identity. Names remain human-authored labels, and paths
remain future addresses rather than identity.

Future shared diagnostic architecture may use a shared diagnostic envelope,
`error` and `warning` severities, deterministic ordering, stable diagnostic
codes, layer/source metadata, layer ordering, and optional aggregate reporting.
Shared formatting must not merge validator responsibilities.

Warnings must not inspect resolved styles, inspect `runtimePlan` emission,
affect CSS variable naming, affect resolver fallback chains, mutate
import/export data, fail builds/runtime/imports by default, or introduce
adapter-specific validation in core.

Strict mode remains future-only. If ever added, it must be opt-in,
backward-compatible, require migration tooling first, and promote warnings only
selectively. Default mode remains permissive.

The diagnostic contract is documented in:

```txt
docs/DIAGNOSTIC_CONTRACT.md
```

The isolated diagnostic contract foundation now exists in:

```txt
src/compiler/diagnostics/diagnosticContract.ts
src/compiler/diagnostics/diagnosticContract.test.ts
```

`diagnosticContract.ts` defines the stable diagnostic envelope and helper
contract. The envelope includes severity, stable machine-facing code,
human-facing message, authored-data path, layer, source, deterministic ordering
metadata, and optional suggestions. Diagnostic paths point to authored schema
or metadata locations, not instance paths, runtime variable names, resolver
paths, DOM paths, adapter paths, import paths, or generated file paths.

The contract currently provides `createDiagnosticPath`, `createDiagnostic`,
`compareDiagnostics`, and `sortDiagnostics`. Deterministic ordering is owned by
the contract and sorts by explicit ordering metadata before severity, layer,
source, code, authored-data path, and message tie-breakers.

The isolated Diagnostic Aggregate Coordinator Foundation now exists in:

```txt
src/compiler/diagnostics/aggregateDiagnostics.ts
src/compiler/diagnostics/aggregateDiagnostics.test.ts
```

`aggregateDiagnostics.ts` is a pure coordinator. It accepts already-created
diagnostic envelopes, flattens multiple diagnostic groups, delegates
deterministic ordering to `sortDiagnostics`, preserves diagnostic object
references, and does not mutate input arrays or diagnostic objects.

Aggregate groups may include group-level `layer` and `source` metadata for
future-safe provenance grouping. That metadata is accepted as metadata only and
is not behaviorally interpreted, does not rewrite diagnostics, and does not
couple aggregation to validators, runtime, resolver, registry, import/export,
canonical IDs, child instance IDs, or instance paths.

The isolated Legacy Diagnostic Formatter Foundation now exists in:

```txt
src/compiler/diagnostics/legacyDiagnosticFormatter.ts
src/compiler/diagnostics/legacyDiagnosticFormatter.test.ts
```

`legacyDiagnosticFormatter.ts` is a pure compatibility formatter. It exposes:

```ts
formatDiagnosticAsLegacyString(diagnostic)
formatDiagnosticsAsLegacyStrings(diagnostics)
```

The formatter converts `DiagnosticEnvelope` values to legacy string
diagnostics. Current legacy formatting returns exactly `diagnostic.message`.
It intentionally ignores severity, code, path, layer, source, order metadata,
and suggestions.

Batch formatting preserves input order, does not sort diagnostics, does not
mutate input diagnostics or the input array, returns a new string array, and
returns `[]` for empty input.

The formatter is compatibility infrastructure only. It is now used by
validator-local compatibility bridges inside `validateComponent` for the
top-level schema presence, variant-axis, token binding, and composition slot
relation local reference, and composition part local reference rule families.
It is not globally wired into validators, public validation APIs, warning
collection, aggregate diagnostics, runtime, resolver, import/export,
`PreviewCanvas`, schemas, UI, generated files, or adapters.

Internal structured validator migrations are closed for only
`validateComponent` top-level schema presence diagnostics, variant-axis
diagnostics, token binding diagnostics, composition slot relation local
reference diagnostics, and composition part local reference diagnostics.

The current internally migrated `validateComponent` families are:

1. top-level schema presence diagnostics
2. variant-axis diagnostics
3. token binding diagnostics
4. composition slot relation local reference diagnostics
5. composition part local reference diagnostics

The migrated top-level schema presence codes are:

- `SCHEMA_COMPONENT_NAME_REQUIRED`
- `SCHEMA_ROOT_SLOT_REQUIRED`
- `SCHEMA_DEFAULT_STATE_REQUIRED`

The migrated variant-axis codes are:

- `SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS`
- `SCHEMA_VARIANT_AXIS_INVALID_DEFAULT`

The migrated token binding codes are:

- `SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_STATE`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS`
- `SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION`

The migrated composition slot relation local reference codes are:

- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT`
- `SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT`

The migrated composition part local reference code is:

- `SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT`

The helpers are module-private and validator-local. They create
`DiagnosticEnvelope` objects for those rules, immediately format them through
`legacyDiagnosticFormatter`, and return legacy `string[]` diagnostics to the
existing `validateComponent` error flow. No top-level structured diagnostics
array was introduced in `validateComponent`, no global formatter wiring was
added, and `aggregateDiagnostics` is not used by the validator.

`validateComponent` still publicly returns legacy `string[]` diagnostics.
Existing top-level schema presence, variant-axis, token binding, and
composition slot relation local reference, and composition part local reference
legacy message text and ordering are preserved. Variant-axis empty-options
short-circuit behavior, token binding authored array order, condition entry
order, unknown variant-axis early-return behavior, `undefined` condition skip
behavior, `slotRelations` array order, same-relation unknown-slot before
unknown-parent-slot ordering, and `parts` array order are preserved. The
component graph validator remains component-type-only and
backward-compatible, registry-backed checks remain legacy-compatible, warning
collection remains opt-in and inactive in validation flows, aggregate
diagnostics remain coordinator-only, public validation APIs remain unchanged,
and no runtime, resolver, import/export, `PreviewCanvas`, UI, generated-file,
or adapter behavior changed.

Current severity values are `error`, `warning`, and `info`. Severity does not
imply runtime behavior. Warnings are non-blocking by default and are emitted
only by opt-in helper calls unless a later explicit collection API is
introduced.

Future diagnostic codes should be stable, namespaced, and machine-facing. Codes
must not contain dynamic values, must not be reused for different meanings, and
should describe the domain rule rather than the implementation function.
Suggested future families include `SCHEMA_*`, `REGISTRY_*`, `GRAPH_*`,
`METADATA_*`, `CANONICAL_*`, `PATH_*`, and `COMPAT_*`.

Aggregate diagnostics currently coordinate only already-created diagnostic
envelopes. They do not collect by invoking validators, normalize validator
output, render messages, adapt to legacy strings, or produce public combined
validation reports. Validators own rules, aggregate diagnostics preserve
provenance, and any future aggregate expansion must remain additive so existing
validation APIs remain valid.

Future diagnostic producers should avoid incidental traversal dependencies and
provide explicit ordering metadata for `sortDiagnostics`. Numeric path indexes
sort numerically in the current diagnostic contract. Graph cycle diagnostics
should eventually normalize cycle paths deterministically.

Structured diagnostics should be additive when introduced. Current string
diagnostics must remain backward-compatible, existing tests should not break
because of diagnostic migration, and the isolated legacy formatter now provides
the `DiagnosticEnvelope -> legacy string` compatibility boundary without
changing validators.

Structured diagnostics migration planning is documented in:

```txt
docs/STRUCTURED_DIAGNOSTICS_MIGRATION.md
```

That checkpoint defines structured diagnostics as an internal migration layer
first. Legacy string diagnostics remain the public compatibility contract for
current validators. Validators migrate independently, own their own rule
production, and must preserve their public return shapes until a later explicit
public API phase.

The intended compatibility path is envelope-to-string formatting:

```txt
DiagnosticEnvelope -> legacy string
```

String-to-envelope reconstruction is intentionally rejected because legacy
strings cannot safely recover stable codes, layers, sources, authored-data
paths, order metadata, or suggestions.

The migration plan separates producer, formatter, aggregate, renderer, and
public API boundaries:

- producers create `DiagnosticEnvelope` objects for rules they own
- the formatter converts envelopes to legacy strings for compatibility
- aggregate diagnostics sorts and combines already-created envelopes only
- renderers live outside validators
- public validator APIs remain legacy-compatible until explicitly migrated

Parity tests are required before any existing validator rule family swaps
internals to structured diagnostics. Stable codes, authored-data paths, source
names, layers, severities, and deterministic `order` metadata must be
preserved during migration.

Formatter parity test checkpoints are closed for `validateComponent`
variant-axis diagnostics, top-level schema presence diagnostics, token binding
diagnostics, composition slot relation local reference diagnostics, and
composition part local reference diagnostics.
The first validator-local internal structured migration is closed for the
variant-axis rule family, the second validator-local internal structured
migration is closed for the top-level schema presence rule family, the third
validator-local internal structured migration is closed for the token binding
rule family, and the fourth validator-local internal structured migration is
closed for the composition slot relation local reference rule family. The fifth
validator-local internal structured migration is closed for the composition
part local reference rule family. The validateComponent structured slice
inventory checkpoint is closed as a documentation-only map of the remaining
legacy string diagnostics, their ordering, dependencies, rollback boundaries,
parity-test difficulty, candidate codes, and recommended priorities. Broader
`validateComponent` migration, graph validator migration, warning activation,
aggregate reporting, and structured public APIs remain future work.

The migration plan does not introduce global diagnostic or formatter wiring
into validators, public validation API changes, warning activation by default,
aggregate diagnostics inside validators, runtime changes, resolver changes,
import/export changes, `PreviewCanvas` changes, adapter changes, canonical
IDs, child instance IDs, instance paths, or path-derived runtime variables.

Suggestions, if added later, are advisory only. They are not operations, must
not mutate data, and must not become codemods or design operations without a
separate explicit layer.

## Component Registry Foundation

The Component Registry Foundation Commit 1 is completed.

A metadata-only component registry now exists in:

```txt
src/compiler/component-model/componentRegistry.ts
```

The registry currently contains entries for the existing reference schemas:

- `Button`
- `Input`

The registry provides pure helpers for:

- creating a registry from component schemas
- listing registry entries
- listing authored component names
- finding a registry entry by authored name
- getting a component schema by authored name
- validating duplicate authored component names

Duplicate authored-name validation is registry-local and produces stable
diagnostics. The registry does not introduce canonical IDs, canonical name
normalization, graph traversal, child runtime resolution, resolver behavior,
runtime emission, runtime consumption, `PreviewCanvas` behavior, import/export
behavior, or adapter behavior.

The Registry-backed Composition Metadata Validation Commit 2 is completed.

`validateComponent` now supports an optional registry-backed validation form:

```ts
validateComponent(schema, { registry })
```

Registry-backed validation is opt-in and additive. Existing
`validateComponent(schema)` behavior remains backward-compatible.

When a registry is provided, composition child metadata additionally validates:

- unknown `composition.children[].component` references
- direct self-reference where a schema references its own authored component
  name as a child component

This validation is still metadata-only. It does not perform indirect cycle
detection, graph traversal, recursive composition resolution, child component
runtime resolution, style resolution, token resolution, runtime planning,
runtime emission, or runtime consumption.

## Pure Component-Type Graph Validator

A pure authored-name-based component-type graph validator now exists in:

```txt
src/compiler/component-model/componentGraphValidation.ts
```

The validator builds a component-type dependency graph from registry entries
and `composition.children[].component` references. Its nodes are authored
component type names, and its edges mean "schema A references component type
B." Graph keys are still authored-name-only.

The validator returns diagnostics only. It currently detects:

- unknown child component references
- direct self-reference
- indirect component-type cycles

The future instance tree remains a separate runtime/compiler concept. It should
describe parent instance to child instance relationships, with instance paths
derived from child instance names. It is not implemented yet.

Current graph validator inputs are limited to:

- registry entries
- schema authored names and registry keys
- `composition.children`
- `composition.children[].component`
- child names for diagnostics

Forbidden graph validator inputs:

- resolver output
- `runtimePlan`
- emitted CSS variables
- `PreviewCanvas`
- adapters
- import/export payloads
- React components
- DOM structure
- rendered children
- CSS selectors
- token resolution
- runtime variable consumption
- platform-specific metadata

Graph keys remain authored-name-only for now:

- no canonical IDs
- no canonical name normalization
- no persisted canonical identity
- duplicate authored-name validation remains the current collision guard
- canonical identity remains future planning only

The `.` character remains reserved for the future semantic instance-path
delimiter, but no new canonical naming rules should be enforced yet.

The graph validator reports indirect component-type cycles with cycle paths,
such as:

```txt
Button -> Input -> Button
```

Those diagnostics have no runtime, `runtimePlan`, or rendering implications.
They do not introduce resolver recursion, child runtime resolution,
graph-derived `runtimePlan` entries, runtime emission changes, runtime
consumption changes, `PreviewCanvas` changes, import/export changes, or adapter
behavior.

Duplicate authored-name validation remains registry-local in
`componentRegistry.ts`. It is not merged into graph traversal.

The graph validator remains separate from single-schema validation flows.
Existing `validateComponent(schema)` behavior remains backward-compatible, and
graph validation is not mandatory for existing schema validation calls.

Explicit non-goals for the graph validator boundary:

- canonical IDs
- canonical collision enforcement
- canonical name normalization
- resolver recursion
- child runtime resolution
- nested runtime token objects
- import/export changes
- `PreviewCanvas` changes
- adapter changes
- `runtimePlan` changes
- CSS variable naming changes
- DOM/render semantics
- instance-path runtime naming

Button declares resolver-level slot relations:

- `root -> label`
- `root -> icon`

The resolver has baseline tests proving composition metadata without slot
relations does not change output.

The slot relation graph helper normalizes composition slot relations and derives
lookup maps:

- normalized relation order
- parent lookup by child slot
- children lookup by parent slot
- diagnostics for unknown slot references
- diagnostics for duplicate slot relations

The resolver consumes valid slot relations for conservative inheritance only.
Inheritance is driven by the internal property registry's `inheritable`
metadata. The current inheritable properties are:

- `color`
- `transitionProperty`
- `transitionDuration`
- `transitionTimingFunction`
- `transitionDelay`

Parent slot values fill missing child-slot properties only. Explicit child-slot
bindings always win.

The same inheritance rule applies to:

- base styles
- state styles

Layout and box properties do not inherit through slot relations, including:

- `background`
- `paddingBlock`
- `paddingInline`
- `height`
- `gap`
- `borderRadius`
- `boxShadow`
- `opacity`

Slot-level runtime variables now have a pure emission helper, but slot
relations still remain resolver metadata. They do not imply DOM hierarchy,
selectors, wrappers, React structure, or adapter output.

Slot relation validation is schema-first. Cycles and self-references are
rejected by `validateComponent` before resolution or any future runtime
emission phase. The resolver does not contain runtime-based cycle handling.

## Property Registry Foundation

The Resolver Hardening property registry foundation is completed.

Component style property behavior is centralized in the internal
`propertyRegistry.ts` module. The registry is internal to the Component Model
and does not redesign public imports, exports, adapters, React, UI, JSON
import, or CSS export.

Each property definition can describe:

- `cssProperty`
- `inheritable`
- `runtimeEmittable`
- `derived`
- `allowStateEmission`

Registry metadata now drives:

- token binding target to CSS property lookup in the resolver
- conservative slot inheritance eligibility
- runtime planning property filtering
- derived property identification for runtimePlan provenance

Unsupported or intentionally non-emitted binding targets can remain registered
without becoming style output. For example, `borderColor` is registered but
does not currently emit into resolved styles or runtime planning.

Derived properties are tracked distinctly from explicit token bindings.
Currently, the base-style `transition` shorthand is derived from transition
longhand values and marked as derived metadata. State styles still do not
receive derived transition shorthand emission.

## Variant Foundation

Variants are declarative and separate from states.

Variant axes are now schema-derived generic string axes. Components no longer
need `intent` and `size`.

Button still supports:

- `intent`
- `size`

Current Button intent options:

- `primary`
- `secondary`
- `danger`
- `neutral`

Current Button size options:

- `sm`
- `md`
- `lg`

Input works with no variants.

Internal variant typing is split between schema-facing selection and
design-state-facing namespace selection:

- `ComponentVariantSelection` describes a partial axis selection for one
  component schema.
- `ResolvedComponentVariantSelection` describes the resolver's normalized
  selection after schema defaults are applied.
- `ComponentVariantSelectionsState` stores selected variants on authored
  namespaces such as `button` and `input`.

Selected variants are not component token overrides. They remain separate from
`DesignState.componentTokens`, which continues to represent authored
layout/motion overrides only.

Existing `tokenBindings.conditions` already support compound variant behavior:

```ts
conditions: {
  intent: "danger",
  size: "lg"
}
```

A binding with multiple variant conditions applies only when all conditions
match. Binding-order precedence is documented by tests: when multiple matching
bindings target the same slot/property within the same style group, the later
binding wins.

There is no `compoundVariants` field yet.

## State System

States are defined through the component schema `states` field.

Current Button states:

- `default`
- `hover`
- `active`
- `focus`
- `disabled`
- `loading`

Current Input states:

- `default`
- `hover`
- `focus`
- `disabled`

State-specific bindings use binding conditions:

```ts
conditions: {
  state: "hover"
}
```

State rendering in the preview is driven manually by local UI state in
`PreviewCanvas`. It does not use CSS pseudo-classes like `:hover`.

## Token Flow

The existing token engine lives in `src/features/design-generator/tokens/`.

The formal token hierarchy is documented in:

```txt
docs/TOKEN_HIERARCHY.md
```

Current hierarchy:

```txt
global tokens
-> semantic token paths
-> component default tokens
-> component overrides
-> resolved runtime tokens / CSS variables
```

Token creation functions:

- `createColorTokens`
- `createLayoutTokens`
- `createMotionTokens`
- `createComponentTokens`

`useDesignTokens(state)` combines those token groups into one flat
`DesignTokens` object.

Current token shape is CSS-variable oriented:

```ts
{
  "--color-accent": "...",
  "--color-on-accent": "...",
  "--layout-radius": "...",
  "--layout-density": "...",
  "--layout-elevation": "...",
  "--motion-duration": "...",
  "--motion-ease": "...",
  "--card-radius": "...",
  "--card-density": "...",
  "--card-elevation": "...",
  "--card-motion-duration": "...",
  ...
}
```

State tokens are part of the real token engine:

- `--state-hover-background`
- `--state-active-opacity`
- `--state-focus-ring`
- `--state-disabled-opacity`

These state tokens exist at runtime, in CSS export, and in JSON export under
`global.state`. JSON import accepts `global.state` additively and falls back to
generated state token values when the group is missing.

Component Model token bindings use semantic string paths:

```ts
token: "semantic.state.hover.background"
```

They do not store token metadata objects.

## Flat Slot Naming Contract

Slot-level variables preserve the flat CSS variable runtime
contract.

Non-root slot variables should use:

```txt
--{component}-{slot}-{property}
```

Examples:

- `--button-icon-size`
- `--card-header-padding`
- `--input-label-color`

Root slot variables should use:

```txt
--{component}-{property}
```

The `root` slot is omitted.

Examples:

- `--button-background`
- `--button-radius`

Avoid root-prefixed variables such as:

```txt
--button-root-background
```

Existing flat variables remain compatible and must not be redesigned:

- `--button-radius`
- `--button-density`
- `--card-radius`
- `--input-radius`

Slot names must remain semantic and schema-derived. Variable names should not be
derived from DOM tags, CSS selectors, adapter implementation details, generated
React component names, or wrapper hierarchy.

The resolver derives additive runtime planning metadata using this naming
contract, and the runtime emitter consumes those planned names:

- root slot omits `root`: `--button-background`
- non-root slots include the slot name: `--button-label-color`
- names remain flat and schema-derived
- planning entries include provenance and layer metadata
- state planning entries include state metadata

`runtimePlan` remains metadata only. It does not carry values. Emitted values
are derived separately from `resolved.styles.base` and
`resolved.styles.states`.

## Runtime Emission And Consumption

A pure runtime emission helper now exists:

```ts
emitComponentRuntimeVariables(resolved, { state? })
```

The helper consumes:

- `resolved.runtimePlan.variables[]` for flat variable metadata
- `resolved.styles.base` for base values
- `resolved.styles.states[state]` for optional active state values

It returns a flat CSS custom property map and does not mutate `runtimePlan`,
write to `DesignTokens`, re-resolve tokens, change import/export data, or call
adapters.

Emission behavior:

- root slot variables omit `root`, such as `--button-background`
- non-root slot variables include the slot name, such as
  `--button-label-color`
- base and state layers use the same variable names
- an active state overlays base values in the returned map
- same-layer duplicate variable names from different slot/property origins
  throw a clear error
- missing resolved style values are skipped instead of emitted as `undefined`
- no state-suffixed variables are emitted

Runtime emission remains flat CSS variables only. There are still no nested
runtime token objects.

Runtime emission and runtime consumption are separate concerns:

```txt
runtime emission != runtime consumption != preview rendering behavior
```

Emission remains broad. Consumption remains target-specific. A variable being
emitted means the value is available to a runtime consumer, not that every
consumer must use it through `var(...)`.

Preview runtime consumption is intentionally selective. The emitter can produce
runtime variables broadly, but `PreviewCanvas` only consumes `var(...)` where
the current inline-style/runtime behavior is safe.

The current PreviewCanvas consumption decisions are extracted into a
preview-local helper:

```txt
src/features/design-generator/components/previewRuntimeConsumptionPolicy.ts
```

The policy is explicit by:

- target/backend, currently `preview-react-inline`
- component namespace, currently `button` or `input`
- slot, currently `root`, `label`, or `icon`
- property

The policy modes are intentionally small:

- `runtime-var`
- `direct-value`
- `direct-longhand`
- `omit-shorthand`

The policy owns only consumption decisions. It does not own resolved values,
change resolver behavior, change `tokenResolver`, change `runtimePlan`, narrow
runtime emission, affect import/export, affect adapters, introduce nested
runtime token objects, or redesign React rendering.

Current `PreviewCanvas` runtime variable consumption:

- Button root:
  - `background`
  - `color`
  - `borderRadius`
  - `boxShadow`
  - `opacity`
  - `paddingBlock`
  - `paddingInline`
- Button slots:
  - label `color`
  - icon `color`
- Input root:
  - `color`
  - `borderRadius`
  - `paddingBlock`
  - `paddingInline`

Input transition-sensitive state-changing properties are intentionally direct in
`PreviewCanvas`:

- `background`
- `boxShadow`
- `opacity`

Root transitions are also intentionally rendered as direct longhands in
`PreviewCanvas`:

- `transitionProperty`
- `transitionDuration`
- `transitionTimingFunction`
- `transitionDelay`

The root `transition` shorthand is not consumed through `var(...)` in
`PreviewCanvas`. Transition runtime variables are still emitted for future
runtime strategies, including:

- `--button-transition-*`
- `--input-transition-*`
- `--button-label-transition-*`
- `--button-icon-transition-*`

Transition safety rule: runtime variables may be emitted broadly, but preview
consumption must stay selective. Animated state-changing properties should use
direct concrete style values in `PreviewCanvas` until there is a safer
CSS/runtime strategy, because stable `var(...)` property declarations can
prevent visible transitions when only custom property values change. React also
warns when transition shorthand and transition longhands are mixed in inline
styles, so root transitions are rendered with concrete longhands only.

This transition-safety fix and policy extraction did not require resolver,
`runtimePlan`, `runtimeEmission`, schema, import/export, adapter, or token
resolver changes.

## Resolver Logic

`resolveComponent` is intentionally small and does not validate schemas.

Validation remains in `validateComponent.ts`.

`resolveComponent` currently:

1. Resolve variant defaults from `schema.variants`.
2. Keep state separate from variants.
3. Select base bindings.
4. Select bindings whose variant conditions match.
5. Select bindings whose state conditions match.
6. Resolve each binding value through `tokenResolver.get(binding.token)`.
7. Build flat slot style maps.
8. Apply registry-driven conservative slot inheritance from composition slot
   relations.
9. Build additive `runtimePlan` metadata for flat variable emission.

Current resolver precedence is binding-order based:

1. Build the normalized variant selection from schema defaults plus the
   caller-provided context.
2. Build base styles from bindings without a state condition whose variant
   conditions match the normalized selection.
3. Build state styles separately from bindings whose state condition matches
   each schema state and whose variant conditions also match the normalized
   selection.
4. When multiple bindings target the same slot/property within the same style
   group, the later binding wins through object merge order.
5. Slot inheritance may fill missing child-slot properties from parent slots for
   registry-marked inheritable properties only.
6. Explicit child-slot bindings win over inherited values.
7. Preview rendering overlays the active state's style group on top of base
   styles.

The resolver does not currently read `DesignState`, active skins, namespace
overrides, import/export data, or UI selections directly. Those inputs are
adapted before resolution through `createTokenResolver(...)` and the explicit
`ComponentResolutionContext`.

The resolver does consume schema-level `composition.slotRelations` directly for
slot inheritance. It does not consume composition parts or child component
metadata for runtime behavior yet.

Resolved component output remains backward-compatible at the existing style
surface:

```ts
styles.base[slot]
styles.states[state][slot]
```

An additive `runtimePlan` field now exists:

```ts
runtimePlan: {
  variables: [
    {
      name,
      property,
      slot,
      source,
      sourceType,
      styleLayer,
      state?
    }
  ]
}
```

`runtimePlan.variables[]` remains flat. Each variable now carries provenance
metadata:

- `sourceType: "explicit"` for values from authored token bindings on the
  planned slot
- `sourceType: "inherited"` for values filled through composition slot
  inheritance
- `sourceType: "derived"` for registry-marked derived properties such as the
  base `transition` shorthand

Each variable also carries layer metadata:

- `styleLayer: "base"` for base style planning entries
- `styleLayer: "state"` for state style planning entries

The existing `source` field remains layer-compatible (`"base"` or `"state"`)
for compatibility with the current runtime planning surface. State entries also
retain the `state` field.

`runtimePlan` is planning metadata only. It does not carry values, write CSS
variables, mutate `DesignTokens`, change import/export data, or invoke
adapters. Runtime values are derived from `resolved.styles` by
`emitComponentRuntimeVariables(...)`.

## Token Resolver

`tokenResolver.ts` adapts Component Model semantic token paths to the existing
flat `DesignTokens` map.

Example mappings:

```ts
semantic.color.accent -> --color-accent
semantic.color.onAccent -> --color-on-accent
semantic.state.hover.background -> --state-hover-background
semantic.state.active.opacity -> --state-active-opacity
semantic.state.focus.ring -> --state-focus-ring
semantic.state.disabled.opacity -> --state-disabled-opacity
```

Some Button component paths resolve to active component tokens:

```ts
component.button.radius -> --${componentKind}-radius
component.button.paddingBlock -> --${componentKind}-density
component.button.elevation -> --${componentKind}-elevation
motion.duration.fast -> --${componentKind}-motion-duration
```

Some Input component paths also resolve through the active component skin:

```ts
component.input.radius -> --${componentKind}-radius
component.input.paddingBlock -> --${componentKind}-density
component.input.paddingInline -> --${componentKind}-density
```

`Button` and `Input` are authored/reference-mode `ComponentNamespace` entries,
not `ComponentKind` skins. `ComponentKind` remains limited to `card`,
`toolbar`, and `panel`.

Reference components inherit a virtual base from the active `card`, `toolbar`,
or `panel` skin, then apply optional authored namespace overrides from
`DesignState.componentTokens`.

The resulting runtime contract remains flat CSS variables such as `--button-*`
and `--input-*`, and JSON import/export preserves the namespace override shape
for compatibility.

If a path is not mapped, the resolver throws a clear error.

If a mapped token key is missing from `DesignTokens`, the resolver throws a
clear error.

## Namespace Inheritance

Namespace inheritance is stabilized.

`button` and `input` inherit layout and motion values from the active
`ComponentKind` unless they have authored field-level overrides.

Authored overrides remain partial source-of-truth data. Inherited resolved
values are not written back as authored overrides.

Changing the active `card`, `toolbar`, or `panel` skin changes inherited fields
while preserving authored namespace overrides.

## Preview Rendering Approach

`PreviewCanvas.tsx` currently renders the Button preview directly from the
Component Model. It also renders the Input preview through the same resolver and
state controls.

Flow:

1. `useDesignTokens(state)` creates the current token map.
2. `createTokenResolver(tokens, state.component.kind)` creates the resolver.
3. `resolveComponent(buttonSchema, tokenResolver, { intent, size, state })`
   resolves the Button.
4. `resolveComponent(inputSchema, tokenResolver, { state })` resolves the Input.
5. `emitComponentRuntimeVariables(resolved, { state })` creates flat Button
   runtime variables.
6. `emitComponentRuntimeVariables(resolvedInput, { state })` creates flat Input
   runtime variables.
7. Button and Input root preview scopes receive those CSS custom properties
   additively.
8. `previewRuntimeConsumptionPolicy.ts` decides whether each preview style
   property consumes a runtime variable, direct value, direct longhand, or
   omitted shorthand.
9. Resolved bindings are still grouped by slot.
10. Each slot gets an inline style object.
11. Slots are rendered as DOM elements by the current preview only.

Current preview slot mapping:

- `root` -> `<button>`
- `label` -> `<span>`
- `icon` -> `<span>`

This preview mapping is not part of the Component Model contract.

Preview runtime variable consumption is selective. Emitted runtime variables
remain available broadly, but the preview consumes `var(...)` only for
properties that are currently safe in the inline-style rendering path.

The PreviewCanvas consumption policy is preview-local and target-specific. Its
current target is `preview-react-inline`; it does not define a universal runtime
architecture layer or change how future exports/adapters may consume the same
emitted variables.

Button root currently consumes runtime variables for:

- `background`
- `color`
- `borderRadius`
- `boxShadow`
- `opacity`
- `paddingBlock`
- `paddingInline`

Button slots currently consume runtime variables for:

- label `color`
- icon `color`

Input root currently consumes runtime variables for:

- `color`
- `borderRadius`
- `paddingBlock`
- `paddingInline`

Input root intentionally keeps transition-sensitive state-changing properties
direct:

- `background`
- `boxShadow`
- `opacity`

Button and Input root transitions intentionally render direct longhands instead
of the `transition` shorthand:

- `transitionProperty`
- `transitionDuration`
- `transitionTimingFunction`
- `transitionDelay`

The preview does not consume root transition shorthand variables with
`var(...)`. Transition runtime variables are still emitted for future use, but
PreviewCanvas avoids mixing transition shorthand and longhands in React inline
styles.

## Export Architecture

CSS export is handled by:

```ts
src/features/design-generator/export/exportCss.ts
```

`exportCss(tokens)` emits:

- global `:root` declarations
- component-specific blocks for existing component kinds

JSON export is handled separately by:

```ts
src/features/design-generator/export/exportJson.ts
```

JSON export keeps the legacy `components` section as a resolved export for
compatibility. Its component values come from the resolved flat `DesignTokens`
object.

JSON export also includes a top-level `overrides` section. This section is
source-of-truth oriented: it serializes authored component overrides from
`DesignState.componentTokens` and preserves partialness by omitting missing
values instead of filling them from globals.

JSON import prefers `overrides` when that section exists. If `overrides` is
missing, import falls back to the legacy `components` path, where resolved
component values are treated as component overrides for backward compatibility.

Composition metadata does not change import/export shapes yet.
Runtime planning and emitted runtime variables are not exported or imported yet.

## What Composition Is Not Yet

Composition is not yet:

- child component runtime resolution
- nested runtime token objects
- adapter integration
- React restructuring
- visual composition editor
- import/export shape changes

There is also no:

- `compoundVariants` field
- generated React component composition
- library-specific output

## Remaining Volatile Areas

The following areas are intentionally unresolved and should receive dedicated
planning or architecture audits before implementation:

- canonicalization rules
- escaping rules
- safe-name and diagnostic helper boundaries
- validator-integrated child naming warning diagnostics
- diagnostic code taxonomy
- opt-in warning collection
- broader formatter parity testing beyond the closed validateComponent
  top-level schema presence, variant-axis, token binding, and composition slot
  relation local reference, and composition part local reference checkpoints
- validator-local structured diagnostic migration beyond the closed
  validateComponent top-level schema presence, variant-axis, token binding, and
  composition slot relation local reference, and composition part local
  reference rule families
- aggregate diagnostics reporting beyond pure coordination
- optional strict mode policy for child naming
- migration tooling before hard child naming errors
- persisted opaque canonical ID migration strategy
- future component registry expansion contract
- canonical-aware graph validation
- future child instance identity migration strategy
- instance path display and machine path semantics
- ordering semantics for future render/adaptation sequence
- recursive composition behavior beyond metadata-only component-type
  diagnostics
- child variant/state selection
- `runtimePlan` instance naming
- adapter/export consumption of future composition graphs

## Current Non-Goals

- No runtime redesign.
- No export or import behavior change.
- No adapter work.
- No React/UI redesign.
- No nested token runtime.
- No export/import of runtimePlan or emitted runtime variables.
- No global runtime consumption architecture layer.
- No canonical IDs or canonical collision enforcement.
- No persisted canonical component IDs or child instance IDs.
- No canonical name normalization.
- No canonical validation warnings or errors.
- No child naming warning diagnostics wired into validation flows.
- No child naming validation errors.
- No warning collection or public validation warning API.
- No warning producers beyond the isolated opt-in child-name hygiene helper.
- No diagnostic wiring into validators beyond the closed validateComponent
  top-level schema presence, variant-axis, token binding, and composition slot
  relation local reference, and composition part local reference helpers.
- No aggregate diagnostics behavior beyond pure coordination.
- No string-to-envelope diagnostic migration.
- No global formatter wiring into validators or public validation APIs.
- No structured public validation API.
- No strict mode.
- No schema-breaking naming rules.
- No resolver recursion or child runtime resolution.
- No child instance ID activation.
- No instance path serialization.
- No instance-specific runtime styling.
- No path-derived CSS variables.
- No instance-path runtime naming.
- No adapter-specific naming rules.
- No adapter-specific validation in core.

## Next Recommended Phase

The current composition semantics, canonical identity planning documentation,
and component registry foundation checkpoints are closed. Future work should
continue through small, metadata-only infrastructure phases before any resolver,
runtime, PreviewCanvas, export, or adapter behavior changes.

The canonical identity checkpoint is documentation-only. Future work should
start with optional safe-name or diagnostic helpers, warning-only collision and
future-safe naming risk detection, and an explicit migration strategy before
persisted opaque canonical IDs are introduced.

The instance semantics checkpoint is documentation-only. Future work should
start with metadata-only validation for future-safe child naming risks, then
optional inactive child instance IDs behind an explicit migration plan. Instance
tree tooling and runtime composition remain separate later phases.

The future-safe child naming warning checkpoint is documentation-only. Future
work should start with warning-only metadata diagnostics, then optional strict
mode only after a migration policy, with migration tooling before hard errors.

The warning-only metadata diagnostics architecture checkpoint is
documentation-only. The warning catalog planning checkpoint is also
documentation-only, and the child-name hygiene API and codes planning
checkpoint is documentation-only. The isolated child-name hygiene diagnostics
foundation is implemented but remains opt-in and unwired. Future work should
proceed through additional scoped formatter parity testing before any broader
structured diagnostics migration, aggregate reporting beyond pure coordination
if needed, and only then optional strict mode.

The diagnostic contract, aggregate coordinator, and legacy formatter
foundations are closed as isolated infrastructure. The validateComponent
variant-axis formatter parity and first internal structured migration
checkpoints are closed. The validateComponent structured slice inventory
checkpoint is also closed as documentation only. The validateComponent presence
formatter parity and second internal structured migration checkpoints are
closed for the top-level schema presence rule family. The validateComponent
token binding formatter parity and third internal structured migration
checkpoints are closed for the token binding rule family. The validateComponent
composition slot relation local reference formatter parity and fourth internal
structured migration checkpoints are closed for the composition slot relation
local reference rule family. The validateComponent composition part local
reference formatter parity and fifth internal structured migration checkpoints
are closed for the composition part local reference rule family. Future work
should proceed through additional rule-family parity and validator-local
migration slices, with broader `validateComponent` migration and optional
structured public APIs kept for later explicit phases. Opt-in warning
collection, migration reporting, and optional strict mode remain later phases
after compatibility boundaries are proven.

The pure authored-name-based component-type graph validator checkpoint is
closed. Future work should continue with small metadata-only phases or dedicated
architecture audits before any canonical identity, instance tree, resolver,
runtime, `PreviewCanvas`, import/export, or adapter behavior changes.
