import type { DesignTokens } from "../../features/design-generator/useDesignTokens";
import type { ComponentKind } from "../../features/design-generator/types";

export type TokenResolver = {
  get(path: string): string;
};

type TokenMapEntry =
  | keyof DesignTokens
  | ((componentKind: ComponentKind) => string);

const tokenPathMap = {
  "component.button.intent.primary.background": "--color-accent",
  "component.button.elevation": (componentKind) =>
    `--${componentKind}-elevation`,
  "component.button.paddingBlock": (componentKind) =>
    `--${componentKind}-density`,
  "component.button.paddingInline": (componentKind) =>
    `--${componentKind}-density`,
  "component.button.radius": (componentKind) => `--${componentKind}-radius`,
  "component.button.size.lg.paddingBlock": (componentKind) =>
    `--${componentKind}-density`,
  "component.button.size.md.paddingBlock": "--layout-radius",
  "component.button.size.sm.paddingBlock": "--motion-distance",
  "component.button.state.active.paddingInline": "--layout-radius",
  "component.button.state.focus.paddingBlock": "--layout-radius",
  "component.button.state.focus.ring": "--layout-elevation",
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
          : tokenMapEntry;
      const value = tokens[tokenName];

      if (value === undefined) {
        throw new Error(
          `Token path "${path}" resolved to missing token "${tokenName}".`
        );
      }

      return value;
    }
  };
}
