import { describe, expect, it } from "vitest";
import type { DesignState } from "../types";
import { useDesignTokens } from "../useDesignTokens";
import { exportCss } from "./exportCss";

function createState(): DesignState {
  return {
    color: {
      accent: "#123456",
      onAccent: "#f8f9fa"
    },
    component: {
      kind: "card"
    },
    componentTokens: {
      card: {
        layout: {
          density: 10,
          elevation: 6,
          radius: 4
        },
        motion: {
          duration: 120
        }
      },
      panel: {
        layout: {
          density: 18,
          elevation: 14,
          radius: 8
        },
        motion: {
          duration: 240
        }
      },
      toolbar: {
        layout: {
          density: 14,
          elevation: 10,
          radius: 6
        },
        motion: {
          duration: 180
        }
      }
    },
    layout: {
      density: 12,
      elevation: 8,
      radius: 5
    },
    motion: {
      delay: 30,
      distance: 9,
      duration: 150,
      ease: "ease-out",
      presetId: "test",
      stagger: 45
    },
    state: {
      activeOpacity: "0.72",
      disabledOpacity: "0.38",
      focusRing: "0 0 0 2px #123456",
      hoverBackground: "#102030"
    },
    variantSelections: {}
  };
}

function cssDeclarationNames(css: string) {
  return css
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("--"))
    .map((line) => line.slice(0, line.indexOf(":")));
}

describe("exportCss", () => {
  it("emits stable flat CSS variables in deterministic order", () => {
    const css = exportCss(useDesignTokens(createState()));

    expect(cssDeclarationNames(css)).toEqual([
      "--color-accent",
      "--color-on-accent",
      "--layout-radius",
      "--layout-density",
      "--layout-elevation",
      "--motion-duration",
      "--motion-ease",
      "--motion-distance",
      "--motion-delay",
      "--motion-stagger",
      "--motion-transition-property",
      "--state-hover-background",
      "--state-active-opacity",
      "--state-focus-ring",
      "--state-disabled-opacity",
      "--card-radius",
      "--card-density",
      "--card-elevation",
      "--card-motion-duration",
      "--toolbar-radius",
      "--toolbar-density",
      "--toolbar-elevation",
      "--toolbar-motion-duration",
      "--panel-radius",
      "--panel-density",
      "--panel-elevation",
      "--panel-motion-duration"
    ]);
  });

  it("preserves the flat runtime contract without nested token structures", () => {
    const css = exportCss(useDesignTokens(createState()));

    expect(css).toContain(":root {");
    expect(css).toContain('[data-component="card"] {');
    expect(css).toContain('[data-component="toolbar"] {');
    expect(css).toContain('[data-component="panel"] {');
    expect(css).not.toContain("componentTokens");
    expect(css).not.toContain("button:");
    expect(css).not.toContain("input:");
    expect(css).not.toContain("layout:");
    expect(css).not.toContain("motion:");
  });

  it("does not export runtimePlan, emitted runtime variables, or composition graph fields", () => {
    const css = exportCss(useDesignTokens(createState()));

    expect(css).not.toContain("runtimePlan");
    expect(css).not.toContain("--button-background");
    expect(css).not.toContain("--button-label-color");
    expect(css).not.toContain("--input-background");
    expect(css).not.toContain("composition");
    expect(css).not.toContain("children");
  });
});
