export type MotionIntent = "calm" | "focused" | "expressive";

export type ComponentKind = "card" | "toolbar" | "panel";

export type DesignState = {
  accent: string;
  component: ComponentKind;
  density: number;
  elevation: number;
  intent: MotionIntent;
  radius: number;
  speed: number;
};
