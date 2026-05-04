import type { DesignTokens } from "../useDesignTokens";
import { componentKinds } from "../tokens/componentTokens";

const globalTokenOrder = [
  "--color-accent",
  "--layout-radius",
  "--layout-density",
  "--layout-elevation",
  "--motion-duration",
  "--motion-ease",
  "--motion-distance",
  "--motion-delay",
  "--motion-stagger",
  "--motion-transition-property",
  "--state-hover-background",
  "--state-active-opacity",
  "--state-focus-ring",
  "--state-disabled-opacity"
] as const;

export function exportCss(tokens: DesignTokens) {
  const globalDeclarations = globalTokenOrder
    .map((tokenName) => `  ${tokenName}: ${tokens[tokenName]};`)
    .join("\n");

  const componentBlocks = componentKinds
    .map((componentKind) => {
      const declarations = [
        `  --${componentKind}-radius: ${tokens[`--${componentKind}-radius`]};`,
        `  --${componentKind}-density: ${tokens[`--${componentKind}-density`]};`,
        `  --${componentKind}-elevation: ${
          tokens[`--${componentKind}-elevation`]
        };`,
        `  --${componentKind}-motion-duration: ${
          tokens[`--${componentKind}-motion-duration`]
        };`
      ].join("\n");

      return `[data-component="${componentKind}"] {\n${declarations}\n}`;
    })
    .join("\n\n");

  return `:root {\n${globalDeclarations}\n}\n\n${componentBlocks}`;
}
