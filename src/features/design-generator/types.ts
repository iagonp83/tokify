export type ComponentKind = "card" | "toolbar" | "panel";

export type ComponentState = {
  kind: ComponentKind;
};

export type ColorState = {
  accent: string;
  onAccent?: string;
};

export type LayoutState = {
  density: number;
  elevation: number;
  radius: number;
};

export type MotionState = {
  delay: number;
  distance: number;
  duration: number;
  ease: string;
  presetId: string;
  stagger: number;
};

export type DesignPreset = {
  id: string;
  label: string;
  overrides: {
    componentTokens?: Partial<ComponentTokensState>;
    color?: Partial<ColorState>;
    layout?: Partial<LayoutState>;
    motion?: Partial<MotionState>;
  };
};

export type DesignSystemProfile = {
  defaults: {
    color: ColorState;
    layout: LayoutState;
    motion: MotionState;
  };
  id: string;
  label: string;
};

export type DesignState = {
  color: ColorState;
  component: ComponentState;
  componentTokens: ComponentTokensState;
  layout: LayoutState;
  motion: MotionState;
};

export type ComponentTokenOverrides = {
  layout?: Partial<LayoutState>;
  motion?: Partial<MotionState>;
};

export type ComponentTokensState = Record<ComponentKind, ComponentTokenOverrides>;

export type UserDesignPreset = {
  createdAt: string;
  id: string;
  label: string;
  state: DesignState;
};
