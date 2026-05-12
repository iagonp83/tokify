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

  entries.forEach((entry) => {
    const dependencies = graph.get(entry.authoredName) ?? [];

    for (const child of entry.schema.composition?.children ?? []) {
      const referencedComponent = child.component;

      if (!referencedComponent.trim()) {
        continue;
      }

      if (!knownComponentNames.has(referencedComponent)) {
        diagnostics.push({
          childName: child.name,
          componentName: entry.authoredName,
          message: `Component type "${entry.authoredName}" child "${child.name}" references unknown component "${referencedComponent}".`,
          referencedComponent,
          type: "unknown-child-component"
        });
        continue;
      }

      if (referencedComponent === entry.authoredName) {
        diagnostics.push({
          childName: child.name,
          componentName: entry.authoredName,
          cyclePath: [entry.authoredName, referencedComponent],
          message: `Component type "${entry.authoredName}" child "${child.name}" cannot reference itself.`,
          referencedComponent,
          type: "direct-self-reference"
        });
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
