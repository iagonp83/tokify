import type {
  ComponentResolutionContext,
  ComponentSchema,
  ComponentVariantAxisName,
  ResolvedComponent
} from "./component.types";

export function resolveComponent(
  schema: ComponentSchema,
  context: ComponentResolutionContext = {}
): ResolvedComponent {
  const resolvedSelection = schema.variants.reduce<
    Required<Record<ComponentVariantAxisName, string>>
  >(
    (currentSelection, axis) => ({
      ...currentSelection,
      [axis.name]: context[axis.name] ?? axis.default
    }),
    {
      intent: "",
      size: ""
    }
  );
  const state = context.state ?? "default";

  const bindings = schema.tokenBindings
    .filter((binding) => {
      if (!binding.conditions) {
        return true;
      }

      return Object.entries(binding.conditions).every(
        ([conditionName, option]) => {
          if (conditionName === "state") {
            return state === option;
          }

          return (
            resolvedSelection[conditionName as ComponentVariantAxisName] ===
            option
          );
        }
      );
    })
    .map((binding) => ({
      ...binding,
      id: [
        schema.name,
        binding.slot,
        binding.target,
        binding.token.namespace,
        binding.token.path
      ].join(".")
    }));

  return {
    bindings,
    schema,
    selection: resolvedSelection,
    state
  };
}
