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
  const baseOrigins: RuntimeVariableOriginMap = {};

  resolved.runtimePlan.variables
    .filter((variable) => variable.styleLayer === "base")
    .forEach((variable) => {
      assignRuntimeVariable(
        variables,
        baseOrigins,
        variable,
        resolved.styles.base[variable.slot]
      );
    });

  if (!options.state) {
    return variables;
  }

  const activeState = options.state;
  const stateOrigins: RuntimeVariableOriginMap = {};

  resolved.runtimePlan.variables
    .filter(
      (variable) =>
        variable.styleLayer === "state" && variable.state === activeState
    )
    .forEach((variable) => {
      assignRuntimeVariable(
        variables,
        stateOrigins,
        variable,
        resolved.styles.states[activeState]?.[variable.slot]
      );
    });

  return variables;
}

type RuntimeVariableOriginMap = Record<
  `--${string}`,
  {
    property: string;
    slot: string;
  }
>;

function assignRuntimeVariable(
  variables: ComponentRuntimeVariableMap,
  origins: RuntimeVariableOriginMap,
  variable: ResolvedComponentRuntimePlanVariable,
  style: ResolvedComponentStyle | undefined
) {
  const value = style?.[variable.property];

  if (value === undefined) {
    return;
  }

  const name = variable.name as `--${string}`;
  const previousOrigin = origins[name];
  const nextOrigin = {
    property: variable.property,
    slot: variable.slot
  };

  if (
    previousOrigin &&
    (previousOrigin.slot !== nextOrigin.slot ||
      previousOrigin.property !== nextOrigin.property)
  ) {
    throw new Error(
      [
        `Runtime variable "${name}" has multiple same-layer origins.`,
        `First origin: ${previousOrigin.slot}.${previousOrigin.property}.`,
        `Next origin: ${nextOrigin.slot}.${nextOrigin.property}.`
      ].join(" ")
    );
  }

  origins[name] = nextOrigin;
  variables[name] = value;
}
