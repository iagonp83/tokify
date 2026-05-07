import type {
  ComponentStateName,
  ComponentTokenBinding,
  ComponentResolutionContext,
  ComponentSchema,
  ResolvedComponent,
  ResolvedComponentBinding,
  ResolvedComponentRuntimePlanSourceType,
  ResolvedComponentVariantSelection,
  ResolvedComponentSlotStyleProvenance,
  ResolvedComponentSlotStyles,
  ResolvedComponentStyle
} from "./component.types";
import type { CompositionSlotRelationGraph } from "./compositionSlotRelations";
import { deriveCompositionSlotRelationGraph } from "./compositionSlotRelations";
import {
  getCssPropertyForTokenBindingTarget,
  isInheritableStyleProperty
} from "./propertyRegistry";
import { createComponentRuntimePlan } from "./runtimePlan";
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
  const baseStyleResolution = createSlotStyles(baseBindings, {
    includeTransition: true,
    slotRelationGraph
  });
  const stateStyleResolutions = Object.fromEntries(
    Object.entries(stateBindingsByState).map(([stateName, stateBindings]) => [
      stateName,
      createSlotStyles(stateBindings, {
        includeTransition: false,
        slotRelationGraph
      })
    ])
  );
  const styles = {
    base: baseStyleResolution.styles,
    states: Object.fromEntries(
      Object.entries(stateStyleResolutions).map(([stateName, resolution]) => [
        stateName,
        resolution.styles
      ])
    )
  };

  return {
    bindings,
    runtimePlan: createComponentRuntimePlan(schema, styles, {
      base: baseStyleResolution.provenance,
      states: Object.fromEntries(
        Object.entries(stateStyleResolutions).map(([stateName, resolution]) => [
          stateName,
          resolution.provenance
        ])
      )
    }),
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

type SlotStyleResolution = {
  provenance: ResolvedComponentSlotStyleProvenance;
  styles: ResolvedComponentSlotStyles;
};

function createSlotStyles(
  bindings: readonly ResolvedComponentBinding[],
  options: {
    includeTransition: boolean;
    slotRelationGraph: CompositionSlotRelationGraph;
  }
): SlotStyleResolution {
  const explicitResolution = bindings.reduce<SlotStyleResolution>(
    (resolution, binding) => {
      const cssProperty = getCssPropertyForTokenBindingTarget(binding.target);

      if (!cssProperty) {
        return resolution;
      }

      return {
        provenance: {
          ...resolution.provenance,
          [binding.slot]: {
            ...(resolution.provenance[binding.slot] ?? {}),
            [cssProperty]: "explicit"
          }
        },
        styles: {
          ...resolution.styles,
          [binding.slot]: {
            ...(resolution.styles[binding.slot] ?? {}),
            [cssProperty]: binding.value
          }
        }
      };
    },
    {
      provenance: {},
      styles: {}
    }
  );
  const inheritedResolution = applySlotInheritance(
    explicitResolution,
    options.slotRelationGraph
  );

  if (!options.includeTransition) {
    return inheritedResolution;
  }

  return Object.entries(inheritedResolution.styles).reduce<SlotStyleResolution>(
    (resolution, [slot, style]) => {
      const shorthandResolution = addTransitionShorthand(
        style,
        inheritedResolution.provenance[slot] ?? {}
      );

      return {
        provenance: {
          ...resolution.provenance,
          [slot]: shorthandResolution.provenance
        },
        styles: {
          ...resolution.styles,
          [slot]: shorthandResolution.style
        }
      };
    },
    {
      provenance: {},
      styles: {}
    }
  );
}

function applySlotInheritance(
  resolution: SlotStyleResolution,
  slotRelationGraph: CompositionSlotRelationGraph
): SlotStyleResolution {
  if (slotRelationGraph.relations.length === 0) {
    return resolution;
  }

  let inheritedResolution = resolution;

  for (let pass = 0; pass < slotRelationGraph.relations.length; pass += 1) {
    let changed = false;

    for (const relation of slotRelationGraph.relations) {
      const parentStyle = inheritedResolution.styles[relation.parentSlot];

      if (!parentStyle) {
        continue;
      }

      const childStyle = inheritedResolution.styles[relation.slot] ?? {};
      const childProvenance =
        inheritedResolution.provenance[relation.slot] ?? {};
      const nextChildStyle = { ...childStyle };
      const nextChildProvenance = { ...childProvenance };
      let relationChanged = false;

      Object.entries(parentStyle).forEach(([property, value]) => {
        if (
          isInheritableStyleProperty(property) &&
          nextChildStyle[property] === undefined
        ) {
          nextChildStyle[property] = value;
          nextChildProvenance[property] = "inherited";
          relationChanged = true;
        }
      });

      if (relationChanged) {
        inheritedResolution = {
          provenance: {
            ...inheritedResolution.provenance,
            [relation.slot]: nextChildProvenance
          },
          styles: {
            ...inheritedResolution.styles,
            [relation.slot]: nextChildStyle
          }
        };
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  return inheritedResolution;
}

function addTransitionShorthand(
  style: ResolvedComponentStyle,
  provenance: Record<string, ResolvedComponentRuntimePlanSourceType>
): {
  provenance: Record<string, ResolvedComponentRuntimePlanSourceType>;
  style: ResolvedComponentStyle;
} {
  if (!style.transitionProperty || !style.transitionDuration) {
    return {
      provenance,
      style
    };
  }

  return {
    provenance: {
      ...provenance,
      transition: "derived"
    },
    style: {
      ...style,
      transition: [
        style.transitionProperty,
        style.transitionDuration,
        style.transitionTimingFunction,
        style.transitionDelay
      ]
        .filter(Boolean)
        .join(" ")
    }
  };
}
