import { describe, expect, it } from "vitest";
import type { ComponentSchema } from "./component.types";
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

describe("resolveComponent", () => {
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
});
