import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buttonSchema } from "../../../compiler/component-model/button.schema";
import { inputSchema } from "../../../compiler/component-model/input.schema";
import { emitComponentRuntimeVariables } from "../../../compiler/component-model/runtimeEmission";
import { resolveComponent } from "../../../compiler/component-model/resolveComponent";
import { createTokenResolver } from "../../../compiler/component-model/tokenResolver";
import { initialDesignState } from "../presets";
import { useDesignTokens as createDesignTokensForTest } from "../useDesignTokens";
import { PreviewCanvas } from "./PreviewCanvas";
import {
  getPreviewRuntimeConsumptionMode,
  type PreviewRuntimeComponentNamespace,
  type PreviewRuntimeConsumptionMode,
  type PreviewRuntimeProperty,
  type PreviewRuntimeSlot
} from "./previewRuntimeConsumptionPolicy";

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
    const { resolvedButton, resolvedInput } = resolveDefaultPreviews();

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
    expectRootStyleNotToRenderTransitionShorthand(buttonRootStyle);
    expect(markup).not.toContain("transition:var(--button-transition)");
    expect(buttonRootStyle).toContain(
      `transition-delay:${resolvedButton.styles.base.root.transitionDelay}`
    );
    expect(buttonRootStyle).toContain(
      `transition-duration:${resolvedButton.styles.base.root.transitionDuration}`
    );
    expect(buttonRootStyle).toContain(
      `transition-property:${resolvedButton.styles.base.root.transitionProperty}`
    );
    expect(buttonRootStyle).toContain(
      `transition-timing-function:${resolvedButton.styles.base.root.transitionTimingFunction}`
    );
    expect(markup).toContain("color:var(--button-label-color)");
    expect(markup).toContain("color:var(--button-icon-color)");
    expect(markup).not.toContain("transition:var(--button-label-transition)");
    expect(markup).not.toContain("transition:var(--button-icon-transition)");
    expect(inputRootStyle).toContain(
      `background:${resolvedInput.styles.base.root.background}`
    );
    expect(inputRootStyle).not.toContain("background:var(--input-background)");
    expect(markup).toContain("border-radius:var(--input-border-radius)");
    expect(inputRootStyle).not.toContain("box-shadow:var(--input-box-shadow)");
    expect(markup).toContain("color:var(--input-color)");
    expect(inputRootStyle).not.toContain("opacity:var(--input-opacity)");
    expect(markup).toContain("padding-block:var(--input-padding-block)");
    expect(markup).toContain("padding-inline:var(--input-padding-inline)");
    expectRootStyleNotToRenderTransitionShorthand(inputRootStyle);
    expect(markup).not.toContain("transition:var(--input-transition)");
    expect(inputRootStyle).toContain(
      `transition-delay:${resolvedInput.styles.base.root.transitionDelay}`
    );
    expect(inputRootStyle).toContain(
      `transition-duration:${resolvedInput.styles.base.root.transitionDuration}`
    );
    expect(inputRootStyle).toContain(
      `transition-property:${resolvedInput.styles.base.root.transitionProperty}`
    );
    expect(inputRootStyle).toContain(
      `transition-timing-function:${resolvedInput.styles.base.root.transitionTimingFunction}`
    );
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
    const tokens = createDesignTokensForTest(initialDesignState);
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
    const tokens = createDesignTokensForTest(initialDesignState);
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
    const tokens = createDesignTokensForTest(initialDesignState);
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
    const { resolvedButton, resolvedInput } = resolveDefaultPreviews();
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

describe("PreviewCanvas runtime consumption policy", () => {
  it("keeps the current preview-only consumption decisions explicit", () => {
    const expectedPolicies = [
      ["button", "root", "background", "runtime-var"],
      ["button", "root", "color", "runtime-var"],
      ["button", "root", "borderRadius", "runtime-var"],
      ["button", "root", "boxShadow", "runtime-var"],
      ["button", "root", "opacity", "runtime-var"],
      ["button", "root", "paddingBlock", "runtime-var"],
      ["button", "root", "paddingInline", "runtime-var"],
      ["button", "root", "transitionDelay", "direct-longhand"],
      ["button", "root", "transitionDuration", "direct-longhand"],
      ["button", "root", "transitionProperty", "direct-longhand"],
      ["button", "root", "transitionTimingFunction", "direct-longhand"],
      ["button", "root", "transition", "omit-shorthand"],
      ["button", "label", "color", "runtime-var"],
      ["button", "icon", "color", "runtime-var"],
      ["input", "root", "color", "runtime-var"],
      ["input", "root", "borderRadius", "runtime-var"],
      ["input", "root", "paddingBlock", "runtime-var"],
      ["input", "root", "paddingInline", "runtime-var"],
      ["input", "root", "background", "direct-value"],
      ["input", "root", "boxShadow", "direct-value"],
      ["input", "root", "opacity", "direct-value"],
      ["input", "root", "transitionDelay", "direct-longhand"],
      ["input", "root", "transitionDuration", "direct-longhand"],
      ["input", "root", "transitionProperty", "direct-longhand"],
      ["input", "root", "transitionTimingFunction", "direct-longhand"],
      ["input", "root", "transition", "omit-shorthand"]
    ] satisfies readonly ExpectedPreviewConsumptionPolicy[];

    expectedPolicies.forEach(([componentNamespace, slot, property, mode]) => {
      expect(
        getPreviewRuntimeConsumptionMode({
          componentNamespace,
          property,
          slot,
          target: "preview-react-inline"
        })
      ).toBe(mode);
    });
  });
});

type ExpectedPreviewConsumptionPolicy = readonly [
  PreviewRuntimeComponentNamespace,
  PreviewRuntimeSlot,
  PreviewRuntimeProperty,
  PreviewRuntimeConsumptionMode
];

function resolveDefaultPreviews() {
  const tokens = createDesignTokensForTest(initialDesignState);
  const tokenResolver = createTokenResolver(
    tokens,
    initialDesignState.component.kind
  );

  return {
    resolvedButton: resolveComponent(buttonSchema, tokenResolver, {
      ...initialDesignState.variantSelections.button,
      state: "default"
    }),
    resolvedInput: resolveComponent(inputSchema, tokenResolver, {
      state: "default"
    })
  };
}

function getStyleAttribute(markup: string, marker: string) {
  const styleAttribute = markup
    .match(/style="([^"]*)"/g)
    ?.find((style) => style.includes(marker));

  expect(styleAttribute).toBeDefined();

  return styleAttribute ?? "";
}

function expectRootStyleNotToRenderTransitionShorthand(style: string) {
  expect(style).not.toMatch(/(^|;)transition:/);
}
