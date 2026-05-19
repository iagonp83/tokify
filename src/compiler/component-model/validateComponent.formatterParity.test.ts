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

type TokenBindingDiagnosticCode =
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT"
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE"
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS"
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION";

type CompositionSlotRelationDiagnosticCode =
  | "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT"
  | "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT"
  | "SCHEMA_COMPOSITION_SLOT_RELATION_SELF_PARENT";

type CompositionPartDiagnosticCode = "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT";

type CompositionChildMetadataShapeDiagnosticCode =
  | "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED"
  | "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED";

type CompositionChildLocalSlotReferenceDiagnosticCode =
  "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT";

type DuplicateLocalCompositionMetadataDiagnosticCode =
  | "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE"
  | "SCHEMA_COMPOSITION_PART_DUPLICATE"
  | "SCHEMA_COMPOSITION_CHILD_DUPLICATE";

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

function createTokenBindingDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: TokenBindingDiagnosticCode;
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

function createCompositionSlotRelationDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: CompositionSlotRelationDiagnosticCode;
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

function createCompositionPartDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: CompositionPartDiagnosticCode;
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

function createCompositionChildMetadataShapeDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: CompositionChildMetadataShapeDiagnosticCode;
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

function createCompositionChildLocalSlotReferenceDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: CompositionChildLocalSlotReferenceDiagnosticCode;
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

function createDuplicateLocalCompositionMetadataDiagnostic({
  code,
  message,
  order,
  path
}: {
  readonly code: DuplicateLocalCompositionMetadataDiagnosticCode;
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

describe("validateComponent token binding diagnostic formatter parity", () => {
  it("formats unknown token binding slot diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          slot: "missingSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown slot "missingSlot".'
    ]);
    expect(structuredDiagnostics[0].code).toBe(
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT"
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats unknown token binding state diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          conditions: {
            state: "focus"
          },
          slot: "root",
          target: "background",
          token: "semantic.color.accent"
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "state")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown state "focus".'
    ]);
    expect(structuredDiagnostics[0].code).toBe(
      "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE"
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats unknown token binding variant-axis diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          conditions: {
            emphasis: "strong"
          },
          slot: "root",
          target: "background",
          token: "semantic.color.accent"
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "emphasis")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown variant axis "emphasis".'
    ]);
    expect(legacyErrors).not.toContain(
      'Token binding "background" references unknown emphasis option "strong".'
    );
    expect(structuredDiagnostics[0].code).toBe(
      "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS"
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats unknown token binding variant-option diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          conditions: {
            tone: "secondary"
          },
          slot: "root",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
      variants: [
        {
          default: "primary",
          name: "tone",
          options: ["primary"]
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "tone")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown tone option "secondary".'
    ]);
    expect(structuredDiagnostics[0].code).toBe(
      "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION"
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves migrated-family ordering before token binding diagnostics", () => {
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
      tokenBindings: [
        {
          conditions: {
            state: "focus",
            tone: "primary",
            emphasis: "strong",
            size: "xl"
          },
          slot: "missingSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
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
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[5],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
        message: legacyErrors[6],
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "state")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
        message: legacyErrors[7],
        order: {
          bucket: 1,
          sequence: 2
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "tone")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS",
        message: legacyErrors[8],
        order: {
          bucket: 1,
          sequence: 3
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "emphasis")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
        message: legacyErrors[9],
        order: {
          bucket: 1,
          sequence: 4
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "size")
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "root" slot.',
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.',
      'Token binding "background" references unknown slot "missingSlot".',
      'Token binding "background" references unknown state "focus".',
      'Token binding "background" references unknown tone option "primary".',
      'Token binding "background" references unknown variant axis "emphasis".',
      'Token binding "background" references unknown size option "xl".'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_ROOT_SLOT_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION"
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves authored token binding array order", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          slot: "firstMissingSlot",
          target: "background",
          token: "semantic.color.accent"
        },
        {
          slot: "secondMissingSlot",
          target: "color",
          token: "semantic.color.foreground"
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[1],
        order: {
          bucket: 1,
          sequence: 10
        },
        path: createDiagnosticPath("tokenBindings", 1, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown slot "firstMissingSlot".',
      'Token binding "color" references unknown slot "secondMissingSlot".'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves authored token binding condition order", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          conditions: {
            state: "focus",
            tone: "secondary",
            emphasis: "strong",
            size: "xl"
          },
          slot: "root",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
      variants: [
        {
          default: "primary",
          name: "tone",
          options: ["primary"]
        },
        {
          default: "sm",
          name: "size",
          options: ["sm"]
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "state")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
        message: legacyErrors[1],
        order: {
          bucket: 1,
          sequence: 2
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "tone")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS",
        message: legacyErrors[2],
        order: {
          bucket: 1,
          sequence: 3
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "emphasis")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
        message: legacyErrors[3],
        order: {
          bucket: 1,
          sequence: 4
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "size")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown state "focus".',
      'Token binding "background" references unknown tone option "secondary".',
      'Token binding "background" references unknown variant axis "emphasis".',
      'Token binding "background" references unknown size option "xl".'
    ]);
    expect(legacyErrors).not.toContain(
      'Token binding "background" references unknown emphasis option "strong".'
    );
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("skips undefined token binding condition entries", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      tokenBindings: [
        {
          conditions: {
            state: undefined,
            tone: "secondary",
            emphasis: undefined
          },
          slot: "root",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
      variants: [
        {
          default: "primary",
          name: "tone",
          options: ["primary"]
        }
      ]
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
        message: legacyErrors[0],
        order: {
          bucket: 1,
          sequence: 2
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "tone")
      })
    ];

    expect(legacyErrors).toEqual([
      'Token binding "background" references unknown tone option "secondary".'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats token binding diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS",
        message:
          'Token binding "background" references unknown variant axis "emphasis".',
        order: {
          bucket: 1,
          sequence: 3
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "emphasis")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message:
          'Token binding "background" references unknown slot "missingSlot".',
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
        message:
          'Token binding "background" references unknown state "focus".',
        order: {
          bucket: 1,
          sequence: 1
        },
        path: createDiagnosticPath("tokenBindings", 0, "conditions", "state")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([3, 0, 1]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Token binding "background" references unknown variant axis "emphasis".',
      'Token binding "background" references unknown slot "missingSlot".',
      'Token binding "background" references unknown state "focus".'
    ]);
  });

  it("does not mutate token binding diagnostic fixtures while formatting", () => {
    const unknownSlotDiagnostic = createTokenBindingDiagnostic({
      code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      message: 'Token binding "background" references unknown slot "missingSlot".',
      order: {
        bucket: 1,
        sequence: 0
      },
      path: createDiagnosticPath("tokenBindings", 0, "slot")
    });
    const unknownStateDiagnostic = createTokenBindingDiagnostic({
      code: "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
      message: 'Token binding "background" references unknown state "focus".',
      order: {
        bucket: 1,
        sequence: 1
      },
      path: createDiagnosticPath("tokenBindings", 0, "conditions", "state")
    });
    const diagnostics = [unknownStateDiagnostic, unknownSlotDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const unknownSlotDiagnosticBeforeFormat = {
      ...unknownSlotDiagnostic,
      order: { ...unknownSlotDiagnostic.order },
      path: [...unknownSlotDiagnostic.path],
      source: { ...unknownSlotDiagnostic.source }
    };
    const unknownStateDiagnosticBeforeFormat = {
      ...unknownStateDiagnostic,
      order: { ...unknownStateDiagnostic.order },
      path: [...unknownStateDiagnostic.path],
      source: { ...unknownStateDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Token binding "background" references unknown state "focus".',
      'Token binding "background" references unknown slot "missingSlot".'
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(unknownSlotDiagnostic).toEqual(unknownSlotDiagnosticBeforeFormat);
    expect(unknownStateDiagnostic).toEqual(unknownStateDiagnosticBeforeFormat);
  });
});

describe("validateComponent composition slot relation diagnostic formatter parity", () => {
  it("formats unknown composition slot relation slot diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "missingSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation references unknown slot "missingSlot".'
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 2,
        sequence: 0
      },
      path: ["composition", "slotRelations", 0, "slot"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats unknown composition slot relation parent-slot diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "root"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation references unknown parent slot "missingParent".'
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 2,
        sequence: 1
      },
      path: ["composition", "slotRelations", 0, "parentSlot"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats composition slot relation self-parent diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      slots: [
        ...baseSchema.slots,
        {
          name: "content",
          required: true,
          role: "content"
        }
      ],
      composition: {
        slotRelations: [
          {
            parentSlot: "content",
            slot: "content"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_SELF_PARENT",
        message: legacyErrors[0],
        order: {
          bucket: 6,
          sequence: 0
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation "content" cannot reference itself as parent.'
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_SLOT_RELATION_SELF_PARENT",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 6,
        sequence: 0
      },
      path: ["composition", "slotRelations", 0, "parentSlot"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves duplicate self-parent formatter output in input order", () => {
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_SELF_PARENT",
        message:
          'Composition slot relation "content" cannot reference itself as parent.',
        order: {
          bucket: 6,
          sequence: 0
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_SELF_PARENT",
        message:
          'Composition slot relation "content" cannot reference itself as parent.',
        order: {
          bucket: 6,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          1,
          "parentSlot"
        )
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([0, 1]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Composition slot relation "content" cannot reference itself as parent.',
      'Composition slot relation "content" cannot reference itself as parent.'
    ]);
  });

  it("preserves migrated-family ordering before composition slot relation diagnostics", () => {
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
      tokenBindings: [
        {
          slot: "missingTokenSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
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
      ],
      composition: {
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
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
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[5],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[6],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: legacyErrors[7],
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "root" slot.',
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.',
      'Token binding "background" references unknown slot "missingTokenSlot".',
      'Composition slot relation references unknown slot "missingRelationSlot".',
      'Composition slot relation references unknown parent slot "missingParent".'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_ROOT_SLOT_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT"
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.bucket)
    ).toEqual([-1, -1, -1, 0, 0, 1, 2, 2]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves authored slot relation array order", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "firstMissingSlot"
          },
          {
            parentSlot: "root",
            slot: "secondMissingSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[1],
        order: {
          bucket: 2,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "slotRelations", 1, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation references unknown slot "firstMissingSlot".',
      'Composition slot relation references unknown slot "secondMissingSlot".'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves unknown slot before unknown parent slot for the same relation", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: legacyErrors[1],
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation references unknown slot "missingSlot".',
      'Composition slot relation references unknown parent slot "missingParent".'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats composition slot relation diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message:
          'Composition slot relation references unknown parent slot "missingParent".',
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: 'Composition slot relation references unknown slot "missingSlot".',
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([1, 0]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Composition slot relation references unknown parent slot "missingParent".',
      'Composition slot relation references unknown slot "missingSlot".'
    ]);
  });

  it("does not mutate composition slot relation diagnostic fixtures while formatting", () => {
    const unknownSlotDiagnostic = createCompositionSlotRelationDiagnostic({
      code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      message: 'Composition slot relation references unknown slot "missingSlot".',
      order: {
        bucket: 2,
        sequence: 0
      },
      path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
    });
    const unknownParentSlotDiagnostic = createCompositionSlotRelationDiagnostic({
      code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
      message:
        'Composition slot relation references unknown parent slot "missingParent".',
      order: {
        bucket: 2,
        sequence: 1
      },
      path: createDiagnosticPath(
        "composition",
        "slotRelations",
        0,
        "parentSlot"
      )
    });
    const diagnostics = [unknownParentSlotDiagnostic, unknownSlotDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const unknownSlotDiagnosticBeforeFormat = {
      ...unknownSlotDiagnostic,
      order: { ...unknownSlotDiagnostic.order },
      path: [...unknownSlotDiagnostic.path],
      source: { ...unknownSlotDiagnostic.source }
    };
    const unknownParentSlotDiagnosticBeforeFormat = {
      ...unknownParentSlotDiagnostic,
      order: { ...unknownParentSlotDiagnostic.order },
      path: [...unknownParentSlotDiagnostic.path],
      source: { ...unknownParentSlotDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Composition slot relation references unknown parent slot "missingParent".',
      'Composition slot relation references unknown slot "missingSlot".'
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(unknownSlotDiagnostic).toEqual(unknownSlotDiagnosticBeforeFormat);
    expect(unknownParentSlotDiagnostic).toEqual(
      unknownParentSlotDiagnosticBeforeFormat
    );
  });
});

describe("validateComponent composition part diagnostic formatter parity", () => {
  it("formats unknown composition part slot diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        parts: [
          {
            name: "label",
            slot: "missingSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition part "label" references unknown slot "missingSlot".'
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 3,
        sequence: 0
      },
      path: ["composition", "parts", 0, "slot"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves migrated-family ordering before composition part diagnostics", () => {
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
      tokenBindings: [
        {
          slot: "missingTokenSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
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
      ],
      composition: {
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
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
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[5],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[6],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: legacyErrors[7],
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      }),
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[8],
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "root" slot.',
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.',
      'Token binding "background" references unknown slot "missingTokenSlot".',
      'Composition slot relation references unknown slot "missingRelationSlot".',
      'Composition slot relation references unknown parent slot "missingParent".',
      'Composition part "label" references unknown slot "missingPartSlot".'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_ROOT_SLOT_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
      "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT"
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.bucket)
    ).toEqual([-1, -1, -1, 0, 0, 1, 2, 2, 3]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves authored composition part array order", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        parts: [
          {
            name: "label",
            slot: "firstMissingSlot"
          },
          {
            name: "icon",
            slot: "secondMissingSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      }),
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[1],
        order: {
          bucket: 3,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "parts", 1, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition part "label" references unknown slot "firstMissingSlot".',
      'Composition part "icon" references unknown slot "secondMissingSlot".'
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats composition part diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message:
          'Composition part "icon" references unknown slot "secondMissingSlot".',
        order: {
          bucket: 3,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "parts", 1, "slot")
      }),
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message:
          'Composition part "label" references unknown slot "firstMissingSlot".',
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([1, 0]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Composition part "icon" references unknown slot "secondMissingSlot".',
      'Composition part "label" references unknown slot "firstMissingSlot".'
    ]);
  });

  it("does not mutate composition part diagnostic fixtures while formatting", () => {
    const firstPartDiagnostic = createCompositionPartDiagnostic({
      code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
      message:
        'Composition part "label" references unknown slot "firstMissingSlot".',
      order: {
        bucket: 3,
        sequence: 0
      },
      path: createDiagnosticPath("composition", "parts", 0, "slot")
    });
    const secondPartDiagnostic = createCompositionPartDiagnostic({
      code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
      message:
        'Composition part "icon" references unknown slot "secondMissingSlot".',
      order: {
        bucket: 3,
        sequence: 1
      },
      path: createDiagnosticPath("composition", "parts", 1, "slot")
    });
    const diagnostics = [secondPartDiagnostic, firstPartDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const firstPartDiagnosticBeforeFormat = {
      ...firstPartDiagnostic,
      order: { ...firstPartDiagnostic.order },
      path: [...firstPartDiagnostic.path],
      source: { ...firstPartDiagnostic.source }
    };
    const secondPartDiagnosticBeforeFormat = {
      ...secondPartDiagnostic,
      order: { ...secondPartDiagnostic.order },
      path: [...secondPartDiagnostic.path],
      source: { ...secondPartDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Composition part "icon" references unknown slot "secondMissingSlot".',
      'Composition part "label" references unknown slot "firstMissingSlot".'
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(firstPartDiagnostic).toEqual(firstPartDiagnosticBeforeFormat);
    expect(secondPartDiagnostic).toEqual(secondPartDiagnosticBeforeFormat);
  });
});

describe("validateComponent composition child metadata shape diagnostic formatter parity", () => {
  it("formats blank composition child name diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Icon",
            name: " ",
            slot: "root"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      })
    ];

    expect(legacyErrors).toEqual(["Composition child name is required."]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 4,
        sequence: 0
      },
      path: ["composition", "children", 0, "name"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats named composition child component-required diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        children: [
          {
            component: " ",
            name: "leadingIcon",
            slot: "root"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition child "leadingIcon" requires a component reference.'
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 4,
        sequence: 1
      },
      path: ["composition", "children", 0, "component"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats unnamed composition child component-required diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "root"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[1],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      })
    ];

    expect(legacyErrors).toEqual([
      "Composition child name is required.",
      "Composition child requires a component reference."
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 4,
        sequence: 1
      },
      path: ["composition", "children", 0, "component"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      legacyErrors[1]
    ]);
  });

  it("preserves migrated-family ordering before composition child metadata shape diagnostics", () => {
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
      tokenBindings: [
        {
          slot: "missingTokenSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
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
      ],
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "content"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
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
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[5],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[6],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: legacyErrors[7],
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      }),
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[8],
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: legacyErrors[9],
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[10],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "root" slot.',
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.',
      'Token binding "background" references unknown slot "missingTokenSlot".',
      'Composition slot relation references unknown slot "missingRelationSlot".',
      'Composition slot relation references unknown parent slot "missingParent".',
      'Composition part "label" references unknown slot "missingPartSlot".',
      "Composition child name is required.",
      "Composition child requires a component reference."
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_ROOT_SLOT_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
      "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
      "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED"
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.bucket)
    ).toEqual([-1, -1, -1, 0, 0, 1, 2, 2, 3, 4, 4]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves composition child array order and same-child metadata shape ordering", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "root"
          },
          {
            component: " ",
            name: "field",
            slot: "root"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[1],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[2],
        order: {
          bucket: 4,
          sequence: 3
        },
        path: createDiagnosticPath("composition", "children", 1, "component")
      })
    ];

    expect(legacyErrors).toEqual([
      "Composition child name is required.",
      "Composition child requires a component reference.",
      'Composition child "field" requires a component reference.'
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([0, 1, 3]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats composition child metadata shape diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: 'Composition child "field" requires a component reference.',
        order: {
          bucket: 4,
          sequence: 3
        },
        path: createDiagnosticPath("composition", "children", 1, "component")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: "Composition child name is required.",
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([3, 0]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Composition child "field" requires a component reference.',
      "Composition child name is required."
    ]);
  });

  it("does not mutate composition child metadata shape diagnostic fixtures while formatting", () => {
    const nameDiagnostic = createCompositionChildMetadataShapeDiagnostic({
      code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
      message: "Composition child name is required.",
      order: {
        bucket: 4,
        sequence: 0
      },
      path: createDiagnosticPath("composition", "children", 0, "name")
    });
    const componentDiagnostic = createCompositionChildMetadataShapeDiagnostic({
      code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
      message: 'Composition child "field" requires a component reference.',
      order: {
        bucket: 4,
        sequence: 3
      },
      path: createDiagnosticPath("composition", "children", 1, "component")
    });
    const diagnostics = [componentDiagnostic, nameDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const nameDiagnosticBeforeFormat = {
      ...nameDiagnostic,
      order: { ...nameDiagnostic.order },
      path: [...nameDiagnostic.path],
      source: { ...nameDiagnostic.source }
    };
    const componentDiagnosticBeforeFormat = {
      ...componentDiagnostic,
      order: { ...componentDiagnostic.order },
      path: [...componentDiagnostic.path],
      source: { ...componentDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Composition child "field" requires a component reference.',
      "Composition child name is required."
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(nameDiagnostic).toEqual(nameDiagnosticBeforeFormat);
    expect(componentDiagnostic).toEqual(componentDiagnosticBeforeFormat);
  });
});

describe("validateComponent composition child local slot reference diagnostic formatter parity", () => {
  it("formats unknown composition child slot diagnostics to the current legacy string", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        children: [
          {
            component: "Badge",
            name: "badge",
            slot: "missingChildSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message: legacyErrors[0],
        order: {
          bucket: 5,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition child "badge" references unknown slot "missingChildSlot".'
    ]);
    expect(structuredDiagnostics[0]).toMatchObject({
      code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
      layer: diagnosticLayers.schema,
      order: {
        bucket: 5,
        sequence: 0
      },
      path: ["composition", "children", 0, "slot"],
      severity: diagnosticSeverities.error,
      source: {
        name: "validateComponent"
      }
    });
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves migrated-family ordering before composition child local slot reference diagnostics", () => {
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
      tokenBindings: [
        {
          slot: "missingTokenSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
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
      ],
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "missingChildSlot"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          }
        ],
        slotRelations: [
          {
            parentSlot: "missingParent",
            slot: "missingRelationSlot"
          }
        ]
      }
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
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[5],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[6],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: legacyErrors[7],
        order: {
          bucket: 2,
          sequence: 1
        },
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          0,
          "parentSlot"
        )
      }),
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[8],
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: legacyErrors[9],
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[10],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      }),
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message: legacyErrors[11],
        order: {
          bucket: 5,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "children", 0, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "root" slot.',
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.',
      'Token binding "background" references unknown slot "missingTokenSlot".',
      'Composition slot relation references unknown slot "missingRelationSlot".',
      'Composition slot relation references unknown parent slot "missingParent".',
      'Composition part "label" references unknown slot "missingPartSlot".',
      "Composition child name is required.",
      "Composition child requires a component reference.",
      'Composition child " " references unknown slot "missingChildSlot".'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_ROOT_SLOT_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
      "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
      "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
      "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT"
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.bucket)
    ).toEqual([-1, -1, -1, 0, 0, 1, 2, 2, 3, 4, 4, 5]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves composition child array order and same-child metadata-before-slot ordering", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "firstMissingSlot"
          },
          {
            component: "Badge",
            name: "badge",
            slot: "secondMissingSlot"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: legacyErrors[0],
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[1],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      }),
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message: legacyErrors[2],
        order: {
          bucket: 5,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "children", 0, "slot")
      }),
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message: legacyErrors[3],
        order: {
          bucket: 5,
          sequence: 5
        },
        path: createDiagnosticPath("composition", "children", 1, "slot")
      })
    ];

    expect(legacyErrors).toEqual([
      "Composition child name is required.",
      "Composition child requires a component reference.",
      'Composition child " " references unknown slot "firstMissingSlot".',
      'Composition child "badge" references unknown slot "secondMissingSlot".'
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([0, 1, 2, 5]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats composition child local slot reference diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message:
          'Composition child "icon" references unknown slot "secondMissingSlot".',
        order: {
          bucket: 5,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 1, "slot")
      }),
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message:
          'Composition child "label" references unknown slot "firstMissingSlot".',
        order: {
          bucket: 5,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "slot")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([1, 0]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Composition child "icon" references unknown slot "secondMissingSlot".',
      'Composition child "label" references unknown slot "firstMissingSlot".'
    ]);
  });

  it("does not mutate composition child local slot reference diagnostic fixtures while formatting", () => {
    const firstChildDiagnostic = createCompositionChildLocalSlotReferenceDiagnostic({
      code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
      message:
        'Composition child "label" references unknown slot "firstMissingSlot".',
      order: {
        bucket: 5,
        sequence: 0
      },
      path: createDiagnosticPath("composition", "children", 0, "slot")
    });
    const secondChildDiagnostic =
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message:
          'Composition child "icon" references unknown slot "secondMissingSlot".',
        order: {
          bucket: 5,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 1, "slot")
      });
    const diagnostics = [secondChildDiagnostic, firstChildDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const firstChildDiagnosticBeforeFormat = {
      ...firstChildDiagnostic,
      order: { ...firstChildDiagnostic.order },
      path: [...firstChildDiagnostic.path],
      source: { ...firstChildDiagnostic.source }
    };
    const secondChildDiagnosticBeforeFormat = {
      ...secondChildDiagnostic,
      order: { ...secondChildDiagnostic.order },
      path: [...secondChildDiagnostic.path],
      source: { ...secondChildDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Composition child "icon" references unknown slot "secondMissingSlot".',
      'Composition child "label" references unknown slot "firstMissingSlot".'
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(firstChildDiagnostic).toEqual(firstChildDiagnosticBeforeFormat);
    expect(secondChildDiagnostic).toEqual(secondChildDiagnosticBeforeFormat);
  });
});

describe("validateComponent duplicate local composition metadata diagnostic formatter parity", () => {
  it("formats duplicate composition metadata diagnostics to the current legacy strings", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      slots: [
        ...baseSchema.slots,
        {
          name: "content",
          required: true,
          role: "content"
        }
      ],
      composition: {
        children: [
          {
            component: "Icon",
            name: "adornment",
            slot: "root"
          },
          {
            component: "Badge",
            name: "adornment",
            slot: "content"
          }
        ],
        parts: [
          {
            name: "body",
            slot: "root"
          },
          {
            name: "body",
            slot: "content"
          }
        ],
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "content"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        message: legacyErrors[0],
        order: {
          bucket: 6,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 1, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        message: legacyErrors[1],
        order: {
          bucket: 6,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "parts", 1, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        message: legacyErrors[2],
        order: {
          bucket: 6,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "children", 1, "name")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation "content" is duplicated.',
      'Composition part "body" is duplicated.',
      'Composition child "adornment" is duplicated.'
    ]);
    expect(structuredDiagnostics).toMatchObject([
      {
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        layer: diagnosticLayers.schema,
        order: {
          bucket: 6,
          sequence: 0
        },
        path: ["composition", "slotRelations", 1, "slot"],
        severity: diagnosticSeverities.error,
        source: {
          name: "validateComponent"
        }
      },
      {
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        layer: diagnosticLayers.schema,
        order: {
          bucket: 6,
          sequence: 1
        },
        path: ["composition", "parts", 1, "name"],
        severity: diagnosticSeverities.error,
        source: {
          name: "validateComponent"
        }
      },
      {
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        layer: diagnosticLayers.schema,
        order: {
          bucket: 6,
          sequence: 2
        },
        path: ["composition", "children", 1, "name"],
        severity: diagnosticSeverities.error,
        source: {
          name: "validateComponent"
        }
      }
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves migrated-family ordering before duplicate composition metadata diagnostics", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      name: " ",
      slots: [
        ...baseSchema.slots,
        {
          name: "content",
          required: true,
          role: "content"
        }
      ],
      states: [{ name: "hover" }],
      tokenBindings: [
        {
          slot: "missingTokenSlot",
          target: "background",
          token: "semantic.color.accent"
        }
      ],
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
      ],
      composition: {
        children: [
          {
            component: " ",
            name: " ",
            slot: "missingChildSlot"
          },
          {
            component: "Icon",
            name: "adornment",
            slot: "root"
          },
          {
            component: "Badge",
            name: "adornment",
            slot: "content"
          }
        ],
        parts: [
          {
            name: "label",
            slot: "missingPartSlot"
          },
          {
            name: "body",
            slot: "root"
          },
          {
            name: "body",
            slot: "content"
          }
        ],
        slotRelations: [
          {
            parentSlot: "root",
            slot: "missingRelationSlot"
          },
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "content"
          }
        ]
      }
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
        code: "SCHEMA_DEFAULT_STATE_REQUIRED",
        message: legacyErrors[1],
        order: {
          bucket: -1,
          sequence: 2
        },
        path: createDiagnosticPath("states")
      }),
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
        message: legacyErrors[2],
        order: {
          bucket: 0,
          sequence: 0
        },
        path: createDiagnosticPath("variants", 0, "options")
      }),
      createVariantDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
        message: legacyErrors[3],
        order: {
          bucket: 0,
          sequence: 3
        },
        path: createDiagnosticPath("variants", 1, "default")
      }),
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: legacyErrors[4],
        order: {
          bucket: 1,
          sequence: 0
        },
        path: createDiagnosticPath("tokenBindings", 0, "slot")
      }),
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: legacyErrors[5],
        order: {
          bucket: 2,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 0, "slot")
      }),
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: legacyErrors[6],
        order: {
          bucket: 3,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "parts", 0, "slot")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
        message: legacyErrors[7],
        order: {
          bucket: 4,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "children", 0, "name")
      }),
      createCompositionChildMetadataShapeDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
        message: legacyErrors[8],
        order: {
          bucket: 4,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "children", 0, "component")
      }),
      createCompositionChildLocalSlotReferenceDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
        message: legacyErrors[9],
        order: {
          bucket: 5,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "children", 0, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        message: legacyErrors[10],
        order: {
          bucket: 6,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 2, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        message: legacyErrors[11],
        order: {
          bucket: 6,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "parts", 2, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        message: legacyErrors[12],
        order: {
          bucket: 6,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "children", 2, "name")
      })
    ];

    expect(legacyErrors).toEqual([
      "Component name is required.",
      'Component requires a "default" state.',
      'Variant axis "tone" requires at least one option.',
      'Variant axis "size" default "lg" must be one of its options.',
      'Token binding "background" references unknown slot "missingTokenSlot".',
      'Composition slot relation references unknown slot "missingRelationSlot".',
      'Composition part "label" references unknown slot "missingPartSlot".',
      "Composition child name is required.",
      "Composition child requires a component reference.",
      'Composition child " " references unknown slot "missingChildSlot".',
      'Composition slot relation "content" is duplicated.',
      'Composition part "body" is duplicated.',
      'Composition child "adornment" is duplicated.'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPONENT_NAME_REQUIRED",
      "SCHEMA_DEFAULT_STATE_REQUIRED",
      "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
      "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
      "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_CHILD_NAME_REQUIRED",
      "SCHEMA_COMPOSITION_CHILD_COMPONENT_REQUIRED",
      "SCHEMA_COMPOSITION_CHILD_UNKNOWN_SLOT",
      "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
      "SCHEMA_COMPOSITION_PART_DUPLICATE",
      "SCHEMA_COMPOSITION_CHILD_DUPLICATE"
    ]);
    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.bucket)
    ).toEqual([-1, -1, 0, 0, 1, 2, 3, 4, 4, 5, 6, 6, 6]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("preserves duplicate family order and first repeated value discovery order", () => {
    const schema: ComponentSchema = {
      ...baseSchema,
      slots: [
        ...baseSchema.slots,
        {
          name: "content",
          required: true,
          role: "content"
        },
        {
          name: "icon",
          required: false,
          role: "icon"
        },
        {
          name: "footer",
          required: false,
          role: "content"
        }
      ],
      composition: {
        children: [
          {
            component: "Badge",
            name: "badge",
            slot: "root"
          },
          {
            component: "Field",
            name: "field",
            slot: "content"
          },
          {
            component: "Badge",
            name: "badge",
            slot: "icon"
          },
          {
            component: "Caption",
            name: "caption",
            slot: "footer"
          },
          {
            component: "Field",
            name: "field",
            slot: "root"
          },
          {
            component: "Caption",
            name: "caption",
            slot: "content"
          }
        ],
        parts: [
          {
            name: "body",
            slot: "root"
          },
          {
            name: "iconPart",
            slot: "icon"
          },
          {
            name: "body",
            slot: "content"
          },
          {
            name: "footerPart",
            slot: "footer"
          },
          {
            name: "iconPart",
            slot: "root"
          },
          {
            name: "footerPart",
            slot: "content"
          }
        ],
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "icon"
          },
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "root",
            slot: "footer"
          },
          {
            parentSlot: "root",
            slot: "icon"
          },
          {
            parentSlot: "root",
            slot: "footer"
          }
        ]
      }
    };
    const legacyErrors = validateComponent(schema).errors;
    const structuredDiagnostics = [
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        message: legacyErrors[0],
        order: {
          bucket: 6,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 2, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        message: legacyErrors[1],
        order: {
          bucket: 6,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "slotRelations", 4, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        message: legacyErrors[2],
        order: {
          bucket: 6,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "slotRelations", 5, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        message: legacyErrors[3],
        order: {
          bucket: 6,
          sequence: 100
        },
        path: createDiagnosticPath("composition", "parts", 2, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        message: legacyErrors[4],
        order: {
          bucket: 6,
          sequence: 101
        },
        path: createDiagnosticPath("composition", "parts", 4, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        message: legacyErrors[5],
        order: {
          bucket: 6,
          sequence: 102
        },
        path: createDiagnosticPath("composition", "parts", 5, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        message: legacyErrors[6],
        order: {
          bucket: 6,
          sequence: 200
        },
        path: createDiagnosticPath("composition", "children", 2, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        message: legacyErrors[7],
        order: {
          bucket: 6,
          sequence: 201
        },
        path: createDiagnosticPath("composition", "children", 4, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        message: legacyErrors[8],
        order: {
          bucket: 6,
          sequence: 202
        },
        path: createDiagnosticPath("composition", "children", 5, "name")
      })
    ];

    expect(legacyErrors).toEqual([
      'Composition slot relation "content" is duplicated.',
      'Composition slot relation "icon" is duplicated.',
      'Composition slot relation "footer" is duplicated.',
      'Composition part "body" is duplicated.',
      'Composition part "iconPart" is duplicated.',
      'Composition part "footerPart" is duplicated.',
      'Composition child "badge" is duplicated.',
      'Composition child "field" is duplicated.',
      'Composition child "caption" is duplicated.'
    ]);
    expect(structuredDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
      "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
      "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
      "SCHEMA_COMPOSITION_PART_DUPLICATE",
      "SCHEMA_COMPOSITION_PART_DUPLICATE",
      "SCHEMA_COMPOSITION_PART_DUPLICATE",
      "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
      "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
      "SCHEMA_COMPOSITION_CHILD_DUPLICATE"
    ]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual(
      legacyErrors
    );
  });

  it("formats duplicate diagnostic lists in input order without sorting", () => {
    const structuredDiagnostics = [
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
        message: 'Composition child "badge" is duplicated.',
        order: {
          bucket: 6,
          sequence: 2
        },
        path: createDiagnosticPath("composition", "children", 1, "name")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
        message: 'Composition slot relation "content" is duplicated.',
        order: {
          bucket: 6,
          sequence: 0
        },
        path: createDiagnosticPath("composition", "slotRelations", 1, "slot")
      }),
      createDuplicateLocalCompositionMetadataDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
        message: 'Composition part "body" is duplicated.',
        order: {
          bucket: 6,
          sequence: 1
        },
        path: createDiagnosticPath("composition", "parts", 1, "name")
      })
    ];

    expect(
      structuredDiagnostics.map((diagnostic) => diagnostic.order.sequence)
    ).toEqual([2, 0, 1]);
    expect(formatDiagnosticsAsLegacyStrings(structuredDiagnostics)).toEqual([
      'Composition child "badge" is duplicated.',
      'Composition slot relation "content" is duplicated.',
      'Composition part "body" is duplicated.'
    ]);
  });

  it("does not mutate duplicate diagnostic fixtures while formatting", () => {
    const slotRelationDiagnostic = createDuplicateLocalCompositionMetadataDiagnostic({
      code: "SCHEMA_COMPOSITION_SLOT_RELATION_DUPLICATE",
      message: 'Composition slot relation "content" is duplicated.',
      order: {
        bucket: 6,
        sequence: 0
      },
      path: createDiagnosticPath("composition", "slotRelations", 1, "slot")
    });
    const partDiagnostic = createDuplicateLocalCompositionMetadataDiagnostic({
      code: "SCHEMA_COMPOSITION_PART_DUPLICATE",
      message: 'Composition part "body" is duplicated.',
      order: {
        bucket: 6,
        sequence: 1
      },
      path: createDiagnosticPath("composition", "parts", 1, "name")
    });
    const childDiagnostic = createDuplicateLocalCompositionMetadataDiagnostic({
      code: "SCHEMA_COMPOSITION_CHILD_DUPLICATE",
      message: 'Composition child "badge" is duplicated.',
      order: {
        bucket: 6,
        sequence: 2
      },
      path: createDiagnosticPath("composition", "children", 1, "name")
    });
    const diagnostics = [childDiagnostic, slotRelationDiagnostic, partDiagnostic];
    const diagnosticsBeforeFormat = [...diagnostics];
    const slotRelationDiagnosticBeforeFormat = {
      ...slotRelationDiagnostic,
      order: { ...slotRelationDiagnostic.order },
      path: [...slotRelationDiagnostic.path],
      source: { ...slotRelationDiagnostic.source }
    };
    const partDiagnosticBeforeFormat = {
      ...partDiagnostic,
      order: { ...partDiagnostic.order },
      path: [...partDiagnostic.path],
      source: { ...partDiagnostic.source }
    };
    const childDiagnosticBeforeFormat = {
      ...childDiagnostic,
      order: { ...childDiagnostic.order },
      path: [...childDiagnostic.path],
      source: { ...childDiagnostic.source }
    };

    const formatted = formatDiagnosticsAsLegacyStrings(diagnostics);

    expect(formatted).toEqual([
      'Composition child "badge" is duplicated.',
      'Composition slot relation "content" is duplicated.',
      'Composition part "body" is duplicated.'
    ]);
    expect(formatted).not.toBe(diagnostics);
    expect(diagnostics).toEqual(diagnosticsBeforeFormat);
    expect(slotRelationDiagnostic).toEqual(
      slotRelationDiagnosticBeforeFormat
    );
    expect(partDiagnostic).toEqual(partDiagnosticBeforeFormat);
    expect(childDiagnostic).toEqual(childDiagnosticBeforeFormat);
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
