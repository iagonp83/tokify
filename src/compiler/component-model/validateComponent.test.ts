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

  it("keeps structured token binding diagnostics legacy-compatible", () => {
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
            state: "focus",
            tone: "primary",
            emphasis: "strong",
            density: undefined,
            size: "xl"
          },
          slot: "missingSlot",
          target: "background",
          token: "semantic.color.accent"
        },
        {
          conditions: {
            tone: "secondary"
          },
          slot: "secondMissingSlot",
          target: "color",
          token: "semantic.color.foreground"
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
        'Token binding "background" references unknown state "focus".',
        'Token binding "background" references unknown tone option "primary".',
        'Token binding "background" references unknown variant axis "emphasis".',
        'Token binding "background" references unknown size option "xl".',
        'Token binding "color" references unknown slot "secondMissingSlot".',
        'Token binding "color" references unknown tone option "secondary".'
      ],
      valid: false
    });
    expect(result.errors).not.toContain(
      'Token binding "background" references unknown emphasis option "strong".'
    );
    expect(result.errors).not.toContain(
      'Token binding "background" references unknown density option "undefined".'
    );
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
  });

  it("keeps structured composition slot relation local reference diagnostics legacy-compatible", () => {
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
          slot: "missingTokenSlot",
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
      ],
      composition: {
        slotRelations: [
          {
            parentSlot: "firstMissingParent",
            slot: "firstMissingSlot"
          },
          {
            parentSlot: "secondMissingParent",
            slot: "secondMissingSlot"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Component name is required.",
        'Component requires a "root" slot.',
        'Component requires a "default" state.',
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.',
        'Token binding "background" references unknown slot "missingTokenSlot".',
        'Composition slot relation references unknown slot "firstMissingSlot".',
        'Composition slot relation references unknown parent slot "firstMissingParent".',
        'Composition slot relation references unknown slot "secondMissingSlot".',
        'Composition slot relation references unknown parent slot "secondMissingParent".'
      ],
      valid: false
    });
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
  });

  it("keeps structured composition part local reference diagnostics legacy-compatible", () => {
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
          slot: "missingTokenSlot",
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
      ],
      composition: {
        parts: [
          {
            name: "label",
            slot: "firstMissingPartSlot"
          },
          {
            name: "icon",
            slot: "secondMissingPartSlot"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Component name is required.",
        'Component requires a "root" slot.',
        'Component requires a "default" state.',
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.',
        'Token binding "background" references unknown slot "missingTokenSlot".',
        'Composition slot relation references unknown slot "missingRelationSlot".',
        'Composition slot relation references unknown parent slot "missingParent".',
        'Composition part "label" references unknown slot "firstMissingPartSlot".',
        'Composition part "icon" references unknown slot "secondMissingPartSlot".'
      ],
      valid: false
    });
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(
      result.errors.some((error) => error.toLowerCase().includes("warning"))
    ).toBe(false);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
  });

  it("keeps structured composition child metadata shape diagnostics legacy-compatible", () => {
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
          slot: "missingTokenSlot",
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
      ],
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "content"
          },
          {
            component: " ",
            name: "field",
            slot: "content"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Component name is required.",
        'Component requires a "root" slot.',
        'Component requires a "default" state.',
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.',
        'Token binding "background" references unknown slot "missingTokenSlot".',
        'Composition slot relation references unknown slot "missingRelationSlot".',
        'Composition slot relation references unknown parent slot "missingParent".',
        'Composition part "label" references unknown slot "missingPartSlot".',
        "Composition child name is required.",
        "Composition child requires a component reference.",
        'Composition child "field" requires a component reference.'
      ],
      valid: false
    });
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(
      result.errors.some((error) => error.toLowerCase().includes("warning"))
    ).toBe(false);
    expect(
      result.errors.some(
        (error) =>
          error.includes("METADATA_CHILD_NAME") ||
          error.includes("PATH_CHILD_NAME")
      )
    ).toBe(false);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
  });

  it("keeps structured composition child local slot reference diagnostics legacy-compatible", () => {
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
          slot: "missingTokenSlot",
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
      ],
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "firstMissingChildSlot"
          },
          {
            component: "Badge",
            name: "badge",
            slot: "secondMissingChildSlot"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Component name is required.",
        'Component requires a "root" slot.',
        'Component requires a "default" state.',
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.',
        'Token binding "background" references unknown slot "missingTokenSlot".',
        'Composition slot relation references unknown slot "missingRelationSlot".',
        'Composition slot relation references unknown parent slot "missingParent".',
        'Composition part "label" references unknown slot "missingPartSlot".',
        "Composition child name is required.",
        "Composition child requires a component reference.",
        'Composition child " " references unknown slot "firstMissingChildSlot".',
        'Composition child "badge" references unknown slot "secondMissingChildSlot".'
      ],
      valid: false
    });
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(
      result.errors.some((error) => error.toLowerCase().includes("warning"))
    ).toBe(false);
    expect(
      result.errors.some(
        (error) =>
          error.includes("METADATA_CHILD_NAME") ||
          error.includes("PATH_CHILD_NAME") ||
          error.includes("starts with whitespace") ||
          error.includes("ends with whitespace") ||
          error.includes("reserved instance-path")
      )
    ).toBe(false);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
  });

  it("keeps structured duplicate local composition metadata diagnostics legacy-compatible", () => {
    const result = validateComponent({
      ...baseSchema,
      name: " ",
      slots: [
        ...baseSchema.slots,
        {
          name: "footer",
          required: false,
          role: "content"
        }
      ],
      states: [{ name: "hover" }],
      tokenBindings: [
        {
          conditions: {
            state: "focus",
            tone: "primary",
            size: "xl",
            emphasis: "strong"
          },
          slot: "missingTokenSlot",
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
      ],
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "missingChildSlot"
          },
          {
            component: "Badge",
            name: " leading.name ",
            slot: "root"
          },
          {
            component: "Badge",
            name: "badge",
            slot: "root"
          },
          {
            component: "Field",
            name: "field",
            slot: "content"
          },
          {
            component: "Badge",
            name: "badge",
            slot: "icon"
          },
          {
            component: "Field",
            name: "field",
            slot: "footer"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          },
          {
            name: "body",
            slot: "root"
          },
          {
            name: "iconPart",
            slot: "icon"
          },
          {
            name: "body",
            slot: "content"
          },
          {
            name: "footerPart",
            slot: "footer"
          },
          {
            name: "iconPart",
            slot: "root"
          },
          {
            name: "footerPart",
            slot: "content"
          }
        ],
        slotRelations: [
          {
            parentSlot: "root",
            slot: "missingRelationSlot"
          },
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "icon"
          },
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "footer"
          },
          {
            parentSlot: "root",
            slot: "icon"
          },
          {
            parentSlot: "root",
            slot: "footer"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Component name is required.",
        'Component requires a "default" state.',
        'Variant axis "tone" requires at least one option.',
        'Variant axis "size" default "lg" must be one of its options.',
        'Token binding "background" references unknown slot "missingTokenSlot".',
        'Token binding "background" references unknown state "focus".',
        'Token binding "background" references unknown tone option "primary".',
        'Token binding "background" references unknown size option "xl".',
        'Token binding "background" references unknown variant axis "emphasis".',
        'Composition slot relation references unknown slot "missingRelationSlot".',
        'Composition part "label" references unknown slot "missingPartSlot".',
        "Composition child name is required.",
        "Composition child requires a component reference.",
        'Composition child " " references unknown slot "missingChildSlot".',
        'Composition slot relation "content" is duplicated.',
        'Composition slot relation "icon" is duplicated.',
        'Composition slot relation "footer" is duplicated.',
        'Composition part "body" is duplicated.',
        'Composition part "iconPart" is duplicated.',
        'Composition part "footerPart" is duplicated.',
        'Composition child "badge" is duplicated.',
        'Composition child "field" is duplicated.'
      ],
      valid: false
    });
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(
      result.errors.some((error) => error.toLowerCase().includes("warning"))
    ).toBe(false);
    expect(
      result.errors.some(
        (error) =>
          error.includes("METADATA_CHILD_NAME") ||
          error.includes("PATH_CHILD_NAME") ||
          error.includes("starts with whitespace") ||
          error.includes("ends with whitespace") ||
          error.includes("reserved instance-path")
      )
    ).toBe(false);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
  });

  it("keeps structured presence diagnostics legacy-compatible", () => {
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
      tokenBindings: [],
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
        'Variant axis "size" default "lg" must be one of its options.'
      ],
      valid: false
    });
    expect(result.errors.every((error) => typeof error === "string")).toBe(true);
    expect(result).not.toHaveProperty("diagnostics");
    expect(result).not.toHaveProperty("warnings");
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

  it("preserves duplicate slot relation self-reference diagnostics before duplicate diagnostics", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "content",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "content"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        'Composition slot relation "content" cannot reference itself as parent.',
        'Composition slot relation "content" cannot reference itself as parent.',
        'Composition slot relation "content" is duplicated.'
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

  it("preserves relation-order-dependent cycle path starts", () => {
    const rootFirstResult = validateComponent({
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
    const contentFirstResult = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "content",
            slot: "root"
          },
          {
            parentSlot: "root",
            slot: "content"
          }
        ]
      }
    });

    expect(rootFirstResult).toEqual({
      errors: [
        "Composition slot relations contain a cycle: root -> content -> root."
      ],
      valid: false
    });
    expect(contentFirstResult).toEqual({
      errors: [
        "Composition slot relations contain a cycle: content -> root -> content."
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

  it("uses the first duplicate slot relation for cycle traversal", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "icon",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "root"
          },
          {
            parentSlot: "content",
            slot: "icon"
          }
        ]
      }
    });

    expect(result).toEqual({
      errors: [
        "Composition slot relations contain a cycle: root -> content -> root.",
        'Composition slot relation "content" is duplicated.'
      ],
      valid: false
    });
  });

  it("keeps unknown slot relation references from suppressing valid cycle diagnostics", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          },
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
        'Composition slot relation references unknown slot "missingRelationSlot".',
        'Composition slot relation references unknown parent slot "missingParent".',
        "Composition slot relations contain a cycle: root -> content -> root."
      ],
      valid: false
    });
  });

  it("keeps self-parent slot relation diagnostics before separate cycle diagnostics", () => {
    const result = validateComponent({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "icon",
            slot: "icon"
          },
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
        'Composition slot relation "icon" cannot reference itself as parent.',
        "Composition slot relations contain a cycle: root -> content -> root."
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
