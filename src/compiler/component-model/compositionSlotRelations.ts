import type {
  ComponentCompositionSlotRelation,
  ComponentSchema,
  ComponentSlotName
} from "./component.types";

export type NormalizedCompositionSlotRelation = {
  parentSlot: ComponentSlotName;
  slot: ComponentSlotName;
};

export type CompositionSlotRelationDiagnostic =
  | {
      relation: ComponentCompositionSlotRelation;
      slot: ComponentSlotName;
      type: "unknown-slot";
    }
  | {
      parentSlot: ComponentSlotName;
      relation: ComponentCompositionSlotRelation;
      type: "unknown-parent-slot";
    }
  | {
      relation: ComponentCompositionSlotRelation;
      slot: ComponentSlotName;
      type: "duplicate-slot-relation";
    };

export type CompositionSlotRelationGraph = {
  childrenByParentSlot: ReadonlyMap<
    ComponentSlotName,
    readonly ComponentSlotName[]
  >;
  diagnostics: readonly CompositionSlotRelationDiagnostic[];
  parentsBySlot: ReadonlyMap<ComponentSlotName, ComponentSlotName>;
  relations: readonly NormalizedCompositionSlotRelation[];
};

export function deriveCompositionSlotRelationGraph(
  schema: ComponentSchema
): CompositionSlotRelationGraph {
  const slotNames = new Set(schema.slots.map((slot) => slot.name));
  const diagnostics: CompositionSlotRelationDiagnostic[] = [];
  const relations: NormalizedCompositionSlotRelation[] = [];
  const parentsBySlot = new Map<ComponentSlotName, ComponentSlotName>();
  const childrenByParentSlot = new Map<ComponentSlotName, ComponentSlotName[]>();

  for (const relation of schema.composition?.slotRelations ?? []) {
    const parentSlot = relation.parentSlot ?? "root";

    if (!slotNames.has(relation.slot)) {
      diagnostics.push({
        relation,
        slot: relation.slot,
        type: "unknown-slot"
      });
      continue;
    }

    if (!slotNames.has(parentSlot)) {
      diagnostics.push({
        parentSlot,
        relation,
        type: "unknown-parent-slot"
      });
      continue;
    }

    if (parentsBySlot.has(relation.slot)) {
      diagnostics.push({
        relation,
        slot: relation.slot,
        type: "duplicate-slot-relation"
      });
      continue;
    }

    parentsBySlot.set(relation.slot, parentSlot);
    childrenByParentSlot.set(parentSlot, [
      ...(childrenByParentSlot.get(parentSlot) ?? []),
      relation.slot
    ]);
    relations.push({
      parentSlot,
      slot: relation.slot
    });
  }

  return {
    childrenByParentSlot,
    diagnostics,
    parentsBySlot,
    relations
  };
}
