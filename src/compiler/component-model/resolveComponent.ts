import type {
  ComponentStateName,
  ComponentTokenBinding,
  ComponentResolutionContext,
  ComponentSchema,
  ResolvedComponent,
  ResolvedComponentBinding,
  ResolvedComponentVariantSelection,
  ResolvedComponentSlotStyles,
  ResolvedComponentStyle,
  TokenBindingTarget
} from "./component.types";
import type { TokenResolver } from "./tokenResolver";

export function resolveComponent(
  schema: ComponentSchema,
  tokenResolver: TokenResolver,
  context: ComponentResolutionContext = {}
): ResolvedComponent {
  const resolvedSelection = schema.variants.reduce<
    ResolvedComponentVariantSelection
  >(
    (currentSelection, axis) => ({
      ...currentSelection,
      [axis.name]: context[axis.name] ?? axis.default
    }),
    {}
  );
  const state = context.state ?? "default";

  const resolveBinding = (
    binding: ComponentTokenBinding
  ): ResolvedComponentBinding => ({
    ...binding,
    id: [schema.name, binding.slot, binding.target, binding.token].join("."),
    value: tokenResolver.get(binding.token)
  });
  const baseBindings = schema.tokenBindings
    .filter(
      (binding) =>
        !binding.conditions?.state &&
        matchesVariantConditions(binding, resolvedSelection)
    )
    .map(resolveBinding);
  const stateBindingsByState = schema.states.reduce<
    Record<ComponentStateName, ResolvedComponentBinding[]>
  >(
    (states, componentState) => ({
      ...states,
      [componentState.name]: schema.tokenBindings
        .filter(
          (binding) =>
            binding.conditions?.state === componentState.name &&
            matchesVariantConditions(binding, resolvedSelection)
        )
        .map(resolveBinding)
    }),
    {
      active: [],
      default: [],
      disabled: [],
      focus: [],
      hover: [],
      loading: []
    }
  );
  const bindings = [
    ...baseBindings,
    ...Object.values(stateBindingsByState).flat()
  ];

  return {
    bindings,
    schema,
    selection: resolvedSelection,
    state,
    styles: {
      base: createSlotStyles(baseBindings, { includeTransition: true }),
      states: Object.fromEntries(
        Object.entries(stateBindingsByState).map(([stateName, stateBindings]) => [
          stateName,
          createSlotStyles(stateBindings, { includeTransition: false })
        ])
      )
    }
  };
}

function matchesVariantConditions(
  binding: ComponentTokenBinding,
  selection: ResolvedComponentVariantSelection
) {
  return Object.entries(binding.conditions ?? {}).every(
    ([conditionName, option]) => {
      if (conditionName === "state") {
        return true;
      }

      return selection[conditionName] === option;
    }
  );
}

function createSlotStyles(
  bindings: readonly ResolvedComponentBinding[],
  options: { includeTransition: boolean }
): ResolvedComponentSlotStyles {
  const styles = bindings.reduce<ResolvedComponentSlotStyles>(
    (slotStyles, binding) => {
      const cssProperty = toCssProperty(binding.target);

      if (!cssProperty) {
        return slotStyles;
      }

      return {
        ...slotStyles,
        [binding.slot]: {
          ...(slotStyles[binding.slot] ?? {}),
          [cssProperty]: binding.value
        }
      };
    },
    {}
  );

  if (!options.includeTransition) {
    return styles;
  }

  return Object.fromEntries(
    Object.entries(styles).map(([slot, style]) => [
      slot,
      addTransitionShorthand(style)
    ])
  );
}

function addTransitionShorthand(
  style: ResolvedComponentStyle
): ResolvedComponentStyle {
  if (!style.transitionProperty || !style.transitionDuration) {
    return style;
  }

  return {
    ...style,
    transition: [
      style.transitionProperty,
      style.transitionDuration,
      style.transitionTimingFunction,
      style.transitionDelay
    ]
      .filter(Boolean)
      .join(" ")
  };
}

function toCssProperty(target: TokenBindingTarget) {
  switch (target) {
    case "background":
    case "borderRadius":
    case "boxShadow":
    case "color":
    case "gap":
    case "height":
    case "opacity":
    case "paddingBlock":
    case "paddingInline":
    case "transitionDelay":
    case "transitionDuration":
    case "transitionProperty":
    case "transitionTimingFunction":
      return target;
    default:
      return undefined;
  }
}
