import { describe, expect, it } from "vitest";
import { buttonSchema } from "./button.schema";
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
