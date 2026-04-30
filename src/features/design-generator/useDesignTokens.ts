import type { CSSProperties } from "react";
import type { DesignState } from "./types";

export function useDesignTokens(state: DesignState): CSSProperties {
  const motionScale =
    state.intent === "calm" ? 0.7 : state.intent === "expressive" ? 1.35 : 1;

  return {
    "--accent": state.accent,
    "--density": `${state.density}px`,
    "--elevation": `0 ${Math.round(state.elevation / 2)}px ${
      state.elevation * 2
    }px rgb(18 28 23 / 0.18)`,
    "--motion-duration": `${Math.round(state.speed * motionScale)}ms`,
    "--radius": `${state.radius}px`
  } as CSSProperties;
}
