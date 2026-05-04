import type { ColorState } from "../types";

export const DEFAULT_COLOR_ON_ACCENT = "#ffffff";

export function createColorTokens(color: ColorState) {
  return {
    "--color-accent": color.accent,
    "--color-on-accent": color.onAccent ?? DEFAULT_COLOR_ON_ACCENT,
    "--state-active-opacity": "0.8",
    "--state-disabled-opacity": "0.48",
    "--state-focus-ring": `0 0 0 3px color-mix(in srgb, ${color.accent} 35%, transparent)`,
    "--state-hover-background": `color-mix(in srgb, ${color.accent} 82%, black)`
  };
}
