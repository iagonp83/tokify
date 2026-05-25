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

## Post Slice A-C Review

After Slices A-C, the internal MVP flow is more inspectable but still not a
complete guided workflow.

Current flow:

- Token editing remains the main authoring path. Users adjust profile, active
  component skin, motion preset, accent color, layout tokens, motion duration,
  and authored Button/Input namespace overrides through `DesignState`.
- Button/Input preview remains the compiler-backed visual feedback path.
  `PreviewCanvas` still resolves Button and Input, emits flat runtime
  variables, and consumes them through the preview-local policy without
  becoming a generalized component workbench.
- The compiler flow status panel now makes the existing Button/Input path
  visible: token availability, schema validation, registry validation,
  component-type graph validation, resolution, runtime emission, preview
  availability, and CSS/JSON token export availability.
- Failed JSON import now produces product-local retryable UI feedback while
  successful import behavior, permissiveness, and import/export shapes remain
  unchanged.
- Export readiness is now clarified beside the export controls. The UI states
  that CSS/JSON exports are current token payload exports only.
- CSS and JSON export helpers remain unchanged. They still export token data
  only and still exclude generated component code, adapters, `runtimePlan`,
  emitted runtime variables, graph diagnostics, and composition graph data.
- Local presets remain lightweight `localStorage` persistence for saved
  `DesignState`. There is still no workspace document model, autosave,
  migration UI, or collaboration model.

Improved since the original planning checkpoint:

- Internal users can now see whether the built-in Button/Input compiler path
  is currently ready instead of inferring readiness from the preview or
  console.
- Failed imports no longer fail silently from the product user's perspective;
  the UI provides a retryable message without routing errors through compiler
  diagnostics.
- Export buttons are now framed as token exports only, reducing the risk that
  users expect component generation, adapters, runtime planning data, or graph
  diagnostics in the exported files.
- The implementation slices established small product-local UI surfaces with
  focused tests while preserving compiler and import/export contracts.

Remaining user-facing gaps:

- Workflow clarity is still partial. Users can see pieces of the flow, but the
  app does not yet provide a short "what to do next" path for an internal MVP
  session.
- Save/load/recovery clarity remains thin. Local presets, import, export, and
  reset exist, but their relationship to recovery, handoff, and durable project
  state is not explained in the UI.
- Validation actionability is limited. The status panel reports readiness, but
  it is intentionally read-only and does not yet guide users from a failing
  state to a corrective action.
- Component workbench limits remain. Button/Input preview is useful, but users
  still cannot author schemas, edit registry entries, inspect slots as a
  first-class workbench, or treat PreviewCanvas as an adapter preview.
- Export/code generation expectations are clearer but still constrained. The
  UI now says token exports only, but there is still no code preview,
  generated component output, or adapter output.
- Visual hierarchy and noise risk have increased. The sidebar now includes
  controls, compiler status, import feedback when present, export readiness
  copy, and preset actions; adding more explanatory UI should be weighed
  against scanability.

Next-step candidates:

- Slice D: Lightweight in-app workflow/checklist. This would make the internal
  MVP path more explicit with the lowest architecture risk if it stays
  read-only and local. Its main risk is adding another text surface to an
  already dense sidebar.
- Manual UI smoke/review checkpoint. This would validate hierarchy,
  scanability, copy, responsive behavior, import retry, preset flow, and
  export affordances without adding product surface. It is lowest risk and can
  expose whether Slice D is still needed.
- Save/load/preset clarity. This would improve a real workflow gap, but it
  likely touches persistence copy and possibly preset UI behavior, so it should
  follow a UI smoke review rather than precede one.
- Component workbench clarity. This could explain Button/Input preview limits,
  but it risks expanding compiler concepts in the UI before the hierarchy is
  proven.
- Pause UI and return to compiler/product architecture planning. This is
  appropriate if the next goal is deeper compiler capability, but it would not
  answer whether the current A-C product surface is usable as an internal MVP.

Recommended next step:

Run a manual UI smoke/review checkpoint before implementing Slice D or any
additional UI. The checkpoint should inspect the current local app across
desktop and narrow viewports, verify the A-C surfaces in context, and produce
a short recommendation on whether the next implementation should be Slice D,
save/load clarity, or a targeted hierarchy/copy cleanup.

This recommended checkpoint should remain non-invasive: no runtime changes, no
resolver changes, no import/export shape changes, no validator, graph,
registry, or diagnostics behavior changes, no structured public diagnostics
API, no warning activation, no aggregate reporting, no strict mode, no
canonical IDs, no instance paths, no child runtime resolution, no component
code generation, no adapters, and no `PreviewCanvas` redesign.

## Targeted Sidebar Hierarchy/Copy Cleanup Follow-up

The post Slice A-C recommendation to perform a targeted hierarchy/copy cleanup
before Slice D has been followed.

The follow-up reduced sidebar copy density, shortened compiler status and
export readiness copy, and grouped presets plus import/export actions more
clearly. It did not implement Slice D, redesign `PreviewCanvas`, or introduce
new product/compiler capabilities.

The cleanup preserved runtime behavior, resolver behavior, import/export helper
behavior, CSS/JSON export output, JSON import behavior, validators, graph
validation, registry behavior, diagnostics behavior, adapters,
`PreviewCanvas` behavior, and public APIs. Warnings, strict mode, aggregate
diagnostics, structured public diagnostics, component generation, adapters,
`runtimePlan` export, emitted runtime variable export, graph export, and
composition graph export remain inactive or unintroduced.

## Save / Load / Recovery Clarity Planning

This checkpoint is documentation-only. It does not implement product features,
change source code, change tests, change runtime behavior, change resolver
behavior, change import/export helper behavior, change validator behavior,
change graph validation behavior, change registry behavior, change diagnostics
behavior, change adapters, change `PreviewCanvas`, or change public APIs.

### Current Persistence And Recovery Inventory

Current local preset behavior:

- Built-in motion presets live in source and are applied as partial motion
  overrides to the current `DesignState`.
- User presets are loaded from `localStorage` on app mount under
  `design-motion-lab:user-presets`.
- A user preset stores `id`, `label`, `createdAt`, and the current
  `DesignState`.
- Saving a user preset prompts for a name, writes the preset to
  `localStorage`, and updates the in-memory preset list.
- Loading a user preset normalizes the saved `DesignState` with current
  default `componentTokens` and `variantSelections`, then replaces the current
  `DesignState`.
- Deleting a user preset removes it from `localStorage` and updates the
  in-memory preset list.
- If no user presets exist, the UI shows the empty state
  "No hay presets guardados."
- Invalid or non-array stored preset data is ignored by the storage helper and
  returns an empty preset list. Entries that fail the basic preset shape check
  are filtered out.

Current reset behavior:

- The `Reiniciar` action replaces the current `DesignState` with the initial
  state for the currently selected profile.
- Reset does not delete local presets.
- Reset does not write or remove exported files.
- Reset does not create a recovery point, version history, or restore entry.
- Reset is separate from JSON import and from local preset loading.

Current CSS export behavior:

- `Export CSS` downloads `tokens.css` and logs the same CSS text to the
  console.
- CSS export emits global `:root` token declarations and per-reference-kind
  blocks for `card`, `toolbar`, and `panel`.
- CSS export is token CSS only. It is not a workspace document and cannot be
  imported by the current JSON import flow.
- CSS export does not emit Button/Input namespace override blocks or JSON
  `overrides` data.
- CSS export does not include generated component code, adapters,
  `runtimePlan`, emitted Button/Input runtime variables, graph diagnostics, or
  composition graph data.

Current JSON export behavior:

- `Export JSON` downloads `tokens.json` and logs the same JSON text to the
  console.
- JSON export emits global color, state, layout, and motion token groups.
- JSON export emits a backward-compatible resolved `components` section for
  `card`, `toolbar`, and `panel`.
- JSON export emits source-oriented `overrides` for reference component kinds
  and authored namespaces when authored component token overrides exist.
- JSON export is token payload export, not a full workspace document.
- JSON export does not include selected profile, active component kind,
  selected editing namespace, active sidebar UI state, generated component
  code, adapters, `runtimePlan`, emitted runtime variables, graph diagnostics,
  composition graph data, autosave state, version history, or collaboration
  metadata.

Current JSON import behavior:

- `Import JSON` opens a hidden file input that accepts JSON files.
- Successful import parses the selected file, converts the current token
  payload shape back into `DesignState`, normalizes default `componentTokens`
  and `variantSelections`, replaces the current `DesignState`, clears import
  error feedback, and resets the file input.
- Import prefers the current `overrides` shape when present. If `overrides` is
  missing, import falls back to the older resolved `components` shape.
- Imported motion receives `presetId: "imported"` because JSON token payloads
  carry motion token values rather than a source preset identity.
- Successful import does not save a local preset, update user preset storage,
  create a restore point, or change import/export payload shapes.

Current failed import feedback and recovery behavior:

- Failed JSON parse, token parsing, and file read failures are shown through
  product-local retryable feedback.
- Failed imports do not mutate `DesignState`.
- Failed imports reset the file input so the same file can be selected again.
- Failed import feedback is not routed through compiler diagnostics.
- Recovery after a failed import is currently "keep working from the previous
  in-memory `DesignState`, then retry import or choose another action."
- There is no automatic restore point, autosave recovery, version history,
  migration UI, or workspace-level recovery model.

### Current Semantics To Preserve

Local presets are the only current saved-in-app persistence surface. They are
local to the browser storage for this app origin and contain saved
`DesignState`, but they are not files, not shared project documents, and not
server persistence.

Current in-app persistence does not save selected profile id, selected editing
namespace, import feedback text, file input state, downloaded export files,
console output, autosave checkpoints, version history, migration state, or
collaboration state.

JSON export is the only current file format that can be imported back into the
product. It is a token payload, not a complete project/workspace document and
not a byte-for-byte `DesignState` round trip. It is useful for token handoff
and partial state restoration, but it does not persist the surrounding app
session.

CSS export is a consumable token stylesheet. It is not importable by the
current product and should not be presented as a restore format.

Reset restores the current editor to the selected profile's initial token
state. It is not undo, not restore-from-preset, not restore-from-export, and
not a destructive preset storage operation.

Failed import recovery is state-preserving but manual. The previous in-memory
state remains active, and the user can retry the same file because the file
input is reset. There is no additional recovery artifact.

### User-Facing Confusion Risks

- Local preset vs JSON export: users may assume "Guardar preset" creates a
  portable file, or that `tokens.json` is equivalent to a saved preset. They
  currently serve different scopes.
- CSS export vs JSON export: users may assume both exports can be loaded back
  into Tokify. Only JSON import exists today.
- Reset vs restore: users may read `Reiniciar` as a restore action or as a
  preset/storage reset. It currently resets editor state only.
- Failed import retry: feedback says the import can be retried, but the UI does
  not explicitly explain that the previous state was preserved.
- No workspace/project document yet: users may expect a durable project file
  that includes all authoring/session/compiler state. Current exports and
  presets do not provide that model.
- No autosave/versioning/migration UI: users may expect automatic recovery or
  version history. Current persistence is manual and local.

### Next Implementation Candidates

Small copy/status clarification around Presets:

- Pros: addresses the biggest local save/load ambiguity at the point of action;
  can clarify that presets are local browser saves, that loading a preset
  replaces the current editor state, and that no file/workspace is created.
- Pros: can improve the no-saved-presets state without changing storage shape,
  import/export shape, runtime behavior, or compiler behavior.
- Cons: does not fully explain CSS/JSON export differences or failed import
  recovery.

Small copy/status clarification around Import / Export:

- Pros: can clarify that CSS is not importable, JSON is the importable token
  payload, and neither export is a workspace document.
- Pros: builds on the existing export readiness note with low implementation
  risk if kept copy-only.
- Cons: Slice C already improved export clarity, so this is less urgent than
  the still-thin preset save/load semantics.

Lightweight recovery hint after failed import:

- Pros: directly explains that the previous state is still active and the same
  file can be retried.
- Pros: narrowly improves recovery confidence without changing import parsing
  or diagnostics.
- Cons: only appears after failure and does not clarify the everyday save/load
  model.

No implementation; defer until workspace model:

- Pros: avoids adding copy that may later be replaced by a real workspace
  document model.
- Cons: leaves current internal users with avoidable ambiguity around a
  workflow that already exists.

Broader workspace/persistence architecture planning:

- Pros: would define the eventual project document, migration, autosave, and
  recovery model before durable persistence exists.
- Cons: too broad for the next internal MVP usability checkpoint and likely to
  pull future persistence concepts into scope before the current local/file
  surfaces are clear.

### Recommended Next Implementation Slice

Recommend a small Preset Persistence Clarification slice.

This slice should be copy/status-only and local to the current Presets surface.
It should clarify that saving a preset stores the current design locally in
this browser, that loading a preset replaces the current editor state, and that
presets are separate from CSS/JSON file export. It may also strengthen the
empty state to explain that no local presets have been saved yet.

The slice should not change localStorage keys, preset payload shape, save/load
behavior, delete behavior, import/export helper behavior, CSS/JSON output,
JSON import behavior, runtime, resolver, validators, graph validation, registry
behavior, diagnostics behavior, adapters, `PreviewCanvas`, public APIs, or
generated output. It should not introduce a workspace document model, autosave,
collaboration, server persistence, import/export shape changes, preset storage
shape changes, runtime/resolver/compiler behavior changes, generated component
code, adapters, or a `PreviewCanvas` redesign.

This is recommended over deferral because the existing product already exposes
manual local save/load, and a small clarification can reduce real internal MVP
confusion without committing to the future workspace architecture.

## Exit Criteria

This planning checkpoint is complete when:

- the current end-to-end product/compiler flow is inventoried
- current user-facing and compiler-facing gaps are documented
- the conservative internal MVP scope is defined
- explicit non-goals and compatibility constraints are recorded
- risks and dependencies are documented
- candidate implementation slices are compared
- exactly one first implementation slice is recommended
- the post Slice A-C review recommends exactly one next checkpoint or slice
- the Save / Load / Recovery clarity checkpoint inventories current
  persistence and recovery surfaces
- the Save / Load / Recovery clarity checkpoint recommends exactly one next
  implementation slice or explicit deferral
- no source code, tests, runtime behavior, resolver behavior, import/export
  behavior, `PreviewCanvas`, UI behavior, adapters, validators, graph
  validation, diagnostics behavior, registry logic, or public APIs are changed
- `git diff --check` passes

Future implementation of the recommended next checkpoint or slice should have
its own focused checkpoint, tests, and validation plan.
