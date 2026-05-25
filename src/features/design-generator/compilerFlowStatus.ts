import { buttonSchema } from "../../compiler/component-model/button.schema";
import { inputSchema } from "../../compiler/component-model/input.schema";
import { validateComponentTypeGraph } from "../../compiler/component-model/componentGraphValidation";
import {
  componentRegistry,
  validateComponentRegistry
} from "../../compiler/component-model/componentRegistry";
import type {
  ComponentResolutionContext,
  ComponentStateName,
  ResolvedComponent
} from "../../compiler/component-model/component.types";
import { emitComponentRuntimeVariables } from "../../compiler/component-model/runtimeEmission";
import { resolveComponent } from "../../compiler/component-model/resolveComponent";
import { createTokenResolver } from "../../compiler/component-model/tokenResolver";
import { exportCss } from "./export/exportCss";
import { exportJson } from "./export/exportJson";
import type { DesignState } from "./types";
import { useDesignTokens, type DesignTokens } from "./useDesignTokens";
import { validateComponent } from "../../compiler/component-model/validateComponent";

export type CompilerFlowStatusState = "blocked" | "ready";

export type CompilerFlowStatusItem = {
  detail: string;
  id: string;
  label: string;
  messages: readonly string[];
  status: CompilerFlowStatusState;
};

export type CompilerFlowStatusSection = {
  items: readonly CompilerFlowStatusItem[];
  title: string;
};

export type CompilerFlowStatusViewModel = {
  constraints: readonly string[];
  sections: readonly CompilerFlowStatusSection[];
  summary: string;
  title: string;
};

const defaultPreviewState: ComponentStateName = "default";

export function createCompilerFlowStatus(
  state: DesignState
): CompilerFlowStatusViewModel {
  const tokenResult = runStatusStep(() => useDesignTokens(state));
  const missingTokenNames = tokenResult.ok
    ? findMissingTokenNames(tokenResult.value)
    : [];
  const tokenStateAvailable =
    hasDesignStateCoreGroups(state) &&
    tokenResult.ok &&
    missingTokenNames.length === 0;
  const tokenStateItem = createTokenStateItem({
    missingTokenNames,
    state,
    tokenResult
  });

  const buttonValidationItem = createValidationItem({
    id: "button-schema-validation",
    label: "Button schema validation",
    result: runStatusStep(() => validateComponent(buttonSchema))
  });
  const inputValidationItem = createValidationItem({
    id: "input-schema-validation",
    label: "Input schema validation",
    result: runStatusStep(() => validateComponent(inputSchema))
  });
  const registryValidationItem = createValidationItem({
    id: "registry-authored-name-validation",
    label: "Registry authored-name validation",
    result: runStatusStep(() => validateComponentRegistry(componentRegistry))
  });
  const graphValidationItem = createGraphValidationItem(
    runStatusStep(() => validateComponentTypeGraph(componentRegistry))
  );
  const tokenResolverResult: StatusStepResult<
    ReturnType<typeof createTokenResolver>
  > =
    tokenStateAvailable && tokenResult.ok
      ? runStatusStep(() =>
          createTokenResolver(tokenResult.value, state.component.kind)
        )
      : createSkippedResult("Skipped because token state is unavailable.");
  const buttonResolutionResult = resolvePreviewComponent({
    context: {
      ...state.variantSelections.button,
      state: defaultPreviewState
    },
    tokenResolverResult,
    schema: buttonSchema
  });
  const inputResolutionResult = resolvePreviewComponent({
    context: {
      ...state.variantSelections.input,
      state: defaultPreviewState
    },
    tokenResolverResult,
    schema: inputSchema
  });
  const buttonResolutionItem = createResolutionItem({
    id: "button-resolution",
    label: "Button resolution",
    result: buttonResolutionResult
  });
  const inputResolutionItem = createResolutionItem({
    id: "input-resolution",
    label: "Input resolution",
    result: inputResolutionResult
  });
  const buttonRuntimeEmissionResult = emitPreviewRuntimeVariables(
    buttonResolutionResult
  );
  const inputRuntimeEmissionResult = emitPreviewRuntimeVariables(
    inputResolutionResult
  );
  const buttonRuntimeEmissionItem = createRuntimeEmissionItem({
    id: "button-runtime-emission",
    label: "Button runtime emission",
    result: buttonRuntimeEmissionResult
  });
  const inputRuntimeEmissionItem = createRuntimeEmissionItem({
    id: "input-runtime-emission",
    label: "Input runtime emission",
    result: inputRuntimeEmissionResult
  });
  const previewItem = createPreviewAvailabilityItem([
    buttonResolutionItem,
    inputResolutionItem,
    buttonRuntimeEmissionItem,
    inputRuntimeEmissionItem
  ]);
  const cssExportItem = createCssExportItem(tokenStateAvailable, tokenResult);
  const jsonExportItem = createJsonExportItem(
    state,
    tokenStateAvailable,
    tokenResult
  );

  return {
    constraints: [
      "Exports remain token-only.",
      "Component generation and adapters remain inactive.",
      "Warnings, strict mode, aggregate diagnostics, and structured public diagnostics remain inactive."
    ],
    sections: [
      {
        title: "State",
        items: [tokenStateItem]
      },
      {
        title: "Validation",
        items: [
          buttonValidationItem,
          inputValidationItem,
          registryValidationItem,
          graphValidationItem
        ]
      },
      {
        title: "Compiler path",
        items: [
          buttonResolutionItem,
          inputResolutionItem,
          buttonRuntimeEmissionItem,
          inputRuntimeEmissionItem,
          previewItem
        ]
      },
      {
        title: "Exports",
        items: [cssExportItem, jsonExportItem]
      }
    ],
    summary: "Read-only Button/Input compiler flow.",
    title: "Compiler status"
  };
}

type StatusStepResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      message: string;
      ok: false;
    };

function runStatusStep<T>(operation: () => T): StatusStepResult<T> {
  try {
    return {
      ok: true,
      value: operation()
    };
  } catch (error) {
    return {
      message: getErrorMessage(error),
      ok: false
    };
  }
}

function createSkippedResult<T>(message: string): StatusStepResult<T> {
  return {
    message,
    ok: false
  };
}

function createTokenStateItem({
  missingTokenNames,
  state,
  tokenResult
}: {
  missingTokenNames: readonly string[];
  state: DesignState;
  tokenResult: StatusStepResult<DesignTokens>;
}): CompilerFlowStatusItem {
  if (!hasDesignStateCoreGroups(state)) {
    return createBlockedItem({
      detail: "Current DesignState is missing required token groups.",
      id: "token-state",
      label: "Token state",
      messages: ["DesignState must include color, layout, motion, component, componentTokens, and variantSelections."]
    });
  }

  if (!tokenResult.ok) {
    return createBlockedItem({
      detail: "Current DesignState did not produce design tokens.",
      id: "token-state",
      label: "Token state",
      messages: [tokenResult.message]
    });
  }

  if (missingTokenNames.length > 0) {
    return createBlockedItem({
      detail: "Current DesignState produced incomplete token values.",
      id: "token-state",
      label: "Token state",
      messages: [`Missing token values: ${missingTokenNames.join(", ")}.`]
    });
  }

  return createReadyItem({
    detail: `${Object.keys(tokenResult.value).length} flat token values for ${state.component.kind}.`,
    id: "token-state",
    label: "Token state"
  });
}

function createValidationItem({
  id,
  label,
  result
}: {
  id: string;
  label: string;
  result: StatusStepResult<{ errors: readonly string[]; valid: boolean }>;
}): CompilerFlowStatusItem {
  if (!result.ok) {
    return createBlockedItem({
      detail: "Validation helper did not complete.",
      id,
      label,
      messages: [result.message]
    });
  }

  if (!result.value.valid) {
    return createBlockedItem({
      detail: `${result.value.errors.length} legacy validation error${result.value.errors.length === 1 ? "" : "s"}.`,
      id,
      label,
      messages: result.value.errors
    });
  }

  return createReadyItem({
    detail: "Valid with legacy output.",
    id,
    label
  });
}

function createGraphValidationItem(
  result: StatusStepResult<{
    diagnostics: readonly { message: string }[];
    valid: boolean;
  }>
): CompilerFlowStatusItem {
  if (!result.ok) {
    return createBlockedItem({
      detail: "Graph validator did not complete.",
      id: "component-type-graph-validation",
      label: "Component-type graph validation",
      messages: [result.message]
    });
  }

  if (!result.value.valid) {
    return createBlockedItem({
      detail: `${result.value.diagnostics.length} legacy graph diagnostic${result.value.diagnostics.length === 1 ? "" : "s"}.`,
      id: "component-type-graph-validation",
      label: "Component-type graph validation",
      messages: result.value.diagnostics.map((diagnostic) => diagnostic.message)
    });
  }

  return createReadyItem({
    detail: "Valid with legacy graph output.",
    id: "component-type-graph-validation",
    label: "Component-type graph validation"
  });
}

function resolvePreviewComponent({
  context,
  schema,
  tokenResolverResult
}: {
  context: ComponentResolutionContext;
  schema: typeof buttonSchema | typeof inputSchema;
  tokenResolverResult: StatusStepResult<ReturnType<typeof createTokenResolver>>;
}): StatusStepResult<ResolvedComponent> {
  if (!tokenResolverResult.ok) {
    return createSkippedResult(tokenResolverResult.message);
  }

  return runStatusStep(() =>
    resolveComponent(schema, tokenResolverResult.value, context)
  );
}

function createResolutionItem({
  id,
  label,
  result
}: {
  id: string;
  label: string;
  result: StatusStepResult<ResolvedComponent>;
}): CompilerFlowStatusItem {
  if (!result.ok) {
    return createBlockedItem({
      detail: "Preview resolution did not complete.",
      id,
      label,
      messages: [result.message]
    });
  }

  return createReadyItem({
    detail: `${result.value.schema.name} resolved for default preview.`,
    id,
    label
  });
}

function emitPreviewRuntimeVariables(
  result: StatusStepResult<ResolvedComponent>
) {
  if (!result.ok) {
    return createSkippedResult<Record<string, string>>(result.message);
  }

  return runStatusStep(() =>
    emitComponentRuntimeVariables(result.value, {
      state: defaultPreviewState
    })
  );
}

function createRuntimeEmissionItem({
  id,
  label,
  result
}: {
  id: string;
  label: string;
  result: StatusStepResult<Record<string, string>>;
}): CompilerFlowStatusItem {
  if (!result.ok) {
    return createBlockedItem({
      detail: "Runtime emission did not complete.",
      id,
      label,
      messages: [result.message]
    });
  }

  return createReadyItem({
    detail: `${Object.keys(result.value).length} flat runtime variables for default preview.`,
    id,
    label
  });
}

function createPreviewAvailabilityItem(
  dependencies: readonly CompilerFlowStatusItem[]
): CompilerFlowStatusItem {
  const blockedDependencies = dependencies.filter(
    (dependency) => dependency.status === "blocked"
  );

  if (blockedDependencies.length > 0) {
    return createBlockedItem({
      detail: "Current Button/Input preview path is blocked by compiler status above.",
      id: "preview-availability",
      label: "Preview availability",
      messages: blockedDependencies.map((dependency) => dependency.label)
    });
  }

  return createReadyItem({
    detail: "PreviewCanvas Button/Input path is available.",
    id: "preview-availability",
    label: "Preview availability"
  });
}

function createCssExportItem(
  tokenStateAvailable: boolean,
  tokenResult: StatusStepResult<DesignTokens>
): CompilerFlowStatusItem {
  if (!tokenStateAvailable || !tokenResult.ok) {
    return createBlockedItem({
      detail: "CSS token export is blocked until token state is available.",
      id: "css-token-export",
      label: "CSS token export",
      messages: tokenResult.ok ? [] : [tokenResult.message]
    });
  }

  const result = runStatusStep(() => exportCss(tokenResult.value));

  if (!result.ok) {
    return createBlockedItem({
      detail: "CSS token export did not complete.",
      id: "css-token-export",
      label: "CSS token export",
      messages: [result.message]
    });
  }

  return createReadyItem({
    detail: "Current flat CSS variables available; token-only.",
    id: "css-token-export",
    label: "CSS token export"
  });
}

function createJsonExportItem(
  state: DesignState,
  tokenStateAvailable: boolean,
  tokenResult: StatusStepResult<DesignTokens>
): CompilerFlowStatusItem {
  if (!tokenStateAvailable || !tokenResult.ok) {
    return createBlockedItem({
      detail: "JSON token export is blocked until token state is available.",
      id: "json-token-export",
      label: "JSON token export",
      messages: tokenResult.ok ? [] : [tokenResult.message]
    });
  }

  const result = runStatusStep(() =>
    JSON.stringify(exportJson(tokenResult.value, state))
  );

  if (!result.ok) {
    return createBlockedItem({
      detail: "JSON token export did not complete.",
      id: "json-token-export",
      label: "JSON token export",
      messages: [result.message]
    });
  }

  return createReadyItem({
    detail: "Current token JSON shape available; no component code, adapters, runtimePlan, emitted variables, or graph fields.",
    id: "json-token-export",
    label: "JSON token export"
  });
}

function createReadyItem({
  detail,
  id,
  label
}: {
  detail: string;
  id: string;
  label: string;
}): CompilerFlowStatusItem {
  return {
    detail,
    id,
    label,
    messages: [],
    status: "ready"
  };
}

function createBlockedItem({
  detail,
  id,
  label,
  messages
}: {
  detail: string;
  id: string;
  label: string;
  messages: readonly string[];
}): CompilerFlowStatusItem {
  return {
    detail,
    id,
    label,
    messages,
    status: "blocked"
  };
}

function hasDesignStateCoreGroups(state: DesignState) {
  return Boolean(
    state.color &&
      state.component &&
      state.componentTokens &&
      state.layout &&
      state.motion &&
      state.variantSelections
  );
}

function findMissingTokenNames(tokens: DesignTokens) {
  return Object.entries(tokens as Record<string, unknown>)
    .filter(([, value]) => value === undefined)
    .map(([tokenName]) => tokenName);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
