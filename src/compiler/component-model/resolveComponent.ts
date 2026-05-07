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
import type { CompositionSlotRelationGraph } from "./compositionSlotRelations";
import { deriveCompositionSlotRelationGraph } from "./compositionSlotRelations";
import { createComponentRuntimePlan } from "./runtimePlan";
import type { TokenResolver } from "./tokenResolver";

const inheritedSlotProperties = new Set([
  "color",
  "transitionDelay",
  "transitionDuration",
  "transitionProperty",
  "transitionTimingFunction"
]);

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
  const slotRelationGraph = deriveCompositionSlotRelationGraph(schema);

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
  const styles = {
    base: createSlotStyles(baseBindings, {
      includeTransition: true,
      slotRelationGraph
    }),
    states: Object.fromEntries(
      Object.entries(stateBindingsByState).map(([stateName, stateBindings]) => [
        stateName,
        createSlotStyles(stateBindings, {
          includeTransition: false,
          slotRelationGraph
        })
      ])
    )
  };

  return {
    bindings,
    runtimePlan: createComponentRuntimePlan(schema, styles),
    schema,
    selection: resolvedSelection,
    state,
    styles
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
  options: {
    includeTransition: boolean;
    slotRelationGraph: CompositionSlotRelationGraph;
  }
): ResolvedComponentSlotStyles {
  const explicitStyles = bindings.reduce<ResolvedComponentSlotStyles>(
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
  const styles = applySlotInheritance(
    explicitStyles,
    options.slotRelationGraph
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

function applySlotInheritance(
  styles: ResolvedComponentSlotStyles,
  slotRelationGraph: CompositionSlotRelationGraph
): ResolvedComponentSlotStyles {
  if (slotRelationGraph.relations.length === 0) {
    return styles;
  }

  let inheritedStyles = styles;

  for (let pass = 0; pass < slotRelationGraph.relations.length; pass += 1) {
    let changed = false;

    for (const relation of slotRelationGraph.relations) {
      const parentStyle = inheritedStyles[relation.parentSlot];

      if (!parentStyle) {
        continue;
      }

      const childStyle = inheritedStyles[relation.slot] ?? {};
      const nextChildStyle = { ...childStyle };
      let relationChanged = false;

      Object.entries(parentStyle).forEach(([property, value]) => {
        if (
          inheritedSlotProperties.has(property) &&
          nextChildStyle[property] === undefined
        ) {
          nextChildStyle[property] = value;
          relationChanged = true;
        }
      });

      if (relationChanged) {
        inheritedStyles = {
          ...inheritedStyles,
          [relation.slot]: nextChildStyle
        };
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  return inheritedStyles;
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
