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

export type ComponentIdentityLayer = "base" | "override";

export type AuthoredComponentIdentityTokens = {
  base: ResolvedComponentTokens;
  override: ComponentTokenOverrides;
  resolved: ResolvedComponentTokens;
};

type ResolvedMotionDurations = {
  duration: number;
  enterDuration: number;
  exitDuration: number;
};

type ComponentOverrideGroup = "layout" | "motion";
type ComponentOverrideField<TGroup extends ComponentOverrideGroup> =
  TGroup extends "layout" ? "density" | "elevation" | "radius" : "duration";
type ComponentOverrideFieldValue<TGroup extends ComponentOverrideGroup> =
  TGroup extends "layout"
    ? NonNullable<ComponentTokenOverrides["layout"]>[ComponentOverrideField<"layout">]
    : NonNullable<ComponentTokenOverrides["motion"]>[ComponentOverrideField<"motion">];

export function getActiveComponentTokens(state: DesignState) {
  return state.componentTokens?.[state.component.kind] ?? {};
}

export function updateActiveComponentTokens(
  state: DesignState,
  patch: ComponentTokenOverrides
): DesignState {
  return updateComponentNamespaceTokens(state, state.component.kind, patch);
}

export function updateComponentNamespaceTokens(
  state: DesignState,
  namespace: ComponentNamespace,
  patch: ComponentTokenOverrides
): DesignState {
  if (isAuthoredComponentNamespace(namespace)) {
    return updateAuthoredComponentNamespaceOverride(state, namespace, patch);
  }

  const currentTokens = state.componentTokens?.[namespace] ?? {};

  return {
    ...state,
    componentTokens: {
      ...state.componentTokens,
      [namespace]: {
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

export function updateComponentFieldOverride<
  TGroup extends ComponentOverrideGroup
>(
  state: DesignState,
  namespace: AuthoredComponentNamespace,
  group: TGroup,
  field: ComponentOverrideField<TGroup>,
  value: ComponentOverrideFieldValue<TGroup>
): DesignState {
  const override = readAuthoredComponentNamespaceOverride(state, namespace);
  const nextOverride = {
    ...override,
    [group]: {
      ...override[group],
      [field]: value
    }
  };

  return setAuthoredComponentNamespaceOverride(state, namespace, nextOverride);
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

export function resolveComponentNamespaceTokens(
  state: DesignState,
  namespace: ComponentNamespace
): ResolvedComponentTokens {
  if (isAuthoredComponentNamespace(namespace)) {
    return resolveAuthoredNamespaceTokens(state, namespace);
  }

  return resolveComponentTokens(state, namespace);
}

export function hasAuthoredComponentNamespaceOverride(
  state: DesignState,
  namespace: ComponentNamespace
): boolean {
  if (!isAuthoredComponentNamespace(namespace)) {
    return false;
  }

  const { override } = readAuthoredComponentIdentityTokens(state, namespace);

  return Boolean(override?.layout || override?.motion);
}

export function hasComponentFieldOverride<
  TGroup extends ComponentOverrideGroup
>(
  state: DesignState,
  namespace: ComponentNamespace,
  group: TGroup,
  field: ComponentOverrideField<TGroup>
): boolean {
  if (!isAuthoredComponentNamespace(namespace)) {
    return false;
  }

  const { override } = readAuthoredComponentIdentityTokens(state, namespace);

  if (group === "layout") {
    return (
      override?.layout?.[field as ComponentOverrideField<"layout">] !== undefined
    );
  }

  return override?.motion?.[field as ComponentOverrideField<"motion">] !== undefined;
}

export function resetComponentFieldOverride<
  TGroup extends ComponentOverrideGroup
>(
  state: DesignState,
  namespace: ComponentNamespace,
  group: TGroup,
  field: ComponentOverrideField<TGroup>
): DesignState {
  if (!isAuthoredComponentNamespace(namespace)) {
    return state;
  }

  const namespaceOverride = readAuthoredComponentNamespaceOverride(
    state,
    namespace
  );

  if (!namespaceOverride?.[group]) {
    return state;
  }

  const groupOverride = Object.fromEntries(
    Object.entries(namespaceOverride[group]).filter(([key]) => key !== field)
  );
  const nextNamespaceOverride = {
    ...namespaceOverride,
    [group]: Object.keys(groupOverride).length > 0 ? groupOverride : undefined
  };
  const cleanedNamespaceOverride = Object.fromEntries(
    Object.entries(nextNamespaceOverride).filter(
      ([, value]) => value !== undefined
    )
  ) as ComponentTokenOverrides;
  return Object.keys(cleanedNamespaceOverride).length > 0
    ? setAuthoredComponentNamespaceOverride(
        state,
        namespace,
        cleanedNamespaceOverride
      )
    : clearAuthoredComponentNamespaceOverride(state, namespace);
}

export function resetAuthoredComponentNamespaceOverride(
  state: DesignState,
  namespace: ComponentNamespace
): DesignState {
  if (!isAuthoredComponentNamespace(namespace)) {
    return state;
  }

  return clearAuthoredComponentNamespaceOverride(state, namespace);
}

export function readAuthoredComponentNamespaceOverride(
  state: DesignState,
  namespace: AuthoredComponentNamespace
): ComponentTokenOverrides {
  return state.componentTokens?.[namespace] ?? {};
}

export function readVirtualAuthoredComponentNamespaceBase(
  state: DesignState,
  namespace: AuthoredComponentNamespace
): ResolvedComponentTokens {
  const virtualBaseResolvers: Record<
    AuthoredComponentNamespace,
    (state: DesignState) => ResolvedComponentTokens
  > = {
    button: (currentState) =>
      resolveComponentTokens(currentState, currentState.component.kind),
    input: (currentState) =>
      resolveComponentTokens(currentState, currentState.component.kind)
  };

  return virtualBaseResolvers[namespace](state);
}

export function readAuthoredComponentIdentityTokens(
  state: DesignState,
  namespace: AuthoredComponentNamespace
): AuthoredComponentIdentityTokens {
  const base = readVirtualAuthoredComponentNamespaceBase(state, namespace);
  const override = readAuthoredComponentNamespaceOverride(state, namespace);

  return {
    base,
    override,
    resolved: {
      layout: {
        ...base.layout,
        ...override.layout
      },
      motion: {
        ...base.motion,
        ...override.motion
      }
    }
  };
}

function updateAuthoredComponentNamespaceOverride(
  state: DesignState,
  namespace: AuthoredComponentNamespace,
  patch: ComponentTokenOverrides
): DesignState {
  let nextState = state;

  if (patch.layout) {
    for (const [field, value] of Object.entries(patch.layout)) {
      nextState = updateComponentFieldOverride(
        nextState,
        namespace,
        "layout",
        field as ComponentOverrideField<"layout">,
        value as ComponentOverrideFieldValue<"layout">
      );
    }
  }

  if (patch.motion) {
    for (const [field, value] of Object.entries(patch.motion)) {
      nextState = updateComponentFieldOverride(
        nextState,
        namespace,
        "motion",
        field as ComponentOverrideField<"motion">,
        value as ComponentOverrideFieldValue<"motion">
      );
    }
  }

  return setAuthoredComponentNamespaceOverride(
    nextState,
    namespace,
    {
      layout: {
        ...readAuthoredComponentNamespaceOverride(nextState, namespace).layout,
        ...patch.layout
      },
      motion: {
        ...readAuthoredComponentNamespaceOverride(nextState, namespace).motion,
        ...patch.motion
      }
    }
  );
}

function setAuthoredComponentNamespaceOverride(
  state: DesignState,
  namespace: AuthoredComponentNamespace,
  override: ComponentTokenOverrides
): DesignState {
  return {
    ...state,
    componentTokens: {
      ...state.componentTokens,
      [namespace]: override
    }
  };
}

function clearAuthoredComponentNamespaceOverride(
  state: DesignState,
  namespace: AuthoredComponentNamespace
): DesignState {
  const componentTokens = { ...state.componentTokens };
  delete componentTokens[namespace];

  return {
    ...state,
    componentTokens
  };
}

function resolveAuthoredNamespaceTokens(
  state: DesignState,
  namespace: AuthoredComponentNamespace
): ResolvedComponentTokens {
  return readAuthoredComponentIdentityTokens(state, namespace).resolved;
}

export function createComponentTokens(state: DesignState) {
  const buttonTokens = resolveAuthoredNamespaceTokens(state, "button");
  const inputTokens = resolveAuthoredNamespaceTokens(state, "input");
  const buttonMotionDurations = resolveMotionDurations(buttonTokens.motion);
  const inputMotionDurations = resolveMotionDurations(inputTokens.motion);
  const referenceComponentTokens = {
    "--button-density": `${buttonTokens.layout.density}px`,
    "--button-elevation": formatElevation(buttonTokens.layout.elevation),
    "--button-enter-motion-duration": `${buttonMotionDurations.enterDuration}ms`,
    "--button-exit-motion-duration": `${buttonMotionDurations.exitDuration}ms`,
    "--button-motion-duration": `${buttonMotionDurations.enterDuration}ms`,
    "--button-radius": `${buttonTokens.layout.radius}px`,
    "--input-density": `${inputTokens.layout.density}px`,
    "--input-enter-motion-duration": `${inputMotionDurations.enterDuration}ms`,
    "--input-exit-motion-duration": `${inputMotionDurations.exitDuration}ms`,
    "--input-motion-duration": `${inputMotionDurations.enterDuration}ms`,
    "--input-radius": `${inputTokens.layout.radius}px`
  };

  return componentKinds.reduce<Record<string, string>>((tokens, componentKind) => {
    const resolvedTokens = resolveComponentTokens(state, componentKind);
    const motionDurations = resolveMotionDurations(resolvedTokens.motion);

    return {
      ...tokens,
      [`--${componentKind}-density`]: `${resolvedTokens.layout.density}px`,
      [`--${componentKind}-elevation`]: formatElevation(
        resolvedTokens.layout.elevation
      ),
      [`--${componentKind}-enter-motion-duration`]: `${motionDurations.enterDuration}ms`,
      [`--${componentKind}-exit-motion-duration`]: `${motionDurations.exitDuration}ms`,
      [`--${componentKind}-motion-duration`]: `${motionDurations.enterDuration}ms`,
      [`--${componentKind}-radius`]: `${resolvedTokens.layout.radius}px`
    };
  }, referenceComponentTokens);
}

function resolveMotionDurations(motion: MotionState): ResolvedMotionDurations {
  return {
    duration: motion.duration,
    enterDuration: motion.enterDuration ?? motion.duration,
    exitDuration: motion.exitDuration ?? motion.duration
  };
}

export function formatElevation(elevation: number) {
  return `0 ${Math.round(elevation / 2)}px ${
    elevation * 2
  }px rgb(18 28 23 / 0.18)`;
}

function isAuthoredComponentNamespace(
  namespace: ComponentNamespace
): namespace is AuthoredComponentNamespace {
  return namespace === "button" || namespace === "input";
}
