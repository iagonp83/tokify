# Warning Catalog Planning

This document defines the planned warning catalog for metadata hygiene and
canonical/path readiness.

This catalog records warning planning and the current isolated warning helper.
It does not activate validator wiring, graph validation wiring, runtime
behavior, resolver behavior, `runtimePlan` behavior, runtime emission,
import/export behavior, `PreviewCanvas` behavior, canonical IDs, child instance
IDs, instance paths, path-derived runtime variables, strict mode, or blocking
warnings.

## Current Status

Warning collection remains planned but inactive in validation flows.

The isolated child-name hygiene diagnostics helper now exists:

```ts
collectChildNameHygieneDiagnostics(schema: ComponentSchema): DiagnosticEnvelope[]
```

It is pure and opt-in. It emits structured `DiagnosticEnvelope` warnings only
when called directly.

The current diagnostics infrastructure provides:

- a stable diagnostic envelope in `src/compiler/diagnostics/diagnosticContract.ts`
- deterministic ordering through `sortDiagnostics`
- a pure aggregate coordinator in
  `src/compiler/diagnostics/aggregateDiagnostics.ts`
- an isolated child-name hygiene producer in
  `src/compiler/diagnostics/childNameHygieneDiagnostics.ts`

The helper is not wired into validators. `validateComponent` remains schema
correctness validation. The component graph validator remains
component-type-only. Current string diagnostics remain backward-compatible.

## Catalog Principles

Future warnings must preserve:

- authored child names
- import/export compatibility
- permissive default behavior
- warning-only posture
- separation from schema validation
- separation from graph validation
- separation from runtime, resolver, import/export, and adapters
- aggregate diagnostics as coordinator-only

Warning producers emit already-created diagnostic envelopes. Aggregate
diagnostics may order and combine those envelopes when a caller passes them in,
but it must not own warning rules or invoke validators.

Warnings are advisory migration and readability signals. They must not:

- make child names identity
- make future-safe names canonical IDs
- introduce canonical IDs
- introduce child instance IDs
- introduce instance paths
- create runtime or path-derived variables
- normalize authored names on import or export
- fail schema validation, graph validation, build, import, export, runtime,
  preview rendering, or adapter output by default

## Code Family Conventions

Exact first-phase child-name hygiene diagnostic codes are implemented below.
Additional future codes remain future work. Code families should be stable,
machine-facing, and namespaced by domain:

- `METADATA_CHILD_NAME_*` for child metadata hygiene
- `PATH_CHILD_NAME_*` for future path-readiness warnings
- `CANONICAL_CHILD_NAME_*` for future canonical-readiness warnings
- `COMPAT_CHILD_NAME_*` for compatibility or migration-readiness warnings

These families are planning labels except where exact first-phase codes are
listed in this document. They do not create validator-active warnings.

## Implemented Producer: Child Name Hygiene

The first child-name hygiene producer is implemented as isolated diagnostics
infrastructure.

Current file:

```txt
src/compiler/diagnostics/childNameHygieneDiagnostics.ts
```

Current test file:

```txt
src/compiler/diagnostics/childNameHygieneDiagnostics.test.ts
```

Current API:

```ts
collectChildNameHygieneDiagnostics(schema: ComponentSchema): DiagnosticEnvelope[]
```

The helper is pure and opt-in. It accepts a `ComponentSchema`; a later refactor
may accept a smaller schema-like child metadata input only if that keeps the
helper independent from validators, runtime, resolver, import/export, and
adapters.

The helper returns already-created `DiagnosticEnvelope` objects. It does not
mutate input, return strings, call `validateComponent`, call the component
graph validator, or call `aggregateDiagnostics` internally.

It does not inspect resolver output, token resolver output, `runtimePlan`,
runtime emission, preview runtime consumption, `PreviewCanvas`, import/export
payloads, adapters, DOM, React output, CSS selectors, generated files, or
runtime variable names.

### First-Phase Layer And Source

Current `DiagnosticLayer` values do not include a dedicated `metadata` layer.
The child-name hygiene producer uses:

- `layer`: `schema`
- `source.name`: `childNameHygiene`
- `severity`: `warning`

The `schema` layer here means the authored schema is the data being inspected.
It does not mean `validateComponent` owns the rules, and it does not make these
warnings schema validity failures. The `source.name` field preserves the
separate rule owner.

### First-Phase Ordering Strategy

Ordering is deterministic. The helper returns sorted envelopes using
`sortDiagnostics` over diagnostics it created.

Current first-phase `order` strategy:

- `bucket`: use one stable child-name hygiene warning bucket, separate from
  blocking schema and graph errors
- `sequence`: derive from stable rule rank first, then
  `composition.children` order for diagnostics in the same rule

Rule rank:

1. `METADATA_CHILD_NAME_LEADING_WHITESPACE`
2. `METADATA_CHILD_NAME_TRAILING_WHITESPACE`
3. `METADATA_CHILD_NAME_REPEATED_WHITESPACE`
4. `METADATA_CHILD_NAME_TAB_OR_NEWLINE`
5. `PATH_CHILD_NAME_RESERVED_DELIMITER`
6. `METADATA_CHILD_NAME_NORMALIZED_COLLISION`
7. `METADATA_CHILD_NAME_CASE_COLLISION`

Sibling collision diagnostics should point at each affected child name rather
than only producing a parent-level summary. If a future reporter adds summaries,
that should be additive and should not replace child-targeted diagnostics.

### First-Phase Normalization Semantics

Whitespace-normalized sibling collision detection should use only this
normalization:

1. trim leading and trailing whitespace
2. collapse each internal whitespace run to a single ASCII space

This normalization is for comparison only. It must not rewrite source data,
change import/export behavior, change displayed names, or produce canonical
IDs.

Case-only sibling collision detection should be separate from whitespace
normalization. The first phase should compare exact authored strings with a
conservative case-insensitive comparison after ruling out exact equality. It
should not lowercase authored names as source data.

Unicode case-folding should be conservative in the first phase. If the first
implementation relies on JavaScript case conversion, the docs and tests should
avoid claiming full locale-aware or Unicode-normalization behavior. Unicode
normalization, locale-specific casing, accent folding, transliteration, and
slugification are deferred.

### Exact First-Phase Codes

#### METADATA_CHILD_NAME_LEADING_WHITESPACE

Purpose:

Warn when a child name starts with whitespace that may be invisible or hard to
notice in diagnostics, review, future display paths, or migration reports.

Trigger condition:

- `composition.children[childIndex].name` begins with whitespace

Authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- metadata hygiene

Why non-blocking:

Leading whitespace is valid authored metadata today. The warning is about
readability and future migration readiness, not schema correctness.

Current ordering:

- child-name hygiene bucket, rule rank 1, then child index order

Explicit non-goals:

- do not trim the name
- do not fail validation
- do not change import/export
- do not infer identity

#### METADATA_CHILD_NAME_TRAILING_WHITESPACE

Purpose:

Warn when a child name ends with whitespace that may be invisible or hard to
notice in diagnostics, review, future display paths, or migration reports.

Trigger condition:

- `composition.children[childIndex].name` ends with whitespace

Authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- metadata hygiene

Why non-blocking:

Trailing whitespace is valid authored metadata today. The warning is advisory
and does not affect current validation, runtime, graph, or serialization
behavior.

Current ordering:

- child-name hygiene bucket, rule rank 2, then child index order

Explicit non-goals:

- do not trim the name
- do not fail validation
- do not change import/export
- do not create canonical names

#### METADATA_CHILD_NAME_REPEATED_WHITESPACE

Purpose:

Warn when a child name contains repeated internal whitespace runs that may make
names visually ambiguous or collision-prone in future display paths and
migration reports.

Trigger condition:

- `composition.children[childIndex].name` contains an internal whitespace run
  of two or more whitespace characters

Authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- metadata hygiene

Why non-blocking:

Repeated whitespace is a readability concern. It does not make the schema
invalid and must not change resolver, runtime, graph, import/export, or adapter
behavior.

Current ordering:

- child-name hygiene bucket, rule rank 3, then child index order

Explicit non-goals:

- do not collapse whitespace in source data
- do not change current string diagnostics
- do not introduce strict mode
- do not reinterpret whitespace as path syntax

#### METADATA_CHILD_NAME_TAB_OR_NEWLINE

Purpose:

Warn when a child name includes tabs or line breaks that may be difficult to
see, render, compare, or report consistently.

Trigger condition:

- `composition.children[childIndex].name` contains a tab, carriage return, or
  newline

Authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- metadata hygiene

Why non-blocking:

Tabs and newlines are authoring hygiene risks, not current correctness
failures. Existing imports, exports, and validation behavior must remain
compatible.

Current ordering:

- child-name hygiene bucket, rule rank 4, then child index order

Explicit non-goals:

- do not rewrite tabs or newlines
- do not reject imported data
- do not change schema validity
- do not generate replacement names

#### PATH_CHILD_NAME_RESERVED_DELIMITER

Purpose:

Warn when a child name contains `.` because `.` is reserved as the planned
future semantic instance-path delimiter.

Trigger condition:

- `composition.children[childIndex].name` contains `.`

Authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- path readiness

Why non-blocking:

No active instance paths exist. The delimiter is reserved for future planning,
so current authored names containing `.` remain valid and import/export
compatible.

Current ordering:

- child-name hygiene bucket, rule rank 5, then child index order

Explicit non-goals:

- do not introduce instance paths
- do not treat `.` as active runtime semantics
- do not rewrite `.` on import or export
- do not make delimiter warnings hard errors

#### METADATA_CHILD_NAME_NORMALIZED_COLLISION

Purpose:

Warn when sibling child names collide after first-phase whitespace
normalization, which means trimming leading/trailing whitespace and collapsing
internal whitespace runs to a single ASCII space.

Trigger condition:

- two or more siblings under the same `composition.children` array have
  different authored names but the same first-phase whitespace-normalized name

Authored-data path target:

- `["composition", "children", childIndex, "name"]` for each affected sibling

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- metadata hygiene

Why non-blocking:

The current system does not derive identity, graph keys, runtime variables,
imports, or exports from normalized child names. This is a future readability
and migration-readiness signal only.

Current ordering:

- child-name hygiene bucket, rule rank 6, then child index order

Explicit non-goals:

- do not create canonical normalization
- do not rewrite or merge siblings
- do not reject current schemas
- do not alter graph traversal
- do not change import/export payloads

#### METADATA_CHILD_NAME_CASE_COLLISION

Purpose:

Warn when sibling child names differ only by case under the first-phase
case-insensitive comparison.

Trigger condition:

- two or more siblings under the same `composition.children` array have
  different authored names but the same conservative case-insensitive form

Authored-data path target:

- `["composition", "children", childIndex, "name"]` for each affected sibling

Severity:

- `warning`

Layer:

- `schema`

Source:

- `childNameHygiene`

Classification:

- metadata hygiene

Why non-blocking:

Case-only differences are valid authored metadata today. The warning is a
future compatibility signal and not a correctness failure.

Current ordering:

- child-name hygiene bucket, rule rank 7, then child index order

Explicit non-goals:

- do not lowercase authored names
- do not introduce locale-specific casing rules in the first phase
- do not make names identity
- do not block import/export
- do not introduce adapter-specific file-system rules in core

### Deferred Codes

These codes remain deferred until a later checkpoint decides they are precise
and safe enough to implement:

- `PATH_CHILD_NAME_UNSAFE_CHARACTER`
- `PATH_CHILD_NAME_PUNCTUATION_RISK`
- `METADATA_CHILD_NAME_AMBIGUOUS_DISPLAY`
- `CANONICAL_CHILD_NAME_MIGRATION_RISK`
- `PATH_CHILD_NAME_MIGRATION_RISK`
- `COMPAT_CHILD_NAME_LEGACY_RISK`

The deferred codes need tighter trigger conditions before implementation.
They should not be smuggled into the first child-name hygiene producer.

## Planned Warning Families

### Child Naming Hygiene

Conceptual purpose:

Flag child names that are valid authored metadata today but may be hard to read,
review, display, or migrate later.

Likely diagnostic code family:

- `METADATA_CHILD_NAME_*`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity expectation:

- `warning`

Classification:

- metadata hygiene

Why non-blocking:

Child names are authored labels, not identity. They are currently metadata for
composition planning and diagnostics. A readability concern should not change
schema validity, graph validity, runtime behavior, import/export, or adapter
output.

Explicit non-goals:

- do not make child names canonical IDs
- do not normalize or rewrite authored names
- do not reject repeated child component types
- do not make warnings part of `validateComponent`
- do not use child names for runtime variable names
- do not introduce instance paths

### Reserved Instance-Path Delimiter Risks

Conceptual purpose:

Warn when an authored child name contains `.` because `.` is reserved as the
planned future semantic instance-path delimiter.

Likely diagnostic code family:

- `PATH_CHILD_NAME_RESERVED_DELIMITER`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity expectation:

- `warning`

Classification:

- canonical/path readiness

Why non-blocking:

No active instance paths exist. The delimiter reservation is a future planning
constraint, so names containing `.` remain import/export compatible and should
not fail current validation.

Explicit non-goals:

- do not introduce instance paths
- do not serialize path addresses
- do not treat `.` as active runtime semantics
- do not rewrite `.` on import or export
- do not make delimiter warnings hard errors without migration tooling

### Whitespace Ambiguity

Conceptual purpose:

Warn about child names with leading whitespace, trailing whitespace, repeated
internal whitespace, tabs, or newlines because those names can be visually
ambiguous in review, diagnostics, future display paths, or migration reports.

Likely diagnostic code family:

- `METADATA_CHILD_NAME_WHITESPACE_*`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity expectation:

- `warning`

Classification:

- metadata hygiene

Why non-blocking:

Whitespace ambiguity is a readability and migration-readiness concern. It does
not make current authored metadata invalid and must not affect resolver,
runtime, graph validation, import/export, or adapters.

Explicit non-goals:

- do not trim names automatically
- do not collapse whitespace on import or export
- do not change current string diagnostics
- do not introduce strict mode
- do not reinterpret whitespace as path syntax

### Duplicate Normalized Sibling Names

Conceptual purpose:

Warn when sibling child names would collide after a future display or path
normalization pass, such as trimming, collapsing whitespace, or replacing
unsafe punctuation for display.

Likely diagnostic code family:

- `METADATA_CHILD_NAME_NORMALIZED_COLLISION`
- `PATH_CHILD_NAME_NORMALIZED_COLLISION`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]` for each colliding child
- optionally `["composition", "children"]` for a parent-level summary if a
  future reporter needs one

Severity expectation:

- `warning`

Classification:

- metadata hygiene
- canonical/path readiness when the collision concerns future migration paths

Why non-blocking:

The current system does not derive identity, runtime variables, imports,
exports, or graph keys from normalized child names. Authored sibling names
should remain valid unless a later explicit migration introduces stricter
rules with tooling.

Explicit non-goals:

- do not create canonical IDs
- do not create canonical child-name normalization
- do not reject current schemas
- do not merge siblings
- do not alter graph traversal
- do not change import/export payloads

### Case-Only Sibling Collisions

Conceptual purpose:

Warn when sibling child names differ only by letter casing, because future
case-insensitive tooling, file systems, display search, or migration reports
could confuse them.

Likely diagnostic code family:

- `METADATA_CHILD_NAME_CASE_COLLISION`
- `COMPAT_CHILD_NAME_CASE_COLLISION`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]` for each colliding child

Severity expectation:

- `warning`

Classification:

- metadata hygiene
- canonical/path readiness when migration tooling is affected

Why non-blocking:

Case-only differences are currently valid authored metadata. The warning is a
compatibility signal, not a correctness failure.

Explicit non-goals:

- do not lowercase authored names
- do not change duplicate-name validation semantics
- do not make names identity
- do not block import/export
- do not introduce adapter-specific file-system rules in core

### Punctuation And Path-Unsafe Names

Conceptual purpose:

Warn when child names include punctuation or characters that may be unsafe or
confusing in future display paths, machine paths, migration files, URLs,
packages, or adapter boundaries.

Likely diagnostic code family:

- `PATH_CHILD_NAME_UNSAFE_CHAR`
- `PATH_CHILD_NAME_PUNCTUATION_RISK`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity expectation:

- `warning`

Classification:

- canonical/path readiness

Why non-blocking:

No current runtime, resolver, import/export, or adapter behavior consumes child
names as path segments. Path safety is future migration readiness only.

Explicit non-goals:

- do not define active escaping rules
- do not create generated path segments
- do not create path-derived CSS variables
- do not introduce adapter-specific naming validation in core
- do not mutate authored punctuation

### Ambiguous Display Names

Conceptual purpose:

Warn about child names that may be visually unclear in future diagnostics,
inspectors, or migration reports, such as names made mostly of punctuation,
symbols, invisible spacing, or labels that are hard to distinguish from nearby
siblings.

Likely diagnostic code family:

- `METADATA_CHILD_NAME_AMBIGUOUS_DISPLAY`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]`

Severity expectation:

- `warning`

Classification:

- metadata hygiene

Why non-blocking:

Display ambiguity is an authoring experience concern. It should not affect
schema correctness, graph correctness, runtime output, or serialized data.

Explicit non-goals:

- do not replace current required-name schema checks
- do not downgrade existing schema errors into warnings
- do not generate display names
- do not rewrite labels
- do not block repeated component types

### Future Canonical/Path Migration Readiness

Conceptual purpose:

Warn when authored child metadata may require attention before a future
canonical identity, instance path, or migration-tooling phase. These warnings
would help users prepare data without changing current behavior.

Likely diagnostic code family:

- `CANONICAL_CHILD_NAME_MIGRATION_RISK`
- `PATH_CHILD_NAME_MIGRATION_RISK`
- `COMPAT_CHILD_NAME_LEGACY_RISK`

Likely authored-data path target:

- `["composition", "children", childIndex, "name"]` when a child name is the
  concern
- `["composition", "children"]` when the concern spans sibling relationships
- a schema-level path only when the whole component schema is the migration
  subject

Severity expectation:

- `warning`

Classification:

- canonical/path readiness

Why non-blocking:

Canonical IDs, child instance IDs, and instance paths are inactive. Migration
readiness warnings should give authors time to prepare before any future
strict or migration phase.

Explicit non-goals:

- do not introduce canonical IDs
- do not introduce child instance IDs
- do not introduce active instance paths
- do not infer identity from names
- do not make future-safe names canonical IDs
- do not add strict mode
- do not make warnings blocking

## Relationship To Existing Validators

The warning catalog is separate from current validation.

`validateComponent` remains responsible for schema correctness. Existing
schema errors should not be reclassified by this catalog. Future warning
producers should not live inside `validateComponent` unless a later migration
explicitly designs an opt-in warning collection API.

The component graph validator remains component-type-only. It should not host
child naming hygiene, canonical readiness, path readiness, runtime readiness,
or adapter readiness checks.

## Relationship To Runtime And Serialization

Warning producers must not inspect resolved styles, token resolver fallback
chains, `runtimePlan`, runtime emission, preview runtime consumption,
import/export payload transformations, adapter output, React output, DOM
structure, CSS selectors, or generated file paths.

Warnings must preserve authored names through import/export. They may point to
authored-data locations, but they must not normalize, rewrite, escape, trim,
deduplicate, or generate names.

## Future Activation Requirements

This checkpoint defines the exact first-phase child-name hygiene codes and the
implemented opt-in helper API. The implementation preserves these boundaries:

- warnings are emitted only when the helper is called explicitly
- the helper returns `DiagnosticEnvelope[]`
- legacy string diagnostics remain backward-compatible
- aggregate diagnostics receives already-created warning envelopes only from
  callers

Before any additional warning producer or deferred code is implemented, a later
checkpoint should define:

- the exact diagnostic codes
- the exact opt-in collection API, if different from the first helper
- whether warnings are emitted internally, surfaced to users, or both
- migration messaging for canonical/path readiness
- any aggregate reporting needs beyond pure coordination

Strict mode is out of scope. If it is ever considered, it must come after
warning-only diagnostics, migration reporting, migration tooling, and an
explicit opt-in compatibility policy.
