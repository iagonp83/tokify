import { describe, expect, it } from "vitest";

import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  type DiagnosticEnvelope,
  type DiagnosticOrder
} from "../diagnostics/diagnosticContract";
import { formatDiagnosticsAsLegacyStrings } from "../diagnostics/legacyDiagnosticFormatter";
import type { ComponentSchema, ComponentVariantAxis } from "./component.types";
import { validateComponent } from "./validateComponent";

const baseSchema = {
  editable: {
    fields: ["variants"],
    tokenOnly: true
  },
  name: "VariantParityComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

function createSchema(
  variants: readonly ComponentVariantAxis[]
): ComponentSchema {
  return {
    ...baseSchema,
    variants
  };
}

function createVariantDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code:
    | "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS"
    | "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT";
  readonly message: string;
  readonly order: DiagnosticOrder;
  readonly path: ReturnType<typeof createDiagnosticPath>;
}): DiagnosticEnvelope {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order,
    path,
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponent"
    }
  });
}

describe("validateComponent variant diagnostic formatter parity", () => {
  it("formats empty variant options diagnostics to the current legacy string", () => {
    const schema = createSchema([
      {
        default: "primary",
        name: "tone",
        options: []
      }
    ]);
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
        message: legacyErrors[0],
        order: {
          bucket: 0,
          sequence: 0
        },
        path: createDiagnosticPath("variants", 0, "options")
      })
    ];

    expect(legacyErrors).toEqual([
      'Variant axis "tone" requires at least one option.'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats invalid variant default diagnostics to the current legacy string", () => {
    const schema = createSchema([
      {
        default: "lg",
        name: "size",
        options: ["sm", "md"]
      }
    ]);
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
        message: legacyErrors[0],
        order: {
          bucket: 0,
          sequence: 0
        },
        path: createDiagnosticPath("variants", 0, "default")
      })
    ];

    expect(legacyErrors).toEqual([
      'Variant axis "size" default "lg" must be one of its options.'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves combined variant diagnostic ordering without formatter sorting", () => {
    const schema = createSchema([
      {
        default: "primary",
        name: "tone",
        options: []
      },
      {
        default: "lg",
        name: "size",
        options: ["sm", "md"]
      }
    ]);
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("variants", 0, "options")
      }),
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
        message: legacyErrors[1],
        order: {
          bucket: 0,
          sequence: 0
        },
        path: createDiagnosticPath("variants", 1, "default")
      })
    ];

    expect(legacyErrors).toEqual([
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT"
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([1, 0]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("mirrors the empty-options short-circuit without adding invalid-default output", () => {
    const schema = createSchema([
      {
        default: "primary",
        name: "tone",
        options: []
      }
    ]);
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
        message: legacyErrors[0],
        order: {
          bucket: 0,
          sequence: 0
        },
        path: createDiagnosticPath("variants", 0, "options")
      })
    ];

    expect(legacyErrors).toHaveLength(1);
    expect(legacyErrors).toEqual([
      'Variant axis "tone" requires at least one option.'
    ]);
    expect(structuredDiagnostics).toHaveLength(1);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("does not mutate the schema input while collecting legacy parity strings", () => {
    const schema = createSchema([
      {
        default: "primary",
        name: "tone",
        options: []
      }
    ]);
    const schemaBeforeValidation = JSON.parse(JSON.stringify(schema));

    validateComponent(schema);

    expect(schema).toEqual(schemaBeforeValidation);
  });
});
