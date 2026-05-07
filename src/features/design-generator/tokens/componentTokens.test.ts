import { describe, expect, it } from "vitest";
import type {
  ComponentKind,
  ComponentNamespace,
  ComponentTokenOverrides,
  DesignState
} from "../types";
import {
  createComponentTokens,
  formatElevation,
  resolveComponentNamespaceTokens,
  resolveComponentTokens
} from "./componentTokens";

function createState(
  patch: Omit<Partial<DesignState>, "component" | "componentTokens"> & {
    component?: Partial<DesignState["component"]>;
    componentTokens?: Partial<Record<ComponentNamespace, ComponentTokenOverrides>>;
  } = {}
): DesignState {
  const state: DesignState = {
    color: {
      accent: "#1d7a5f",
      onAccent: "#ffffff"
    },
    component: {
      kind: "card"
    },
    componentTokens: {
      card: {
        layout: {
          density: 12,
          elevation: 8
        },
        motion: {
          duration: 120
        }
      },
      toolbar: {
        layout: {
          density: 20,
          radius: 10
        },
        motion: {
          duration: 180
        }
      },
      panel: {
        layout: {
          density: 28,
          elevation: 16,
          radius: 14
        },
        motion: {
          duration: 240
        }
      }
    },
    layout: {
      density: 8,
      elevation: 4,
      radius: 6
    },
    motion: {
      delay: 30,
      distance: 12,
      duration: 90,
      ease: "ease-out",
      presetId: "test",
      stagger: 20
    },
    state: {},
    variantSelections: {}
  };

  return {
    ...state,
    ...patch,
    component: {
      ...state.component,
      ...patch.component
    },
    componentTokens: {
      ...state.componentTokens,
      ...patch.componentTokens
    }
  };
}

function withComponentKind(state: DesignState, kind: ComponentKind): DesignState {
  return {
    ...state,
    component: {
      ...state.component,
      kind
    }
  };
}

describe("component token resolution", () => {
  it("layers component card tokens over global layout and motion", () => {
    const resolved = resolveComponentTokens(createState(), "card");

    expect(resolved).toEqual({
      layout: {
        density: 12,
        elevation: 8,
        radius: 6
      },
      motion: {
        delay: 30,
        distance: 12,
        duration: 120,
        ease: "ease-out",
        presetId: "test",
        stagger: 20
      }
    });
  });

  it("resolves button namespace from the active component kind", () => {
    const state = withComponentKind(createState(), "toolbar");

    expect(resolveComponentNamespaceTokens(state, "button")).toEqual(
      resolveComponentTokens(state, "toolbar")
    );
  });

  it("resolves input namespace from the active component kind", () => {
    const state = withComponentKind(createState(), "panel");

    expect(resolveComponentNamespaceTokens(state, "input")).toEqual(
      resolveComponentTokens(state, "panel")
    );
  });

  it("layers button overrides over the virtual base", () => {
    const state = createState({
      componentTokens: {
        button: {
          layout: {
            radius: 18
          },
          motion: {
            duration: 310
          }
        }
      }
    });

    expect(resolveComponentNamespaceTokens(state, "button")).toEqual({
      layout: {
        density: 12,
        elevation: 8,
        radius: 18
      },
      motion: {
        delay: 30,
        distance: 12,
        duration: 310,
        ease: "ease-out",
        presetId: "test",
        stagger: 20
      }
    });
  });

  it("layers input overrides over the virtual base", () => {
    const state = withComponentKind(
      createState({
        componentTokens: {
          input: {
            layout: {
              density: 34
            },
            motion: {
              duration: 410
            }
          }
        }
      }),
      "panel"
    );

    expect(resolveComponentNamespaceTokens(state, "input")).toEqual({
      layout: {
        density: 34,
        elevation: 16,
        radius: 14
      },
      motion: {
        delay: 30,
        distance: 12,
        duration: 410,
        ease: "ease-out",
        presetId: "test",
        stagger: 20
      }
    });
  });

  it("changes authored namespace base when active component kind changes without overrides", () => {
    const cardState = withComponentKind(createState(), "card");
    const panelState = withComponentKind(createState(), "panel");

    expect(resolveComponentNamespaceTokens(cardState, "button").layout).toEqual({
      density: 12,
      elevation: 8,
      radius: 6
    });
    expect(resolveComponentNamespaceTokens(panelState, "button").layout).toEqual({
      density: 28,
      elevation: 16,
      radius: 14
    });
  });

  it("keeps authored overrides while base switching only changes inherited fields", () => {
    const state = createState({
      componentTokens: {
        button: {
          layout: {
            radius: 22
          }
        }
      }
    });
    const cardResolved = resolveComponentNamespaceTokens(
      withComponentKind(state, "card"),
      "button"
    );
    const toolbarResolved = resolveComponentNamespaceTokens(
      withComponentKind(state, "toolbar"),
      "button"
    );

    expect(cardResolved.layout).toEqual({
      density: 12,
      elevation: 8,
      radius: 22
    });
    expect(toolbarResolved.layout).toEqual({
      density: 20,
      elevation: 4,
      radius: 22
    });
  });

  it("emits flat button and input runtime variables", () => {
    const tokens = createComponentTokens(
      createState({
        componentTokens: {
          button: {
            layout: {
              density: 15,
              elevation: 9,
              radius: 11
            },
            motion: {
              duration: 135
            }
          },
          input: {
            layout: {
              density: 17,
              radius: 13
            },
            motion: {
              duration: 155
            }
          }
        }
      })
    );

    expect(tokens).toMatchObject({
      "--button-density": "15px",
      "--button-elevation": formatElevation(9),
      "--button-enter-motion-duration": "135ms",
      "--button-exit-motion-duration": "135ms",
      "--button-motion-duration": "135ms",
      "--button-radius": "11px",
      "--input-density": "17px",
      "--input-enter-motion-duration": "155ms",
      "--input-exit-motion-duration": "155ms",
      "--input-motion-duration": "155ms",
      "--input-radius": "13px"
    });
  });

  it("does not expose internal namespace structure as runtime output", () => {
    const tokens = createComponentTokens(createState());

    expect(tokens).not.toHaveProperty("button");
    expect(tokens).not.toHaveProperty("input");
    expect(tokens).not.toHaveProperty("componentTokens");
    expect(Object.values(tokens).every((value) => typeof value === "string")).toBe(
      true
    );
  });
});
