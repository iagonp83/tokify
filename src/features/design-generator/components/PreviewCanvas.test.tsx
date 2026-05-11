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
    const buttonRootStyle = getStyleAttribute(markup, "--button-background:");
    const inputRootStyle = getStyleAttribute(markup, "--input-background:");

    expect(markup).toContain("--button-background:");
    expect(markup).toContain("--button-border-radius:");
    expect(markup).toContain("--button-box-shadow:");
    expect(markup).toContain("--button-color:");
    expect(markup).toContain("--button-padding-block:");
    expect(markup).toContain("--button-padding-inline:");
    expect(markup).toContain("--button-transition:");
    expect(markup).toContain("--button-transition-delay:");
    expect(markup).toContain("--button-transition-duration:");
    expect(markup).toContain("--button-transition-property:");
    expect(markup).toContain("--button-transition-timing-function:");
    expect(markup).toContain("--button-label-color:");
    expect(markup).toContain("--button-icon-color:");
    expect(markup).toContain("--input-background:");
    expect(markup).toContain("--input-border-radius:");
    expect(markup).toContain("--input-color:");
    expect(markup).toContain("--input-padding-block:");
    expect(markup).toContain("--input-padding-inline:");
    expect(markup).toContain("--input-transition:");
    expect(markup).toContain("--input-transition-delay:");
    expect(markup).toContain("--input-transition-duration:");
    expect(markup).toContain("--input-transition-property:");
    expect(markup).toContain("--input-transition-timing-function:");
    expect(markup).toContain("background:var(--button-background)");
    expect(markup).toContain("border-radius:var(--button-border-radius)");
    expect(markup).toContain("box-shadow:var(--button-box-shadow)");
    expect(markup).toContain("color:var(--button-color)");
    expect(markup).toContain("opacity:var(--button-opacity)");
    expect(markup).toContain("padding-block:var(--button-padding-block)");
    expect(markup).toContain("padding-inline:var(--button-padding-inline)");
    expect(markup).toContain("transition:var(--button-transition)");
    expect(markup).toContain("color:var(--button-label-color)");
    expect(markup).toContain("color:var(--button-icon-color)");
    expect(markup).not.toContain("transition:var(--button-label-transition)");
    expect(markup).not.toContain("transition:var(--button-icon-transition)");
    expect(markup).toContain("background:var(--input-background)");
    expect(markup).toContain("border-radius:var(--input-border-radius)");
    expect(markup).toContain("box-shadow:var(--input-box-shadow)");
    expect(markup).toContain("color:var(--input-color)");
    expect(markup).toContain("opacity:var(--input-opacity)");
    expect(markup).toContain("padding-block:var(--input-padding-block)");
    expect(markup).toContain("padding-inline:var(--input-padding-inline)");
    expect(markup).toContain("transition:var(--input-transition)");
    expect(buttonRootStyle).not.toContain(";transition-delay:");
    expect(buttonRootStyle).not.toContain(";transition-duration:");
    expect(buttonRootStyle).not.toContain(";transition-property:");
    expect(buttonRootStyle).not.toContain(";transition-timing-function:");
    expect(inputRootStyle).not.toContain(";transition-delay:");
    expect(inputRootStyle).not.toContain(";transition-duration:");
    expect(inputRootStyle).not.toContain(";transition-property:");
    expect(inputRootStyle).not.toContain(";transition-timing-function:");
    expect(markup).toContain("display:inline-flex");
    expect(markup).toContain("min-width:220px");
    expect(markup).not.toContain("var(--button-root-opacity)");
    expect(markup).not.toContain("var(--input-root-opacity)");
    expect(markup).not.toContain("var(--button-root-box-shadow)");
    expect(markup).not.toContain("var(--input-root-box-shadow)");
    expect(markup).not.toContain("var(--button-root-padding-block)");
    expect(markup).not.toContain("var(--button-root-padding-inline)");
    expect(markup).not.toContain("var(--input-root-padding-block)");
    expect(markup).not.toContain("var(--input-root-padding-inline)");
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

  it("keeps using existing emitted root boxShadow variables", () => {
    const tokens = useDesignTokens(initialDesignState);
    const tokenResolver = createTokenResolver(
      tokens,
      initialDesignState.component.kind
    );
    const resolvedButton = resolveComponent(buttonSchema, tokenResolver, {
      ...initialDesignState.variantSelections.button,
      state: "default"
    });
    const resolvedInput = resolveComponent(inputSchema, tokenResolver, {
      state: "focus"
    });
    const buttonVariables = emitComponentRuntimeVariables(resolvedButton, {
      state: "default"
    });
    const inputVariables = emitComponentRuntimeVariables(resolvedInput, {
      state: "focus"
    });

    expect(buttonVariables["--button-box-shadow"]).toBe(
      resolvedButton.styles.base.root.boxShadow
    );
    expect(inputVariables["--input-box-shadow"]).toBe(
      resolvedInput.styles.states.focus?.root.boxShadow
    );
    expect(Object.keys(buttonVariables)).not.toContain(
      "--button-root-box-shadow"
    );
    expect(Object.keys(inputVariables)).not.toContain(
      "--input-root-box-shadow"
    );
  });

  it("keeps using existing emitted root padding variables", () => {
    const tokens = useDesignTokens(initialDesignState);
    const tokenResolver = createTokenResolver(
      tokens,
      initialDesignState.component.kind
    );
    const resolvedButton = resolveComponent(buttonSchema, tokenResolver, {
      ...initialDesignState.variantSelections.button,
      state: "default"
    });
    const resolvedInput = resolveComponent(inputSchema, tokenResolver, {
      state: "default"
    });
    const buttonVariables = emitComponentRuntimeVariables(resolvedButton, {
      state: "default"
    });
    const inputVariables = emitComponentRuntimeVariables(resolvedInput, {
      state: "default"
    });

    expect(buttonVariables["--button-padding-block"]).toBe(
      resolvedButton.styles.base.root.paddingBlock
    );
    expect(buttonVariables["--button-padding-inline"]).toBe(
      resolvedButton.styles.base.root.paddingInline
    );
    expect(inputVariables["--input-padding-block"]).toBe(
      resolvedInput.styles.base.root.paddingBlock
    );
    expect(inputVariables["--input-padding-inline"]).toBe(
      resolvedInput.styles.base.root.paddingInline
    );
  });

  it("keeps using existing emitted root transition shorthand variables", () => {
    const tokens = useDesignTokens(initialDesignState);
    const tokenResolver = createTokenResolver(
      tokens,
      initialDesignState.component.kind
    );
    const resolvedButton = resolveComponent(buttonSchema, tokenResolver, {
      ...initialDesignState.variantSelections.button,
      state: "default"
    });
    const resolvedInput = resolveComponent(inputSchema, tokenResolver, {
      state: "default"
    });
    const buttonVariables = emitComponentRuntimeVariables(resolvedButton, {
      state: "default"
    });
    const inputVariables = emitComponentRuntimeVariables(resolvedInput, {
      state: "default"
    });

    expect(buttonVariables["--button-transition"]).toBe(
      resolvedButton.styles.base.root.transition
    );
    expect(inputVariables["--input-transition"]).toBe(
      resolvedInput.styles.base.root.transition
    );
    expect(buttonVariables["--button-label-transition"]).toBe(
      resolvedButton.styles.base.label.transition
    );
    expect(buttonVariables["--button-icon-transition"]).toBe(
      resolvedButton.styles.base.icon.transition
    );
  });
});

function getStyleAttribute(markup: string, marker: string) {
  const styleAttribute = markup
    .match(/style="([^"]*)"/g)
    ?.find((style) => style.includes(marker));

  expect(styleAttribute).toBeDefined();

  return styleAttribute ?? "";
}
