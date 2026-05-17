import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  type DiagnosticEnvelope
} from "../diagnostics/diagnosticContract";
import { formatDiagnosticsAsLegacyStrings } from "../diagnostics/legacyDiagnosticFormatter";
import type {
  ComponentCompositionPart,
  ComponentCompositionSlotRelation,
  ComponentSchema,
  ComponentTokenBinding,
  ComponentVariantAxis
} from "./component.types";
import type { ComponentRegistry } from "./componentRegistry";

export type ComponentValidationResult = {
  errors: string[];
  valid: boolean;
};

export type ComponentValidationOptions = {
  registry?: ComponentRegistry;
};

export function validateComponent(
  schema: ComponentSchema,
  options: ComponentValidationOptions = {}
): ComponentValidationResult {
  const errors: string[] = [];
  const slotNames = new Set(schema.slots.map((slot) => slot.name));
  const stateNames = new Set<string>(schema.states.map((state) => state.name));
  const variantAxes = new Map(
    schema.variants.map((axis) => [axis.name, axis.options])
  );

  errors.push(...validateSchemaPresence(schema, slotNames, stateNames));

  schema.variants.forEach((axis, variantIndex) => {
    errors.push(...validateVariantAxis(axis, variantIndex));
  });

  schema.tokenBindings.forEach((binding, bindingIndex) => {
    errors.push(
      ...validateTokenBinding(
        binding,
        bindingIndex,
        slotNames,
        stateNames,
        variantAxes
      )
    );
  });

  schema.composition?.slotRelations?.forEach((relation, relationIndex) => {
    errors.push(
      ...validateCompositionSlotRelationLocalReferences(
        relation,
        relationIndex,
        slotNames
      )
    );
  });

  schema.composition?.parts?.forEach((part, partIndex) => {
    errors.push(
      ...validateCompositionPartLocalReference(part, partIndex, slotNames)
    );
  });

  schema.composition?.children?.forEach((child) => {
    if (!child.name.trim()) {
      errors.push("Composition child name is required.");
    }

    if (!child.component.trim()) {
      errors.push(
        child.name.trim()
          ? `Composition child "${child.name}" requires a component reference.`
          : "Composition child requires a component reference."
      );
    }

    if (options.registry && child.component.trim()) {
      if (child.component === schema.name) {
        errors.push(
          `Composition child "${child.name}" cannot reference parent component "${schema.name}".`
        );
      } else if (!hasRegistryComponent(options.registry, child.component)) {
        errors.push(
          `Composition child "${child.name}" references unknown component "${child.component}".`
        );
      }
    }

    if (!slotNames.has(child.slot)) {
      errors.push(
        `Composition child "${child.name}" references unknown slot "${child.slot}".`
      );
    }
  });

  errors.push(...validateSlotRelationTopology(schema, slotNames));

  findDuplicates(
    schema.composition?.slotRelations?.map((relation) => relation.slot) ?? []
  ).forEach((slot) => {
    errors.push(`Composition slot relation "${slot}" is duplicated.`);
  });

  findDuplicates(schema.composition?.parts?.map((part) => part.name) ?? []).forEach(
    (partName) => {
      errors.push(`Composition part "${partName}" is duplicated.`);
    }
  );

  findDuplicates(
    schema.composition?.children?.map((child) => child.name) ?? []
  ).forEach((childName) => {
    errors.push(`Composition child "${childName}" is duplicated.`);
  });

  return {
    errors,
    valid: errors.length === 0
  };
}

type SchemaPresenceDiagnosticCode =
  | "SCHEMA_COMPONENT_NAME_REQUIRED"
  | "SCHEMA_ROOT_SLOT_REQUIRED"
  | "SCHEMA_DEFAULT_STATE_REQUIRED";

type VariantAxisDiagnosticCode =
  | "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS"
  | "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT";

type TokenBindingDiagnosticCode =
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT"
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE"
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS"
  | "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION";

type CompositionSlotRelationDiagnosticCode =
  | "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT"
  | "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT";

type CompositionPartDiagnosticCode = "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT";

function validateSchemaPresence(
  schema: ComponentSchema,
  slotNames: ReadonlySet<string>,
  stateNames: ReadonlySet<string>
): string[] {
  const diagnostics: DiagnosticEnvelope<SchemaPresenceDiagnosticCode>[] = [];

  if (!schema.name.trim()) {
    diagnostics.push(
      createSchemaPresenceDiagnostic({
        code: "SCHEMA_COMPONENT_NAME_REQUIRED",
        message: "Component name is required.",
        path: createDiagnosticPath("name"),
        sequence: 0
      })
    );
  }

  if (!slotNames.has("root")) {
    diagnostics.push(
      createSchemaPresenceDiagnostic({
        code: "SCHEMA_ROOT_SLOT_REQUIRED",
        message: 'Component requires a "root" slot.',
        path: createDiagnosticPath("slots"),
        sequence: 1
      })
    );
  }

  if (!stateNames.has("default")) {
    diagnostics.push(
      createSchemaPresenceDiagnostic({
        code: "SCHEMA_DEFAULT_STATE_REQUIRED",
        message: 'Component requires a "default" state.',
        path: createDiagnosticPath("states"),
        sequence: 2
      })
    );
  }

  return formatDiagnosticsAsLegacyStrings(diagnostics);
}

function createSchemaPresenceDiagnostic({
  code,
  message,
  path,
  sequence
}: {
  readonly code: SchemaPresenceDiagnosticCode;
  readonly message: string;
  readonly path: ReturnType<typeof createDiagnosticPath>;
  readonly sequence: number;
}): DiagnosticEnvelope<SchemaPresenceDiagnosticCode> {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order: {
      bucket: -1,
      sequence
    },
    path,
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponent"
    }
  });
}

function validateVariantAxis(
  axis: ComponentVariantAxis,
  variantIndex: number
): string[] {
  const diagnostics: DiagnosticEnvelope<VariantAxisDiagnosticCode>[] = [];

  if (axis.options.length === 0) {
    diagnostics.push(
      createVariantAxisDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_EMPTY_OPTIONS",
        message: `Variant axis "${axis.name}" requires at least one option.`,
        path: createDiagnosticPath("variants", variantIndex, "options"),
        sequence: variantIndex * 2
      })
    );

    return formatDiagnosticsAsLegacyStrings(diagnostics);
  }

  if (!axis.options.includes(axis.default)) {
    diagnostics.push(
      createVariantAxisDiagnostic({
        code: "SCHEMA_VARIANT_AXIS_INVALID_DEFAULT",
        message: `Variant axis "${axis.name}" default "${axis.default}" must be one of its options.`,
        path: createDiagnosticPath("variants", variantIndex, "default"),
        sequence: variantIndex * 2 + 1
      })
    );
  }

  return formatDiagnosticsAsLegacyStrings(diagnostics);
}

function createVariantAxisDiagnostic({
  code,
  message,
  path,
  sequence
}: {
  readonly code: VariantAxisDiagnosticCode;
  readonly message: string;
  readonly path: ReturnType<typeof createDiagnosticPath>;
  readonly sequence: number;
}): DiagnosticEnvelope<VariantAxisDiagnosticCode> {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order: {
      bucket: 0,
      sequence
    },
    path,
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponent"
    }
  });
}

function validateTokenBinding(
  binding: ComponentTokenBinding,
  bindingIndex: number,
  slotNames: ReadonlySet<string>,
  stateNames: ReadonlySet<string>,
  variantAxes: ReadonlyMap<string, readonly string[]>
): string[] {
  const diagnostics: DiagnosticEnvelope<TokenBindingDiagnosticCode>[] = [];
  const baseSequence = bindingIndex * 1000;

  if (!slotNames.has(binding.slot)) {
    diagnostics.push(
      createTokenBindingDiagnostic({
        code: "SCHEMA_TOKEN_BINDING_UNKNOWN_SLOT",
        message: `Token binding "${binding.target}" references unknown slot "${binding.slot}".`,
        path: createDiagnosticPath("tokenBindings", bindingIndex, "slot"),
        sequence: baseSequence
      })
    );
  }

  Object.entries(binding.conditions ?? {}).forEach(
    ([axisName, option], conditionIndex) => {
      if (option === undefined) {
        return;
      }

      if (axisName === "state") {
        if (!stateNames.has(option)) {
          diagnostics.push(
            createTokenBindingDiagnostic({
              code: "SCHEMA_TOKEN_BINDING_UNKNOWN_STATE",
              message: `Token binding "${binding.target}" references unknown state "${option}".`,
              path: createDiagnosticPath(
                "tokenBindings",
                bindingIndex,
                "conditions",
                "state"
              ),
              sequence: baseSequence + conditionIndex + 1
            })
          );
        }

        return;
      }

      const axisOptions = variantAxes.get(axisName);

      if (!axisOptions) {
        diagnostics.push(
          createTokenBindingDiagnostic({
            code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_AXIS",
            message: `Token binding "${binding.target}" references unknown variant axis "${axisName}".`,
            path: createDiagnosticPath(
              "tokenBindings",
              bindingIndex,
              "conditions",
              axisName
            ),
            sequence: baseSequence + conditionIndex + 1
          })
        );
        return;
      }

      if (!axisOptions.includes(option)) {
        diagnostics.push(
          createTokenBindingDiagnostic({
            code: "SCHEMA_TOKEN_BINDING_UNKNOWN_VARIANT_OPTION",
            message: `Token binding "${binding.target}" references unknown ${axisName} option "${option}".`,
            path: createDiagnosticPath(
              "tokenBindings",
              bindingIndex,
              "conditions",
              axisName
            ),
            sequence: baseSequence + conditionIndex + 1
          })
        );
      }
    }
  );

  return formatDiagnosticsAsLegacyStrings(diagnostics);
}

function createTokenBindingDiagnostic({
  code,
  message,
  path,
  sequence
}: {
  readonly code: TokenBindingDiagnosticCode;
  readonly message: string;
  readonly path: ReturnType<typeof createDiagnosticPath>;
  readonly sequence: number;
}): DiagnosticEnvelope<TokenBindingDiagnosticCode> {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order: {
      bucket: 1,
      sequence
    },
    path,
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponent"
    }
  });
}

function validateCompositionSlotRelationLocalReferences(
  relation: ComponentCompositionSlotRelation,
  relationIndex: number,
  slotNames: ReadonlySet<string>
): string[] {
  const diagnostics: DiagnosticEnvelope<CompositionSlotRelationDiagnosticCode>[] =
    [];
  const baseSequence = relationIndex * 2;

  if (!slotNames.has(relation.slot)) {
    diagnostics.push(
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_SLOT",
        message: `Composition slot relation references unknown slot "${relation.slot}".`,
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          relationIndex,
          "slot"
        ),
        sequence: baseSequence
      })
    );
  }

  if (relation.parentSlot && !slotNames.has(relation.parentSlot)) {
    diagnostics.push(
      createCompositionSlotRelationDiagnostic({
        code: "SCHEMA_COMPOSITION_SLOT_RELATION_UNKNOWN_PARENT_SLOT",
        message: `Composition slot relation references unknown parent slot "${relation.parentSlot}".`,
        path: createDiagnosticPath(
          "composition",
          "slotRelations",
          relationIndex,
          "parentSlot"
        ),
        sequence: baseSequence + 1
      })
    );
  }

  return formatDiagnosticsAsLegacyStrings(diagnostics);
}

function createCompositionSlotRelationDiagnostic({
  code,
  message,
  path,
  sequence
}: {
  readonly code: CompositionSlotRelationDiagnosticCode;
  readonly message: string;
  readonly path: ReturnType<typeof createDiagnosticPath>;
  readonly sequence: number;
}): DiagnosticEnvelope<CompositionSlotRelationDiagnosticCode> {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order: {
      bucket: 2,
      sequence
    },
    path,
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponent"
    }
  });
}

function validateCompositionPartLocalReference(
  part: ComponentCompositionPart,
  partIndex: number,
  slotNames: ReadonlySet<string>
): string[] {
  const diagnostics: DiagnosticEnvelope<CompositionPartDiagnosticCode>[] = [];

  if (!slotNames.has(part.slot)) {
    diagnostics.push(
      createCompositionPartDiagnostic({
        code: "SCHEMA_COMPOSITION_PART_UNKNOWN_SLOT",
        message: `Composition part "${part.name}" references unknown slot "${part.slot}".`,
        path: createDiagnosticPath("composition", "parts", partIndex, "slot"),
        sequence: partIndex
      })
    );
  }

  return formatDiagnosticsAsLegacyStrings(diagnostics);
}

function createCompositionPartDiagnostic({
  code,
  message,
  path,
  sequence
}: {
  readonly code: CompositionPartDiagnosticCode;
  readonly message: string;
  readonly path: ReturnType<typeof createDiagnosticPath>;
  readonly sequence: number;
}): DiagnosticEnvelope<CompositionPartDiagnosticCode> {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order: {
      bucket: 3,
      sequence
    },
    path,
    severity: diagnosticSeverities.error,
    source: {
      name: "validateComponent"
    }
  });
}

function findDuplicates(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
}

function hasRegistryComponent(
  registry: ComponentRegistry,
  authoredName: string
): boolean {
  return registry.entries.some((entry) => entry.authoredName === authoredName);
}

function validateSlotRelationTopology(
  schema: ComponentSchema,
  slotNames: ReadonlySet<string>
) {
  const errors: string[] = [];
  const relationSlots = new Set<string>();
  const relations: { parentSlot: string; slot: string }[] = [];

  for (const relation of schema.composition?.slotRelations ?? []) {
    const parentSlot = relation.parentSlot ?? "root";

    if (!slotNames.has(relation.slot) || !slotNames.has(parentSlot)) {
      continue;
    }

    if (relation.slot === parentSlot) {
      errors.push(
        `Composition slot relation "${relation.slot}" cannot reference itself as parent.`
      );
      continue;
    }

    if (relationSlots.has(relation.slot)) {
      continue;
    }

    relationSlots.add(relation.slot);
    relations.push({
      parentSlot,
      slot: relation.slot
    });
  }

  findSlotRelationCycles(relations).forEach((cycle) => {
    errors.push(`Composition slot relations contain a cycle: ${cycle}.`);
  });

  return errors;
}

function findSlotRelationCycles(
  relations: readonly { parentSlot: string; slot: string }[]
) {
  const childrenByParentSlot = new Map<string, string[]>();

  relations.forEach((relation) => {
    childrenByParentSlot.set(relation.parentSlot, [
      ...(childrenByParentSlot.get(relation.parentSlot) ?? []),
      relation.slot
    ]);
  });

  const cycles: string[] = [];
  const reportedCycles = new Set<string>();

  const visit = (slot: string, path: readonly string[]) => {
    const cycleStartIndex = path.indexOf(slot);

    if (cycleStartIndex >= 0) {
      const cycle = [...path.slice(cycleStartIndex), slot];
      const cycleKey = createCycleKey(cycle);

      if (!reportedCycles.has(cycleKey)) {
        reportedCycles.add(cycleKey);
        cycles.push(cycle.join(" -> "));
      }

      return;
    }

    (childrenByParentSlot.get(slot) ?? []).forEach((childSlot) => {
      visit(childSlot, [...path, slot]);
    });
  };

  relations.forEach((relation) => {
    visit(relation.parentSlot, []);
  });

  return cycles;
}

function createCycleKey(cycle: readonly string[]) {
  const nodes = cycle.slice(0, -1);
  const rotations = nodes.map((_, index) => [
    ...nodes.slice(index),
    ...nodes.slice(0, index)
  ]);

  return rotations
    .map((rotation) => rotation.join("\u0000"))
    .sort()[0];
}
