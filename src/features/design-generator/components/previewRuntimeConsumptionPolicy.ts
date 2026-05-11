import type { CSSProperties } from "react";

export type PreviewRuntimeConsumptionMode =
  | "runtime-var"
  | "direct-value"
  | "direct-longhand"
  | "omit-shorthand";

export type PreviewRuntimeTarget = "preview-react-inline";

export type PreviewRuntimeComponentNamespace = "button" | "input";

export type PreviewRuntimeSlot = "root" | "label" | "icon";

export type PreviewRuntimeProperty =
  | "background"
  | "borderRadius"
  | "boxShadow"
  | "color"
  | "opacity"
  | "paddingBlock"
  | "paddingInline"
  | "transition"
  | "transitionDelay"
  | "transitionDuration"
  | "transitionProperty"
  | "transitionTimingFunction";

export type PreviewRuntimeConsumptionRequest = {
  componentNamespace: PreviewRuntimeComponentNamespace;
  property: PreviewRuntimeProperty;
  slot: PreviewRuntimeSlot;
  target: PreviewRuntimeTarget;
};

type PreviewRuntimeConsumptionPolicy = PreviewRuntimeConsumptionRequest & {
  mode: PreviewRuntimeConsumptionMode;
};

const previewRuntimeConsumptionPolicies = [
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "background",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "color",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "borderRadius",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "boxShadow",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "opacity",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "paddingBlock",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "paddingInline",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "direct-longhand",
    property: "transitionDelay",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "direct-longhand",
    property: "transitionDuration",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "direct-longhand",
    property: "transitionProperty",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "direct-longhand",
    property: "transitionTimingFunction",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "omit-shorthand",
    property: "transition",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "color",
    slot: "label",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "button",
    mode: "runtime-var",
    property: "color",
    slot: "icon",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "runtime-var",
    property: "color",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "runtime-var",
    property: "borderRadius",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "runtime-var",
    property: "paddingBlock",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "runtime-var",
    property: "paddingInline",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-value",
    property: "background",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-value",
    property: "boxShadow",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-value",
    property: "opacity",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-longhand",
    property: "transitionDelay",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-longhand",
    property: "transitionDuration",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-longhand",
    property: "transitionProperty",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "direct-longhand",
    property: "transitionTimingFunction",
    slot: "root",
    target: "preview-react-inline"
  },
  {
    componentNamespace: "input",
    mode: "omit-shorthand",
    property: "transition",
    slot: "root",
    target: "preview-react-inline"
  }
] as const satisfies readonly PreviewRuntimeConsumptionPolicy[];

export function getPreviewRuntimeConsumptionMode(
  request: PreviewRuntimeConsumptionRequest
): PreviewRuntimeConsumptionMode {
  return findPreviewRuntimeConsumptionPolicy(request).mode;
}

export function consumePreviewRuntimeStyleValue<
  Property extends PreviewRuntimeProperty & keyof CSSProperties
>(
  request: Omit<PreviewRuntimeConsumptionRequest, "property"> & {
    property: Property;
    style: CSSProperties;
  }
): CSSProperties[Property] | undefined {
  const mode = getPreviewRuntimeConsumptionMode(request);

  if (mode === "runtime-var") {
    return createPreviewRuntimeVariableReference(request) as CSSProperties[Property];
  }

  if (mode === "omit-shorthand") {
    return undefined;
  }

  return request.style[request.property] as CSSProperties[Property] | undefined;
}

export function omitPreviewRuntimeStyleProperties(
  request: Omit<PreviewRuntimeConsumptionRequest, "property"> & {
    style: CSSProperties;
  }
): CSSProperties {
  const nextStyle = { ...request.style };

  previewRuntimeConsumptionPolicies
    .filter(
      (policy) =>
        isMatchingPreviewRuntimeConsumptionScope(policy, request) &&
        policy.mode === "omit-shorthand"
    )
    .forEach((policy) => {
      delete nextStyle[policy.property as keyof CSSProperties];
    });

  return nextStyle;
}

function findPreviewRuntimeConsumptionPolicy(
  request: PreviewRuntimeConsumptionRequest
) {
  const policy = previewRuntimeConsumptionPolicies.find((candidate) =>
    isMatchingPreviewRuntimeConsumptionRequest(candidate, request)
  );

  if (!policy) {
    throw new Error(
      [
        "Missing PreviewCanvas runtime consumption policy for",
        `${request.target}.${request.componentNamespace}.${request.slot}.${request.property}.`
      ].join(" ")
    );
  }

  return policy;
}

function isMatchingPreviewRuntimeConsumptionRequest(
  policy: PreviewRuntimeConsumptionPolicy,
  request: PreviewRuntimeConsumptionRequest
) {
  return (
    isMatchingPreviewRuntimeConsumptionScope(policy, request) &&
    policy.property === request.property
  );
}

function isMatchingPreviewRuntimeConsumptionScope(
  policy: Omit<PreviewRuntimeConsumptionPolicy, "property" | "mode">,
  request: Omit<PreviewRuntimeConsumptionRequest, "property">
) {
  return (
    policy.target === request.target &&
    policy.componentNamespace === request.componentNamespace &&
    policy.slot === request.slot
  );
}

function createPreviewRuntimeVariableReference(
  request: PreviewRuntimeConsumptionRequest
) {
  return `var(${createPreviewRuntimeVariableName(request)})`;
}

function createPreviewRuntimeVariableName({
  componentNamespace,
  property,
  slot
}: PreviewRuntimeConsumptionRequest) {
  const propertySegment = toKebabSegment(property);

  if (slot === "root") {
    return `--${toKebabSegment(componentNamespace)}-${propertySegment}`;
  }

  return `--${toKebabSegment(componentNamespace)}-${toKebabSegment(
    slot
  )}-${propertySegment}`;
}

function toKebabSegment(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
