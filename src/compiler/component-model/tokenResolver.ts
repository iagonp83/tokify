import type { DesignTokens } from "../../features/design-generator/useDesignTokens";

export type TokenResolver = {
  get(path: string): string;
};

const tokenPathMap = {
  "component.button.intent.primary.background": "--color-accent",
  "component.button.paddingBlock": "--layout-density",
  "component.button.paddingInline": "--layout-density",
  "component.button.radius": "--layout-radius",
  "component.button.size.lg.height": "--layout-density",
  "component.button.size.md.height": "--layout-density",
  "component.button.size.sm.height": "--layout-density",
  "motion.duration.fast": "--motion-duration",
  "motion.ease.standard": "--motion-ease",
  "semantic.color.accent": "--color-accent",
  "semantic.color.onAccent": "--color-accent"
} as const;

export type TokenPath = keyof typeof tokenPathMap;

export function createTokenResolver(tokens: DesignTokens): TokenResolver {
  return {
    get(path) {
      const tokenName = tokenPathMap[path as TokenPath];

      if (!tokenName) {
        throw new Error(`Token path "${path}" is not mapped to the token engine.`);
      }

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
