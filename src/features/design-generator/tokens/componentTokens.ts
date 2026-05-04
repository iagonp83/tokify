import type {
  AuthoredComponentNamespace,
  ComponentKind,
  ComponentNamespace,
  ComponentTokenOverrides,
  DesignState,
  LayoutState,
  MotionState
} from "../types";

export const componentKinds: ComponentKind[] = ["card", "toolbar", "panel"];
export const componentNamespaces: ComponentNamespace[] = [
  "card",
  "toolbar",
  "panel",
  "button",
  "input"
];

export type ResolvedComponentTokens = {
  layout: LayoutState;
  motion: MotionState;
};

export function getActiveComponentTokens(state: DesignState) {
  return state.componentTokens?.[state.component.kind] ?? {};
}

export function updateActiveComponentTokens(
  state: DesignState,
  patch: ComponentTokenOverrides
): DesignState {
  const activeKind = state.component.kind;
  const currentTokens = getActiveComponentTokens(state);

  return {
    ...state,
    componentTokens: {
      ...state.componentTokens,
      [activeKind]: {
        layout: {
          ...currentTokens.layout,
          ...patch.layout
        },
        motion: {
          ...currentTokens.motion,
          ...patch.motion
        }
      }
    }
  };
}

export function resolveComponentTokens(
  state: DesignState,
  componentKind: ComponentKind
): ResolvedComponentTokens {
  const overrides = state.componentTokens?.[componentKind] ?? {};

  return {
    layout: {
      ...state.layout,
      ...overrides.layout
    },
    motion: {
      ...state.motion,
      ...overrides.motion
    }
  };
}

function resolveAuthoredNamespaceTokens(
  state: DesignState,
  namespace: AuthoredComponentNamespace
): ResolvedComponentTokens {
  const activeComponentTokens = resolveComponentTokens(
    state,
    state.component.kind
  );
  const overrides = state.componentTokens?.[namespace] ?? {};

  return {
    layout: {
      ...activeComponentTokens.layout,
      ...overrides.layout
    },
    motion: {
      ...activeComponentTokens.motion,
      ...overrides.motion
    }
  };
}

export function createComponentTokens(state: DesignState) {
  const buttonTokens = resolveAuthoredNamespaceTokens(state, "button");
  const inputTokens = resolveAuthoredNamespaceTokens(state, "input");
  const referenceComponentTokens = {
    "--button-density": `${buttonTokens.layout.density}px`,
    "--button-elevation": formatElevation(buttonTokens.layout.elevation),
    "--button-motion-duration": `${buttonTokens.motion.duration}ms`,
    "--button-radius": `${buttonTokens.layout.radius}px`,
    "--input-density": `${inputTokens.layout.density}px`,
    "--input-motion-duration": `${inputTokens.motion.duration}ms`,
    "--input-radius": `${inputTokens.layout.radius}px`
  };

  return componentKinds.reduce<Record<string, string>>((tokens, componentKind) => {
    const resolvedTokens = resolveComponentTokens(state, componentKind);

    return {
      ...tokens,
      [`--${componentKind}-density`]: `${resolvedTokens.layout.density}px`,
      [`--${componentKind}-elevation`]: formatElevation(
        resolvedTokens.layout.elevation
      ),
      [`--${componentKind}-motion-duration`]: `${resolvedTokens.motion.duration}ms`,
      [`--${componentKind}-radius`]: `${resolvedTokens.layout.radius}px`
    };
  }, referenceComponentTokens);
}

export function formatElevation(elevation: number) {
  return `0 ${Math.round(elevation / 2)}px ${
    elevation * 2
  }px rgb(18 28 23 / 0.18)`;
}
