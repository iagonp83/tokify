import { describe, expect, it } from "vitest";

import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  type DiagnosticEnvelope,
  type DiagnosticEnvelopeInput
} from "./diagnosticContract";
import {
  formatDiagnosticAsLegacyString,
  formatDiagnosticsAsLegacyStrings
} from "./legacyDiagnosticFormatter";

const baseDiagnosticInput = {
  code: "schema/missing-slot",
  layer: diagnosticLayers.schema,
  message: "Slot metadata references a missing slot.",
  order: {
    bucket: 0,
    sequence: 0
  },
  path: createDiagnosticPath("composition", "slotRelations", 0, "slot"),
  severity: diagnosticSeverities.error,
  source: {
    name: "legacyDiagnosticFormatterTest"
  }
} satisfies DiagnosticEnvelopeInput;

function makeDiagnostic(
  overrides: Partial<DiagnosticEnvelopeInput> = {}
): DiagnosticEnvelope {
  return createDiagnostic({
    ...baseDiagnosticInput,
    ...overrides,
    order: overrides.order ?? baseDiagnosticInput.order,
    path: overrides.path ?? baseDiagnosticInput.path,
    source: overrides.source ?? baseDiagnosticInput.source
  });
}

describe("legacy diagnostic formatter", () => {
  it("formats a single diagnostic to exactly its message", () => {
    const diagnostic = makeDiagnostic({
      message: "Only the diagnostic message is emitted."
    });

    expect(formatDiagnosticAsLegacyString(diagnostic)).toBe(
      "Only the diagnostic message is emitted."
    );
  });

  it("ignores diagnostic metadata when formatting legacy strings", () => {
    const diagnostic = makeDiagnostic({
      code: "graph/unknown-child-component",
      layer: diagnosticLayers.graph,
      message: "Child component metadata references an unknown component.",
      order: {
        bucket: 99,
        sequence: 42
      },
      path: createDiagnosticPath("components", 1, "composition", "children", 0),
      severity: diagnosticSeverities.warning,
      source: {
        name: "validateComponentTypeGraph"
      },
      suggestions: [
        {
          message: "Register the child component before validating the graph.",
          path: createDiagnosticPath("components")
        }
      ]
    });

    expect(formatDiagnosticAsLegacyString(diagnostic)).toBe(
      "Child component metadata references an unknown component."
    );
  });

  it("formats diagnostic lists in input order without sorting", () => {
    const latestByOrder = makeDiagnostic({
      code: "schema/latest",
      message: "Latest diagnostic by contract order.",
      order: {
        bucket: 2,
        sequence: 0
      }
    });
    const earliestByOrder = makeDiagnostic({
      code: "schema/earliest",
      message: "Earliest diagnostic by contract order.",
      order: {
        bucket: 0,
        sequence: 0
      }
    });
    const middleByOrder = makeDiagnostic({
      code: "schema/middle",
      message: "Middle diagnostic by contract order.",
      order: {
        bucket: 1,
        sequence: 0
      }
    });

    expect(
      formatDiagnosticsAsLegacyStrings([
        latestByOrder,
        earliestByOrder,
        middleByOrder
      ])
    ).toEqual([
      "Latest diagnostic by contract order.",
      "Earliest diagnostic by contract order.",
      "Middle diagnostic by contract order."
    ]);
  });

  it("formats an empty diagnostic list to an empty array", () => {
    expect(formatDiagnosticsAsLegacyStrings([])).toEqual([]);
  });

  it("does not mutate input diagnostics or reuse the input array", () => {
    const firstDiagnostic = makeDiagnostic({
      code: "schema/first",
      message: "First diagnostic."
    });
    const secondDiagnostic = makeDiagnostic({
      code: "schema/second",
      message: "Second diagnostic.",
      suggestions: [
        {
          message: "Keep the diagnostic metadata intact.",
          path: createDiagnosticPath("composition")
        }
      ]
    });
    const diagnostics = [secondDiagnostic, firstDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const firstDiagnosticBeforeFormat = {
      ...firstDiagnostic,
      order: { ...firstDiagnostic.order },
      path: [...firstDiagnostic.path],
      source: { ...firstDiagnostic.source }
    };
    const secondDiagnosticBeforeFormat = {
      ...secondDiagnostic,
      order: { ...secondDiagnostic.order },
      path: [...secondDiagnostic.path],
      source: { ...secondDiagnostic.source },
      suggestions: secondDiagnostic.suggestions?.map((suggestion) => ({
        ...suggestion,
        ...(suggestion.path ? { path: [...suggestion.path] } : {})
      }))
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual(["Second diagnostic.", "First diagnostic."]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(firstDiagnostic).toEqual(firstDiagnosticBeforeFormat);
    expect(secondDiagnostic).toEqual(secondDiagnosticBeforeFormat);
  });
});
