import { describe, expect, it } from "vitest";
import type { DesignTokens } from "../../features/design-generator/useDesignTokens";
import { createTokenResolver } from "./tokenResolver";

function createTokens(tokens: Record<string, string>): DesignTokens {
  return tokens as DesignTokens;
}

describe("createTokenResolver", () => {
  it("resolves direct token path mappings", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--color-accent": "#1d7a5f"
      })
    );

    expect(resolver.get("semantic.color.accent")).toBe("#1d7a5f");
  });

  it("resolves computed secondary button background mappings", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--color-accent": "#1d7a5f",
        "--color-on-accent": "#ffffff"
      })
    );

    expect(resolver.get("component.button.intent.secondary.background")).toBe(
      "color-mix(in srgb, #1d7a5f 12%, #ffffff)"
    );
  });

  it("routes component-kind motion token mappings for card", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--card-motion-duration": "120ms"
      }),
      "card"
    );

    expect(resolver.get("motion.duration.fast")).toBe("120ms");
  });

  it("routes component-kind motion token mappings for toolbar", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--toolbar-motion-duration": "180ms"
      }),
      "toolbar"
    );

    expect(resolver.get("motion.duration.fast")).toBe("180ms");
  });

  it("routes component-kind motion token mappings for panel", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--panel-motion-duration": "240ms"
      }),
      "panel"
    );

    expect(resolver.get("motion.duration.fast")).toBe("240ms");
  });

  it("prefers authored namespace tokens over inherited component-kind values", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--button-density": "14px",
        "--card-density": "22px"
      }),
      "card"
    );

    expect(resolver.get("component.button.paddingBlock")).toBe("14px");
  });

  it("falls back to the active component kind when namespace token is missing", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--panel-density": "18px"
      }),
      "panel"
    );

    expect(resolver.get("component.button.paddingBlock")).toBe("18px");
  });

  it("walks fallback chains before using the active component kind", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--toolbar-enter-motion-duration": "260ms"
      }),
      "toolbar"
    );

    expect(resolver.get("component.button.motion.duration")).toBe("260ms");
  });

  it("throws when a token path is not mapped", () => {
    const resolver = createTokenResolver(createTokens({}));

    expect(() => resolver.get("semantic.color.unknown")).toThrow(
      'Token path "semantic.color.unknown" is not mapped to the token engine.'
    );
  });

  it("throws when a mapped token is missing", () => {
    const resolver = createTokenResolver(createTokens({}));

    expect(() => resolver.get("semantic.color.accent")).toThrow(
      'Token path "semantic.color.accent" resolved to missing token "--color-accent".'
    );
  });

  it("scales px density tokens through public token paths", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--button-density": "10px"
      })
    );

    expect(resolver.get("component.button.size.md.paddingBlock")).toBe("3px");
  });

  it("scales rem density tokens through public token paths", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--button-density": "1rem"
      })
    );

    expect(resolver.get("component.button.size.md.paddingInline")).toBe("1rem");
  });

  it("returns calc fallback for non-numeric density scaling", () => {
    const resolver = createTokenResolver(
      createTokens({
        "--button-density": "var(--density)"
      })
    );

    expect(resolver.get("component.button.size.sm.paddingBlock")).toBe(
      "calc(var(--density) * 0.2)"
    );
  });
});
