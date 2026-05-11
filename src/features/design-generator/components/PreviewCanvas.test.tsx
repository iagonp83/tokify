import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buttonSchema } from "../../../compiler/component-model/button.schema";
import { inputSchema } from "../../../compiler/component-model/input.schema";
import { emitComponentRuntimeVariables } from "../../../compiler/component-model/runtimeEmission";
import { resolveComponent } from "../../../compiler/component-model/resolveComponent";
import { createTokenResolver } from "../../../compiler/component-model/tokenResolver";
import { initialDesignState } from "../presets";
import { useDesignTokens } from "../useDesignTokens";
import { PreviewCanvas } from "./PreviewCanvas";

describe("PreviewCanvas runtime emission", () => {
  it("attaches emitted variables while Button and Input roots consume them", () => {
    const markup = renderToStaticMarkup(
      <PreviewCanvas
        onButtonVariantChange={() => undefined}
        state={initialDesignState}
      />
    );

    expect(markup).toContain("--button-background:");
    expect(markup).toContain("--button-border-radius:");
    expect(markup).toContain("--button-color:");
    expect(markup).toContain("--button-label-color:");
    expect(markup).toContain("--button-icon-color:");
    expect(markup).toContain("--input-background:");
    expect(markup).toContain("--input-border-radius:");
    expect(markup).toContain("--input-color:");
    expect(markup).toContain("background:var(--button-background)");
    expect(markup).toContain("border-radius:var(--button-border-radius)");
    expect(markup).toContain("color:var(--button-color)");
    expect(markup).toContain("opacity:var(--button-opacity)");
    expect(markup).toContain("color:var(--button-label-color)");
    expect(markup).toContain("color:var(--button-icon-color)");
    expect(markup).toContain("background:var(--input-background)");
    expect(markup).toContain("border-radius:var(--input-border-radius)");
    expect(markup).toContain("color:var(--input-color)");
    expect(markup).toContain("opacity:var(--input-opacity)");
    expect(markup).toContain("display:inline-flex");
    expect(markup).toContain("min-width:220px");
    expect(markup).not.toContain("var(--button-root-opacity)");
    expect(markup).not.toContain("var(--input-root-opacity)");
    expect(markup).not.toContain("--button-hover-background");
    expect(markup).not.toContain("--input-hover-background");
  });

  it("keeps using existing emitted root opacity variables", () => {
    const tokens = useDesignTokens(initialDesignState);
    const tokenResolver = createTokenResolver(
      tokens,
      initialDesignState.component.kind
    );
    const resolvedButton = resolveComponent(buttonSchema, tokenResolver, {
      ...initialDesignState.variantSelections.button,
      state: "active"
    });
    const resolvedInput = resolveComponent(inputSchema, tokenResolver, {
      state: "disabled"
    });
    const buttonVariables = emitComponentRuntimeVariables(resolvedButton, {
      state: "active"
    });
    const inputVariables = emitComponentRuntimeVariables(resolvedInput, {
      state: "disabled"
    });

    expect(buttonVariables["--button-opacity"]).toBe(
      resolvedButton.styles.states.active?.root.opacity
    );
    expect(inputVariables["--input-opacity"]).toBe(
      resolvedInput.styles.states.disabled?.root.opacity
    );
    expect(Object.keys(buttonVariables)).not.toContain(
      "--button-root-opacity"
    );
    expect(Object.keys(inputVariables)).not.toContain("--input-root-opacity");
  });
});
