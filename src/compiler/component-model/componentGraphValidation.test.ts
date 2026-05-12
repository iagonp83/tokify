import { describe, expect, it } from "vitest";
import type { ComponentSchema } from "./component.types";
import {
  createComponentRegistry,
  validateComponentRegistry
} from "./componentRegistry";
import { validateComponentTypeGraph } from "./componentGraphValidation";
import { validateComponent } from "./validateComponent";

type TestChild = string | { component: string; name: string };

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

describe("validateComponentTypeGraph", () => {
  it("passes components with no children", () => {
    const registry = createComponentRegistry([createTestSchema("Button")]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [],
      valid: true
    });
  });

  it("passes acyclic component-type graphs", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", ["Input"]),
      createTestSchema("Input", ["Icon"]),
      createTestSchema("Icon")
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [],
      valid: true
    });
  });

  it("reports unknown child component references with stable diagnostics", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        }
      ])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          childName: "badge",
          componentName: "Button",
          message:
            'Component type "Button" child "badge" references unknown component "Badge".',
          referencedComponent: "Badge",
          type: "unknown-child-component"
        }
      ],
      valid: false
    });
  });

  it("reports direct self-reference with stable diagnostics", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Button",
          name: "self"
        }
      ])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          childName: "self",
          componentName: "Button",
          cyclePath: ["Button", "Button"],
          message: 'Component type "Button" child "self" cannot reference itself.',
          referencedComponent: "Button",
          type: "direct-self-reference"
        }
      ],
      valid: false
    });
  });

  it("reports simple indirect component-type cycles with the cycle path", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", ["Input"]),
      createTestSchema("Input", ["Button"])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          cyclePath: ["Button", "Input", "Button"],
          message:
            "Component type dependency graph contains a cycle: Button -> Input -> Button.",
          type: "component-type-cycle"
        }
      ],
      valid: false
    });
  });

  it("reports longer indirect component-type cycles with the cycle path", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", ["Input"]),
      createTestSchema("Input", ["Icon"]),
      createTestSchema("Icon", ["Button"])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          cyclePath: ["Button", "Input", "Icon", "Button"],
          message:
            "Component type dependency graph contains a cycle: Button -> Input -> Icon -> Button.",
          type: "component-type-cycle"
        }
      ],
      valid: false
    });
  });

  it("keeps duplicate authored-name validation registry-local", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button"),
      createTestSchema("Button")
    ]);

    expect(validateComponentRegistry(registry)).toEqual({
      errors: ['Component registry authored name "Button" is duplicated.'],
      valid: false
    });
    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [],
      valid: true
    });
  });

  it("keeps validateComponent behavior backward-compatible", () => {
    const schema = createTestSchema("Button", [
      {
        component: "Badge",
        name: "badge"
      }
    ]);
    const cyclicRegistry = createComponentRegistry([
      createTestSchema("Button", ["Input"]),
      createTestSchema("Input", ["Button"])
    ]);

    expect(validateComponent(schema)).toEqual({
      errors: [],
      valid: true
    });
    expect(
      validateComponent(createTestSchema("Button", ["Input"]), {
        registry: cyclicRegistry
      })
    ).toEqual({
      errors: [],
      valid: true
    });
  });
});
