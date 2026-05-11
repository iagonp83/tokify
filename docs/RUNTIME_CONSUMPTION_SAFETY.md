# Runtime Consumption Safety Model

This document records the Runtime Consumption Safety Model for the current
component runtime architecture.

The model is documentation-first. It does not require runtime behavior changes,
resolver changes, adapter changes, import/export changes, or a redesign of the
flat CSS variable contract.

## Audit Verdict

The current architectural interpretation is valid:

```txt
runtime emission != runtime consumption != preview rendering behavior
```

The existing separation remains the intended architecture:

- resolver -> `resolved.styles`
- `runtimePlan` -> additive metadata only
- runtime emission -> broad flat CSS variable contract
- `PreviewCanvas`, exports, and adapters -> target-specific consumers

Runtime variables may be emitted even when a particular consumer chooses not to
consume them through `var(...)`.

## Core Separation

### Resolution

The resolver produces concrete resolved component styles:

```txt
resolved.styles.base
resolved.styles.states
```

These styles are the source of truth for concrete values after token resolution,
variant selection, state selection, namespace inheritance, slot inheritance, and
derived style calculation.

### Runtime Planning

`runtimePlan` is additive planning metadata. It stays value-free and non-mutating.

It may describe that a flat runtime variable can exist, but it does not promise
that every rendering target must consume that variable through `var(...)`.

`runtimePlan.variables[]` remains flat and metadata-only.

### Runtime Emission

`emitComponentRuntimeVariables(resolved, { state? })` emits a broad flat map of
CSS custom properties from `resolved.styles`.

Emission is intentionally broad. A variable being emitted means the value is
available to runtime consumers. It does not mean every target should consume it
through a CSS custom property declaration.

The runtime contract remains flat:

```txt
--button-background
--button-label-color
--input-transition-duration
```

Nested runtime token objects are not part of the contract.

### Runtime Consumption

Consumption is target-specific. A consumer decides whether to use:

- `property: var(--component-property)`
- a direct concrete value from `resolved.styles`
- direct transition longhands
- a target-specific export or adapter mapping

`PreviewCanvas` is one consumer. It is not the universal runtime backend.

## PreviewCanvas Backend

`PreviewCanvas` is a constrained React inline-style backend.

It currently attaches emitted flat runtime variables to the Button and Input
preview roots, then consumes those variables selectively in React inline style
objects.

Because this backend uses React inline styles, CSS custom properties, state
updates, and transitions together, it has constraints that may not apply to CSS
file export, generated component code, or adapter-specific output.

The PreviewCanvas rule is:

```txt
emit broadly, consume selectively
```

Those current PreviewCanvas decisions are now represented by a preview-local
policy helper:

```txt
src/features/design-generator/components/previewRuntimeConsumptionPolicy.ts
```

The helper is target-specific to `preview-react-inline`. It records only
consumption decisions and does not own values, change resolution, change
`runtimePlan`, narrow runtime emission, alter import/export, affect adapters,
or introduce nested runtime token objects.

## Property Categories

These categories describe consumption policy, not emission eligibility.

Do not classify every property universally. The same property may be safe for
one component, slot, state, or target, and risky for another. For example,
`opacity` can be generally var-safe, while Input root opacity remains direct in
the current PreviewCanvas because var consumption caused transition loss in that
empirical backend.

### Static-Safe

A property is static-safe when the current target can consume it through
`var(...)` without known transition, shorthand, or inline-style quirks.

Current PreviewCanvas examples include:

- Button root `color`
- Button root `borderRadius`
- Button root `paddingBlock`
- Button root `paddingInline`
- Button label `color`
- Button icon `color`
- Input root `color`
- Input root `borderRadius`
- Input root `paddingBlock`
- Input root `paddingInline`

Button root `background`, `boxShadow`, and `opacity` are also currently consumed
through runtime variables in PreviewCanvas, but they should not be treated as
universally static-safe across all components and targets.

### Transition-Sensitive

A property is transition-sensitive when visible behavior depends on transition
interpolation or state-to-state animation.

Transition-sensitive properties may still be emitted as runtime variables. A
consumer may choose direct concrete values when `var(...)` consumption prevents
or weakens visible transitions in that target.

Current PreviewCanvas examples:

- Button root `background`, `boxShadow`, and `opacity` consume runtime variables
  in the stable path.
- Input root `background`, `boxShadow`, and `opacity` remain direct concrete
  values because current PreviewCanvas behavior loses expected transitions when
  they are consumed through `var(...)`.
- Root transition properties are rendered as direct longhands.

### Shorthand-Risk

A property is shorthand-risk when using a shorthand can reset omitted longhands,
obscure target-specific behavior, or conflict with explicit longhands.

Current PreviewCanvas shorthand-risk examples:

- `transition`
- slot-level transition shorthand variables such as `--button-label-transition`
  and `--button-icon-transition`

These variables may be emitted, but PreviewCanvas should not consume them as
`transition: var(...)`.

### Preview-Direct-Only

A property is preview-direct-only when the current React inline-style preview
backend must use the concrete resolved value to preserve behavior.

Current PreviewCanvas direct-only examples:

- Input root `background`
- Input root `boxShadow`
- Input root `opacity`
- Button/Input root transition longhands:
  - `transitionProperty`
  - `transitionDuration`
  - `transitionTimingFunction`
  - `transitionDelay`

This category is intentionally narrow and empirical. It should not be promoted
into a global property rule without target-specific proof.

### Export-Safe-But-Preview-Risky

A property is export-safe-but-preview-risky when it can remain part of the flat
runtime emission contract, and may be usable by CSS export or future adapters,
but should not be consumed through `var(...)` in the current PreviewCanvas.

Current examples:

- `--button-transition`
- `--input-transition`
- `--button-label-transition`
- `--button-icon-transition`
- `--input-background`
- `--input-box-shadow`
- `--input-opacity`

The key point is that emission remains sound even when preview consumption is
selective.

### Longhand-Only

A property group is longhand-only when PreviewCanvas should avoid the shorthand
and render direct longhands instead.

Current PreviewCanvas root transitions are longhand-only:

- `transitionProperty`
- `transitionDuration`
- `transitionTimingFunction`
- `transitionDelay`

The root `transition` shorthand is still emitted as a runtime variable for
future consumers, but PreviewCanvas avoids consuming it.

## React Inline-Style Constraints

PreviewCanvas should preserve these constraints:

- Avoid `transition` shorthand consumption through `var(...)`.
- Avoid mixing transition shorthand and transition longhands in React inline
  style objects.
- Prefer direct concrete transition longhands in PreviewCanvas.
- Keep transition-sensitive properties direct when current empirical behavior
  shows transition loss through `var(...)`.
- Do not infer universal property policy from one component's preview behavior.

React inline style is a backend with its own quirks. The constraints above do
not automatically apply to stylesheet exports or future adapter backends.

## Browser And Runtime Caveats

CSS custom properties resolve where they are consumed, not where they are
declared.

Animation depends on the consuming property. Changing a custom property value is
not always equivalent to changing a typed animatable CSS property directly.

Unregistered custom properties are untyped token streams. They are not
equivalent to typed animatable values unless a target explicitly registers and
uses them in a compatible way.

CSS shorthands can reset omitted longhands. This matters for transition
composition, especially in React inline styles where shorthand/longhand mixing
can produce warnings or unexpected behavior.

## Current PreviewCanvas Matrix

### Button Root

| Property | Runtime variable emitted | Preview consumption |
| --- | --- | --- |
| `background` | Yes, `--button-background` | `var(--button-background)` |
| `color` | Yes, `--button-color` | `var(--button-color)` |
| `borderRadius` | Yes, `--button-border-radius` | `var(--button-border-radius)` |
| `boxShadow` | Yes, `--button-box-shadow` | `var(--button-box-shadow)` |
| `opacity` | Yes, `--button-opacity` | `var(--button-opacity)` |
| `paddingBlock` | Yes, `--button-padding-block` | `var(--button-padding-block)` |
| `paddingInline` | Yes, `--button-padding-inline` | `var(--button-padding-inline)` |
| `transition` | Yes, `--button-transition` | Not consumed as `var(...)` |
| `transitionProperty` | Yes, `--button-transition-property` | Direct concrete longhand |
| `transitionDuration` | Yes, `--button-transition-duration` | Direct concrete longhand |
| `transitionTimingFunction` | Yes, `--button-transition-timing-function` | Direct concrete longhand |
| `transitionDelay` | Yes, `--button-transition-delay` | Direct concrete longhand |

The Button motion pulse may temporarily override some visual properties with
direct preview values. That is preview behavior, not a runtime contract change.

### Button Slots

| Slot | Property | Runtime variable emitted | Preview consumption |
| --- | --- | --- | --- |
| `label` | `color` | Yes, `--button-label-color` | `var(--button-label-color)` |
| `label` | `transition` | Yes, `--button-label-transition` | Not consumed as `var(...)` |
| `icon` | `color` | Yes, `--button-icon-color` | `var(--button-icon-color)` |
| `icon` | `transition` | Yes, `--button-icon-transition` | Not consumed as `var(...)` |

### Input Root

| Property | Runtime variable emitted | Preview consumption |
| --- | --- | --- |
| `background` | Yes, `--input-background` | Direct concrete value |
| `color` | Yes, `--input-color` | `var(--input-color)` |
| `borderRadius` | Yes, `--input-border-radius` | `var(--input-border-radius)` |
| `boxShadow` | Yes, `--input-box-shadow` | Direct concrete value |
| `opacity` | Yes, `--input-opacity` | Direct concrete value |
| `paddingBlock` | Yes, `--input-padding-block` | `var(--input-padding-block)` |
| `paddingInline` | Yes, `--input-padding-inline` | `var(--input-padding-inline)` |
| `transition` | Yes, `--input-transition` | Not consumed as `var(...)` |
| `transitionProperty` | Yes, `--input-transition-property` | Direct concrete longhand |
| `transitionDuration` | Yes, `--input-transition-duration` | Direct concrete longhand |
| `transitionTimingFunction` | Yes, `--input-transition-timing-function` | Direct concrete longhand |
| `transitionDelay` | Yes, `--input-transition-delay` | Direct concrete longhand |

## Preview-Local Consumption Policy Registry

The current implementation has a dedicated PreviewCanvas consumption policy
registry/helper. It is intentionally small and preview-local, not a new runtime
architecture layer.

Each current policy entry is keyed by:

- target/backend, currently `preview-react-inline`
- component namespace, currently `button` or `input`
- slot, currently `root`, `label`, or `icon`
- property

State is not part of the current key because current PreviewCanvas consumption
decisions do not require state-specific policy.

Current modes are:

- `runtime-var`: consume the emitted flat runtime variable through `var(...)`
- `direct-value`: use the concrete resolved style value
- `direct-longhand`: use the concrete resolved transition longhand
- `omit-shorthand`: omit the shorthand from PreviewCanvas inline styles

This registry must not:

- move values into `runtimePlan`
- mutate `resolved.styles`
- narrow broad runtime emission
- introduce nested runtime token objects
- change import/export formats
- redesign React or adapters

The purpose is to make existing target-specific PreviewCanvas consumption
decisions explicit while preserving the flat runtime variable contract. Future
exports or adapters may define their own target-specific consumption behavior
without changing this preview policy.

## Stable Rules

- Keep runtime emission broad.
- Keep runtime consumption target-specific.
- Keep PreviewCanvas selective.
- Keep flat CSS custom properties as the runtime contract.
- Keep `runtimePlan` additive, metadata-only, and value-free.
- Keep transition shorthand avoided in PreviewCanvas.
- Keep PreviewCanvas root transitions as direct longhands.
- Keep component/slot/target-specific exceptions possible.
- Keep the current policy registry preview-local unless a future phase
  explicitly scopes another target.
