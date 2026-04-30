import type { ColorState } from "../types";

export function createColorTokens(color: ColorState) {
  return {
    "--color-accent": color.accent
  };
}
