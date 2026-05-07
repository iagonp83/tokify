# Current System Snapshot

## Stable State

The project is currently a React + TypeScript + Vite application.

The runtime token contract remains a flat CSS variable map. The system does not
emit nested runtime token objects.

Current stabilized areas:

- resolver system
- token resolver
- variant system
- namespace inheritance
- flat runtime token output
- Composition System Foundation
- Composition Resolver Integration
- Resolver Hardening

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
- baseline composition resolver behavior
- slot relation graph normalization
- conservative slot inheritance
- flat slot runtime planning metadata
- property registry lookup and style metadata
- registry-driven inheritance and runtime planning behavior
- slot relation self-reference and cycle validation
- runtimePlan provenance metadata

## Component Model Structure

The Component Model lives in `src/compiler/component-model/`.

Current files:

- `component.types.ts`
- `button.schema.ts`
- `compositionSlotRelations.ts`
- `input.schema.ts`
- `propertyRegistry.ts`
- `resolveComponent.ts`
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
- duplicate slot relation identifiers are rejected
- duplicate part identifiers are rejected
- duplicate child component identifiers are rejected

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

The runtime does not emit new slot-level variables yet.

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

Future slot-level variables must preserve the flat CSS variable runtime
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

The resolver now derives additive runtime planning metadata using this naming
contract:

- root slot omits `root`: `--button-background`
- non-root slots include the slot name: `--button-label-color`
- names remain flat and schema-derived
- planning entries include provenance and layer metadata
- state planning entries include state metadata

This metadata is not emitted into the runtime yet.

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
9. Build additive `runtimePlan` metadata for future flat variable emission.

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

`runtimePlan` is planning metadata only. It does not write CSS variables, mutate
`DesignTokens`, change import/export data, or alter React rendering.

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
5. Resolved bindings are grouped by slot.
6. Each slot gets an inline style object.
7. Slots are rendered as DOM elements by the current preview only.

Current preview slot mapping:

- `root` -> `<button>`
- `label` -> `<span>`
- `icon` -> `<span>`

This preview mapping is not part of the Component Model contract.

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
Runtime planning metadata is not exported or imported yet.

## What Composition Is Not Yet

Composition is not yet:

- runtime CSS variable emission for slot-level variables
- child component runtime resolution
- nested runtime token objects
- adapter integration
- React restructuring
- visual composition editor
- import/export shape changes

There is also no:

- `compoundVariants` field
- new slot variable emission
- generated React component composition
- library-specific output

## Current Non-Goals

- No runtime redesign.
- No export or import behavior change.
- No adapter work.
- No React/UI redesign.
- No nested token runtime.
- No actual runtime emission from `runtimePlan` yet.

## Next Recommended Phase

Runtime emission planning or the next explicitly scoped composition phase.
