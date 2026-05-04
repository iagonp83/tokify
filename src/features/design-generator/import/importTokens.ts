import { initialDesignState } from "../presets";
import { componentKinds } from "../tokens/componentTokens";
import type {
  AuthoredComponentNamespace,
  ComponentKind,
  ComponentNamespace,
  ComponentTokenOverrides,
  DesignState,
  LayoutState,
  MotionState,
  StateTokensState
} from "../types";

type TokenGroup = {
  color?: {
    accent?: unknown;
    onAccent?: unknown;
  };
  layout?: {
    density?: unknown;
    elevation?: unknown;
    radius?: unknown;
  };
  motion?: {
    delay?: unknown;
    distance?: unknown;
    duration?: unknown;
    ease?: unknown;
    stagger?: unknown;
  };
  state?: {
    activeOpacity?: unknown;
    disabledOpacity?: unknown;
    focusRing?: unknown;
    hoverBackground?: unknown;
  };
};

type ComponentTokenGroup = {
  layout?: TokenGroup["layout"];
  motion?: Pick<NonNullable<TokenGroup["motion"]>, "duration">;
};

type ImportPayload = TokenGroup & {
  components?: Partial<Record<ComponentKind, ComponentTokenGroup>>;
  global?: TokenGroup;
  overrides?: Partial<Record<ComponentNamespace, ComponentTokenGroup>>;
};

const authoredComponentNamespaces: AuthoredComponentNamespace[] = [
  "button",
  "input"
];

export function parseDesignState(input: unknown): DesignState {
  if (!isObject(input)) {
    throw new Error("Formato de tokens invalido.");
  }

  const payload = input as ImportPayload;
  const globalTokens = payload.global ?? payload;
  const color = {
    accent: readString(
      globalTokens.color?.accent,
      initialDesignState.color.accent,
      "global.color.accent"
    ),
    onAccent: readString(
      globalTokens.color?.onAccent,
      initialDesignState.color.onAccent ?? "#ffffff",
      "global.color.onAccent"
    )
  };
  const layout = readLayout(globalTokens.layout, initialDesignState.layout, "global");
  const motion = readMotion(globalTokens.motion, initialDesignState.motion, "global");
  const state = readState(globalTokens.state, "global");

  return {
    ...initialDesignState,
    color,
    layout,
    motion,
    state,
    componentTokens: payload.overrides
      ? readAuthoredComponentOverrides(payload.overrides)
      : readComponentTokens(payload.components, layout, motion)
  };
}

export const importTokens = parseDesignState;

function readComponentTokens(
  components: ImportPayload["components"],
  globalLayout: LayoutState,
  globalMotion: MotionState
): DesignState["componentTokens"] {
  return componentKinds.reduce<DesignState["componentTokens"]>(
    (componentTokens, componentKind) => ({
      ...componentTokens,
      [componentKind]: readComponentTokenOverrides(
        components?.[componentKind],
        componentKind,
        globalLayout,
        globalMotion
      )
    }),
    initialDesignState.componentTokens
  );
}

function readComponentTokenOverrides(
  component: ComponentTokenGroup | undefined,
  componentKind: ComponentKind,
  globalLayout: LayoutState,
  globalMotion: MotionState
): ComponentTokenOverrides {
  if (!component) {
    return {};
  }

  return {
    layout: readLayout(component.layout, globalLayout, `components.${componentKind}`),
    motion: {
      duration: readUnitNumber(
        component.motion?.duration,
        globalMotion.duration,
        `components.${componentKind}.motion.duration`,
        "ms"
      )
    }
  };
}

function readAuthoredComponentOverrides(
  overrides: ImportPayload["overrides"]
): DesignState["componentTokens"] {
  const componentTokenOverrides = componentKinds.reduce<
    DesignState["componentTokens"]
  >(
    (componentTokens, componentKind) => ({
      ...componentTokens,
      [componentKind]: readAuthoredComponentOverride(
        overrides?.[componentKind],
        componentKind
      )
    }),
    initialDesignState.componentTokens
  );

  return authoredComponentNamespaces.reduce<DesignState["componentTokens"]>(
    (componentTokens, namespace) => {
      const namespaceOverride = readAuthoredComponentOverride(
        overrides?.[namespace],
        namespace
      );

      if (!namespaceOverride.layout && !namespaceOverride.motion) {
        return componentTokens;
      }

      return {
        ...componentTokens,
        [namespace]: namespaceOverride
      };
    },
    componentTokenOverrides
  );
}

function readAuthoredComponentOverride(
  component: ComponentTokenGroup | undefined,
  componentKind: ComponentNamespace
): ComponentTokenOverrides {
  if (!component) {
    return {};
  }

  const layout = readLayoutOverride(
    component.layout,
    `overrides.${componentKind}`
  );
  const motion = readMotionOverride(
    component.motion,
    `overrides.${componentKind}`
  );

  return {
    ...(layout ? { layout } : {}),
    ...(motion ? { motion } : {})
  };
}

function readLayoutOverride(
  layout: TokenGroup["layout"],
  path: string
): ComponentTokenOverrides["layout"] {
  if (!layout) {
    return undefined;
  }

  const parsedLayout: ComponentTokenOverrides["layout"] = {};

  if (layout.density !== undefined) {
    parsedLayout.density = readUnitNumber(
      layout.density,
      initialDesignState.layout.density,
      `${path}.layout.density`,
      "px"
    );
  }

  if (layout.elevation !== undefined) {
    parsedLayout.elevation = readElevation(
      layout.elevation,
      initialDesignState.layout.elevation,
      `${path}.layout.elevation`
    );
  }

  if (layout.radius !== undefined) {
    parsedLayout.radius = readUnitNumber(
      layout.radius,
      initialDesignState.layout.radius,
      `${path}.layout.radius`,
      "px"
    );
  }

  return Object.keys(parsedLayout).length > 0 ? parsedLayout : undefined;
}

function readMotionOverride(
  motion: ComponentTokenGroup["motion"],
  path: string
): ComponentTokenOverrides["motion"] {
  if (!motion) {
    return undefined;
  }

  const parsedMotion: ComponentTokenOverrides["motion"] = {};

  if (motion.duration !== undefined) {
    parsedMotion.duration = readUnitNumber(
      motion.duration,
      initialDesignState.motion.duration,
      `${path}.motion.duration`,
      "ms"
    );
  }

  return Object.keys(parsedMotion).length > 0 ? parsedMotion : undefined;
}

function readLayout(
  layout: TokenGroup["layout"],
  defaults: LayoutState,
  path: string
): LayoutState {
  return {
    density: readUnitNumber(layout?.density, defaults.density, `${path}.layout.density`, "px"),
    elevation: readElevation(layout?.elevation, defaults.elevation, `${path}.layout.elevation`),
    radius: readUnitNumber(layout?.radius, defaults.radius, `${path}.layout.radius`, "px")
  };
}

function readMotion(
  motion: TokenGroup["motion"],
  defaults: MotionState,
  path: string
): MotionState {
  return {
    delay: readUnitNumber(motion?.delay, defaults.delay, `${path}.motion.delay`, "ms"),
    distance: readUnitNumber(
      motion?.distance,
      defaults.distance,
      `${path}.motion.distance`,
      "px"
    ),
    duration: readUnitNumber(
      motion?.duration,
      defaults.duration,
      `${path}.motion.duration`,
      "ms"
    ),
    ease: readString(motion?.ease, defaults.ease, `${path}.motion.ease`),
    presetId: "imported",
    stagger: readUnitNumber(
      motion?.stagger,
      defaults.stagger,
      `${path}.motion.stagger`,
      "ms"
    )
  };
}

function readState(
  state: TokenGroup["state"],
  path: string
): Partial<StateTokensState> | undefined {
  if (!state) {
    return undefined;
  }

  const parsedState: Partial<StateTokensState> = {};

  if (state.activeOpacity !== undefined) {
    parsedState.activeOpacity = readString(
      state.activeOpacity,
      "0.8",
      `${path}.state.activeOpacity`
    );
  }

  if (state.disabledOpacity !== undefined) {
    parsedState.disabledOpacity = readString(
      state.disabledOpacity,
      "0.48",
      `${path}.state.disabledOpacity`
    );
  }

  if (state.focusRing !== undefined) {
    parsedState.focusRing = readString(
      state.focusRing,
      "",
      `${path}.state.focusRing`
    );
  }

  if (state.hoverBackground !== undefined) {
    parsedState.hoverBackground = readString(
      state.hoverBackground,
      "",
      `${path}.state.hoverBackground`
    );
  }

  return parsedState;
}

function readString(value: unknown, fallback: string, fieldName: string) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Token ${fieldName} invalido.`);
  }

  return value;
}

function readUnitNumber(
  value: unknown,
  fallback: number,
  fieldName: string,
  unit: "ms" | "px"
) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`Token ${fieldName} invalido.`);
  }

  const numberValue = Number.parseFloat(String(value).trim().replace(unit, ""));

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Token ${fieldName} invalido.`);
  }

  return numberValue;
}

function readElevation(value: unknown, fallback: number, fieldName: string) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    throw new Error(`Token ${fieldName} invalido.`);
  }

  const match = value.match(/^0\s+([\d.]+)px\s+([\d.]+)px/);

  if (!match) {
    throw new Error(`Token ${fieldName} invalido.`);
  }

  return Number.parseFloat(match[2]) / 2;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
