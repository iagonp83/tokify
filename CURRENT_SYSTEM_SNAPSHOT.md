# Current System Snapshot

## Component Model Structure

The Component Model lives in `src/compiler/component-model/`.

Current files:

- `component.types.ts`
- `button.schema.ts`
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

The current reference component is `Button`.

Button slots:

- `root`
- `label`
- `icon`

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

These state tokens exist at runtime and in CSS export, but they are not yet
fully modeled as a JSON `state` token group.

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

`Button` is currently a reference component rendered through the active
component skin. It is not yet a real component token namespace in
`ComponentKind`, `componentKinds`, or `DesignState.componentTokens`.

Known invalid placeholder mappings currently exist in `tokenResolver.ts` and
cross semantic boundaries:

```ts
component.button.size.md.paddingBlock -> --layout-radius
component.button.size.sm.paddingBlock -> --motion-distance
component.button.state.active.paddingInline -> --layout-radius
component.button.state.focus.paddingBlock -> --layout-radius
component.button.state.focus.ring -> --layout-elevation
```

`semantic.color.onAccent` maps to `--color-on-accent`, which defaults to
`#ffffff` when older state or imported JSON does not provide it.

If a path is not mapped, the resolver throws a clear error.

If a mapped token key is missing from `DesignTokens`, the resolver throws a clear error.

## Preview Rendering Approach

`PreviewCanvas.tsx` currently renders the Button preview directly from the Component Model.

Flow:

1. `useDesignTokens(state)` creates the current token map.
2. `createTokenResolver(tokens, state.component.kind)` creates the resolver.
3. `resolveComponent(buttonSchema, tokenResolver, { intent, size, state })` resolves the Button.
4. Resolved bindings are grouped by slot.
5. Each slot gets an inline style object.
6. Slots are rendered as DOM elements.

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

The current JSON export behaves as a resolved export. Its component values come
from the resolved flat `DesignTokens` object, not from a source-of-truth
separation of global tokens, semantic token groups, component defaults, and
authored overrides. This compatibility behavior should be preserved until a
dedicated export/import migration is introduced.

## Current Non-Goals

- No redesign.
- No runtime behavior change.
- No export or import behavior change.
- No resolver mapping change.
- No token migration yet.

At this snapshot, the Component Model is connected to preview rendering and real `DesignTokens`, but there are still no adapters, no generated React components, and no library-specific output.
