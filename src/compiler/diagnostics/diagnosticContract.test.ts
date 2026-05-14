import { describe, expect, it } from "vitest";

import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  sortDiagnostics,
  type DiagnosticEnvelope,
  type DiagnosticEnvelopeInput
} from "./diagnosticContract";

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
    name: "validateComponent"
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

describe("diagnostic contract", () => {
  it("creates a structured diagnostic envelope without rewriting fields", () => {
    const diagnostic = createDiagnostic({
      ...baseDiagnosticInput,
      suggestions: [
        {
          message: "Add the missing slot or remove the relation.",
          path: createDiagnosticPath("slots")
        }
      ]
    });

    expect(diagnostic).toEqual({
      code: "schema/missing-slot",
      layer: "schema",
      message: "Slot metadata references a missing slot.",
      order: {
        bucket: 0,
        sequence: 0
      },
      path: ["composition", "slotRelations", 0, "slot"],
      severity: "error",
      source: {
        name: "validateComponent"
      },
      suggestions: [
        {
          message: "Add the missing slot or remove the relation.",
          path: ["slots"]
        }
      ]
    });
  });

  it("keeps severity, code, layer, source, and path as explicit contract fields", () => {
    const diagnostic = makeDiagnostic({
      code: "graph/unknown-child-component",
      layer: diagnosticLayers.graph,
      path: createDiagnosticPath("components", 1, "composition", "children", 0),
      severity: diagnosticSeverities.warning,
      source: {
        name: "validateComponentTypeGraph"
      }
    });

    expect(diagnostic.severity).toBe("warning");
    expect(diagnostic.code).toBe("graph/unknown-child-component");
    expect(diagnostic.layer).toBe("graph");
    expect(diagnostic.source).toEqual({
      name: "validateComponentTypeGraph"
    });
    expect(diagnostic.path).toEqual([
      "components",
      1,
      "composition",
      "children",
      0
    ]);
  });

  it("sorts diagnostics deterministically without mutating the input array", () => {
    const laterSchemaDiagnostic = makeDiagnostic({
      code: "schema/later",
      order: {
        bucket: 1,
        sequence: 1
      }
    });
    const graphDiagnostic = makeDiagnostic({
      code: "graph/unknown-child-component",
      layer: diagnosticLayers.graph,
      order: {
        bucket: 0,
        sequence: 2
      },
      path: createDiagnosticPath("components", 1),
      source: {
        name: "validateComponentTypeGraph"
      }
    });
    const schemaDiagnostic = makeDiagnostic({
      code: "schema/unknown-slot",
      order: {
        bucket: 0,
        sequence: 1
      },
      path: createDiagnosticPath("composition", "slotRelations", 1, "slot")
    });
    const tiedOrderDiagnostic = makeDiagnostic({
      code: "schema/duplicate-slot",
      order: {
        bucket: 0,
        sequence: 1
      },
      path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
    });
    const diagnostics = [
      laterSchemaDiagnostic,
      graphDiagnostic,
      schemaDiagnostic,
      tiedOrderDiagnostic
    ];

    expect(sortDiagnostics(diagnostics).map((diagnostic) => diagnostic.code)).toEqual([
      "schema/duplicate-slot",
      "schema/unknown-slot",
      "graph/unknown-child-component",
      "schema/later"
    ]);
    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "schema/later",
      "graph/unknown-child-component",
      "schema/unknown-slot",
      "schema/duplicate-slot"
    ]);
  });
});
