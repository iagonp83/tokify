import { describe, expect, it } from "vitest";
import { buttonSchema } from "./button.schema";
import type { ResolvedComponent } from "./component.types";
import { inputSchema } from "./input.schema";
import { emitComponentRuntimeVariables } from "./runtimeEmission";
import { resolveComponent } from "./resolveComponent";
import type { TokenResolver } from "./tokenResolver";

const tokenResolver: TokenResolver = {
  get(path) {
    return path;
  }
};

describe("emitComponentRuntimeVariables", () => {
  it("emits flat Button root variables while omitting the root slot", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(variables["--button-background"]).toBe(
      resolved.styles.base.root.background
    );
    expect(variables["--button-border-radius"]).toBe(
      resolved.styles.base.root.borderRadius
    );
    expect(Object.keys(variables)).not.toContain("--button-root-background");
  });

  it("emits flat Button label variables with the non-root slot name", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(variables["--button-label-color"]).toBe(
      resolved.styles.base.label.color
    );
    expect(Object.keys(variables)).not.toContain("--button-root-label-color");
  });

  it("emits flat Button icon variables with the non-root slot name", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(variables["--button-icon-color"]).toBe(
      resolved.styles.base.icon.color
    );
    expect(Object.keys(variables)).not.toContain("--button-root-icon-color");
  });

  it("emits flat Input root variables while omitting the root slot", () => {
    const resolved = resolveComponent(inputSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(variables["--input-background"]).toBe(
      resolved.styles.base.root.background
    );
    expect(variables["--input-border-radius"]).toBe(
      resolved.styles.base.root.borderRadius
    );
    expect(Object.keys(variables)).not.toContain("--input-root-background");
  });

  it("reads base variable values from resolved base styles", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(variables["--button-padding-inline"]).toBe(
      resolved.styles.base.root.paddingInline
    );
    expect(variables["--button-transition"]).toBe(
      resolved.styles.base.root.transition
    );
  });

  it("overlays active state values on the same flat variable names", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved, {
      state: "hover"
    });

    expect(variables["--button-background"]).toBe(
      resolved.styles.states.hover?.root.background
    );
    expect(variables["--button-color"]).toBe(resolved.styles.base.root.color);
  });

  it("allows base and state entries to use the same variable name as layering", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved, {
      state: "hover"
    });

    expect(resolved.runtimePlan.variables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "--button-background",
          styleLayer: "base"
        }),
        expect.objectContaining({
          name: "--button-background",
          state: "hover",
          styleLayer: "state"
        })
      ])
    );
    expect(variables["--button-background"]).toBe(
      resolved.styles.states.hover?.root.background
    );
  });

  it("emits base values only when no active state is provided", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(variables["--button-background"]).toBe(
      resolved.styles.base.root.background
    );
  });

  it("emits base values only when the requested state has no entries", () => {
    const resolved = resolveComponent(inputSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved, {
      state: "active"
    });

    expect(variables["--input-background"]).toBe(
      resolved.styles.base.root.background
    );
  });

  it("throws for same-layer duplicate variable names from different origins", () => {
    expect(() =>
      emitComponentRuntimeVariables(createDuplicateOriginResolution())
    ).toThrow(
      'Runtime variable "--collision-background" has multiple same-layer origins.'
    );
  });

  it("emits inherited and derived runtimePlan entries when style values exist", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved);

    expect(
      resolved.runtimePlan.variables.find(
        (variable) =>
          variable.name === "--button-label-color" &&
          variable.sourceType === "inherited"
      )
    ).toBeDefined();
    expect(
      resolved.runtimePlan.variables.find(
        (variable) =>
          variable.name === "--button-transition" &&
          variable.sourceType === "derived"
      )
    ).toBeDefined();
    expect(variables["--button-label-color"]).toBe(
      resolved.styles.base.label.color
    );
    expect(variables["--button-transition"]).toBe(
      resolved.styles.base.root.transition
    );
  });

  it("skips runtimePlan entries when the resolved style value is missing", () => {
    const variables = emitComponentRuntimeVariables(
      createMissingValueResolution()
    );

    expect(variables["--missing-background"]).toBe("base-bg");
    expect(Object.hasOwn(variables, "--missing-color")).toBe(false);
  });

  it("does not emit state-suffixed variable names", () => {
    const resolved = resolveComponent(buttonSchema, tokenResolver);
    const variables = emitComponentRuntimeVariables(resolved, {
      state: "hover"
    });

    expect(Object.keys(variables).some((name) => name.includes("hover"))).toBe(
      false
    );
  });
});

function createDuplicateOriginResolution(): ResolvedComponent {
  return {
    bindings: [],
    runtimePlan: {
      variables: [
        {
          name: "--collision-background",
          property: "background",
          slot: "root",
          source: "base",
          sourceType: "explicit",
          styleLayer: "base"
        },
        {
          name: "--collision-background",
          property: "color",
          slot: "label",
          source: "base",
          sourceType: "explicit",
          styleLayer: "base"
        }
      ]
    },
    schema: {
      editable: {
        fields: ["tokenBindings"],
        tokenOnly: true
      },
      name: "Collision",
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
        }
      ],
      states: [{ name: "default" }],
      tokenBindings: [],
      variants: [],
      version: "0.1.0"
    },
    selection: {},
    state: "default",
    styles: {
      base: {
        label: {
          color: "label-color"
        },
        root: {
          background: "root-bg"
        }
      },
      states: {}
    }
  };
}

function createMissingValueResolution(): ResolvedComponent {
  return {
    bindings: [],
    runtimePlan: {
      variables: [
        {
          name: "--missing-background",
          property: "background",
          slot: "root",
          source: "base",
          sourceType: "explicit",
          styleLayer: "base"
        },
        {
          name: "--missing-color",
          property: "color",
          slot: "root",
          source: "base",
          sourceType: "explicit",
          styleLayer: "base"
        }
      ]
    },
    schema: {
      editable: {
        fields: ["tokenBindings"],
        tokenOnly: true
      },
      name: "Missing",
      slots: [
        {
          name: "root",
          required: true,
          role: "root"
        }
      ],
      states: [{ name: "default" }],
      tokenBindings: [],
      variants: [],
      version: "0.1.0"
    },
    selection: {},
    state: "default",
    styles: {
      base: {
        root: {
          background: "base-bg"
        }
      },
      states: {}
    }
  };
}
