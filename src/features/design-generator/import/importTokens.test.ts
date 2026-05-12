import { describe, expect, it } from "vitest";
import { initialDesignState } from "../presets";
import { useDesignTokens } from "../useDesignTokens";
import { importTokens } from "./importTokens";

describe("importTokens", () => {
  it("imports additively and falls back to existing defaults for missing groups", () => {
    const imported = importTokens({
      global: {
        color: {
          accent: "#24486f"
        }
      }
    });

    expect(imported.color).toEqual({
      accent: "#24486f",
      onAccent: initialDesignState.color.onAccent
    });
    expect(imported.layout).toEqual(initialDesignState.layout);
    expect(imported.motion).toEqual({
      ...initialDesignState.motion,
      presetId: "imported"
    });
    expect(imported.component).toEqual(initialDesignState.component);
    expect(imported.variantSelections).toEqual(
      initialDesignState.variantSelections
    );
  });

  it("falls back to legacy components when overrides are absent", () => {
    const imported = importTokens({
      global: {
        color: {
          accent: "#305070",
          onAccent: "#ffffff"
        },
        layout: {
          density: "12px",
          elevation: "0 3px 6px rgb(18 28 23 / 0.18)",
          radius: "5px"
        },
        motion: {
          delay: "10ms",
          distance: "3px",
          duration: "150ms",
          ease: "ease-out",
          stagger: "20ms"
        }
      },
      components: {
        card: {
          layout: {
            radius: "14px"
          },
          motion: {
            duration: "260ms"
          }
        }
      }
    });

    expect(imported.componentTokens.card).toEqual({
      layout: {
        density: 12,
        elevation: 3,
        radius: 14
      },
      motion: {
        duration: 260
      }
    });
    expect(imported.componentTokens.toolbar).toEqual({});
    expect(imported.componentTokens.panel).toEqual({});
  });

  it("preserves partial overrides and ignores legacy components when overrides exist", () => {
    const imported = importTokens({
      global: {
        color: {
          accent: "#305070"
        }
      },
      components: {
        card: {
          layout: {
            density: "99px"
          }
        }
      },
      overrides: {
        button: {
          layout: {
            radius: "18px"
          }
        },
        card: {
          motion: {
            duration: "220ms"
          }
        }
      }
    });

    expect(imported.componentTokens.card).toEqual({
      motion: {
        duration: 220
      }
    });
    expect(imported.componentTokens.button).toEqual({
      layout: {
        radius: 18
      }
    });
    expect(imported.componentTokens.toolbar).toEqual({});
    expect(imported.componentTokens.panel).toEqual({});
  });

  it("imports legacy authored namespace override wrappers", () => {
    const imported = importTokens({
      overrides: {
        input: {
          override: {
            layout: {
              density: "24px"
            },
            motion: {
              duration: "310ms"
            }
          }
        }
      }
    });

    expect(imported.componentTokens.input).toEqual({
      layout: {
        density: 24
      },
      motion: {
        duration: 310
      }
    });
  });

  it("imports global state tokens when present and otherwise token generation falls back", () => {
    const imported = importTokens({
      global: {
        color: {
          accent: "#24486f"
        },
        state: {
          activeOpacity: "0.68",
          hoverBackground: "#18324f"
        }
      }
    });

    const tokens = useDesignTokens(imported);

    expect(imported.state).toEqual({
      activeOpacity: "0.68",
      hoverBackground: "#18324f"
    });
    expect(tokens["--state-active-opacity"]).toBe("0.68");
    expect(tokens["--state-hover-background"]).toBe("#18324f");
    expect(tokens["--state-disabled-opacity"]).toBe("0.48");
  });

  it("reports current diagnostics for invalid payloads", () => {
    expect(() => importTokens(null)).toThrow("Formato de tokens invalido.");
    expect(() =>
      importTokens({
        global: {
          layout: {
            density: {}
          }
        }
      })
    ).toThrow("Token global.layout.density invalido.");
  });

  it("does not import runtimePlan, emitted runtime variables, or composition graph fields", () => {
    const imported = importTokens({
      global: {
        color: {
          accent: "#24486f"
        }
      },
      runtimePlan: {
        variables: [{ name: "--button-background" }]
      },
      emittedRuntimeVariables: {
        "--button-background": "red"
      },
      composition: {
        children: [{ component: "Input", name: "field" }]
      }
    });

    expect(imported).not.toHaveProperty("runtimePlan");
    expect(imported).not.toHaveProperty("emittedRuntimeVariables");
    expect(imported).not.toHaveProperty("composition");
    expect(JSON.stringify(imported)).not.toContain("--button-background");
    expect(imported.componentTokens).toEqual(initialDesignState.componentTokens);
  });
});
