import {
  sortDiagnostics,
  type DiagnosticEnvelope,
  type DiagnosticLayer,
  type DiagnosticSource
} from "./diagnosticContract";

export type DiagnosticAggregateGroup<
  Diagnostic extends DiagnosticEnvelope = DiagnosticEnvelope
> =
  | readonly Diagnostic[]
  | {
      readonly diagnostics: readonly Diagnostic[];
      readonly layer?: DiagnosticLayer;
      readonly source?: DiagnosticSource;
    };

export function aggregateDiagnostics<
  Diagnostic extends DiagnosticEnvelope = DiagnosticEnvelope
>(
  groups: readonly DiagnosticAggregateGroup<Diagnostic>[]
): Diagnostic[] {
  return sortDiagnostics(
    groups.flatMap((group) =>
      "diagnostics" in group ? group.diagnostics : group
    )
  );
}
