import type { ColorState } from "../types";

export function createColorTokens(color: ColorState) {
  return {
    "--color-accent": color.accent,
    "--state-active-opacity": "0.8",
    "--state-disabled-opacity": "0.48",
    "--state-focus-ring": `0 0 0 3px color-mix(in srgb, ${color.accent} 35%, transparent)`,
    "--state-hover-background": `color-mix(in srgb, ${color.accent} 82%, black)`
  };
}
