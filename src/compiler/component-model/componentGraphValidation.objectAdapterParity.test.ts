import { describe, expect, it } from "vitest";

import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  type DiagnosticEnvelope
} from "../diagnostics/diagnosticContract";
import type { ComponentName, ComponentSchema } from "./component.types";
import {
  createComponentRegistry,
  type ComponentRegistry
} from "./componentRegistry";
import {
  validateComponentTypeGraph,
  type ComponentTypeGraphDiagnostic
} from "./componentGraphValidation";

type TestChild = string | { component: string; name: string };

type GraphObjectAdapterParityCode =
  | "GRAPH_UNKNOWN_CHILD_COMPONENT"
  | "GRAPH_DIRECT_SELF_REFERENCE";

type UnknownChildDiagnostic = Extract<
  ComponentTypeGraphDiagnostic,
  { type: "unknown-child-component" }
>;

type DirectSelfReferenceDiagnostic = Extract<
  ComponentTypeGraphDiagnostic,
  { type: "direct-self-reference" }
>;

type GraphObjectAdapterParityDiagnostic =
  | UnknownChildDiagnostic
  | DirectSelfReferenceDiagnostic;

type UnknownChildComponentFixture = {
  readonly envelope: DiagnosticEnvelope<"GRAPH_UNKNOWN_CHILD_COMPONENT">;
  readonly kind: "unknown-child-component";
  readonly legacyFields: Omit<UnknownChildDiagnostic, "message" | "type">;
};

type DirectSelfReferenceFixture = {
  readonly envelope: DiagnosticEnvelope<"GRAPH_DIRECT_SELF_REFERENCE">;
  readonly kind: "direct-self-reference";
  readonly legacyFields: Omit<DirectSelfReferenceDiagnostic, "message" | "type">;
};

type GraphObjectAdapterParityFixture =
  | UnknownChildComponentFixture
  | DirectSelfReferenceFixture;

function createTestSchema(
  name: string,
  children: readonly TestChild[] = []
): ComponentSchema {
  const childMetadata = children.map((child, index) => {
    const childDefinition =
      typeof child === "string"
        ? {
            component: child,
            name: `child${index + 1}`
          }
        : child;

    return {
      component: childDefinition.component,
      name: childDefinition.name,
      slot: "root" as const
    };
  });

  return {
    editable: {
      fields: ["slots", "tokenBindings"],
      tokenOnly: true
    },
    name,
    slots: [
      {
        name: "root",
        required: true,
        role: "root"
      }
    ],
    states: [
      {
        name: "default"
      }
    ],
    tokenBindings: [],
    variants: [],
    version: "0.1.0",
    ...(childMetadata.length > 0
      ? {
          composition: {
            children: childMetadata
          }
        }
      : {})
  };
}

function collectGraphObjectAdapterParityFixtures(
  registry: ComponentRegistry
): GraphObjectAdapterParityFixture[] {
  const knownComponentNames = new Set(
    registry.entries.map((entry) => entry.authoredName)
  );
  const fixtures: GraphObjectAdapterParityFixture[] = [];

  registry.entries.forEach((entry, entryIndex) => {
    for (const [childIndex, child] of (
      entry.schema.composition?.children ?? []
    ).entries()) {
      const referencedComponent = child.component;

      if (!referencedComponent.trim()) {
        continue;
      }

      if (!knownComponentNames.has(referencedComponent)) {
        fixtures.push(
          createUnknownChildComponentFixture({
            childIndex,
            childName: child.name,
            componentName: entry.authoredName,
            entryIndex,
            referencedComponent,
            sequence: fixtures.length
          })
        );
        continue;
      }

      if (referencedComponent === entry.authoredName) {
        fixtures.push(
          createDirectSelfReferenceFixture({
            childIndex,
            childName: child.name,
            componentName: entry.authoredName,
            entryIndex,
            referencedComponent,
            sequence: fixtures.length
          })
        );
      }
    }
  });

  return fixtures;
}

function createUnknownChildComponentFixture({
  childIndex,
  childName,
  componentName,
  entryIndex,
  referencedComponent,
  sequence
}: {
  readonly childIndex: number;
  readonly childName: string;
  readonly componentName: ComponentName;
  readonly entryIndex: number;
  readonly referencedComponent: ComponentName;
  readonly sequence: number;
}): UnknownChildComponentFixture {
  return {
    envelope: createGraphDiagnosticEnvelope({
      childIndex,
      code: "GRAPH_UNKNOWN_CHILD_COMPONENT",
      entryIndex,
      message: `Component type "${componentName}" child "${childName}" references unknown component "${referencedComponent}".`,
      sequence
    }),
    kind: "unknown-child-component",
    legacyFields: {
      childName,
      componentName,
      referencedComponent
    }
  };
}

function createDirectSelfReferenceFixture({
  childIndex,
  childName,
  componentName,
  entryIndex,
  referencedComponent,
  sequence
}: {
  readonly childIndex: number;
  readonly childName: string;
  readonly componentName: ComponentName;
  readonly entryIndex: number;
  readonly referencedComponent: ComponentName;
  readonly sequence: number;
}): DirectSelfReferenceFixture {
  return {
    envelope: createGraphDiagnosticEnvelope({
      childIndex,
      code: "GRAPH_DIRECT_SELF_REFERENCE",
      entryIndex,
      message: `Component type "${componentName}" child "${childName}" cannot reference itself.`,
      sequence
    }),
    kind: "direct-self-reference",
    legacyFields: {
      childName,
      componentName,
      cyclePath: [componentName, componentName],
      referencedComponent
    }
  };
}

function createGraphDiagnosticEnvelope<Code extends GraphObjectAdapterParityCode>({
  childIndex,
  code,
  entryIndex,
  message,
  sequence
}: {
  readonly childIndex: number;
  readonly code: Code;
  readonly entryIndex: number;
  readonly message: string;
  readonly sequence: number;
}): DiagnosticEnvelope<Code> {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.graph,
    message,
    order: {
      bucket: 0,
      sequence
    },
    path: createDiagnosticPath(
      "entries",
      entryIndex,
      "schema",
      "composition",
      "children",
      childIndex,
      "component"
    ),
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponentTypeGraph"
    }
  });
}

function adaptGraphObjectAdapterParityFixtures(
  fixtures: readonly GraphObjectAdapterParityFixture[]
): GraphObjectAdapterParityDiagnostic[] {
  return fixtures.map(adaptGraphObjectAdapterParityFixture);
}

function adaptGraphObjectAdapterParityFixture(
  fixture: GraphObjectAdapterParityFixture
): GraphObjectAdapterParityDiagnostic {
  switch (fixture.kind) {
    case "unknown-child-component":
      return {
        childName: fixture.legacyFields.childName,
        componentName: fixture.legacyFields.componentName,
        message: fixture.envelope.message,
        referencedComponent: fixture.legacyFields.referencedComponent,
        type: "unknown-child-component"
      };

    case "direct-self-reference":
      return {
        childName: fixture.legacyFields.childName,
        componentName: fixture.legacyFields.componentName,
        cyclePath: fixture.legacyFields.cyclePath,
        message: fixture.envelope.message,
        referencedComponent: fixture.legacyFields.referencedComponent,
        type: "direct-self-reference"
      };
  }
}

function expectGraphEnvelopeMetadata(
  fixture: GraphObjectAdapterParityFixture,
  {
    childIndex,
    code,
    entryIndex,
    sequence
  }: {
    readonly childIndex: number;
    readonly code: GraphObjectAdapterParityCode;
    readonly entryIndex: number;
    readonly sequence: number;
  }
) {
  expect(fixture.envelope).toMatchObject({
    code,
    layer: diagnosticLayers.graph,
    order: {
      bucket: 0,
      sequence
    },
    path: [
      "entries",
      entryIndex,
      "schema",
      "composition",
      "children",
      childIndex,
      "component"
    ],
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponentTypeGraph"
    }
  });
  expect(fixture.envelope).not.toHaveProperty("suggestions");
}

describe("validateComponentTypeGraph planned legacy object adapter parity", () => {
  it("maps unknown child component envelopes to the current legacy object byte-for-byte", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        }
      ])
    ]);
    const fixtures = collectGraphObjectAdapterParityFixtures(registry);
    const adaptedDiagnostics = adaptGraphObjectAdapterParityFixtures(fixtures);
    const currentResult = validateComponentTypeGraph(registry);

    expect(fixtures).toHaveLength(1);
    expectGraphEnvelopeMetadata(fixtures[0], {
      childIndex: 0,
      code: "GRAPH_UNKNOWN_CHILD_COMPONENT",
      entryIndex: 0,
      sequence: 0
    });
    expect(adaptedDiagnostics).toEqual([
      {
        childName: "badge",
        componentName: "Button",
        message:
          'Component type "Button" child "badge" references unknown component "Badge".',
        referencedComponent: "Badge",
        type: "unknown-child-component"
      }
    ]);
    expect(adaptedDiagnostics).toStrictEqual(currentResult.diagnostics);
    expect(JSON.stringify(adaptedDiagnostics)).toBe(
      JSON.stringify(currentResult.diagnostics)
    );
  });

  it("maps direct self-reference envelopes to the current legacy object byte-for-byte", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Button",
          name: "self"
        }
      ])
    ]);
    const fixtures = collectGraphObjectAdapterParityFixtures(registry);
    const adaptedDiagnostics = adaptGraphObjectAdapterParityFixtures(fixtures);
    const currentResult = validateComponentTypeGraph(registry);

    expect(fixtures).toHaveLength(1);
    expectGraphEnvelopeMetadata(fixtures[0], {
      childIndex: 0,
      code: "GRAPH_DIRECT_SELF_REFERENCE",
      entryIndex: 0,
      sequence: 0
    });
    expect(adaptedDiagnostics).toEqual([
      {
        childName: "self",
        componentName: "Button",
        cyclePath: ["Button", "Button"],
        message: 'Component type "Button" child "self" cannot reference itself.',
        referencedComponent: "Button",
        type: "direct-self-reference"
      }
    ]);
    expect(adaptedDiagnostics[0]).toHaveProperty("cyclePath", [
      "Button",
      "Button"
    ]);
    expect(adaptedDiagnostics).toStrictEqual(currentResult.diagnostics);
    expect(JSON.stringify(adaptedDiagnostics)).toBe(
      JSON.stringify(currentResult.diagnostics)
    );
  });

  it("preserves mixed unknown and direct self-reference order by registry entry and authored child order", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        },
        {
          component: "Button",
          name: "self"
        }
      ]),
      createTestSchema("Input", [
        {
          component: "Input",
          name: "inputSelf"
        },
        {
          component: "Tooltip",
          name: "tooltip"
        }
      ])
    ]);
    const fixtures = collectGraphObjectAdapterParityFixtures(registry);
    const adaptedDiagnostics = adaptGraphObjectAdapterParityFixtures(fixtures);
    const currentResult = validateComponentTypeGraph(registry);

    expect(
      fixtures.map((fixture) => ({
        code: fixture.envelope.code,
        path: fixture.envelope.path,
        sequence: fixture.envelope.order.sequence
      }))
    ).toEqual([
      {
        code: "GRAPH_UNKNOWN_CHILD_COMPONENT",
        path: [
          "entries",
          0,
          "schema",
          "composition",
          "children",
          0,
          "component"
        ],
        sequence: 0
      },
      {
        code: "GRAPH_DIRECT_SELF_REFERENCE",
        path: [
          "entries",
          0,
          "schema",
          "composition",
          "children",
          1,
          "component"
        ],
        sequence: 1
      },
      {
        code: "GRAPH_DIRECT_SELF_REFERENCE",
        path: [
          "entries",
          1,
          "schema",
          "composition",
          "children",
          0,
          "component"
        ],
        sequence: 2
      },
      {
        code: "GRAPH_UNKNOWN_CHILD_COMPONENT",
        path: [
          "entries",
          1,
          "schema",
          "composition",
          "children",
          1,
          "component"
        ],
        sequence: 3
      }
    ]);
    expect(adaptedDiagnostics).toEqual([
      {
        childName: "badge",
        componentName: "Button",
        message:
          'Component type "Button" child "badge" references unknown component "Badge".',
        referencedComponent: "Badge",
        type: "unknown-child-component"
      },
      {
        childName: "self",
        componentName: "Button",
        cyclePath: ["Button", "Button"],
        message: 'Component type "Button" child "self" cannot reference itself.',
        referencedComponent: "Button",
        type: "direct-self-reference"
      },
      {
        childName: "inputSelf",
        componentName: "Input",
        cyclePath: ["Input", "Input"],
        message:
          'Component type "Input" child "inputSelf" cannot reference itself.',
        referencedComponent: "Input",
        type: "direct-self-reference"
      },
      {
        childName: "tooltip",
        componentName: "Input",
        message:
          'Component type "Input" child "tooltip" references unknown component "Tooltip".',
        referencedComponent: "Tooltip",
        type: "unknown-child-component"
      }
    ]);
    expect(adaptedDiagnostics).toStrictEqual(currentResult.diagnostics);
    expect(JSON.stringify(adaptedDiagnostics)).toBe(
      JSON.stringify(currentResult.diagnostics)
    );
  });

  it("keeps blank and whitespace-only component references outside graph object adapter parity", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "",
          name: "empty"
        },
        {
          component: "   ",
          name: "blank"
        },
        {
          component: "\t\n",
          name: "whitespace"
        },
        {
          component: "Badge",
          name: "badge"
        }
      ])
    ]);
    const fixtures = collectGraphObjectAdapterParityFixtures(registry);
    const adaptedDiagnostics = adaptGraphObjectAdapterParityFixtures(fixtures);
    const currentResult = validateComponentTypeGraph(registry);

    expect(fixtures.map((fixture) => fixture.envelope.path)).toEqual([
      [
        "entries",
        0,
        "schema",
        "composition",
        "children",
        3,
        "component"
      ]
    ]);
    expect(adaptedDiagnostics.map((diagnostic) => diagnostic.childName)).toEqual(
      ["badge"]
    );
    expect(adaptedDiagnostics).toStrictEqual(currentResult.diagnostics);
    expect(currentResult.diagnostics).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ childName: "empty" }),
        expect.objectContaining({ childName: "blank" }),
        expect.objectContaining({ childName: "whitespace" })
      ])
    );
  });

  it("keeps unknown and direct self-reference diagnostics excluded from indirect cycle traversal", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Input ",
          name: "unknownInput"
        },
        {
          component: "Button",
          name: "self"
        }
      ]),
      createTestSchema("Input", [
        {
          component: "Button",
          name: "button"
        }
      ])
    ]);
    const fixtures = collectGraphObjectAdapterParityFixtures(registry);
    const adaptedDiagnostics = adaptGraphObjectAdapterParityFixtures(fixtures);
    const currentResult = validateComponentTypeGraph(registry);

    expect(adaptedDiagnostics).toStrictEqual([
      {
        childName: "unknownInput",
        componentName: "Button",
        message:
          'Component type "Button" child "unknownInput" references unknown component "Input ".',
        referencedComponent: "Input ",
        type: "unknown-child-component"
      },
      {
        childName: "self",
        componentName: "Button",
        cyclePath: ["Button", "Button"],
        message: 'Component type "Button" child "self" cannot reference itself.',
        referencedComponent: "Button",
        type: "direct-self-reference"
      }
    ]);
    expect(currentResult).toEqual({
      diagnostics: adaptedDiagnostics,
      valid: false
    });
    expect(currentResult.diagnostics).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "component-type-cycle" })
      ])
    );
  });

  it("keeps the current public graph result shape as diagnostics plus valid", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        },
        {
          component: "Button",
          name: "self"
        }
      ])
    ]);
    const result = validateComponentTypeGraph(registry);

    expect(Array.isArray(result)).toBe(false);
    expect(Object.keys(result).sort()).toEqual(["diagnostics", "valid"]);
    expect(result).not.toHaveProperty("errors");
    expect(Array.isArray(result.diagnostics)).toBe(true);
    expect(typeof result.valid).toBe("boolean");
    expect(result.diagnostics).toStrictEqual(
      adaptGraphObjectAdapterParityFixtures(
        collectGraphObjectAdapterParityFixtures(registry)
      )
    );
  });
});
