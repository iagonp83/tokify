import type { CSSProperties } from "react";
import type { DesignState } from "./types";
import { createColorTokens } from "./tokens/colorTokens";
import { createComponentTokens } from "./tokens/componentTokens";
import { createLayoutTokens } from "./tokens/layoutTokens";
import { createMotionTokens } from "./tokens/motionTokens";

export type DesignTokens = ReturnType<typeof createColorTokens> &
  ReturnType<typeof createComponentTokens> &
  ReturnType<typeof createLayoutTokens> &
  ReturnType<typeof createMotionTokens>;

export type DesignTokenStyle = CSSProperties & DesignTokens;

export function useDesignTokens(state: DesignState): DesignTokenStyle {
  return {
    ...createColorTokens(state.color),
    ...createLayoutTokens(state.layout),
    ...createMotionTokens(state.motion),
    ...createComponentTokens(state)
  } as DesignTokenStyle;
}
