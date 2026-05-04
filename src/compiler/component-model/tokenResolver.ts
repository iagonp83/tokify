import type { DesignTokens } from "../../features/design-generator/useDesignTokens";
import type { ComponentKind } from "../../features/design-generator/types";

export type TokenResolver = {
  get(path: string): string;
};

type TokenMapEntry =
  | keyof DesignTokens
  | ((componentKind: ComponentKind) => string)
  | {
      fallback: (componentKind: ComponentKind) => string;
      token: keyof DesignTokens;
    };

const tokenPathMap = {
  "component.button.intent.primary.background": "--color-accent",
  "component.button.elevation": {
    fallback: (componentKind) => `--${componentKind}-elevation`,
    token: "--button-elevation"
  },
  "component.button.motion.duration": {
    fallback: (componentKind) => `--${componentKind}-motion-duration`,
    token: "--button-motion-duration"
  },
  "component.button.paddingBlock": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.paddingInline": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.radius": {
    fallback: (componentKind) => `--${componentKind}-radius`,
    token: "--button-radius"
  },
  "component.button.size.lg.paddingBlock": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.size.md.paddingBlock": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.size.sm.paddingBlock": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.state.active.paddingInline": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.state.focus.paddingBlock": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--button-density"
  },
  "component.button.state.focus.ring": "--state-focus-ring",
  "component.input.motion.duration": {
    fallback: (componentKind) => `--${componentKind}-motion-duration`,
    token: "--input-motion-duration"
  },
  "component.input.paddingBlock": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--input-density"
  },
  "component.input.paddingInline": {
    fallback: (componentKind) => `--${componentKind}-density`,
    token: "--input-density"
  },
  "component.input.radius": {
    fallback: (componentKind) => `--${componentKind}-radius`,
    token: "--input-radius"
  },
  "motion.delay.none": "--motion-delay",
  "motion.duration.fast": (componentKind) =>
    `--${componentKind}-motion-duration`,
  "motion.ease.standard": "--motion-ease",
  "motion.transition.property": "--motion-transition-property",
  "semantic.color.accent": "--color-accent",
  "semantic.color.onAccent": "--color-on-accent",
  "semantic.state.active.opacity": "--state-active-opacity",
  "semantic.state.disabled.opacity": "--state-disabled-opacity",
  "semantic.state.focus.ring": "--state-focus-ring",
  "semantic.state.hover.background": "--state-hover-background"
} satisfies Record<string, TokenMapEntry>;

export type TokenPath = keyof typeof tokenPathMap;

export function createTokenResolver(
  tokens: DesignTokens,
  componentKind: ComponentKind = "card"
): TokenResolver {
  return {
    get(path) {
      const tokenMapEntry = tokenPathMap[path as TokenPath];

      if (!tokenMapEntry) {
        throw new Error(`Token path "${path}" is not mapped to the token engine.`);
      }

      const tokenName =
        typeof tokenMapEntry === "function"
          ? tokenMapEntry(componentKind)
          : typeof tokenMapEntry === "object"
            ? tokenMapEntry.token
            : tokenMapEntry;
      const value = tokens[tokenName];

      if (value === undefined && typeof tokenMapEntry === "object") {
        const fallbackTokenName = tokenMapEntry.fallback(componentKind);
        const fallbackValue = tokens[fallbackTokenName];

        if (fallbackValue !== undefined) {
          return fallbackValue;
        }
      }

      if (value === undefined) {
        throw new Error(
          `Token path "${path}" resolved to missing token "${tokenName}".`
        );
      }

      return value;
    }
  };
}
