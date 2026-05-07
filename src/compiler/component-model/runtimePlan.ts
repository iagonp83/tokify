import type {
  ComponentSchema,
  ComponentSlotName,
  ResolvedComponentRuntimePlan,
  ResolvedComponentRuntimePlanVariable,
  ResolvedComponentSlotStyleProvenance,
  ResolvedComponentStateStyleProvenance,
  ResolvedComponentSlotStyles,
  ResolvedComponentStateStyles
} from "./component.types";
import {
  getComponentStyleProperty,
  isRuntimeEmittableStyleProperty
} from "./propertyRegistry";

export type ComponentRuntimePlanStyleProvenance = {
  base?: ResolvedComponentSlotStyleProvenance;
  states?: ResolvedComponentStateStyleProvenance;
};

export function createFlatSlotVariableName(
  componentName: string,
  slot: ComponentSlotName,
  property: string
) {
  const componentSegment = toKebabSegment(componentName);
  const propertySegment = toKebabSegment(property);

  if (slot === "root") {
    return `--${componentSegment}-${propertySegment}`;
  }

  return `--${componentSegment}-${toKebabSegment(slot)}-${propertySegment}`;
}

export function createComponentRuntimePlan(
  schema: ComponentSchema,
  styles: {
    base: ResolvedComponentSlotStyles;
    states: ResolvedComponentStateStyles;
  },
  provenance: ComponentRuntimePlanStyleProvenance = {}
): ResolvedComponentRuntimePlan {
  return {
    variables: [
      ...createStyleVariables(
        schema,
        styles.base,
        "base",
        provenance.base ?? {}
      ),
      ...schema.states.flatMap((state) =>
        createStyleVariables(
          schema,
          styles.states[state.name] ?? {},
          "state",
          provenance.states?.[state.name] ?? {}
        ).map((variable) => ({
          ...variable,
          state: state.name
        }))
      )
    ]
  };
}

function createStyleVariables(
  schema: ComponentSchema,
  slotStyles: ResolvedComponentSlotStyles,
  styleLayer: ResolvedComponentRuntimePlanVariable["styleLayer"],
  provenance: ResolvedComponentSlotStyleProvenance
): ResolvedComponentRuntimePlanVariable[] {
  return schema.slots.flatMap((slot) => {
    const style = slotStyles[slot.name];

    if (!style) {
      return [];
    }

    return Object.keys(style)
      .filter((property) =>
        isRuntimeEmittableStyleProperty(property, styleLayer)
      )
      .map((property) => ({
        name: createFlatSlotVariableName(schema.name, slot.name, property),
        property,
        slot: slot.name,
        source: styleLayer,
        sourceType: getRuntimeVariableSourceType(
          property,
          slot.name,
          provenance
        ),
        styleLayer
      }));
  });
}

function getRuntimeVariableSourceType(
  property: string,
  slot: ComponentSlotName,
  provenance: ResolvedComponentSlotStyleProvenance
): ResolvedComponentRuntimePlanVariable["sourceType"] {
  const sourceType = provenance[slot]?.[property];

  if (sourceType) {
    return sourceType;
  }

  return getComponentStyleProperty(property)?.derived ? "derived" : "explicit";
}

function toKebabSegment(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
