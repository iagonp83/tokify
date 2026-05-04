import type { ColorState, StateTokensState } from "../types";

export const DEFAULT_COLOR_ON_ACCENT = "#ffffff";

export function createColorTokens(
  color: ColorState,
  state: Partial<StateTokensState> = {}
) {
  return {
    "--color-accent": color.accent,
    "--color-on-accent": color.onAccent ?? DEFAULT_COLOR_ON_ACCENT,
    "--state-active-opacity": state.activeOpacity ?? "0.8",
    "--state-disabled-opacity": state.disabledOpacity ?? "0.48",
    "--state-focus-ring":
      state.focusRing ??
      `0 0 0 3px color-mix(in srgb, ${color.accent} 35%, transparent)`,
    "--state-hover-background":
      state.hoverBackground ?? `color-mix(in srgb, ${color.accent} 82%, black)`
  };
}
