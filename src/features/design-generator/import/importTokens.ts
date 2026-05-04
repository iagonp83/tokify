import { initialDesignState } from "../presets";
import { componentKinds } from "../tokens/componentTokens";
import type {
  ComponentKind,
  ComponentTokenOverrides,
  DesignState,
  LayoutState,
  MotionState
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
};

type ComponentTokenGroup = {
  layout?: TokenGroup["layout"];
  motion?: Pick<NonNullable<TokenGroup["motion"]>, "duration">;
};

type ImportPayload = TokenGroup & {
  components?: Partial<Record<ComponentKind, ComponentTokenGroup>>;
  global?: TokenGroup;
};

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

  return {
    ...initialDesignState,
    color,
    layout,
    motion,
    componentTokens: readComponentTokens(payload.components, layout, motion)
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
