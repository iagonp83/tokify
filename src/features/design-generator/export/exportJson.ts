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
        accent: tokens["--color-accent"]
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
