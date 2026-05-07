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

Child components should be represented as schema-level composition metadata in a
future phase. They should not be introduced by hard-coding React children,
runtime JSX structure, or adapter-specific imports in the Component Model.

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

### Slot Inheritance

The resolver currently consumes `composition.slotRelations` for conservative
property-level slot inheritance.

Inheritance is limited to this explicit allowlist:

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

Future slot-level CSS variables must preserve the flat runtime contract. The
variable name should encode:

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

- runtime token emission
- CSS export
- JSON import/export
- preview rendering
- React component structure
- library adapters

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

## Current Non-Goals

Composition integration currently does not include:

- runtime redesign
- nested runtime token objects
- adapter work
- React restructuring
- visual composition editor
- import/export changes
- runtime variable planning or emission changes

## Future Migration Order

Completed foundation work:

1. Docs.
2. Variant typing generalization.
3. Compound variant precedence tests.
4. Optional composition metadata.
5. Metadata validation.
6. Flat token naming rules.

Current resolver integration work:

1. Resolver composition baseline tests.
2. Slot relation graph derivation.
3. Button composition slot metadata.
4. Conservative slot inheritance.
5. Slot precedence documentation.

Do not continue to later phases until each earlier phase has established the
needed compatibility boundary.
