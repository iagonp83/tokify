# Internal Usable MVP Planning / Product-Compiler Flow Audit

This checkpoint records the current end-to-end Tokify product/compiler flow and
defines a conservative internal MVP scope. It is documentation-only. It does
not implement product features, change source code, change tests, change
runtime behavior, change resolver behavior, change import/export behavior,
change `PreviewCanvas`, change UI behavior, change adapters, change validators,
change graph validation, change diagnostics behavior, or change public APIs.

## Current State

Tokify is currently a React + TypeScript + Vite application with a token-first
design generator UI and an increasingly formal compiler-side component model.
The active product surface lets a user edit global visual tokens, select a
profile, apply motion presets, edit a small set of component namespace tokens,
preview Button/Input compiler output, inspect generated CSS variables, export
CSS/JSON, import JSON, and save local custom presets.

Current token editing is state-driven through `DesignState`. The UI exposes
accent color swatches, profile selection, motion preset selection, and sliders
for radius, density, elevation, and motion duration. Global token output is a
flat CSS custom property map built from color, layout, motion, and component
token groups. The runtime token contract remains flat CSS variables; nested
runtime token objects are not active.

Current component editing has two distinct surfaces. The product UI exposes
`card`, `toolbar`, and `panel` as active reference component kinds, plus
`button` and `input` as editable authored namespaces. The compiler-side
Component Model currently has library-agnostic Button and Input schemas with
slots, states, variants, edit policy, token bindings, optional composition
metadata, resolver support, runtime planning metadata, and flat runtime
variable emission. The product UI does not yet provide schema editing,
component creation, registry editing, or component-library authoring.

Current variants are compiler-backed for Button only. Button has `intent` and
`size` axes; `PreviewCanvas` renders controls from `buttonSchema.variants` and
stores selections under `DesignState.variantSelections.button`. Input currently
has no variants. Variant editing is selection-only in the preview; users cannot
author axes, options, defaults, or token bindings through the UI.

Current states are preview-time selections. `PreviewCanvas` supports
`default`, `hover`, `active`, `focus`, and `disabled` state controls for Button
and Input resolution. Button also declares `loading` in the schema, but the
current preview state controls do not expose it. States are not currently a
persisted user workflow beyond the preview's local state selection.

Current preview behavior is a target-specific React inline-style consumer.
`PreviewCanvas` resolves Button and Input with the current design tokens,
emits flat runtime variables, and consumes those variables selectively through
the preview-local runtime consumption policy. The preview also includes a
separate decorative card for the active `card`/`toolbar`/`panel` kind. The
preview is useful for compiler smoke visibility, but it is not a generalized
component workbench, not an adapter backend, and not a full component library
preview.

Current validation feedback is mostly compiler-internal. `validateComponent`
returns `{ valid: boolean; errors: string[] }` publicly and internally uses
local `DiagnosticEnvelope -> legacy string` helpers for all current
schema-local and optional registry-backed diagnostic families.
`componentGraphValidation` returns `{ diagnostics, valid }` publicly and uses
a local `DiagnosticEnvelope -> legacy graph diagnostic` bridge for all current
graph diagnostics. The product UI does not surface schema validation, graph
validation, or compiler diagnostics beyond the read-only compiler flow status
panel. Failed JSON imports now show product-local retryable feedback without
routing through compiler diagnostics.

Current import/export is token-focused. CSS export emits `:root` variables and
per-reference-component blocks for `card`, `toolbar`, and `panel`. JSON export
emits global token groups, resolved component token groups for `card`,
`toolbar`, and `panel`, and explicit overrides for reference and authored
component namespaces. Import parses the current JSON token shape back into
`DesignState`, with backward-compatible support for older component groups.
Import/export intentionally excludes `runtimePlan`, emitted runtime variables,
composition graph fields, adapters, and generated component code.
The product UI now includes a read-only export readiness note that clarifies
current CSS/JSON exports are token payload exports only.

Current persistence is local and lightweight. Built-in profiles and motion
presets live in source. User presets are saved in `localStorage` under
`design-motion-lab:user-presets`, loaded on app mount, and contain the current
`DesignState`. There is no workspace file model, versioning, autosave,
collaboration, server persistence, or migration UI.

Current user-facing gaps:

- no clear internal MVP workflow that says what a user should complete from
  start to finish
- no validation panel or actionable diagnostic feedback in the UI
- no visible compiler readiness status for the current Button/Input schemas
- no schema, registry, or graph visibility for internal users
- no component-generation output, adapter output, or code preview
- no persistent workspace/project document beyond local presets
- no discoverable save/load/import recovery path for invalid or partial data
- no first-class record of what is in scope for an internal MVP

Current compiler-facing gaps:

- no product-level orchestration boundary that connects token state, schema
  validation, graph validation, resolution, runtime emission, preview, and
  export into one inspectable flow
- no UI-consumable validation view model while public validators remain legacy
- no single internal status object that distinguishes blocking errors from
  unavailable future capabilities
- no component-generation target yet; exports remain token-only
- no adapter contract active in the product flow
- no authored component library workflow beyond Button/Input source schemas
- no workspace document format that includes compiler state as a durable
  project artifact

## What Blocks Internal MVP Today

Tokify is not yet a usable internal MVP because the current product surface
does not make the compiler flow inspectable. A user can edit tokens and see a
preview, but cannot tell whether the existing Button/Input schemas validate,
whether the registry and graph are healthy, whether preview resolution
succeeded, or which outputs are actually available.

The most important blocker is not missing broad component coverage. It is the
missing read-only product/compiler status layer that connects the existing
pieces into one understandable internal workflow. Without that layer, adding
more controls or components would make the product feel larger without making
it safer or more usable.

## MVP Internal Scope

The conservative internal MVP should make Tokify usable as an internal
product-compiler workbench for the existing token and Button/Input compiler
flow, without pretending that the full future design system compiler exists.

Must-have capabilities:

- a clearly inspectable end-to-end flow from `DesignState` to tokens, schema
  validation, graph validation, resolved Button/Input output, flat runtime
  variables, preview, and current token export
- UI-visible validation feedback for the existing validator outputs, adapted
  locally for display without changing public validator APIs
- import failure feedback that reaches the user instead of only the console
- explicit product copy or status labels that distinguish current token export
  from future component/adaptor/code generation
- internal documentation that defines the MVP workflow, compatibility boundary,
  and exit criteria before implementation begins
- focused tests for any implementation slice that touches UI state,
  validation display, import handling, or export readiness behavior

The internal MVP should preserve the current architecture boundaries:

- runtime token contract remains flat CSS variables
- Component Model remains library-agnostic
- `composition.children` remains metadata-only
- graph keys remain authored-name-only
- duplicate authored-name validation remains registry-local
- resolver behavior remains non-recursive
- import/export shapes remain backward-compatible
- current public validator return shapes remain legacy-compatible
- warnings remain inactive by default
- strict mode remains inactive

Compatibility constraints:

- do not change `validateComponent` public shape
- do not change `componentGraphValidation` public shape
- do not add a structured public validation API in the MVP entry slice
- do not fail existing imports for advisory concerns
- do not normalize authored names on import or export
- do not export `runtimePlan`, emitted runtime variables, graph diagnostics, or
  composition graph data through the current token export path
- do not change existing preset storage shape unless a migration is explicitly
  planned and tested

## Non-Goals

This MVP planning checkpoint explicitly defers:

- warning collection
- aggregate reporting
- structured public validation API
- strict mode
- canonical IDs
- child instance IDs
- instance paths
- path-derived CSS variables
- child runtime resolution
- resolver recursion
- PreviewCanvas redesign
- broad component library expansion
- adapter implementation
- generated React/shadcn/Radix/CSS-only component output
- import/export shape changes
- runtime token object nesting
- schema-authored UI editing
- registry editing UI
- visual composition editor
- workspace/versioning/collaboration systems

## Risks

The main product risk is presenting a partial compiler foundation as a complete
generator. The internal MVP should be explicit that current export is token
export only and that Button/Input preview is a compiler workbench path, not a
complete component generation pipeline.

The main architecture risk is pulling future compiler concepts into the UI too
early. UI-visible diagnostics must be a display adaptation over current legacy
validator outputs, not a public structured validation API, aggregate reporting
system, warning activation path, or strict mode.

The main compatibility risk is import/export churn. The internal MVP should
keep token import/export stable while surfacing clearer status around what is
not exported yet.

The main implementation risk is mixing product usability fixes with compiler
behavior changes. MVP slices should be narrow and should avoid touching
runtime, resolver, `runtimePlan`, runtime emission, import/export shape,
adapters, validators, graph validation, registry behavior, or diagnostics
behavior unless a later explicitly scoped phase requires it.

## Dependencies

The MVP can rely on the existing token engine, `DesignState`, Button/Input
schemas, component registry, validator functions, graph validator, resolver,
runtime plan, runtime emission helper, preview runtime consumption policy,
current token import/export helpers, and local preset storage.

The MVP should not depend on future canonical identity, child instance IDs,
instance paths, warning wiring, aggregate diagnostics, structured public
validation APIs, strict mode, child runtime resolution, resolver recursion,
PreviewCanvas redesign, adapters, or broad component library expansion.

## Candidate Slices

### Slice A: Product-Compiler Flow Status Panel

Add a small internal status panel that reports the existing end-to-end flow for
the current built-in Button/Input compiler path: token state present, schema
validation status, registry validation status, graph validation status,
resolution status, runtime emission status, preview availability, and token
export availability.

Pros:

- makes the current compiler flow visible without changing core behavior
- can adapt existing legacy validator outputs locally for UI display
- clarifies what is currently token export versus future component generation
- creates a narrow product/compiler orchestration boundary for later slices

Cons:

- needs careful copy to avoid implying warnings, strict mode, or structured
  public diagnostics are active
- requires UI tests or focused rendering tests if implemented

### Slice B: Import Error Feedback

Show failed JSON import errors in the UI instead of console-only logging.

Pros:

- directly improves usability
- low architectural risk if import parsing remains unchanged
- easy to test narrowly

Cons:

- does not establish the end-to-end compiler workflow
- does not answer whether the current Button/Input compiler path is valid
- may become throwaway UI if done before the broader status surface exists

### Slice C: Export Readiness Clarification

Add UI status around the existing CSS/JSON export buttons to clarify that
exports are token exports and do not include generated component code,
runtimePlan, emitted runtime variables, or graph fields.

Pros:

- reduces user confusion
- low implementation risk
- preserves import/export behavior

Cons:

- mostly copy/status work
- does not surface validation or compiler readiness
- less useful without a flow-level status model

### Slice D: Internal MVP Workflow Documentation In App

Add a small in-app internal workflow summary or checklist.

Pros:

- helps internal users understand the current path
- minimal compiler risk

Cons:

- can become stale quickly
- does not produce real validation feedback
- less valuable than a status panel backed by existing compiler functions

## Recommended First Slice

Recommend Slice A: Product-Compiler Flow Status Panel.

The first implementation slice should add a narrow, read-only internal status
panel for the existing Button/Input flow. It should call only current public
helpers and adapt their existing outputs locally for display. It should not
change validator behavior, graph validation behavior, public APIs, warnings,
strict mode, import/export shapes, resolver behavior, runtime behavior,
`runtimePlan`, runtime emission, `PreviewCanvas` architecture, registry logic,
or adapters.

The initial panel should report:

- token state is available from the current `DesignState`
- Button and Input schema validation status from `validateComponent`
- registry duplicate authored-name validation status from
  `validateComponentRegistry`
- component-type graph validation status from the existing graph validator
- Button/Input resolution and runtime emission status through existing helpers
- preview availability for the current Button/Input preview path
- export availability for current CSS/JSON token exports only

This slice is recommended first because it creates the safest product/compiler
orchestration point while staying read-only. It also gives later slices a
natural home for import errors and export readiness details without widening
compiler contracts.

## Slice A Implementation Status

Slice A is now implemented and closed as a read-only product-compiler flow
status panel for the existing Button/Input path.

The implementation reports token state availability, Button/Input schema
validation, registry authored-name validation, component-type graph validation,
Button/Input resolution, Button/Input runtime emission, preview availability,
and CSS/JSON token export availability. It does not change runtime, resolver,
import/export, validators, graph validation, registry behavior, diagnostics
behavior, adapters, `PreviewCanvas` behavior, or public APIs.

The implementation does not activate component code generation, adapters,
warnings, strict mode, aggregate diagnostics, or structured public diagnostics.

## Slice B Implementation Status

Slice B is now implemented and closed as product-local failed JSON import
feedback in the design-generator UI.

The implementation keeps the successful import path unchanged, leaves
import/export shapes unchanged, and does not make imports stricter. Failed
imports do not mutate `DesignState`; they set local UI feedback and reset the
file input so the same file can be retried.

The implementation does not route import errors through compiler diagnostics
and does not change runtime, resolver, validators, graph validation, registry
behavior, diagnostics behavior, adapters, `PreviewCanvas` behavior, or public
APIs. It does not activate warning collection, aggregate diagnostics, strict
mode, or structured public diagnostics.

## Slice C Implementation Status

Slice C is now implemented and closed as a read-only export readiness note in
the design-generator UI.

The implementation clarifies that current CSS/JSON exports are token payload
exports only. It explicitly says generated component code and adapters are not
included, and that `runtimePlan`, emitted runtime variables, graph diagnostics,
and composition graph data are not exported.

The implementation does not activate warnings, aggregate diagnostics, strict
mode, or structured public diagnostics. It leaves CSS export output, JSON
export output, import behavior, import/export shapes, runtime, resolver,
validators, graph validation, registry behavior, diagnostics behavior,
adapters, `PreviewCanvas` behavior, and public APIs unchanged.

## Exit Criteria

This planning checkpoint is complete when:

- the current end-to-end product/compiler flow is inventoried
- current user-facing and compiler-facing gaps are documented
- the conservative internal MVP scope is defined
- explicit non-goals and compatibility constraints are recorded
- risks and dependencies are documented
- candidate implementation slices are compared
- exactly one first implementation slice is recommended
- no source code, tests, runtime behavior, resolver behavior, import/export
  behavior, `PreviewCanvas`, UI behavior, adapters, validators, graph
  validation, diagnostics behavior, registry logic, or public APIs are changed
- `git diff --check` passes

Future implementation of the recommended first slice should have its own
focused checkpoint, tests, and validation plan.
