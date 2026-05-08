import type {
  ComponentStateName,
  ResolvedComponent,
  ResolvedComponentRuntimePlanVariable,
  ResolvedComponentStyle
} from "./component.types";

export type ComponentRuntimeVariableMap = Record<`--${string}`, string>;

export type ComponentRuntimeVariableEmissionOptions = {
  state?: ComponentStateName;
};

export function emitComponentRuntimeVariables(
  resolved: ResolvedComponent,
  options: ComponentRuntimeVariableEmissionOptions = {}
): ComponentRuntimeVariableMap {
  const variables: ComponentRuntimeVariableMap = {};

  resolved.runtimePlan.variables
    .filter((variable) => variable.styleLayer === "base")
    .forEach((variable) => {
      assignRuntimeVariable(
        variables,
        variable,
        resolved.styles.base[variable.slot]
      );
    });

  if (!options.state) {
    return variables;
  }

  resolved.runtimePlan.variables
    .filter(
      (variable) =>
        variable.styleLayer === "state" && variable.state === options.state
    )
    .forEach((variable) => {
      assignRuntimeVariable(
        variables,
        variable,
        resolved.styles.states[options.state]?.[variable.slot]
      );
    });

  return variables;
}

function assignRuntimeVariable(
  variables: ComponentRuntimeVariableMap,
  variable: ResolvedComponentRuntimePlanVariable,
  style: ResolvedComponentStyle | undefined
) {
  const value = style?.[variable.property];

  if (value === undefined) {
    return;
  }

  variables[variable.name as `--${string}`] = value;
}
