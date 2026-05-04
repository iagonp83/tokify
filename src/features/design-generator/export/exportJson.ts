import type { DesignTokens } from "../useDesignTokens";
import { componentKinds, formatElevation } from "../tokens/componentTokens";
import type {
  ComponentKind,
  ComponentTokenOverrides,
  DesignState
} from "../types";

type ExportedComponentOverride = {
  layout?: {
    density?: string;
    elevation?: string;
    radius?: string;
  };
  motion?: {
    duration?: string;
  };
};

export type ExportedDesignTokens = {
  components: Record<
    ComponentKind,
    {
      layout: {
        density: string;
        elevation: string;
        radius: string;
      };
      motion: {
        duration: string;
      };
    }
  >;
  overrides: Partial<Record<ComponentKind, ExportedComponentOverride>>;
  global: {
    color: {
      accent: string;
      onAccent: string;
    };
    state: {
      activeOpacity: string;
      disabledOpacity: string;
      focusRing: string;
      hoverBackground: string;
    };
    layout: {
      density: string;
      elevation: string;
      radius: string;
    };
      motion: {
        delay: string;
        distance: string;
        duration: string;
        ease: string;
        property: string;
        stagger: string;
      };
  };
};

export function exportJson(
  tokens: DesignTokens,
  state?: DesignState
): ExportedDesignTokens {
  return {
    global: {
      color: {
        accent: tokens["--color-accent"],
        onAccent: tokens["--color-on-accent"]
      },
      state: {
        activeOpacity: tokens["--state-active-opacity"],
        disabledOpacity: tokens["--state-disabled-opacity"],
        focusRing: tokens["--state-focus-ring"],
        hoverBackground: tokens["--state-hover-background"]
      },
      layout: {
        density: tokens["--layout-density"],
        elevation: tokens["--layout-elevation"],
        radius: tokens["--layout-radius"]
      },
      motion: {
        delay: tokens["--motion-delay"],
        distance: tokens["--motion-distance"],
        duration: tokens["--motion-duration"],
        ease: tokens["--motion-ease"],
        property: tokens["--motion-transition-property"],
        stagger: tokens["--motion-stagger"]
      }
    },
    overrides: exportComponentOverrides(state?.componentTokens),
    components: componentKinds.reduce<ExportedDesignTokens["components"]>(
      (components, componentKind) => ({
        ...components,
        [componentKind]: {
          layout: {
            density: tokens[`--${componentKind}-density`],
            elevation: tokens[`--${componentKind}-elevation`],
            radius: tokens[`--${componentKind}-radius`]
          },
          motion: {
            duration: tokens[`--${componentKind}-motion-duration`]
          }
        }
      }),
      {} as ExportedDesignTokens["components"]
    )
  };
}

function exportComponentOverrides(
  componentTokens: DesignState["componentTokens"] | undefined
): ExportedDesignTokens["overrides"] {
  if (!componentTokens) {
    return {};
  }

  return componentKinds.reduce<ExportedDesignTokens["overrides"]>(
    (overrides, componentKind) => {
      const componentOverride = exportComponentOverride(
        componentTokens[componentKind]
      );

      if (!componentOverride) {
        return overrides;
      }

      return {
        ...overrides,
        [componentKind]: componentOverride
      };
    },
    {}
  );
}

function exportComponentOverride(
  override: ComponentTokenOverrides | undefined
): ExportedComponentOverride | undefined {
  if (!override) {
    return undefined;
  }

  const layout = exportLayoutOverride(override);
  const motion = exportMotionOverride(override);
  const exportedOverride = {
    ...(layout ? { layout } : {}),
    ...(motion ? { motion } : {})
  };

  return Object.keys(exportedOverride).length > 0
    ? exportedOverride
    : undefined;
}

function exportLayoutOverride(override: ComponentTokenOverrides) {
  const layout = {
    ...(override.layout?.density !== undefined
      ? { density: `${override.layout.density}px` }
      : {}),
    ...(override.layout?.elevation !== undefined
      ? { elevation: formatElevation(override.layout.elevation) }
      : {}),
    ...(override.layout?.radius !== undefined
      ? { radius: `${override.layout.radius}px` }
      : {})
  };

  return Object.keys(layout).length > 0 ? layout : undefined;
}

function exportMotionOverride(override: ComponentTokenOverrides) {
  const motion = {
    ...(override.motion?.duration !== undefined
      ? { duration: `${override.motion.duration}ms` }
      : {})
  };

  return Object.keys(motion).length > 0 ? motion : undefined;
}
