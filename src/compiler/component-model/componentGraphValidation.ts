import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  type DiagnosticEnvelope
} from "../diagnostics/diagnosticContract";
import type { ComponentName } from "./component.types";
import type {
  ComponentRegistry,
  ComponentRegistryEntry
} from "./componentRegistry";

export type ComponentTypeGraphDiagnostic =
  | {
      childName: string;
      componentName: ComponentName;
      message: string;
      referencedComponent: ComponentName;
      type: "unknown-child-component";
    }
  | {
      childName: string;
      componentName: ComponentName;
      cyclePath: readonly ComponentName[];
      message: string;
      referencedComponent: ComponentName;
      type: "direct-self-reference";
    }
  | {
      cyclePath: readonly ComponentName[];
      message: string;
      type: "component-type-cycle";
    };

export type ComponentTypeGraphValidationResult = {
  diagnostics: readonly ComponentTypeGraphDiagnostic[];
  valid: boolean;
};

type ComponentTypeDependencyGraph = ReadonlyMap<
  ComponentName,
  readonly ComponentName[]
>;

type GraphChildReferenceDiagnosticCode =
  | "GRAPH_UNKNOWN_CHILD_COMPONENT"
  | "GRAPH_DIRECT_SELF_REFERENCE";

type GraphChildReferenceDiagnosticInput = {
  readonly childIndex: number;
  readonly childName: string;
  readonly componentName: ComponentName;
  readonly entryIndex: number;
  readonly referencedComponent: ComponentName;
  readonly sequence: number;
};

export function validateComponentTypeGraph(
  registry: ComponentRegistry
): ComponentTypeGraphValidationResult {
  const knownComponentNames = new Set(
    registry.entries.map((entry) => entry.authoredName)
  );
  const diagnostics: ComponentTypeGraphDiagnostic[] = [];
  const graph = buildComponentTypeDependencyGraph(
    registry.entries,
    knownComponentNames,
    diagnostics
  );

  diagnostics.push(...findIndirectCycleDiagnostics(registry.entries, graph));

  return {
    diagnostics,
    valid: diagnostics.length === 0
  };
}

function buildComponentTypeDependencyGraph(
  entries: readonly ComponentRegistryEntry[],
  knownComponentNames: ReadonlySet<ComponentName>,
  diagnostics: ComponentTypeGraphDiagnostic[]
): ComponentTypeDependencyGraph {
  const graph = new Map<ComponentName, ComponentName[]>();
  let childReferenceDiagnosticSequence = 0;

  entries.forEach((entry, entryIndex) => {
    const dependencies = graph.get(entry.authoredName) ?? [];

    for (const [childIndex, child] of (
      entry.schema.composition?.children ?? []
    ).entries()) {
      const referencedComponent = child.component;

      if (!referencedComponent.trim()) {
        continue;
      }

      if (!knownComponentNames.has(referencedComponent)) {
        diagnostics.push(
          createUnknownChildComponentDiagnostic({
            childIndex,
            childName: child.name,
            componentName: entry.authoredName,
            entryIndex,
            referencedComponent,
            sequence: childReferenceDiagnosticSequence
          })
        );
        childReferenceDiagnosticSequence += 1;
        continue;
      }

      if (referencedComponent === entry.authoredName) {
        diagnostics.push(
          createDirectSelfReferenceDiagnostic({
            childIndex,
            childName: child.name,
            componentName: entry.authoredName,
            entryIndex,
            referencedComponent,
            sequence: childReferenceDiagnosticSequence
          })
        );
        childReferenceDiagnosticSequence += 1;
        continue;
      }

      if (!dependencies.includes(referencedComponent)) {
        dependencies.push(referencedComponent);
      }
    }

    graph.set(entry.authoredName, dependencies);
  });

  return graph;
}

function createUnknownChildComponentDiagnostic(
  input: GraphChildReferenceDiagnosticInput
): ComponentTypeGraphDiagnostic {
  const envelope = createGraphChildReferenceDiagnosticEnvelope({
    childIndex: input.childIndex,
    code: "GRAPH_UNKNOWN_CHILD_COMPONENT",
    entryIndex: input.entryIndex,
    message: `Component type "${input.componentName}" child "${input.childName}" references unknown component "${input.referencedComponent}".`,
    sequence: input.sequence
  });

  return adaptUnknownChildComponentDiagnostic(envelope, input);
}

function createDirectSelfReferenceDiagnostic(
  input: GraphChildReferenceDiagnosticInput
): ComponentTypeGraphDiagnostic {
  const envelope = createGraphChildReferenceDiagnosticEnvelope({
    childIndex: input.childIndex,
    code: "GRAPH_DIRECT_SELF_REFERENCE",
    entryIndex: input.entryIndex,
    message: `Component type "${input.componentName}" child "${input.childName}" cannot reference itself.`,
    sequence: input.sequence
  });

  return adaptDirectSelfReferenceDiagnostic(envelope, input);
}

function createGraphChildReferenceDiagnosticEnvelope<
  Code extends GraphChildReferenceDiagnosticCode
>({
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

function adaptUnknownChildComponentDiagnostic(
  envelope: DiagnosticEnvelope<"GRAPH_UNKNOWN_CHILD_COMPONENT">,
  input: GraphChildReferenceDiagnosticInput
): ComponentTypeGraphDiagnostic {
  return {
    childName: input.childName,
    componentName: input.componentName,
    message: envelope.message,
    referencedComponent: input.referencedComponent,
    type: "unknown-child-component"
  };
}

function adaptDirectSelfReferenceDiagnostic(
  envelope: DiagnosticEnvelope<"GRAPH_DIRECT_SELF_REFERENCE">,
  input: GraphChildReferenceDiagnosticInput
): ComponentTypeGraphDiagnostic {
  return {
    childName: input.childName,
    componentName: input.componentName,
    cyclePath: [input.componentName, input.componentName],
    message: envelope.message,
    referencedComponent: input.referencedComponent,
    type: "direct-self-reference"
  };
}

function findIndirectCycleDiagnostics(
  entries: readonly ComponentRegistryEntry[],
  graph: ComponentTypeDependencyGraph
): ComponentTypeGraphDiagnostic[] {
  const diagnostics: ComponentTypeGraphDiagnostic[] = [];
  const reportedCycles = new Set<string>();

  const visit = (componentName: ComponentName, path: readonly ComponentName[]) => {
    const cycleStartIndex = path.indexOf(componentName);

    if (cycleStartIndex >= 0) {
      const cyclePath = [...path.slice(cycleStartIndex), componentName];
      const cycleKey = createCycleKey(cyclePath);

      if (!reportedCycles.has(cycleKey)) {
        reportedCycles.add(cycleKey);
        diagnostics.push({
          cyclePath,
          message: `Component type dependency graph contains a cycle: ${cyclePath.join(
            " -> "
          )}.`,
          type: "component-type-cycle"
        });
      }

      return;
    }

    for (const dependency of graph.get(componentName) ?? []) {
      visit(dependency, [...path, componentName]);
    }
  };

  entries.forEach((entry) => {
    visit(entry.authoredName, []);
  });

  return diagnostics;
}

function createCycleKey(cyclePath: readonly ComponentName[]) {
  const nodes = cyclePath.slice(0, -1);
  const rotations = nodes.map((_, index) => [
    ...nodes.slice(index),
    ...nodes.slice(0, index)
  ]);

  return rotations
    .map((rotation) => rotation.join("\u0000"))
    .sort()[0];
}
