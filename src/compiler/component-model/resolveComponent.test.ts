import { describe, expect, it } from "vitest";
import { buttonSchema } from "./button.schema";
import type { ComponentSchema } from "./component.types";
import { inputSchema } from "./input.schema";
import { resolveComponent } from "./resolveComponent";
import type { TokenResolver } from "./tokenResolver";

const tokenValues: Record<string, string> = {
  "base.background": "base-bg",
  "base.border": "base-border",
  "base.color": "base-color",
  "base.transition.delay": "25ms",
  "base.transition.duration": "120ms",
  "base.transition.property": "background-color",
  "base.transition.timing": "ease-out",
  "intent.danger.background": "danger-bg",
  "intent.primary.background": "primary-bg",
  "later.color": "later-color",
  "size.lg.padding": "16px",
  "size.md.padding": "12px",
  "state.hover.background": "hover-bg",
  "state.hover.color": "hover-color",
  "state.hover.danger.background": "hover-danger-bg",
  "state.hover.transition.duration": "80ms",
  "state.hover.transition.property": "opacity"
};

const tokenResolver: TokenResolver = {
  get(path) {
    return tokenValues[path] ?? path;
  }
};

const testSchema = {
  editable: {
    fields: ["variants", "tokenBindings"],
    tokenOnly: true
  },
  name: "TestComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }, { name: "hover" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    },
    {
      slot: "root",
      target: "color",
      token: "base.color"
    },
    {
      slot: "root",
      target: "color",
      token: "later.color"
    },
    {
      slot: "root",
      target: "borderColor",
      token: "base.border"
    },
    {
      slot: "root",
      target: "transitionProperty",
      token: "base.transition.property"
    },
    {
      slot: "root",
      target: "transitionDuration",
      token: "base.transition.duration"
    },
    {
      slot: "root",
      target: "transitionTimingFunction",
      token: "base.transition.timing"
    },
    {
      slot: "root",
      target: "transitionDelay",
      token: "base.transition.delay"
    },
    {
      conditions: {
        intent: "primary"
      },
      slot: "root",
      target: "background",
      token: "intent.primary.background"
    },
    {
      conditions: {
        intent: "danger"
      },
      slot: "root",
      target: "background",
      token: "intent.danger.background"
    },
    {
      conditions: {
        size: "md"
      },
      slot: "root",
      target: "paddingInline",
      token: "size.md.padding"
    },
    {
      conditions: {
        size: "lg"
      },
      slot: "root",
      target: "paddingInline",
      token: "size.lg.padding"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "background",
      token: "state.hover.background"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "transitionProperty",
      token: "state.hover.transition.property"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "transitionDuration",
      token: "state.hover.transition.duration"
    },
    {
      conditions: {
        intent: "danger",
        state: "hover"
      },
      slot: "root",
      target: "background",
      token: "state.hover.danger.background"
    }
  ],
  variants: [
    {
      default: "primary",
      name: "intent",
      options: ["primary", "danger"]
    },
    {
      default: "md",
      name: "size",
      options: ["md", "lg"]
    }
  ],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const zeroVariantSchema = {
  editable: {
    fields: ["tokenBindings"],
    tokenOnly: true
  },
  name: "ZeroVariantComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    }
  ],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const oneVariantSchema = {
  editable: {
    fields: ["variants", "tokenBindings"],
    tokenOnly: true
  },
  name: "OneVariantComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    },
    {
      conditions: {
        size: "compact"
      },
      slot: "root",
      target: "background",
      token: "size.compact.background"
    },
    {
      conditions: {
        size: "roomy"
      },
      slot: "root",
      target: "background",
      token: "size.roomy.background"
    }
  ],
  variants: [
    {
      default: "compact",
      name: "size",
      options: ["compact", "roomy"]
    }
  ],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const customAxisSchema = {
  editable: {
    fields: ["variants", "tokenBindings"],
    tokenOnly: true
  },
  name: "CustomAxisComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    },
    {
      conditions: {
        tone: "quiet"
      },
      slot: "root",
      target: "background",
      token: "tone.quiet.background"
    },
    {
      conditions: {
        tone: "loud"
      },
      slot: "root",
      target: "background",
      token: "tone.loud.background"
    }
  ],
  variants: [
    {
      default: "quiet",
      name: "tone",
      options: ["quiet", "loud"]
    }
  ],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const compoundVariantSchema = {
  editable: {
    fields: ["variants", "tokenBindings"],
    tokenOnly: true
  },
  name: "CompoundVariantComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    },
    {
      conditions: {
        intent: "danger"
      },
      slot: "root",
      target: "background",
      token: "intent.danger.background"
    },
    {
      conditions: {
        size: "lg"
      },
      slot: "root",
      target: "paddingInline",
      token: "size.lg.padding"
    },
    {
      conditions: {
        intent: "danger",
        size: "lg"
      },
      slot: "root",
      target: "background",
      token: "intent.danger.size.lg.background"
    },
    {
      conditions: {
        intent: "danger",
        size: "lg"
      },
      slot: "root",
      target: "background",
      token: "intent.danger.size.lg.background.later"
    }
  ],
  variants: [
    {
      default: "primary",
      name: "intent",
      options: ["primary", "danger"]
    },
    {
      default: "md",
      name: "size",
      options: ["md", "lg"]
    }
  ],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const compositionBaselineSchema = {
  editable: {
    fields: ["slots", "variants", "tokenBindings"],
    tokenOnly: true
  },
  name: "CompositionBaselineComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    },
    {
      name: "label",
      required: true,
      role: "label"
    },
    {
      name: "icon",
      required: false,
      role: "icon"
    }
  ],
  states: [{ name: "default" }, { name: "hover" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    },
    {
      slot: "root",
      target: "color",
      token: "base.color"
    },
    {
      slot: "label",
      target: "color",
      token: "later.color"
    },
    {
      conditions: {
        density: "roomy"
      },
      slot: "root",
      target: "paddingInline",
      token: "size.lg.padding"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "background",
      token: "state.hover.background"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "label",
      target: "color",
      token: "state.hover.danger.background"
    }
  ],
  variants: [
    {
      default: "compact",
      name: "density",
      options: ["compact", "roomy"]
    }
  ],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const compositionMetadataWithoutRelationsSchema = {
  ...compositionBaselineSchema,
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
        name: "text",
        slot: "label"
      }
    ]
  }
} as const satisfies ComponentSchema;

const slotInheritanceSchema = {
  composition: {
    slotRelations: [
      {
        parentSlot: "root",
        slot: "label"
      },
      {
        parentSlot: "root",
        slot: "icon"
      }
    ]
  },
  editable: {
    fields: ["slots", "tokenBindings"],
    tokenOnly: true
  },
  name: "SlotInheritanceComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    },
    {
      name: "label",
      required: true,
      role: "label"
    },
    {
      name: "icon",
      required: false,
      role: "icon"
    }
  ],
  states: [{ name: "default" }, { name: "hover" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    },
    {
      slot: "root",
      target: "color",
      token: "base.color"
    },
    {
      slot: "root",
      target: "paddingInline",
      token: "size.md.padding"
    },
    {
      slot: "root",
      target: "transitionProperty",
      token: "base.transition.property"
    },
    {
      slot: "root",
      target: "transitionDuration",
      token: "base.transition.duration"
    },
    {
      slot: "root",
      target: "transitionTimingFunction",
      token: "base.transition.timing"
    },
    {
      slot: "root",
      target: "transitionDelay",
      token: "base.transition.delay"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "background",
      token: "state.hover.background"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "color",
      token: "state.hover.color"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "transitionDuration",
      token: "state.hover.transition.duration"
    }
  ],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

const slotInheritanceOverrideSchema = {
  ...slotInheritanceSchema,
  tokenBindings: [
    ...slotInheritanceSchema.tokenBindings,
    {
      slot: "label",
      target: "color",
      token: "later.color"
    }
  ]
} as const satisfies ComponentSchema;

describe("resolveComponent", () => {
  it("resolves components with zero variant axes without applying variant-conditioned styles", () => {
    const resolved = resolveComponent(zeroVariantSchema, tokenResolver, {
      intent: "ignored",
      size: "ignored"
    });

    expect(resolved.selection).toEqual({});
    expect(resolved.styles.base.root.background).toBe("base-bg");
  });

  it("derives a one-axis selection from the schema default", () => {
    const resolved = resolveComponent(oneVariantSchema, tokenResolver);

    expect(resolved.selection).toEqual({
      size: "compact"
    });
    expect(resolved.styles.base.root.background).toBe(
      "size.compact.background"
    );
  });

  it("uses explicit context over a one-axis schema default", () => {
    const resolved = resolveComponent(oneVariantSchema, tokenResolver, {
      size: "roomy"
    });

    expect(resolved.selection).toEqual({
      size: "roomy"
    });
    expect(resolved.styles.base.root.background).toBe("size.roomy.background");
  });

  it("derives custom variant axes from the schema", () => {
    const resolved = resolveComponent(customAxisSchema, tokenResolver);

    expect(resolved.selection).toEqual({
      tone: "quiet"
    });
    expect(resolved.styles.base.root.background).toBe("tone.quiet.background");
  });

  it("uses explicit context for custom schema-derived axes", () => {
    const resolved = resolveComponent(customAxisSchema, tokenResolver, {
      tone: "loud"
    });

    expect(resolved.selection).toEqual({
      tone: "loud"
    });
    expect(resolved.styles.base.root.background).toBe("tone.loud.background");
  });

  it("uses default variant selection when context is empty", () => {
    const resolved = resolveComponent(testSchema, tokenResolver);

    expect(resolved.selection).toEqual({
      intent: "primary",
      size: "md"
    });
    expect(resolved.state).toBe("default");
  });

  it("uses explicit variant selection over schema defaults", () => {
    const resolved = resolveComponent(testSchema, tokenResolver, {
      intent: "danger",
      size: "lg"
    });

    expect(resolved.selection).toEqual({
      intent: "danger",
      size: "lg"
    });
  });

  it("preserves Button intent and size defaults from its schema", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);

    expect(resolved.selection).toEqual({
      intent: "primary",
      size: "md"
    });
    expect(resolved.styles.base.root.background).toBe(
      "component.button.intent.primary.background"
    );
    expect(resolved.styles.base.root.paddingInline).toBe(
      "component.button.size.md.paddingInline"
    );
    expect(resolved.styles.base.label.color).toBe(
      "component.button.intent.primary.color"
    );
    expect(resolved.styles.base.icon.color).toBe(
      "component.button.intent.primary.color"
    );
  });

  it("preserves explicit Button intent and size selection", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver, {
      intent: "danger",
      size: "lg"
    });

    expect(resolved.selection).toEqual({
      intent: "danger",
      size: "lg"
    });
    expect(resolved.styles.base.root.background).toBe(
      "component.button.intent.danger.background"
    );
    expect(resolved.styles.base.root.paddingInline).toBe(
      "component.button.size.lg.paddingInline"
    );
    expect(resolved.styles.base.label.color).toBe(
      "component.button.intent.danger.color"
    );
    expect(resolved.styles.base.icon.color).toBe(
      "component.button.intent.danger.color"
    );
  });

  it("applies single variant conditions without requiring other axes to match", () => {
    const resolved = resolveComponent(compoundVariantSchema, tokenResolver, {
      intent: "danger",
      size: "md"
    });

    expect(resolved.styles.base.root).toMatchObject({
      background: "danger-bg"
    });
    expect(resolved.styles.base.root.paddingInline).toBeUndefined();
  });

  it("applies multi-axis conditions only when every variant condition matches", () => {
    const dangerMd = resolveComponent(compoundVariantSchema, tokenResolver, {
      intent: "danger",
      size: "md"
    });
    const primaryLg = resolveComponent(compoundVariantSchema, tokenResolver, {
      intent: "primary",
      size: "lg"
    });
    const dangerLg = resolveComponent(compoundVariantSchema, tokenResolver, {
      intent: "danger",
      size: "lg"
    });

    expect(dangerMd.styles.base.root.background).toBe("danger-bg");
    expect(primaryLg.styles.base.root.background).toBe("base-bg");
    expect(primaryLg.styles.base.root.paddingInline).toBe("16px");
    expect(dangerLg.styles.base.root.background).toBe(
      "intent.danger.size.lg.background.later"
    );
  });

  it("uses binding order as precedence for matching compound variant bindings", () => {
    const resolved = resolveComponent(compoundVariantSchema, tokenResolver, {
      intent: "danger",
      size: "lg"
    });

    expect(
      resolved.bindings
        .filter((binding) => binding.target === "background")
        .map((binding) => binding.token)
    ).toEqual([
      "base.background",
      "intent.danger.background",
      "intent.danger.size.lg.background",
      "intent.danger.size.lg.background.later"
    ]);
    expect(resolved.styles.base.root.background).toBe(
      "intent.danger.size.lg.background.later"
    );
  });

  it("uses explicit selections over schema defaults for compound variant matching", () => {
    const defaultResolved = resolveComponent(compoundVariantSchema, tokenResolver);
    const explicitResolved = resolveComponent(
      compoundVariantSchema,
      tokenResolver,
      {
        intent: "danger",
        size: "lg"
      }
    );

    expect(defaultResolved.selection).toEqual({
      intent: "primary",
      size: "md"
    });
    expect(defaultResolved.styles.base.root.background).toBe("base-bg");
    expect(explicitResolved.selection).toEqual({
      intent: "danger",
      size: "lg"
    });
    expect(explicitResolved.styles.base.root.background).toBe(
      "intent.danger.size.lg.background.later"
    );
  });

  it("preserves Input behavior with no variant axes", () => {
    const resolved = resolveComponent(inputSchema, tokenResolver);

    expect(resolved.selection).toEqual({});
    expect(resolved.styles.base.root.background).toBe("semantic.color.onAccent");
  });

  it("merges unconditional and matching variant bindings into base styles", () => {
    const resolved = resolveComponent(testSchema, tokenResolver);

    expect(resolved.styles.base.root).toMatchObject({
      background: "primary-bg",
      color: "later-color",
      paddingInline: "12px"
    });
  });

  it("lets later bindings win for the same slot and target", () => {
    const resolved = resolveComponent(testSchema, tokenResolver, {
      intent: "danger"
    });

    expect(resolved.styles.base.root.background).toBe("danger-bg");
    expect(resolved.styles.base.root.color).toBe("later-color");
  });

  it("groups state bindings under styles.states[state]", () => {
    const resolved = resolveComponent(testSchema, tokenResolver);

    expect(resolved.styles.base.root.background).toBe("primary-bg");
    expect(resolved.styles.states.hover?.root).toMatchObject({
      background: "hover-bg"
    });
  });

  it("resolves variant-conditional state bindings", () => {
    const primary = resolveComponent(testSchema, tokenResolver);
    const danger = resolveComponent(testSchema, tokenResolver, {
      intent: "danger"
    });

    expect(primary.styles.states.hover?.root.background).toBe("hover-bg");
    expect(danger.styles.states.hover?.root.background).toBe("hover-danger-bg");
  });

  it("applies transition shorthand only to base styles", () => {
    const resolved = resolveComponent(testSchema, tokenResolver);

    expect(resolved.styles.base.root.transition).toBe(
      "background-color 120ms ease-out 25ms"
    );
    expect(resolved.styles.states.hover?.root).toMatchObject({
      transitionDuration: "80ms",
      transitionProperty: "opacity"
    });
    expect(resolved.styles.states.hover?.root.transition).toBeUndefined();
  });

  it("keeps unsupported binding targets in bindings but omits them from styles", () => {
    const resolved = resolveComponent(testSchema, tokenResolver);

    expect(
      resolved.bindings.some((binding) => binding.target === "borderColor")
    ).toBe(true);
    expect(resolved.styles.base.root.borderColor).toBeUndefined();
  });

  it("resolves a multi-slot schema without composition metadata", () => {
    const resolved = resolveComponent(compositionBaselineSchema, tokenResolver, {
      density: "roomy"
    });

    expect(resolved.selection).toEqual({
      density: "roomy"
    });
    expect(resolved.styles.base).toEqual({
      label: {
        color: "later-color"
      },
      root: {
        background: "base-bg",
        color: "base-color",
        paddingInline: "16px"
      }
    });
    expect(resolved.styles.states.hover).toEqual({
      label: {
        color: "hover-danger-bg"
      },
      root: {
        background: "hover-bg"
      }
    });
  });

  it("does not change resolved output when composition metadata is present", () => {
    const context = {
      density: "roomy",
      state: "hover"
    } as const;
    const withoutComposition = resolveComponent(
      compositionBaselineSchema,
      tokenResolver,
      context
    );
    const withComposition = resolveComponent(
      compositionMetadataWithoutRelationsSchema,
      tokenResolver,
      context
    );

    expect(withComposition).toEqual({
      ...withoutComposition,
      schema: compositionMetadataWithoutRelationsSchema
    });
    expect(withComposition.bindings).toEqual(withoutComposition.bindings);
    expect(withComposition.selection).toEqual(withoutComposition.selection);
    expect(withComposition.state).toBe(withoutComposition.state);
    expect(withComposition.styles).toEqual(withoutComposition.styles);
  });

  it("inherits root color into the label slot through composition relations", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.styles.base.label.color).toBe("base-color");
  });

  it("inherits root color into the icon slot through composition relations", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.styles.base.icon.color).toBe("base-color");
  });

  it("keeps explicit child color bindings over inherited root color", () => {
    const resolved = resolveComponent(
      slotInheritanceOverrideSchema,
      tokenResolver
    );

    expect(resolved.styles.base.root.color).toBe("base-color");
    expect(resolved.styles.base.label.color).toBe("later-color");
    expect(resolved.styles.base.icon.color).toBe("base-color");
  });

  it("does not inherit non-allowlisted slot properties", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.styles.base.root).toMatchObject({
      background: "base-bg",
      paddingInline: "12px"
    });
    expect(resolved.styles.base.label.background).toBeUndefined();
    expect(resolved.styles.base.label.paddingInline).toBeUndefined();
    expect(resolved.styles.base.icon.background).toBeUndefined();
    expect(resolved.styles.base.icon.paddingInline).toBeUndefined();
  });

  it("applies slot inheritance to state styles", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.styles.states.hover?.root).toMatchObject({
      background: "hover-bg",
      color: "hover-color",
      transitionDuration: "80ms"
    });
    expect(resolved.styles.states.hover?.label).toEqual({
      color: "hover-color",
      transitionDuration: "80ms"
    });
    expect(resolved.styles.states.hover?.icon).toEqual({
      color: "hover-color",
      transitionDuration: "80ms"
    });
    expect(resolved.styles.states.hover?.label.background).toBeUndefined();
    expect(resolved.styles.states.hover?.icon.background).toBeUndefined();
  });

  it("plans flat runtime variables with root slot names omitted", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.runtimePlan.variables).toContainEqual({
      name: "--slot-inheritance-component-background",
      property: "background",
      slot: "root",
      source: "base"
    });
    expect(resolved.runtimePlan.variables).toContainEqual({
      name: "--slot-inheritance-component-color",
      property: "color",
      slot: "root",
      source: "base"
    });
  });

  it("plans flat runtime variables with non-root slot names included", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.runtimePlan.variables).toContainEqual({
      name: "--slot-inheritance-component-label-color",
      property: "color",
      slot: "label",
      source: "base"
    });
    expect(resolved.runtimePlan.variables).toContainEqual({
      name: "--slot-inheritance-component-icon-color",
      property: "color",
      slot: "icon",
      source: "base"
    });
  });

  it("includes state-aware runtime planning entries", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.runtimePlan.variables).toContainEqual({
      name: "--slot-inheritance-component-label-color",
      property: "color",
      slot: "label",
      source: "state",
      state: "hover"
    });
    expect(resolved.runtimePlan.variables).toContainEqual({
      name: "--slot-inheritance-component-icon-transition-duration",
      property: "transitionDuration",
      slot: "icon",
      source: "state",
      state: "hover"
    });
  });

  it("keeps runtime planning variables in stable schema and style order", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(resolved.runtimePlan.variables.map((variable) => variable.name)).toEqual(
      [
        "--slot-inheritance-component-background",
        "--slot-inheritance-component-color",
        "--slot-inheritance-component-padding-inline",
        "--slot-inheritance-component-transition-property",
        "--slot-inheritance-component-transition-duration",
        "--slot-inheritance-component-transition-timing-function",
        "--slot-inheritance-component-transition-delay",
        "--slot-inheritance-component-transition",
        "--slot-inheritance-component-label-color",
        "--slot-inheritance-component-label-transition-property",
        "--slot-inheritance-component-label-transition-duration",
        "--slot-inheritance-component-label-transition-timing-function",
        "--slot-inheritance-component-label-transition-delay",
        "--slot-inheritance-component-label-transition",
        "--slot-inheritance-component-icon-color",
        "--slot-inheritance-component-icon-transition-property",
        "--slot-inheritance-component-icon-transition-duration",
        "--slot-inheritance-component-icon-transition-timing-function",
        "--slot-inheritance-component-icon-transition-delay",
        "--slot-inheritance-component-icon-transition",
        "--slot-inheritance-component-background",
        "--slot-inheritance-component-color",
        "--slot-inheritance-component-transition-duration",
        "--slot-inheritance-component-label-color",
        "--slot-inheritance-component-label-transition-duration",
        "--slot-inheritance-component-icon-color",
        "--slot-inheritance-component-icon-transition-duration"
      ]
    );
  });

  it("keeps runtime planning metadata flat and internal", () => {
    const resolved = resolveComponent(slotInheritanceSchema, tokenResolver);

    expect(Object.keys(resolved.runtimePlan)).toEqual(["variables"]);
    expect(Array.isArray(resolved.runtimePlan.variables)).toBe(true);
    resolved.runtimePlan.variables.forEach((variable) => {
      expect(Object.keys(variable).sort()).toEqual(
        variable.source === "state"
          ? ["name", "property", "slot", "source", "state"]
          : ["name", "property", "slot", "source"]
      );
      expect(variable.name.startsWith("--")).toBe(true);
      expect(variable.name).not.toContain("root");
    });
  });
});
