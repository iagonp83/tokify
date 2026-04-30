import type { LayoutState } from "../types";
import { formatElevation } from "./componentTokens";

export function createLayoutTokens(layout: LayoutState) {
  return {
    "--layout-density": `${layout.density}px`,
    "--layout-elevation": formatElevation(layout.elevation),
    "--layout-radius": `${layout.radius}px`
  };
}
