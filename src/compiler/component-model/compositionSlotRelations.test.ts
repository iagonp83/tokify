import { describe, expect, it } from "vitest";
import type { ComponentSchema } from "./component.types";
import { deriveCompositionSlotRelationGraph } from "./compositionSlotRelations";

const baseSchema = {
  editable: {
    fields: ["slots", "tokenBindings"],
    tokenOnly: true
  },
  name: "CompositionGraphComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    },
    {
      name: "content",
      required: true,
      role: "content"
    },
    {
      name: "label",
      required: true,
      role: "label"
    },
    {
      name: "icon",
      required: false,
      role: "icon"
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "base.background"
    }
  ],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

describe("deriveCompositionSlotRelationGraph", () => {
  it("handles missing composition metadata as an empty graph", () => {
    const graph = deriveCompositionSlotRelationGraph(baseSchema);

    expect(graph.relations).toEqual([]);
    expect([...graph.parentsBySlot.entries()]).toEqual([]);
    expect([...graph.childrenByParentSlot.entries()]).toEqual([]);
    expect(graph.diagnostics).toEqual([]);
  });

  it("handles empty slot relation metadata as an empty graph", () => {
    const graph = deriveCompositionSlotRelationGraph({
      ...baseSchema,
      composition: {}
    });

    expect(graph.relations).toEqual([]);
    expect([...graph.parentsBySlot.entries()]).toEqual([]);
    expect([...graph.childrenByParentSlot.entries()]).toEqual([]);
    expect(graph.diagnostics).toEqual([]);
  });

  it("derives parent and child slot lookup maps from valid relations", () => {
    const graph = deriveCompositionSlotRelationGraph({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "label"
          },
          {
            parentSlot: "content",
            slot: "icon"
          }
        ]
      }
    });

    expect(graph.relations).toEqual([
      {
        parentSlot: "root",
        slot: "content"
      },
      {
        parentSlot: "content",
        slot: "label"
      },
      {
        parentSlot: "content",
        slot: "icon"
      }
    ]);
    expect([...graph.parentsBySlot.entries()]).toEqual([
      ["content", "root"],
      ["label", "content"],
      ["icon", "content"]
    ]);
    expect([...graph.childrenByParentSlot.entries()]).toEqual([
      ["root", ["content"]],
      ["content", ["label", "icon"]]
    ]);
    expect(graph.diagnostics).toEqual([]);
  });

  it("defaults omitted parent slots to root", () => {
    const graph = deriveCompositionSlotRelationGraph({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            slot: "label"
          }
        ]
      }
    });

    expect(graph.relations).toEqual([
      {
        parentSlot: "root",
        slot: "label"
      }
    ]);
    expect([...graph.parentsBySlot.entries()]).toEqual([["label", "root"]]);
    expect([...graph.childrenByParentSlot.entries()]).toEqual([
      ["root", ["label"]]
    ]);
    expect(graph.diagnostics).toEqual([]);
  });

  it("skips unknown slot references and records diagnostics", () => {
    const graph = deriveCompositionSlotRelationGraph({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "missingSlot"
          },
          {
            parentSlot: "missingParent",
            slot: "label"
          },
          {
            parentSlot: "root",
            slot: "icon"
          }
        ]
      }
    });

    expect(graph.relations).toEqual([
      {
        parentSlot: "root",
        slot: "icon"
      }
    ]);
    expect([...graph.parentsBySlot.entries()]).toEqual([["icon", "root"]]);
    expect([...graph.childrenByParentSlot.entries()]).toEqual([
      ["root", ["icon"]]
    ]);
    expect(graph.diagnostics).toEqual([
      {
        relation: {
          parentSlot: "root",
          slot: "missingSlot"
        },
        slot: "missingSlot",
        type: "unknown-slot"
      },
      {
        parentSlot: "missingParent",
        relation: {
          parentSlot: "missingParent",
          slot: "label"
        },
        type: "unknown-parent-slot"
      }
    ]);
  });

  it("keeps the first relation for a slot and reports later duplicates", () => {
    const graph = deriveCompositionSlotRelationGraph({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "label"
          },
          {
            parentSlot: "content",
            slot: "label"
          }
        ]
      }
    });

    expect(graph.relations).toEqual([
      {
        parentSlot: "root",
        slot: "label"
      }
    ]);
    expect([...graph.parentsBySlot.entries()]).toEqual([["label", "root"]]);
    expect([...graph.childrenByParentSlot.entries()]).toEqual([
      ["root", ["label"]]
    ]);
    expect(graph.diagnostics).toEqual([
      {
        relation: {
          parentSlot: "content",
          slot: "label"
        },
        slot: "label",
        type: "duplicate-slot-relation"
      }
    ]);
  });

  it("preserves slot relation ordering while normalizing", () => {
    const graph = deriveCompositionSlotRelationGraph({
      ...baseSchema,
      composition: {
        slotRelations: [
          {
            parentSlot: "root",
            slot: "icon"
          },
          {
            parentSlot: "root",
            slot: "content"
          },
          {
            parentSlot: "content",
            slot: "label"
          }
        ]
      }
    });

    expect(graph.relations.map((relation) => relation.slot)).toEqual([
      "icon",
      "content",
      "label"
    ]);
    expect(graph.childrenByParentSlot.get("root")).toEqual(["icon", "content"]);
  });
});
