import { describe, expect, it } from "vitest";

import type { ComponentSchema } from "../component-model/component.types";
import { collectChildNameHygieneDiagnostics } from "./childNameHygieneDiagnostics";

const baseSchema = {
  editable: {
    fields: ["slots", "tokenBindings"],
    tokenOnly: true
  },
  name: "ComposedComponent",
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
    }
  ],
  states: [{ name: "default" }],
  tokenBindings: [],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

function createSchema(childNames: readonly string[]): ComponentSchema {
  return {
    ...baseSchema,
    composition: {
      children: childNames.map((name, index) => ({
        component: "Child",
        name,
        slot: index % 2 === 0 ? "content" : "root"
      }))
    }
  };
}

function collectCodes(childNames: readonly string[]): string[] {
  return collectChildNameHygieneDiagnostics(createSchema(childNames)).map(
    (diagnostic) => diagnostic.code
  );
}

describe("child name hygiene diagnostics", () => {
  it("returns no diagnostics when composition children are absent or empty", () => {
    expect(collectChildNameHygieneDiagnostics(baseSchema)).toEqual([]);
    expect(collectChildNameHygieneDiagnostics(createSchema([]))).toEqual([]);
  });

  it("emits exact metadata and path fields for a child-name warning", () => {
    expect(collectChildNameHygieneDiagnostics(createSchema([" label"]))).toEqual([
      {
        code: "METADATA_CHILD_NAME_LEADING_WHITESPACE",
        layer: "schema",
        message: "Child name starts with whitespace.",
        order: {
          bucket: 100,
          sequence: 0
        },
        path: ["composition", "children", 0, "name"],
        severity: "warning",
        source: {
          name: "childNameHygiene"
        }
      }
    ]);
  });

  it("detects leading and trailing whitespace independently", () => {
    expect(collectCodes([" label "])).toEqual([
      "METADATA_CHILD_NAME_LEADING_WHITESPACE",
      "METADATA_CHILD_NAME_TRAILING_WHITESPACE"
    ]);
  });

  it("detects repeated internal ASCII spaces without treating tabs or newlines as repeated-space warnings", () => {
    expect(collectCodes(["leading  icon"])).toEqual([
      "METADATA_CHILD_NAME_REPEATED_WHITESPACE"
    ]);
    expect(collectCodes(["leading\t\ticon"])).toEqual([
      "METADATA_CHILD_NAME_TAB_OR_NEWLINE"
    ]);
    expect(collectCodes(["leading\nicon"])).toEqual([
      "METADATA_CHILD_NAME_TAB_OR_NEWLINE"
    ]);
  });

  it("detects tab, carriage return, and newline boundaries", () => {
    expect(collectCodes(["leading\ticon"])).toEqual([
      "METADATA_CHILD_NAME_TAB_OR_NEWLINE"
    ]);
    expect(collectCodes(["leading\ricon"])).toEqual([
      "METADATA_CHILD_NAME_TAB_OR_NEWLINE"
    ]);
    expect(collectCodes(["leading\nicon"])).toEqual([
      "METADATA_CHILD_NAME_TAB_OR_NEWLINE"
    ]);
  });

  it("detects the reserved instance-path delimiter anywhere in the child name", () => {
    expect(collectCodes(["card.header"])).toEqual([
      "PATH_CHILD_NAME_RESERVED_DELIMITER"
    ]);
  });

  it("emits one normalized-collision diagnostic per affected sibling", () => {
    const diagnostics = collectChildNameHygieneDiagnostics(
      createSchema(["primary action", " primary   action ", "secondary action"])
    );

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "METADATA_CHILD_NAME_LEADING_WHITESPACE",
      "METADATA_CHILD_NAME_TRAILING_WHITESPACE",
      "METADATA_CHILD_NAME_REPEATED_WHITESPACE",
      "METADATA_CHILD_NAME_NORMALIZED_COLLISION",
      "METADATA_CHILD_NAME_NORMALIZED_COLLISION"
    ]);
    expect(
      diagnostics
        .filter(
          (diagnostic) =>
            diagnostic.code === "METADATA_CHILD_NAME_NORMALIZED_COLLISION"
        )
        .map((diagnostic) => diagnostic.path)
    ).toEqual([
      ["composition", "children", 0, "name"],
      ["composition", "children", 1, "name"]
    ]);
  });

  it("keeps normalized collision checks sibling-local and ignores exact authored equality by itself", () => {
    expect(collectCodes(["item", "item"])).toEqual([]);
    expect(collectCodes(["item", " item "])).toEqual([
      "METADATA_CHILD_NAME_LEADING_WHITESPACE",
      "METADATA_CHILD_NAME_TRAILING_WHITESPACE",
      "METADATA_CHILD_NAME_NORMALIZED_COLLISION",
      "METADATA_CHILD_NAME_NORMALIZED_COLLISION"
    ]);
  });

  it("emits one conservative case-collision diagnostic per affected sibling", () => {
    const diagnostics = collectChildNameHygieneDiagnostics(
      createSchema(["label", "Label", "LABEL", "label icon"])
    );

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "METADATA_CHILD_NAME_CASE_COLLISION",
      "METADATA_CHILD_NAME_CASE_COLLISION",
      "METADATA_CHILD_NAME_CASE_COLLISION"
    ]);
    expect(diagnostics.map((diagnostic) => diagnostic.path)).toEqual([
      ["composition", "children", 0, "name"],
      ["composition", "children", 1, "name"],
      ["composition", "children", 2, "name"]
    ]);
  });

  it("keeps case-collision checks exact-equality-safe and separate from whitespace normalization", () => {
    expect(collectCodes(["Label", "Label"])).toEqual([]);
    expect(collectCodes([" label", "LABEL"])).toEqual([
      "METADATA_CHILD_NAME_LEADING_WHITESPACE"
    ]);
  });

  it("returns diagnostics in deterministic child order and documented rule order", () => {
    const diagnostics = collectChildNameHygieneDiagnostics(
      createSchema([" item  label.\n", "Item label"])
    );

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "METADATA_CHILD_NAME_LEADING_WHITESPACE",
      "METADATA_CHILD_NAME_TRAILING_WHITESPACE",
      "METADATA_CHILD_NAME_REPEATED_WHITESPACE",
      "METADATA_CHILD_NAME_TAB_OR_NEWLINE",
      "PATH_CHILD_NAME_RESERVED_DELIMITER"
    ]);
    expect(diagnostics.map((diagnostic) => diagnostic.order.sequence)).toEqual([
      0, 3, 6, 9, 12
    ]);
  });

  it("does not mutate the schema input", () => {
    const schema = createSchema([" label", "Label"]);
    const schemaBeforeDiagnostics = JSON.parse(JSON.stringify(schema));

    collectChildNameHygieneDiagnostics(schema);

    expect(schema).toEqual(schemaBeforeDiagnostics);
  });

  it("returns structured envelopes without validator, runtime, resolver, or import/export fields", () => {
    const diagnostics = collectChildNameHygieneDiagnostics(
      createSchema([" label", "Label"])
    );

    diagnostics.forEach((diagnostic) => {
      expect(typeof diagnostic).toBe("object");
      expect(diagnostic).not.toHaveProperty("runtimePlan");
      expect(diagnostic).not.toHaveProperty("resolver");
      expect(diagnostic).not.toHaveProperty("registry");
      expect(diagnostic).not.toHaveProperty("import");
      expect(diagnostic).not.toHaveProperty("export");
      expect(diagnostic).not.toHaveProperty("validateComponent");
      expect(diagnostic).not.toHaveProperty("graph");
      expect(diagnostic.path).not.toEqual(
        expect.arrayContaining(["canonicalId", "instanceId", "instancePath"])
      );
    });
  });

  it("implements only the exact first-phase diagnostic codes", () => {
    const diagnostics = collectChildNameHygieneDiagnostics(
      createSchema([
        " label",
        "label ",
        "label  icon",
        "label\ticon",
        "card.header",
        "primary action",
        "primary   action",
        "Label",
        "LABEL"
      ])
    );

    expect(new Set(diagnostics.map((diagnostic) => diagnostic.code))).toEqual(
      new Set([
        "METADATA_CHILD_NAME_LEADING_WHITESPACE",
        "METADATA_CHILD_NAME_TRAILING_WHITESPACE",
        "METADATA_CHILD_NAME_REPEATED_WHITESPACE",
        "METADATA_CHILD_NAME_TAB_OR_NEWLINE",
        "METADATA_CHILD_NAME_NORMALIZED_COLLISION",
        "METADATA_CHILD_NAME_CASE_COLLISION",
        "PATH_CHILD_NAME_RESERVED_DELIMITER"
      ])
    );
  });
});
