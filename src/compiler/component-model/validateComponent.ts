import type {
  ComponentSchema,
  ComponentVariantAxisName
} from "./component.types";

export type ComponentValidationResult = {
  errors: string[];
  valid: boolean;
};

const requiredVariantAxes: readonly ComponentVariantAxisName[] = [
  "intent",
  "size"
];

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

  requiredVariantAxes.forEach((axisName) => {
    const options = variantAxes.get(axisName);

    if (!options) {
      errors.push(`Component requires a "${axisName}" variant axis.`);
      return;
    }

    if (options.length === 0) {
      errors.push(`Variant axis "${axisName}" requires at least one option.`);
    }
  });

  schema.variants.forEach((axis) => {
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
      if (axisName === "state") {
        if (!stateNames.has(option)) {
          errors.push(
            `Token binding "${binding.target}" references unknown state "${option}".`
          );
        }

        return;
      }

      const axisOptions = variantAxes.get(axisName as ComponentVariantAxisName);

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

  return {
    errors,
    valid: errors.length === 0
  };
}
