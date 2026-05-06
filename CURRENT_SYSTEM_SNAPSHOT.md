# Current System Snapshot

## Component Model Structure

The Component Model lives in `src/compiler/component-model/`.

Current files:

- `component.types.ts`
- `button.schema.ts`
- `input.schema.ts`
- `resolveComponent.ts`
- `validateComponent.ts`
- `tokenResolver.ts`

The core schema shape is:

```ts
ComponentSchema = {
  editable,
  name,
  slots,
  states,
  tokenBindings,
  variants,
  version
}
```

Components are library-agnostic. They do not describe React, DOM, CSS classes, or adapters. They describe:

- available slots
- supported states
- variant axes
- token bindings
- edit policy

The current reference components are `Button` and `Input`.

Button slots:

- `root`
- `label`
- `icon`

Input slots:

- `root`

## Variant System

Variants are declarative and separate from states.

Current variant axes:

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

State is not part of the variant axes.

Internal variant typing is split between schema-facing selection and future
design-state-facing namespace selection:

- `ComponentVariantSelection` describes a partial axis selection for one
  component schema.
- `ResolvedComponentVariantSelection` describes the resolver's normalized
  selection after schema defaults are applied.
- `ComponentVariantSelectionsState` is reserved for selected variants on
  authored namespaces such as `button` and `input`.

Selected variants are not component token overrides. They should remain separate
from `DesignState.componentTokens`, which continues to represent authored
layout/motion overrides only.

Variant-specific bindings are expressed through binding conditions:

```ts
conditions: {
  intent: "secondary"
}
```

or:

```ts
conditions: {
  size: "sm"
}
```

## State System

States are defined only through the component schema `states` field.

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

State rendering in the preview is driven manually by local UI state in `PreviewCanvas`. It does not use CSS pseudo-classes like `:hover`.

Current visible state behavior:

- `hover` changes background
- `active` changes opacity
- `focus` changes box shadow
- `disabled` changes opacity

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

`useDesignTokens(state)` combines those token groups into one flat `DesignTokens` object.

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

State tokens are now part of the real token engine:

- `--state-hover-background`
- `--state-active-opacity`
- `--state-focus-ring`
- `--state-disabled-opacity`

These state tokens exist at runtime, in CSS export, and in JSON export under
`global.state`. JSON import accepts `global.state` additively and falls back to
the existing generated state token values when the group is missing.

Component Model token bindings use semantic string paths:

```ts
token: "semantic.state.hover.background"
```

They do not store token metadata objects.

## Resolver Logic

`resolveComponent` is intentionally small and does not validate schemas.

Validation remains in `validateComponent.ts`.

`resolveComponent` does only:

1. Resolve variant defaults.
2. Keep state separate from variants.
3. Select base bindings.
4. Select bindings whose variant conditions match.
5. Select bindings whose state conditions match.
6. Resolve each binding value through `tokenResolver.get(binding.token)`.

Current resolver precedence is intentionally binding-order based:

1. Build the normalized variant selection from schema defaults plus the
   caller-provided context.
2. Build base styles from bindings without a state condition whose variant
   conditions match the normalized selection.
3. Build state styles separately from bindings whose state condition matches each
   schema state and whose variant conditions also match the normalized
   selection.
4. When multiple bindings target the same slot/property within the same style
   group, the later binding wins through object merge order.
5. Preview rendering overlays the active state's style group on top of base
   styles.

The resolver does not currently read `DesignState`, active skins, namespace
overrides, import/export data, or UI selections directly. Those inputs are
adapted before resolution through `createTokenResolver(...)` and the explicit
`ComponentResolutionContext`.

The returned resolved component includes:

```ts
{
  schema,
  selection,
  state,
  bindings
}
```

Each resolved binding includes:

```ts
{
  slot,
  target,
  token,
  value,
  conditions?,
  id
}
```

## Token Resolver

`tokenResolver.ts` adapts Component Model semantic token paths to the existing flat `DesignTokens` map.

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

`Button` and `Input` are currently reference components rendered through the
active component skin. They are authored/reference-mode `ComponentNamespace`
entries, not `ComponentKind` skins. `ComponentKind` remains limited to `card`,
`toolbar`, and `panel`.

This is intentional for the current consolidation phase. Reference components
inherit a virtual base from the active `card`, `toolbar`, or `panel` skin, then
apply optional authored namespace overrides from `DesignState.componentTokens`.
The resulting runtime contract remains flat CSS variables such as `--button-*`
and `--input-*`, and JSON import/export preserves the namespace override shape
for compatibility.

Future direction:

- Materialize a namespace base for `button` and `input` only if a later model
  change needs source-of-truth values beyond the current virtual inherited base.
- Expand `component.button.*` and `component.input.*` token mappings safely
  without broadening `ComponentKind`.
- Keep runtime CSS variables flat.
- Preserve reference-mode compatibility so existing `button` and `input`
  namespace overrides continue to inherit from the active `card`, `toolbar`, or
  `panel` skin unless explicitly overridden.

Previously invalid placeholder mappings in `tokenResolver.ts` have been
corrected so padding-related paths resolve to active component density and the
focus ring path resolves to the state focus ring:

```ts
component.button.size.md.paddingBlock -> --${componentKind}-density
component.button.size.sm.paddingBlock -> --${componentKind}-density
component.button.state.active.paddingInline -> --${componentKind}-density
component.button.state.focus.paddingBlock -> --${componentKind}-density
component.button.state.focus.ring -> --state-focus-ring
```

`semantic.color.onAccent` maps to `--color-on-accent`, which defaults to
`#ffffff` when older state or imported JSON does not provide it.

If a path is not mapped, the resolver throws a clear error.

If a mapped token key is missing from `DesignTokens`, the resolver throws a clear error.

## Preview Rendering Approach

`PreviewCanvas.tsx` currently renders the Button preview directly from the Component Model.
It also renders the Input preview through the same resolver and state controls.

Flow:

1. `useDesignTokens(state)` creates the current token map.
2. `createTokenResolver(tokens, state.component.kind)` creates the resolver.
3. `resolveComponent(buttonSchema, tokenResolver, { intent, size, state })` resolves the Button.
4. `resolveComponent(inputSchema, tokenResolver, { state })` resolves the Input.
5. Resolved bindings are grouped by slot.
6. Each slot gets an inline style object.
7. Slots are rendered as DOM elements.

Current slot mapping:

- `root` -> `<button>`
- `label` -> `<span>`
- `icon` -> `<span>`

Current rendered structure:

```tsx
<button style={rootStyle}>
  <span style={iconStyle}>{"\\u2022"}</span>
  <span style={labelStyle}>Button</span>
</button>
```

Temporary state controls remain in `PreviewCanvas`:

- `default`
- `hover`
- `active`
- `focus`
- `disabled`

These controls exist only to validate Component Model state rendering.

## Export Architecture

CSS export is handled by:

```ts
src/features/design-generator/export/exportCss.ts
```

`exportCss(tokens)` emits:

- global `:root` declarations
- component-specific blocks for existing component kinds

Global exports include:

- color tokens
- layout tokens
- motion tokens
- state tokens

Component exports include blocks like:

```css
[data-component="card"] {
  --card-radius: ...;
  --card-density: ...;
  --card-elevation: ...;
  --card-motion-duration: ...;
}
```

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

## Current Non-Goals

- No redesign.
- No runtime behavior change.
- No export or import behavior change.
- No resolver mapping change.
- No token migration yet.

At this snapshot, the Component Model is connected to preview rendering and real `DesignTokens`, but there are still no adapters, no generated React components, and no library-specific output.
