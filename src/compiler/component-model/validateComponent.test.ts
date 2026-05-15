import { describe, expect, it } from "vitest";
import { buttonSchema } from "./button.schema";
import type { ComponentSchema } from "./component.types";
import { createComponentRegistry } from "./componentRegistry";
import { inputSchema } from "./input.schema";
import { validateComponent } from "./validateComponent";

const baseSchema = {
  editable: {
    fields: ["slots", "tokenBindings"],
    tokenOnly: true
  },
  name: "ComposedComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    },
    {
      name: "content",
      required: true,
      role: "content"
    },
    {
      name: "icon",
      required: false,
      role: "icon"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "semantic.color.accent"
    }
  ],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

describe("validateComponent composition metadata", () => {
  it("keeps composition metadata optional for existing schemas", () => {
    expect(validateComponent(buttonSchema)).toEqual({
      errors: [],
      valid: true
    });
    expect(validateComponent(inputSchema)).toEqual({
      errors: [],
      valid: true
    });
  });

  it("accepts Button slot relation metadata", () => {
    expect(buttonSchema.composition?.slotRelations).toEqual([
      {
        parentSlot: "root",
        slot: "label"
      },
      {
        parentSlot: "root",
        slot: "icon"
      }
    ]);
    expect(validateComponent(buttonSchema)).toEqual({
      errors: [],
      valid: true
    });
  });

  it("accepts composition metadata that references existing flat slots", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Icon",
            name: "leadingIcon",
            slot: "icon"
          }
        ],
        parts: [
          {
            name: "body",
            slot: "content"
          }
        ],
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "icon"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [],
      valid: true
    });
  });

  it("accepts valid acyclic slot relation graphs", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "icon"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [],
      valid: true
    });
  });

  it("preserves Button and Input schema compatibility", () => {
    expect(validateComponent(buttonSchema)).toEqual({
      errors: [],
      valid: true
    });
    expect(validateComponent(inputSchema)).toEqual({
      errors: [],
      valid: true
    });
  });

  it("reports multiple schema and token binding errors in stable order", () => {
    const result = validateComponent({
      ...baseSchema,
      name: " ",
      slots: [
        {
          name: "content",
          required: true,
          role: "content"
        }
      ],
      states: [{ name: "hover" }],
      tokenBindings: [
        {
          conditions: {
            tone: "primary",
            size: "xl",
            emphasis: "strong"
          },
          slot: "missingSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
      variants: [
        {
          default: "primary",
          name: "tone",
          options: []
        },
        {
          default: "lg",
          name: "size",
          options: ["sm", "md"]
        }
      ]
    });

    expect(result).toEqual({
      errors: [
        "Component name is required.",
        'Component requires a "root" slot.',
        'Component requires a "default" state.',
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.',
        'Token binding "background" references unknown slot "missingSlot".',
        'Token binding "background" references unknown tone option "primary".',
        'Token binding "background" references unknown size option "xl".',
        'Token binding "background" references unknown variant axis "emphasis".'
      ],
      valid: false
    });
  });

  it("reports empty variant options with unchanged legacy string output", () => {
    const result = validateComponent({
      ...baseSchema,
      variants: [
        {
          default: "primary",
          name: "tone",
          options: []
        }
      ]
    });

    expect(result).toEqual({
      errors: ['Variant axis "tone" requires at least one option.'],
      valid: false
    });
  });

  it("reports invalid variant defaults with unchanged legacy string output", () => {
    const result = validateComponent({
      ...baseSchema,
      variants: [
        {
          default: "lg",
          name: "size",
          options: ["sm", "md"]
        }
      ]
    });

    expect(result).toEqual({
      errors: [
        'Variant axis "size" default "lg" must be one of its options.'
      ],
      valid: false
    });
  });

  it("preserves ordered legacy output for combined invalid variant axes", () => {
    const result = validateComponent({
      ...baseSchema,
      variants: [
        {
          default: "primary",
          name: "tone",
          options: []
        },
        {
          default: "lg",
          name: "size",
          options: ["sm", "md"]
        }
      ]
    });

    expect(result).toEqual({
      errors: [
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.'
      ],
      valid: false
    });
  });

  it("keeps empty variant options short-circuit behavior unchanged", () => {
    const result = validateComponent({
      ...baseSchema,
      variants: [
        {
          default: "primary",
          name: "tone",
          options: []
        }
      ]
    });

    expect(result).toEqual({
      errors: ['Variant axis "tone" requires at least one option.'],
      valid: false
    });
  });

  it("accepts valid variant axes without diagnostics", () => {
    const result = validateComponent({
      ...baseSchema,
      variants: [
        {
          default: "primary",
          name: "tone",
          options: ["primary", "secondary"]
        },
        {
          default: "md",
          name: "size",
          options: ["sm", "md", "lg"]
        }
      ]
    });

    expect(result).toEqual({
      errors: [],
      valid: true
    });
  });

  it("continues returning public legacy string arrays", () => {
    const result = validateComponent({
      ...baseSchema,
      variants: [
        {
          default: "primary",
          name: "tone",
          options: []
        }
      ]
    });

    expect(result).toEqual({
      errors: ['Variant axis "tone" requires at least one option.'],
      valid: false
    });
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(result).not.toHaveProperty("diagnostics");
  });

  it("accepts known child component references when registry validation is enabled", () => {
    const registry = createComponentRegistry([baseSchema, inputSchema]);
    const result = validateComponent(
      {
        ...baseSchema,
        composition: {
          children: [
            {
              component: "Input",
              name: "field",
              slot: "content"
            }
          ]
        }
      },
      { registry }
    );

    expect(result).toEqual({
      errors: [],
      valid: true
    });
  });

  it("rejects unknown child component references when registry validation is enabled", () => {
    const registry = createComponentRegistry([baseSchema, inputSchema]);
    const result = validateComponent(
      {
        ...baseSchema,
        composition: {
          children: [
            {
              component: "Badge",
              name: "badge",
              slot: "content"
            }
          ]
        }
      },
      { registry }
    );

    expect(result).toEqual({
      errors: [
        'Composition child "badge" references unknown component "Badge".'
      ],
      valid: false
    });
  });

  it("rejects direct child component self-reference when registry validation is enabled", () => {
    const registry = createComponentRegistry([baseSchema, inputSchema]);
    const result = validateComponent(
      {
        ...baseSchema,
        composition: {
          children: [
            {
              component: "ComposedComponent",
              name: "self",
              slot: "content"
            }
          ]
        }
      },
      { registry }
    );

    expect(result).toEqual({
      errors: [
        'Composition child "self" cannot reference parent component "ComposedComponent".'
      ],
      valid: false
    });
  });

  it("keeps child component reference validation disabled without registry input", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Badge",
            name: "badge",
            slot: "content"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [],
      valid: true
    });
  });

  it("rejects composition metadata that references unknown slots", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Badge",
            name: "badge",
            slot: "badgeSlot"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "label"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "missingSlot"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        'Composition slot relation references unknown parent slot "missingParent".',
        'Composition slot relation references unknown slot "missingSlot".',
        'Composition part "label" references unknown slot "label".',
        'Composition child "badge" references unknown slot "badgeSlot".'
      ],
      valid: false
    });
  });

  it("rejects duplicate composition identifiers", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Icon",
            name: "adornment",
            slot: "icon"
          },
          {
            component: "Badge",
            name: "adornment",
            slot: "content"
          }
        ],
        parts: [
          {
            name: "body",
            slot: "content"
          },
          {
            name: "body",
            slot: "icon"
          }
        ],
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "content"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        'Composition slot relation "content" is duplicated.',
        'Composition part "body" is duplicated.',
        'Composition child "adornment" is duplicated.'
      ],
      valid: false
    });
  });

  it("rejects blank child metadata names", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Icon",
            name: " ",
            slot: "icon"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: ["Composition child name is required."],
      valid: false
    });
  });

  it("rejects blank child component references", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        children: [
          {
            component: " ",
            name: "leadingIcon",
            slot: "icon"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: ['Composition child "leadingIcon" requires a component reference.'],
      valid: false
    });
  });

  it("rejects slot relation self-references", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "content",
            slot: "content"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        'Composition slot relation "content" cannot reference itself as parent.'
      ],
      valid: false
    });
  });

  it("rejects simple slot relation cycles", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "root"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Composition slot relations contain a cycle: root -> content -> root."
      ],
      valid: false
    });
  });

  it("rejects multi-node slot relation cycles", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "icon"
          },
          {
            parentSlot: "icon",
            slot: "root"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Composition slot relations contain a cycle: root -> content -> icon -> root."
      ],
      valid: false
    });
  });

  it("keeps slot relation topology diagnostics ordered by discovered cycle path", () => {
    const result = validateComponent({
      ...baseSchema,
      slots: [
        ...baseSchema.slots,
        {
          name: "footer",
          required: false,
          role: "content"
        },
        {
          name: "label",
          required: false,
          role: "label"
        }
      ],
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "icon"
          },
          {
            parentSlot: "icon",
            slot: "root"
          },
          {
            parentSlot: "footer",
            slot: "label"
          },
          {
            parentSlot: "label",
            slot: "footer"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Composition slot relations contain a cycle: root -> content -> icon -> root.",
        "Composition slot relations contain a cycle: footer -> label -> footer."
      ],
      valid: false
    });
  });
});
