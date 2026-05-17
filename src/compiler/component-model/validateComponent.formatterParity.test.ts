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

type PresenceDiagnosticCode =
  | "SCHEMA_COMPONENT_NAME_REQUIRED"
  | "SCHEMA_ROOT_SLOT_REQUIRED"
  | "SCHEMA_DEFAULT_STATE_REQUIRED";

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

function createPresenceDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: PresenceDiagnosticCode;
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

describe("validateComponent presence diagnostic formatter parity", () => {
  it("formats component name required diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      name: " "
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createPresenceDiagnostic({
        code: "SCHEMA_COMPONENT_NAME_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: -1,
          sequence: 0
        },
        path: createDiagnosticPath("name")
      })
    ];

    expect(legacyErrors).toEqual(["Component name is required."]);
    expect(structuredDiagnostics[0].code).toBe(
      "SCHEMA_COMPONENT_NAME_REQUIRED"
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats root slot required diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      slots: [
        {
          name: "content",
          required: true,
          role: "content"
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createPresenceDiagnostic({
        code: "SCHEMA_ROOT_SLOT_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: -1,
          sequence: 1
        },
        path: createDiagnosticPath("slots")
      })
    ];

    expect(legacyErrors).toEqual(['Component requires a "root" slot.']);
    expect(structuredDiagnostics[0].code).toBe("SCHEMA_ROOT_SLOT_REQUIRED");
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats default state required diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      states: [{ name: "hover" }]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createPresenceDiagnostic({
        code: "SCHEMA_DEFAULT_STATE_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: -1,
          sequence: 2
        },
        path: createDiagnosticPath("states")
      })
    ];

    expect(legacyErrors).toEqual(['Component requires a "default" state.']);
    expect(structuredDiagnostics[0].code).toBe(
      "SCHEMA_DEFAULT_STATE_REQUIRED"
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves presence ordering before migrated variant-axis diagnostics", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      name: " ",
      slots: [
        {
          name: "content",
          required: true,
          role: "content"
        }
      ],
      states: [{ name: "hover" }],
      variants: [
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
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createPresenceDiagnostic({
        code: "SCHEMA_COMPONENT_NAME_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: -1,
          sequence: 0
        },
        path: createDiagnosticPath("name")
      }),
      createPresenceDiagnostic({
        code: "SCHEMA_ROOT_SLOT_REQUIRED",
        message: legacyErrors[1],
        order: {
          bucket: -1,
          sequence: 1
        },
        path: createDiagnosticPath("slots")
      }),
      createPresenceDiagnostic({
        code: "SCHEMA_DEFAULT_STATE_REQUIRED",
        message: legacyErrors[2],
        order: {
          bucket: -1,
          sequence: 2
        },
        path: createDiagnosticPath("states")
      }),
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
        message: legacyErrors[3],
        order: {
          bucket: 0,
          sequence: 0
        },
        path: createDiagnosticPath("variants", 0, "options")
      }),
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
        message: legacyErrors[4],
        order: {
          bucket: 0,
          sequence: 3
        },
        path: createDiagnosticPath("variants", 1, "default")
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "root" slot.',
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_ROOT_SLOT_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT"
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats presence diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createPresenceDiagnostic({
        code: "SCHEMA_ROOT_SLOT_REQUIRED",
        message: 'Component requires a "root" slot.',
        order: {
          bucket: -1,
          sequence: 1
        },
        path: createDiagnosticPath("slots")
      }),
      createPresenceDiagnostic({
        code: "SCHEMA_COMPONENT_NAME_REQUIRED",
        message: "Component name is required.",
        order: {
          bucket: -1,
          sequence: 0
        },
        path: createDiagnosticPath("name")
      }),
      createPresenceDiagnostic({
        code: "SCHEMA_DEFAULT_STATE_REQUIRED",
        message: 'Component requires a "default" state.',
        order: {
          bucket: -1,
          sequence: 2
        },
        path: createDiagnosticPath("states")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([1, 0, 2]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Component requires a "root" slot.',
      "Component name is required.",
      'Component requires a "default" state.'
    ]);
  });

  it("does not mutate presence diagnostic fixtures while formatting", () => {
    const componentNameDiagnostic = createPresenceDiagnostic({
      code: "SCHEMA_COMPONENT_NAME_REQUIRED",
      message: "Component name is required.",
      order: {
        bucket: -1,
        sequence: 0
      },
      path: createDiagnosticPath("name")
    });
    const rootSlotDiagnostic = createPresenceDiagnostic({
      code: "SCHEMA_ROOT_SLOT_REQUIRED",
      message: 'Component requires a "root" slot.',
      order: {
        bucket: -1,
        sequence: 1
      },
      path: createDiagnosticPath("slots")
    });
    const diagnostics = [rootSlotDiagnostic, componentNameDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const componentNameDiagnosticBeforeFormat = {
      ...componentNameDiagnostic,
      order: { ...componentNameDiagnostic.order },
      path: [...componentNameDiagnostic.path],
      source: { ...componentNameDiagnostic.source }
    };
    const rootSlotDiagnosticBeforeFormat = {
      ...rootSlotDiagnostic,
      order: { ...rootSlotDiagnostic.order },
      path: [...rootSlotDiagnostic.path],
      source: { ...rootSlotDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Component requires a "root" slot.',
      "Component name is required."
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(componentNameDiagnostic).toEqual(
      componentNameDiagnosticBeforeFormat
    );
    expect(rootSlotDiagnostic).toEqual(rootSlotDiagnosticBeforeFormat);
  });
});

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
