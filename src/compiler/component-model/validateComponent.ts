import type { ComponentSchema } from "./component.types";

export type ComponentValidationResult = {
  errors: string[];
  valid: boolean;
};

export function validateComponent(
  schema: ComponentSchema
): ComponentValidationResult {
  const errors: string[] = [];
  const slotNames = new Set(schema.slots.map((slot) => slot.name));
  const stateNames = new Set<string>(schema.states.map((state) => state.name));
  const variantAxes = new Map(
    schema.variants.map((axis) => [axis.name, axis.options])
  );

  if (!schema.name.trim()) {
    errors.push("Component name is required.");
  }

  if (!slotNames.has("root")) {
    errors.push('Component requires a "root" slot.');
  }

  if (!stateNames.has("default")) {
    errors.push('Component requires a "default" state.');
  }

  schema.variants.forEach((axis) => {
    if (axis.options.length === 0) {
      errors.push(`Variant axis "${axis.name}" requires at least one option.`);
      return;
    }

    if (!axis.options.includes(axis.default)) {
      errors.push(
        `Variant axis "${axis.name}" default "${axis.default}" must be one of its options.`
      );
    }
  });

  schema.tokenBindings.forEach((binding) => {
    if (!slotNames.has(binding.slot)) {
      errors.push(
        `Token binding "${binding.target}" references unknown slot "${binding.slot}".`
      );
    }

    Object.entries(binding.conditions ?? {}).forEach(([axisName, option]) => {
      if (option === undefined) {
        return;
      }

      if (axisName === "state") {
        if (!stateNames.has(option)) {
          errors.push(
            `Token binding "${binding.target}" references unknown state "${option}".`
          );
        }

        return;
      }

      const axisOptions = variantAxes.get(axisName);

      if (!axisOptions) {
        errors.push(
          `Token binding "${binding.target}" references unknown variant axis "${axisName}".`
        );
        return;
      }

      if (!axisOptions.includes(option)) {
        errors.push(
          `Token binding "${binding.target}" references unknown ${axisName} option "${option}".`
        );
      }
    });
  });

  schema.composition?.slotRelations?.forEach((relation) => {
    if (!slotNames.has(relation.slot)) {
      errors.push(
        `Composition slot relation references unknown slot "${relation.slot}".`
      );
    }

    if (relation.parentSlot && !slotNames.has(relation.parentSlot)) {
      errors.push(
        `Composition slot relation references unknown parent slot "${relation.parentSlot}".`
      );
    }
  });

  schema.composition?.parts?.forEach((part) => {
    if (!slotNames.has(part.slot)) {
      errors.push(
        `Composition part "${part.name}" references unknown slot "${part.slot}".`
      );
    }
  });

  schema.composition?.children?.forEach((child) => {
    if (!slotNames.has(child.slot)) {
      errors.push(
        `Composition child "${child.name}" references unknown slot "${child.slot}".`
      );
    }
  });

  findDuplicates(
    schema.composition?.slotRelations?.map((relation) => relation.slot) ?? []
  ).forEach((slot) => {
    errors.push(`Composition slot relation "${slot}" is duplicated.`);
  });

  findDuplicates(schema.composition?.parts?.map((part) => part.name) ?? []).forEach(
    (partName) => {
      errors.push(`Composition part "${partName}" is duplicated.`);
    }
  );

  findDuplicates(
    schema.composition?.children?.map((child) => child.name) ?? []
  ).forEach((childName) => {
    errors.push(`Composition child "${childName}" is duplicated.`);
  });

  return {
    errors,
    valid: errors.length === 0
  };
}

function findDuplicates(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
}
