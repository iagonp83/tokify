# Token Hierarchy

This document describes the current token hierarchy and the known compatibility
gaps that must be preserved until explicit migration work is introduced.

## Goals

- Make token resolution predictable.
- Keep the system scalable across components.
- Keep CSS and JSON exports understandable.
- Preserve current runtime behavior while the hierarchy is formalized.

## Non-Goals

- No redesign.
- No runtime behavior change.
- No export or import behavior change.
- No resolver mapping change.
- No token migration yet.

## Hierarchy

The intended token hierarchy is:

```txt
global tokens
-> semantic token paths
-> component default tokens
-> component overrides
-> resolved runtime tokens / CSS variables
```

### Global Tokens

Global tokens are the broad design-system inputs shared by all generated
components. In the current state model, these are represented by:

- `color`
- `layout`
- `motion`

Current global CSS variables include examples such as:

- `--color-accent`
- `--color-on-accent`
- `--layout-radius`
- `--layout-density`
- `--layout-elevation`
- `--motion-duration`
- `--motion-ease`
- `--motion-distance`
- `--motion-delay`
- `--motion-stagger`
- `--motion-transition-property`

Global tokens are the default source for component token resolution unless a
component override exists.

### Semantic Token Paths

Semantic token paths are component-model-facing references. They are not CSS
variables themselves. They describe intent and are resolved by
`tokenResolver.ts`.

Examples:

- `semantic.color.accent`
- `semantic.color.onAccent`
- `semantic.state.hover.background`
- `semantic.state.active.opacity`
- `semantic.state.focus.ring`
- `semantic.state.disabled.opacity`

The Component Model should bind to semantic paths rather than raw CSS variable
names. This keeps schemas library-agnostic and allows the runtime/export layer
to evolve independently.

### Component Default Tokens

Component default tokens are per-component resolved values derived from the
global token state.

The current component token namespaces are:

- `card`
- `toolbar`
- `panel`

Current component CSS variables include:

- `--card-radius`
- `--card-density`
- `--card-elevation`
- `--card-motion-duration`
- `--toolbar-radius`
- `--toolbar-density`
- `--toolbar-elevation`
- `--toolbar-motion-duration`
- `--panel-radius`
- `--panel-density`
- `--panel-elevation`
- `--panel-motion-duration`

These values are produced by resolving global layout and motion tokens together
with any component-specific overrides.

### Component Overrides

Component overrides are authored deviations from global defaults. They live in
`DesignState.componentTokens`.

Current override shape:

```ts
componentTokens: {
  card: {
    layout?: Partial<LayoutState>,
    motion?: Partial<MotionState>
  },
  toolbar: {
    layout?: Partial<LayoutState>,
    motion?: Partial<MotionState>
  },
  panel: {
    layout?: Partial<LayoutState>,
    motion?: Partial<MotionState>
  }
}
```

Overrides should represent user intent, not resolved inherited values. This
distinction matters for future profile changes, preset loading, and
source-of-truth exports.

### Resolved Runtime Tokens / CSS Variables

Resolved runtime tokens are the flattened CSS-variable contract used by the
preview and CSS export.

`useDesignTokens(state)` currently merges:

1. `createColorTokens(state.color)`
2. `createLayoutTokens(state.layout)`
3. `createMotionTokens(state.motion)`
4. `createComponentTokens(state)`

The result is a flat object shaped for CSS custom properties:

```ts
{
  "--color-accent": "...",
  "--layout-radius": "...",
  "--motion-duration": "...",
  "--card-radius": "...",
  "--card-motion-duration": "..."
}
```

This flat object is a runtime/export representation. It should not be treated
as the complete source-of-truth token model.

## Current Compatibility Gaps

### Button Is A Reference Component

`Button` exists in the Component Model as the current reference implementation,
but it is not currently a real component token namespace.

There is no `button` entry in `ComponentKind`, `componentKinds`, or
`DesignState.componentTokens`.

Current behavior:

- The Button schema uses token paths such as `component.button.radius`.
- `tokenResolver.ts` resolves those paths through the active component kind.
- The rendered Button therefore uses the selected `card`, `toolbar`, or `panel`
  skin.

This is compatibility behavior. A real `button` token namespace requires an
explicit model change and migration plan.

### Corrected Button Resolver Mappings

Some Button token resolver mappings previously crossed semantic boundaries.

Corrected mappings:

- `component.button.size.md.paddingBlock -> --${componentKind}-density`
- `component.button.size.sm.paddingBlock -> --${componentKind}-density`
- `component.button.state.active.paddingInline -> --${componentKind}-density`
- `component.button.state.focus.paddingBlock -> --${componentKind}-density`
- `component.button.state.focus.ring -> --state-focus-ring`

Padding-related paths now resolve to density-related tokens. The focus ring path
now resolves to the state focus ring token.

### JSON Export Is Currently Resolved Export

The current JSON export serializes resolved token values from the flat
`DesignTokens` object.

This means the JSON `components` section contains resolved values for every
component kind, not only authored component overrides.

As a result, importing exported JSON can treat inherited values as component
overrides. This is current compatibility behavior, not the desired future
source-of-truth model.

Future source-of-truth export should distinguish:

- global defaults
- semantic token groups
- authored component overrides
- optional resolved values for compatibility or inspection

### State Tokens Are Runtime/CSS/JSON Tokens

State tokens currently exist at runtime, in CSS export, and in JSON export:

- `--state-hover-background`
- `--state-active-opacity`
- `--state-focus-ring`
- `--state-disabled-opacity`

They are generated by the token engine and consumed through semantic state
paths. JSON export exposes them under `global.state` as:

- `hoverBackground`
- `activeOpacity`
- `focusRing`
- `disabledOpacity`

JSON import accepts `global.state` additively. Older JSON without this group
continues to import with the generated runtime defaults.

### `semantic.color.onAccent` Uses A Dedicated Token

`semantic.color.onAccent` maps to `--color-on-accent`.

This keeps foreground-on-accent and accent background independently
addressable.

Older state and imported JSON that do not provide `onAccent` fall back to the
safe default `#ffffff`.
