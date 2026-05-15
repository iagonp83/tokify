import type { DiagnosticEnvelope } from "./diagnosticContract";

export function formatDiagnosticAsLegacyString(
  diagnostic: DiagnosticEnvelope
): string {
  return diagnostic.message;
}

export function formatDiagnosticsAsLegacyStrings(
  diagnostics: readonly DiagnosticEnvelope[]
): string[] {
  return diagnostics.map(formatDiagnosticAsLegacyString);
}
