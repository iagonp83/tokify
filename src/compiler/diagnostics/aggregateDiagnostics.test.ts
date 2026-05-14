import { describe, expect, it } from "vitest";

import {
  aggregateDiagnostics,
  type DiagnosticAggregateGroup
} from "./aggregateDiagnostics";
import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
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
    name: "contract-only-producer"
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

describe("aggregate diagnostics", () => {
  it("returns an empty array for empty aggregation", () => {
    expect(aggregateDiagnostics([])).toEqual([]);
  });

  it("flattens plain and metadata-wrapped diagnostic groups", () => {
    const schemaDiagnostic = makeDiagnostic({
      code: "schema/unknown-slot",
      order: {
        bucket: 0,
        sequence: 1
      },
      path: createDiagnosticPath("composition", "slotRelations", 1, "slot")
    });
    const registryDiagnostic = makeDiagnostic({
      code: "registry/missing-component",
      layer: diagnosticLayers.registry,
      order: {
        bucket: 0,
        sequence: 2
      },
      path: createDiagnosticPath("components", 0, "type"),
      source: {
        name: "futureRegistryDiagnostics"
      }
    });
    const graphDiagnostic = makeDiagnostic({
      code: "graph/unknown-child-component",
      layer: diagnosticLayers.graph,
      order: {
        bucket: 0,
        sequence: 3
      },
      path: createDiagnosticPath("components", 0, "composition", "children", 0),
      source: {
        name: "futureGraphDiagnostics"
      }
    });
    const groups: readonly DiagnosticAggregateGroup[] = [
      [registryDiagnostic],
      {
        diagnostics: [graphDiagnostic, schemaDiagnostic],
        layer: diagnosticLayers.runtime,
        source: {
          name: "coordinator-metadata-only"
        }
      }
    ];

    expect(aggregateDiagnostics(groups)).toEqual([
      schemaDiagnostic,
      registryDiagnostic,
      graphDiagnostic
    ]);
  });

  it("applies deterministic diagnostic ordering", () => {
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
        name: "futureGraphDiagnostics"
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

    expect(
      aggregateDiagnostics([
        [laterSchemaDiagnostic, graphDiagnostic],
        [schemaDiagnostic, tiedOrderDiagnostic]
      ]).map((diagnostic) => diagnostic.code)
    ).toEqual([
      "schema/duplicate-slot",
      "schema/unknown-slot",
      "graph/unknown-child-component",
      "schema/later"
    ]);
  });

  it("does not mutate original input arrays or diagnostic objects", () => {
    const firstDiagnostic = makeDiagnostic({
      code: "schema/first",
      order: {
        bucket: 0,
        sequence: 0
      }
    });
    const secondDiagnostic = makeDiagnostic({
      code: "schema/second",
      order: {
        bucket: 0,
        sequence: 1
      },
      suggestions: [
        {
          message: "Update the authored slot metadata.",
          path: createDiagnosticPath("slots")
        }
      ]
    });
    const plainGroup = [secondDiagnostic, firstDiagnostic];
    const wrappedGroup = {
      diagnostics: [secondDiagnostic],
      layer: diagnosticLayers.schema,
      source: {
        name: "coordinator-metadata-only"
      }
    } satisfies DiagnosticAggregateGroup;
    const firstBeforeAggregation = {
      ...firstDiagnostic,
      order: { ...firstDiagnostic.order },
      path: [...firstDiagnostic.path],
      source: { ...firstDiagnostic.source }
    };
    const secondBeforeAggregation = {
      ...secondDiagnostic,
      order: { ...secondDiagnostic.order },
      path: [...secondDiagnostic.path],
      source: { ...secondDiagnostic.source },
      suggestions: secondDiagnostic.suggestions?.map((suggestion) => ({
        ...suggestion,
        ...(suggestion.path ? { path: [...suggestion.path] } : {})
      }))
    };

    const aggregated = aggregateDiagnostics([plainGroup, wrappedGroup]);

    expect(plainGroup).toEqual([secondDiagnostic, firstDiagnostic]);
    expect(wrappedGroup.diagnostics).toEqual([secondDiagnostic]);
    expect(firstDiagnostic).toEqual(firstBeforeAggregation);
    expect(secondDiagnostic).toEqual(secondBeforeAggregation);
    expect(aggregated[0]).toBe(firstDiagnostic);
    expect(aggregated[1]).toBe(secondDiagnostic);
    expect(aggregated[2]).toBe(secondDiagnostic);
  });

  it("preserves severity, code, path, source, and diagnostic metadata exactly", () => {
    const diagnostic = makeDiagnostic({
      code: "schema/authored-data-path",
      message: "Authored composition metadata is diagnostic-only.",
      path: createDiagnosticPath("composition", "children", 0, "component"),
      severity: diagnosticSeverities.warning,
      source: {
        name: "futureMetadataDiagnostics"
      }
    });

    expect(
      aggregateDiagnostics([
        {
          diagnostics: [diagnostic],
          layer: diagnosticLayers.graph,
          source: {
            name: "group-metadata-does-not-rewrite-diagnostics"
          }
        }
      ])
    ).toEqual([
      {
        code: "schema/authored-data-path",
        layer: "schema",
        message: "Authored composition metadata is diagnostic-only.",
        order: {
          bucket: 0,
          sequence: 0
        },
        path: ["composition", "children", 0, "component"],
        severity: "warning",
        source: {
          name: "futureMetadataDiagnostics"
        }
      }
    ]);
  });

  it("requires only diagnostic contract inputs, not validators or runtime identifiers", () => {
    const schemaDiagnostic = makeDiagnostic({
      code: "schema/metadata-only",
      path: createDiagnosticPath("composition", "children", 0, "type"),
      source: {
        name: "futureSchemaDiagnostics"
      }
    });
    const graphDiagnostic = makeDiagnostic({
      code: "graph/component-type-only",
      layer: diagnosticLayers.graph,
      path: createDiagnosticPath("components", 0, "type"),
      source: {
        name: "futureGraphDiagnostics"
      }
    });

    const aggregated = aggregateDiagnostics([[schemaDiagnostic], [graphDiagnostic]]);

    expect(aggregated).toEqual([schemaDiagnostic, graphDiagnostic]);
    expect(
      aggregated.flatMap((diagnostic) => diagnostic.path).map(String)
    ).not.toEqual(
      expect.arrayContaining(["canonicalId", "instanceId", "instancePath"])
    );
    aggregated.forEach((diagnostic) => {
      expect(diagnostic).not.toHaveProperty("runtimePlan");
      expect(diagnostic).not.toHaveProperty("resolver");
      expect(diagnostic).not.toHaveProperty("registry");
      expect(diagnostic).not.toHaveProperty("import");
      expect(diagnostic).not.toHaveProperty("export");
    });
  });
});
