import type { DesignTokens } from "../useDesignTokens";
import { componentKinds } from "../tokens/componentTokens";
import type { ComponentKind } from "../types";

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

export function exportJson(tokens: DesignTokens): ExportedDesignTokens {
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
