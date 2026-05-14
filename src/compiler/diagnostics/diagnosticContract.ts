export const diagnosticSeverities = {
  error: "error",
  info: "info",
  warning: "warning"
} as const;

export type DiagnosticSeverity =
  (typeof diagnosticSeverities)[keyof typeof diagnosticSeverities];

export const diagnosticLayers = {
  adapter: "adapter",
  export: "export",
  graph: "graph",
  import: "import",
  preview: "preview",
  registry: "registry",
  resolver: "resolver",
  runtime: "runtime",
  schema: "schema"
} as const;

export type DiagnosticLayer =
  (typeof diagnosticLayers)[keyof typeof diagnosticLayers];

export type DiagnosticCode = string;

export type DiagnosticPathSegment = number | string;

export type DiagnosticPath = readonly DiagnosticPathSegment[];

export type DiagnosticSource = {
  readonly name: string;
};

export type DiagnosticOrder = {
  readonly bucket: number;
  readonly sequence: number;
};

export type DiagnosticSuggestion = {
  readonly message: string;
  readonly path?: DiagnosticPath;
};

export type DiagnosticEnvelope<Code extends DiagnosticCode = DiagnosticCode> = {
  readonly code: Code;
  readonly layer: DiagnosticLayer;
  readonly message: string;
  readonly order: DiagnosticOrder;
  readonly path: DiagnosticPath;
  readonly severity: DiagnosticSeverity;
  readonly source: DiagnosticSource;
  readonly suggestions?: readonly DiagnosticSuggestion[];
};

export type DiagnosticEnvelopeInput<
  Code extends DiagnosticCode = DiagnosticCode
> = DiagnosticEnvelope<Code>;

const diagnosticSeverityOrder = {
  error: 0,
  warning: 1,
  info: 2
} satisfies Record<DiagnosticSeverity, number>;

const diagnosticLayerOrder = {
  schema: 0,
  registry: 1,
  graph: 2,
  resolver: 3,
  runtime: 4,
  import: 5,
  export: 6,
  preview: 7,
  adapter: 8
} satisfies Record<DiagnosticLayer, number>;

export function createDiagnosticPath(
  ...segments: DiagnosticPathSegment[]
): DiagnosticPath {
  return segments;
}

export function createDiagnostic<Code extends DiagnosticCode>(
  diagnostic: DiagnosticEnvelopeInput<Code>
): DiagnosticEnvelope<Code> {
  return {
    code: diagnostic.code,
    layer: diagnostic.layer,
    message: diagnostic.message,
    order: { ...diagnostic.order },
    path: [...diagnostic.path],
    severity: diagnostic.severity,
    source: { ...diagnostic.source },
    ...(diagnostic.suggestions
      ? {
          suggestions: diagnostic.suggestions.map((suggestion) => ({
            message: suggestion.message,
            ...(suggestion.path ? { path: [...suggestion.path] } : {})
          }))
        }
      : {})
  };
}

export function sortDiagnostics<Diagnostic extends DiagnosticEnvelope>(
  diagnostics: readonly Diagnostic[]
): Diagnostic[] {
  return [...diagnostics].sort(compareDiagnostics);
}

export function compareDiagnostics(
  left: DiagnosticEnvelope,
  right: DiagnosticEnvelope
): number {
  return (
    compareNumber(left.order.bucket, right.order.bucket) ||
    compareNumber(left.order.sequence, right.order.sequence) ||
    compareNumber(
      diagnosticSeverityOrder[left.severity],
      diagnosticSeverityOrder[right.severity]
    ) ||
    compareNumber(
      diagnosticLayerOrder[left.layer],
      diagnosticLayerOrder[right.layer]
    ) ||
    compareString(left.source.name, right.source.name) ||
    compareString(left.code, right.code) ||
    compareDiagnosticPath(left.path, right.path) ||
    compareString(left.message, right.message)
  );
}

function compareDiagnosticPath(
  left: DiagnosticPath,
  right: DiagnosticPath
): number {
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const comparison = compareDiagnosticPathSegment(left[index], right[index]);

    if (comparison !== 0) {
      return comparison;
    }
  }

  return compareNumber(left.length, right.length);
}

function compareDiagnosticPathSegment(
  left: DiagnosticPathSegment,
  right: DiagnosticPathSegment
): number {
  if (typeof left === "number" && typeof right === "number") {
    return compareNumber(left, right);
  }

  if (typeof left === "number") {
    return -1;
  }

  if (typeof right === "number") {
    return 1;
  }

  return compareString(left, right);
}

function compareNumber(left: number, right: number): number {
  return left - right;
}

function compareString(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
