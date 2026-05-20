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

  it("returns the legacy graph validation object shape instead of string diagnostics", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        }
      ])
    ]);

    const result = validateComponentTypeGraph(registry);

    expect(Array.isArray(result)).toBe(false);
    expect(Object.keys(result).sort()).toEqual(["diagnostics", "valid"]);
    expect(result).not.toHaveProperty("errors");
    expect(Array.isArray(result.diagnostics)).toBe(true);
    expect(typeof result.valid).toBe("boolean");
    expect(result.diagnostics).toEqual([
      {
        childName: "badge",
        componentName: "Button",
        message:
          'Component type "Button" child "badge" references unknown component "Badge".',
        referencedComponent: "Badge",
        type: "unknown-child-component"
      }
    ]);
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

  it("reports multiple unknown child component references in traversal order", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        },
        {
          component: "Tooltip",
          name: "tooltip"
        }
      ]),
      createTestSchema("Input", [
        {
          component: "Menu",
          name: "menu"
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
        },
        {
          childName: "tooltip",
          componentName: "Button",
          message:
            'Component type "Button" child "tooltip" references unknown component "Tooltip".',
          referencedComponent: "Tooltip",
          type: "unknown-child-component"
        },
        {
          childName: "menu",
          componentName: "Input",
          message:
            'Component type "Input" child "menu" references unknown component "Menu".',
          referencedComponent: "Menu",
          type: "unknown-child-component"
        }
      ],
      valid: false
    });
  });

  it("skips blank and whitespace-only child component references", () => {
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
        }
      ])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [],
      valid: true
    });
  });

  it("treats component references as exact authored names and skips unknown references from the cycle graph", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Input ",
          name: "input"
        }
      ]),
      createTestSchema("Input", ["Button"])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          childName: "input",
          componentName: "Button",
          message:
            'Component type "Button" child "input" references unknown component "Input ".',
          referencedComponent: "Input ",
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

  it("reports direct self-reference while skipping it from indirect cycle detection", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Button",
          name: "self"
        },
        {
          component: "Input",
          name: "input"
        }
      ]),
      createTestSchema("Input", ["Button"])
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
        },
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

  it("reports direct self-reference before later sibling diagnostics", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Button",
          name: "self"
        },
        {
          component: "Badge",
          name: "badge"
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
        },
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

  it("keeps authored-name graph keys case-sensitive", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "button",
          name: "lowercase"
        }
      ]),
      createTestSchema("button", [
        {
          component: "Button",
          name: "uppercase"
        }
      ])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          cyclePath: ["Button", "button", "Button"],
          message:
            "Component type dependency graph contains a cycle: Button -> button -> Button.",
          type: "component-type-cycle"
        }
      ],
      valid: false
    });
  });

  it("suppresses duplicate dependency edges when reporting cycles", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Input",
          name: "primaryInput"
        },
        {
          component: "Input",
          name: "secondaryInput"
        }
      ]),
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

  it("reports multiple independent component-type cycles in discovery order", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", ["Input"]),
      createTestSchema("Input", ["Button"]),
      createTestSchema("Menu", ["Tooltip"]),
      createTestSchema("Tooltip", ["Menu"])
    ]);

    expect(validateComponentTypeGraph(registry)).toEqual({
      diagnostics: [
        {
          cyclePath: ["Button", "Input", "Button"],
          message:
            "Component type dependency graph contains a cycle: Button -> Input -> Button.",
          type: "component-type-cycle"
        },
        {
          cyclePath: ["Menu", "Tooltip", "Menu"],
          message:
            "Component type dependency graph contains a cycle: Menu -> Tooltip -> Menu.",
          type: "component-type-cycle"
        }
      ],
      valid: false
    });
  });

  it("reports unknown references before indirect cycles with stable cycle paths", () => {
    const registry = createComponentRegistry([
      createTestSchema("Button", [
        {
          component: "Badge",
          name: "badge"
        }
      ]),
      createTestSchema("Input", ["Icon"]),
      createTestSchema("Icon", ["Input"])
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
        },
        {
          cyclePath: ["Input", "Icon", "Input"],
          message:
            "Component type dependency graph contains a cycle: Input -> Icon -> Input.",
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
