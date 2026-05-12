import { describe, expect, it } from "vitest";
import type { DesignState } from "../types";
import { useDesignTokens } from "../useDesignTokens";
import { exportJson } from "./exportJson";

function createState(): DesignState {
  return {
    color: {
      accent: "#315f82",
      onAccent: "#fdfdfd"
    },
    component: {
      kind: "toolbar"
    },
    componentTokens: {
      card: {
        layout: {
          density: 16
        }
      },
      panel: {},
      toolbar: {
        motion: {
          duration: 210
        }
      },
      button: {
        layout: {
          radius: 22
        }
      },
      input: {
        motion: {
          duration: 330
        }
      }
    },
    layout: {
      density: 12,
      elevation: 7,
      radius: 5
    },
    motion: {
      delay: 25,
      distance: 4,
      duration: 140,
      ease: "ease-in-out",
      presetId: "test",
      stagger: 35
    },
    state: {
      activeOpacity: "0.7",
      disabledOpacity: "0.42",
      focusRing: "0 0 0 4px #315f82",
      hoverBackground: "#214763"
    },
    variantSelections: {}
  };
}

function collectObjectKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => [
    key,
    ...collectObjectKeys(nestedValue)
  ]);
}

describe("exportJson", () => {
  it("exports global color, state, layout, and motion token groups", () => {
    const exported = exportJson(useDesignTokens(createState()), createState());

    expect(exported.global.color).toEqual({
      accent: "#315f82",
      onAccent: "#fdfdfd"
    });
    expect(exported.global.state).toEqual({
      activeOpacity: "0.7",
      disabledOpacity: "0.42",
      focusRing: "0 0 0 4px #315f82",
      hoverBackground: "#214763"
    });
    expect(exported.global.layout).toEqual({
      density: "12px",
      elevation: "0 4px 14px rgb(18 28 23 / 0.18)",
      radius: "5px"
    });
    expect(exported.global.motion).toMatchObject({
      delay: "25ms",
      distance: "4px",
      duration: "140ms",
      ease: "ease-in-out",
      property:
        "background-color, border-color, border-radius, box-shadow, color, opacity, padding",
      stagger: "35ms"
    });
  });

  it("exports the backward-compatible resolved component shape", () => {
    const state = createState();
    const exported = exportJson(useDesignTokens(state), state);

    expect(Object.keys(exported.components)).toEqual([
      "card",
      "toolbar",
      "panel"
    ]);
    expect(exported.components.card).toEqual({
      layout: {
        density: "16px",
        elevation: "0 4px 14px rgb(18 28 23 / 0.18)",
        radius: "5px"
      },
      motion: {
        duration: "140ms"
      }
    });
    expect(exported.components.toolbar.motion).toEqual({
      duration: "210ms"
    });
  });

  it("serializes only authored override fields and preserves partialness", () => {
    const state = createState();
    const exported = exportJson(useDesignTokens(state), state);

    expect(exported.overrides).toEqual({
      card: {
        layout: {
          density: "16px"
        }
      },
      toolbar: {
        motion: {
          duration: "210ms"
        }
      },
      button: {
        layout: {
          radius: "22px"
        }
      },
      input: {
        motion: {
          duration: "330ms"
        }
      }
    });
  });

  it("does not export runtimePlan, emitted runtime variables, or composition graph fields", () => {
    const state = createState();
    const exported = exportJson(useDesignTokens(state), state);
    const keys = collectObjectKeys(exported);

    expect(keys).not.toContain("runtimePlan");
    expect(keys).not.toContain("variables");
    expect(keys.some((key) => key.startsWith("--"))).toBe(false);
    expect(JSON.stringify(exported)).not.toContain("--button-background");
    expect(JSON.stringify(exported)).not.toContain("--button-label-color");
    expect(keys).not.toContain("composition");
    expect(keys).not.toContain("children");
  });
});
