# Composition System

This document defines the integration constraints and current resolver behavior
for the Composition System.

## Purpose

The Composition System should let the compiler describe how components,
component parts, and child components relate to each other without changing the
current runtime contract or introducing adapter-specific behavior.

Composition must remain schema/resolver-first. The Component Model and resolver
should define the portable structure first; React rendering, DOM structure,
library adapters, and generated code remain downstream concerns.

## Terms

### Component

A component is a library-agnostic schema entry with a name, slots, states,
variants, edit policy, and token bindings.

Components are not React components, DOM nodes, CSS classes, or adapter output.
They are compiler-owned descriptions that can later be rendered or exported by
adapters.

### Component Type

A component type is the stable logical identity of a component, such as
`Button`, `Input`, or a future `Icon`.

Component type identity is what other schemas reference through child metadata.
It is not an import path, React component name, DOM tag, CSS class, adapter
identifier, or generated file name.

### Component Schema

A component schema is the versioned compiler-owned definition for one component
type.

The schema owns the component-local contract:

- slots
- states
- variants
- token bindings
- edit policy
- optional composition metadata

Schemas are still library-agnostic. A schema does not own rendered hierarchy,
adapter output, generated code structure, PreviewCanvas behavior, or runtime
variable values.

### Component Registry

The component registry is a metadata-only catalog of known component schemas.

The current registry foundation contains entries for the existing `Button` and
`Input` schemas and provides pure helpers for listing entries, listing authored
component names, looking up entries by authored name, getting schemas by
authored name, and validating duplicate authored names.

The registry does not own style resolution, token resolution, runtime planning,
runtime emission, runtime consumption, PreviewCanvas behavior, import/export
behavior, adapters, canonical IDs, graph traversal, or child component runtime
resolution.

The registry may be provided to schema validation as optional metadata context:

```ts
validateComponent(schema, { registry })
```

Without registry input, `validateComponent(schema)` preserves its existing
schema-local behavior for backward compatibility.

### Component Instance

A component instance is a future resolved occurrence of a component schema at a
specific position in a composition graph.

Component instances do not exist as resolver behavior yet. When introduced,
they should carry instance identity, graph position, variant/state selection,
and runtime planning scope without changing the schema's component type
identity.

### Child Instance

A child instance is a parent-declared occurrence of another component type.

In current metadata, a child instance is declared by one
`composition.children[]` entry. Its `component` field references the component
type, while its `name` field identifies the child instance within the parent
schema.

Component type identity and child instance identity are separate. For example,
`leadingIcon` and `trailingIcon` may both reference the same `Icon` component
type without becoming the same instance.

Child instance names are unique only within one parent schema's
`composition.children` list. They are not globally unique across all schemas.

### Slot

A slot is a flat semantic address inside a component schema.

Examples:

- `root`
- `label`
- `icon`

Slots are not DOM structure. A slot may map to a DOM element later, but the
schema should not assume a tag name, wrapper hierarchy, CSS selector, or adapter
implementation.

### Slot Relation

A slot relation is a flat semantic resolver relation between two slots.

Example:

```ts
slotRelations: [
  {
    parentSlot: "root",
    slot: "label"
  }
]
```

Slot relations are not DOM hierarchy, rendered nesting, CSS selectors, adapter
structure, or React component structure. They describe how the resolver may
share a small allowlisted set of style properties between flat slot addresses.

### Part

A part is a meaningful piece of a component that may be addressed by a slot.

For this phase, part behavior should be represented through existing slot names
and token bindings. A future metadata layer may describe part relationships, but
the resolver should not need nested part trees to keep resolving current
components.

### Child Component

A child component is a component used as part of another component's
composition.

Child components are represented as schema-level composition metadata through
`composition.children`.

Child component metadata is validation-only and metadata-only. It does not
affect resolver behavior, runtime planning, runtime emission, React rendering,
DOM structure, import/export, generated code, adapters, or preview behavior.

Semantically, `composition.children` declares parent-owned child instance
metadata. A child entry is associated with a flat parent slot; it is not inside
a DOM slot, React slot, JSX child position, wrapper element, CSS selector, or
adapter-specific insertion point.

The current child metadata shape identifies:

- `name`: the parent-owned child metadata identifier
- `component`: the referenced component name
- `slot`: the parent component's flat slot associated with the child metadata
- optional `description`
- optional `required`

Validation requires child metadata to use a non-empty `name`, a non-empty
`component` reference, a known parent slot, and a unique child name within
`composition.children`.

When registry-backed validation is explicitly enabled, child metadata also
requires the `component` reference to match a known registry authored component
name. Registry-backed validation also rejects direct self-reference where a
schema references its own authored component name as a child component.

Repeated child component types are allowed under different child names. A
single parent schema may declare `leadingIcon` and `trailingIcon` child
instances that both reference the same `Icon` component type.

Indirect self-reference and recursive component-type cycle validation are still
deferred until a dedicated graph validation phase. Part/child name collision
policy is also deferred because parts and children are currently separate
metadata lists, not a single shared composition namespace.

Child components should not be introduced by hard-coding React children,
runtime JSX structure, DOM hierarchy, selector metadata, generated imports, or
adapter-specific behavior in the Component Model.

The following are explicitly non-semantic for `composition.children`:

- DOM nesting
- React children
- JSX hierarchy
- CSS selectors
- wrapper elements
- adapter imports
- generated code hierarchy
- PreviewCanvas runtime meaning

### Compound Variant

A compound variant is behavior that applies when more than one variant condition
matches at the same time.

The current binding condition shape can already express this form:

```ts
conditions: {
  intent: "danger",
  size: "lg"
}
```

Initial compound-variant work should prove and document precedence through
resolver tests before adding new schema fields.

### Inherited Token

An inherited token is a resolved value that a component namespace receives from
a broader source when it has no authored override.

Current examples include `button` and `input` namespace values inheriting from
the active `card`, `toolbar`, or `panel` component kind, while preserving any
authored namespace overrides.

Inherited values must remain distinguishable from authored overrides in source
of truth data.

### Runtime Plan Provenance

Runtime plan provenance is metadata that describes where a planned runtime
variable declaration came from.

Current provenance values are:

- `explicit`: the value came from a matching token binding on the planned slot
- `inherited`: the value was filled through slot relation inheritance
- `derived`: the value was computed from other resolved style properties

Provenance is planning metadata only. The runtime emitter may consume it, but
`runtimePlan` still does not carry values, change `DesignTokens`, alter
import/export shapes, or change adapter behavior.

## Current Discovered Reality

The current Button schema is already a multi-slot component:

- `root`
- `label`
- `icon`

This means the foundation for multi-part components already exists in the
Component Model. The resolver already groups resolved styles by slot and by
state, which gives future composition work a safe extension point without
changing runtime rendering.

Input currently uses only a `root` slot, which is also valid. Composition must
support both single-slot and multi-slot components.

Button currently declares resolver-level slot relations:

- `root -> label`
- `root -> icon`

## Integration Constraints

### Slots Stay Flat

Slots must remain flat semantic addresses in this phase. Composition metadata
may later describe relationships between slots, parts, and child components, but
slot identifiers themselves should stay stable and addressable.

Do not require nested slot paths or DOM-shaped trees for resolver behavior.

### Future Composition Graph Semantics

The future composition graph should separate instance topology from component
type dependencies.

The runtime or compiler instance graph should be a strict instance tree. Each
child instance has one parent instance and one stable path derived from child
instance names, not from DOM structure, React structure, selectors, generated
code, or adapter output.

The component-type dependency graph should be acyclic. A component schema may
reference other component types through `composition.children`, and the same
component type may appear multiple times in an instance tree under different
child instance names. However, component type references must not create direct
or indirect recursion once graph validation exists. The current registry-backed
validation only checks unknown direct child component references and direct
self-reference when a registry is provided.

This model allows schema reuse while keeping instance identity stable:

- component types are reusable definitions
- component schemas define local contracts
- child entries declare parent-owned child instances
- instance paths identify occurrences
- adapters may later decide how to render those occurrences

### Component-Type Dependency Graph Boundary

The next planned graph validation boundary is a component-type dependency
graph, not an instance tree.

The component-type graph should be built only from registry entries and
`composition.children[].component` references. For now, graph nodes are
authored component type names and graph edges mean "schema A references
component type B." This graph is for metadata validation only.

The future instance tree is a separate runtime/compiler concept. It should
describe parent instance to child instance relationships, with instance paths
derived from child instance names. It is not implemented yet and should not be
created implicitly by component-type graph validation.

Allowed graph validator inputs are limited to:

- registry entries
- schema authored names and registry keys
- `composition.children`
- `composition.children[].component`
- child instance names
- parent slot references
- available parent slot names from schema metadata

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

Graph keys are authored-name-only for now. There are no canonical IDs,
canonical name normalization rules, or persisted canonical identities yet.
Duplicate authored-name validation remains the current collision guard.
Canonical identity remains future planning only.

The `.` character remains reserved for the future semantic instance-path
delimiter, but new canonical naming rules should not be enforced during the
authored-name graph validator phase.

### Future Indirect Cycle Detection Boundary

A future pure validator may detect indirect component-type cycles such as:

```txt
Button -> Input -> Button
```

Those diagnostics should remain metadata-only. Indirect cycle detection must
not introduce resolver recursion, child runtime resolution, graph-derived
`runtimePlan` entries, runtime emission changes, runtime consumption changes,
PreviewCanvas changes, import/export changes, or adapter behavior.

### Future Instance Paths

Future instance paths should be derived from child instance names and the
composition instance tree.

Conceptual examples:

```txt
Button
Button.leadingIcon
Button.trailingIcon
Toolbar.primaryAction.icon
```

These paths are semantic compiler identities. They are not DOM paths, React
component paths, CSS selectors, adapter import paths, or generated file paths.

Instance paths should be stable as long as child instance names and graph
position remain stable. They should support repeated use of the same component
type without collisions.

### Canonical Identity Direction

Canonical identity rules are planned but not implemented yet.

Future registry and graph work should separate authored names from canonical
IDs:

- authored names remain readable schema data
- canonical IDs are derived from authored names for identity checks
- component type identity should eventually compare canonical component IDs
- child instance identity should eventually compare canonical child IDs
- runtime variable names should eventually derive from canonical IDs only

The `.` character is reserved as the future semantic instance-path delimiter.
Child instance names should not rely on `.` being available as ordinary name
content once canonical validation exists.

Future canonical collision diagnostics should reject ambiguous names before
registry or resolver behavior runs. For example, names that would normalize to
the same canonical child ID should not coexist in one parent schema's
`composition.children` list.

The exact canonicalization and escaping rules remain volatile. They should be
defined in a dedicated phase before canonical-aware registry behavior,
cross-component graph validation, or instance-aware `runtimePlan` naming.

The current component registry foundation does not introduce canonical IDs,
canonical name normalization, or canonical persisted identifiers. Authored
component names remain the active lookup surface.

### Slot Inheritance

The resolver currently consumes `composition.slotRelations` for conservative
property-level slot inheritance.

Inheritance eligibility is driven by the central internal property registry.
The current registry-marked inheritable properties are:

- `color`
- `transitionProperty`
- `transitionDuration`
- `transitionTimingFunction`
- `transitionDelay`

Parent slot values may fill missing child-slot properties only. Explicit
child-slot token bindings always win over inherited parent-slot values.

The same inheritance rule applies to base styles and state styles:

- `styles.base[slot]`
- `styles.states[state][slot]`

The resolver does not inherit layout or box properties, including:

- `background`
- `paddingBlock`
- `paddingInline`
- `height`
- `gap`
- `borderRadius`
- `boxShadow`
- `opacity`

Slot inheritance does not change the resolver output shape. Resolved styles
remain grouped by flat slot names and states.

The property registry centralizes style-property behavior that was previously
spread across resolver CSS-property lookup, slot inheritance allowlists, and
runtime planning behavior. Registry entries can describe:

- `cssProperty`
- `inheritable`
- `runtimeEmittable`
- `derived`
- `allowStateEmission`

This registry is internal to the Component Model. It does not redesign public
schema metadata, imports, exports, React rendering, UI behavior, or adapters.

Derived style properties are distinguishable from explicit token bindings.
Currently, the base `transition` shorthand is treated as a derived property
when planned in `runtimePlan`.

### Slot Relation Validation

Composition validation is schema-first. Slot relation safety is checked before
resolution and before any future runtime emission phase.

Validation rejects:

- relations whose `slot` references an unknown slot
- relations whose `parentSlot` references an unknown slot
- relations whose `slot` references itself as parent
- simple cycles
- multi-node cycles
- duplicate child-slot relation identifiers

The resolver assumes validated acyclic relations. It does not implement
runtime-based cycle handling.

### Registry-Backed Child Reference Validation

Registry-backed child reference validation is opt-in and metadata-only.

When `validateComponent(schema, { registry })` is used, validation rejects:

- child component references that do not match a known registry authored name
- direct self-reference where a schema references its own authored component
  name as a child component

When validation is called as `validateComponent(schema)`, child component
reference lookup remains disabled for backward compatibility. Existing
schema-local checks remain preserved in both modes:

- known parent slot
- non-empty child name
- non-empty component reference
- duplicate child names within one parent schema

Registry-backed validation does not perform graph traversal, indirect cycle
detection, recursive composition resolution, child runtime resolution, style
resolution, token resolution, runtime planning, runtime emission, runtime
consumption, PreviewCanvas behavior, import/export behavior, or adapter
behavior.

### Flat CSS Variable Contract Is Mandatory

The runtime token contract remains a flat map of CSS custom properties.

Valid direction:

```ts
{
  "--button-radius": "...",
  "--button-density": "...",
  "--state-focus-ring": "..."
}
```

Avoid introducing nested runtime token objects as the public CSS/export
contract.

Future slot-level tokens may add more flat variables, but they must follow a
predictable flat naming scheme and continue to resolve through the token engine.

### Slot-Level Token Naming

Slot-level CSS variables preserve the flat runtime contract. The variable name
should encode:

```txt
component -> slot -> property
```

Use this pattern for non-root slots:

```txt
--{component}-{slot}-{property}
```

Examples:

- `--button-icon-size`
- `--card-header-padding`
- `--input-label-color`

Use this pattern for root slot styles:

```txt
--{component}-{property}
```

Examples:

- `--button-background`
- `--button-radius`
- `--input-color`

The `root` slot is the component's default style surface, so root-slot variable
names should omit `root`. Avoid names such as `--button-root-background`.

This preserves compatibility with existing component-level variables such as:

- `--button-radius`
- `--button-density`
- `--card-radius`
- `--input-radius`

Slot names must remain semantic and schema-derived. Variable names should not be
derived from DOM tags, CSS selectors, adapter implementation details, generated
React component names, or wrapper hierarchy.

Collision avoidance rules:

- A component owns its own variable prefix.
- A slot variable should include the slot name unless it targets `root`.
- A property name should describe the resolved style concern, not the source
  token group.
- New slot-level variables must not repurpose existing component-level variable
  names with incompatible meaning.

Scalability requirements:

- Multi-part components should add flat variables predictably per slot.
- Adding new slots should not require nested runtime token objects.
- Adapters may map flat variables to their own output later, but adapter naming
  must not leak into the Component Model or token contract.
- Token resolver paths may stay semantic while resolving to these flat runtime
  variables.

### Runtime Planning And Emission

The resolver creates additive runtime planning metadata for flat CSS variable
emission.

For the target-specific runtime consumption policy, see
[`RUNTIME_CONSUMPTION_SAFETY.md`](./RUNTIME_CONSUMPTION_SAFETY.md).

The runtime plan remains flat:

```ts
runtimePlan.variables[]
```

Each planned variable currently has this shape:

```ts
{
  name,
  property,
  slot,
  source,
  sourceType,
  styleLayer,
  state?
}
```

`sourceType` describes where the planned declaration came from:

- `explicit`: a matching token binding on the planned slot
- `inherited`: a value filled through a slot relation
- `derived`: a registry-marked derived property, such as base `transition`

`styleLayer` describes which style layer the planned declaration belongs to:

- `base`: a base style planning entry
- `state`: a state style planning entry

The existing `source` field remains layer-compatible with current planning
behavior (`"base"` or `"state"`). State-layer entries also retain `state`
metadata.

`runtimePlan` is planning metadata only. It does not carry values, mutate
`DesignTokens`, change CSS export, change JSON import/export, or invoke
adapters.

If future child component composition adds instance-aware runtime planning,
`runtimePlan.variables[]` must remain flat. Any instance-aware variable naming
must be collision-safe and derived from semantic instance paths plus flat slot
and property names. It must not introduce nested runtime token objects or derive
names from DOM structure, React hierarchy, CSS selectors, adapter imports, or
generated code hierarchy.

A pure runtime emission helper consumes resolved components:

```ts
emitComponentRuntimeVariables(resolved, { state? })
```

The helper derives emitted values from `resolved.styles.base` and
`resolved.styles.states`, using `runtimePlan.variables[]` only for flat
variable metadata. It returns flat CSS custom properties.

Emission rules:

- root slot variables omit `root`
- non-root slot variables include the slot name
- base and state layers use the same variable names
- the requested active state overlays base values in the returned map
- same-layer different-origin variable collisions throw
- missing values are skipped
- state-suffixed variable names are not emitted

`PreviewCanvas` now consumes this helper additively for Button and Input root
preview scopes. Slots remain semantic addresses; the current preview's DOM
mapping is downstream rendering behavior and is not part of the Component
Model contract.

Preview consumption is intentionally selective. Runtime variables are emitted
broadly, but `PreviewCanvas` consumes `var(...)` only where the current
inline-style rendering path is safe.

Current safe preview consumption:

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

Input root keeps transition-sensitive state-changing properties direct in
`PreviewCanvas`:

- `background`
- `boxShadow`
- `opacity`

Root transitions are rendered with concrete longhands in `PreviewCanvas`:

- `transitionProperty`
- `transitionDuration`
- `transitionTimingFunction`
- `transitionDelay`

The root `transition` shorthand is not consumed with `var(...)` in
`PreviewCanvas`. Transition variables still emit for future use, including
`--button-transition-*`, `--input-transition-*`,
`--button-label-transition-*`, and `--button-icon-transition-*`.

Transition safety rule: emit runtime variables broadly, but consume them
selectively. Animated state-changing properties in `PreviewCanvas` should use
direct concrete values until a safer CSS/runtime strategy exists. Stable
`var(...)` property declarations can prevent visible transitions when only the
custom property values change, and React warns when transition shorthand and
longhands are mixed in inline styles.

### Schema/Resolver First

Composition must be introduced through portable schema concepts and resolver
behavior before runtime rendering changes.

Safe order:

1. Define schema terms and constraints.
2. Prove resolver behavior with tests.
3. Add optional metadata only after behavior is understood.
4. Let adapters consume the model later.

### No Runtime Redesign In This Phase

The current composition resolver integration must not redesign:

- CSS export
- JSON import/export
- React component structure
- library adapters

Runtime emission is being integrated incrementally through flat CSS variables.
It must not introduce nested runtime token objects, adapter metadata, selector
metadata, or DOM structure into the Component Model.

### No Adapter Or React Restructuring

Composition metadata should not force immediate changes to React rendering.

Adapters are downstream from the Component Model and should not be introduced or
redesigned during this phase.

## Compatibility Rules

- Preserve existing imports and exports.
- Preserve existing schema fields.
- Preserve resolver behavior with tests when adding composition behavior.
- Preserve binding-order precedence until compound variant precedence is tested
  and documented.
- Preserve the distinction between authored overrides and inherited values.
- Preserve the flat `DesignTokens` runtime shape.
- Preserve `runtimePlan.variables[]` as a flat planning structure.
- Keep registry-backed validation opt-in unless a later migration explicitly
  changes the validation contract.

## Current Non-Goals

Composition integration currently does not include:

- runtime redesign
- nested runtime token objects
- adapter work
- React restructuring
- visual composition editor
- import/export changes
- export/import of runtimePlan or emitted runtime variables
- canonical IDs
- canonical collision enforcement
- indirect component graph traversal
- child component runtime resolution
- resolver recursion
- PreviewCanvas changes
- adapter changes
- runtimePlan changes
- CSS variable naming changes
- DOM/render semantics
- instance-path runtime naming

## Future Migration Order

Completed foundation work:

1. Docs.
2. Variant typing generalization.
3. Compound variant precedence tests.
4. Optional composition metadata.
5. Metadata validation.
6. Flat token naming rules.

Completed resolver integration and hardening work:

1. Resolver composition baseline tests.
2. Slot relation graph derivation.
3. Button composition slot metadata.
4. Conservative slot inheritance.
5. Slot precedence documentation.
6. Property registry foundation.
7. Registry-driven inheritance and runtime planning behavior.
8. Slot relation self-reference and cycle validation.
9. Runtime plan provenance metadata.

Completed runtime emission integration work:

1. Pure runtime variable emission helper.
2. Base/state flat variable layering.
3. Same-layer collision hardening.
4. Additive PreviewCanvas runtime variable wiring.
5. Selective preview consumption of safe Button/Input root variables.
6. Preview consumption of Button label/icon color.
7. Transition-safety boundary for animated properties and root transition
   longhands.

Completed component registry foundation work:

1. Metadata-only component registry module.
2. Registry entries for existing Button/Input schemas.
3. Pure lookup/list/schema helpers.
4. Duplicate authored-name validation.
5. Optional registry-backed composition child component reference validation.
6. Direct self-reference validation when registry validation is enabled.
7. Backward-compatible `validateComponent(schema)` behavior without registry
   input.

Recommended next graph validation phase:

1. Add a pure authored-name-based component-type graph validator.
2. Keep the validator isolated from resolver, runtime, `PreviewCanvas`,
   import/export, and adapters.
3. Add focused tests for no children, acyclic graphs, direct self-reference,
   simple indirect cycles, longer indirect cycles, unknown references, and
   duplicate authored names remaining registry-local.

Do not continue to later phases until each earlier phase has established the
needed compatibility boundary.
