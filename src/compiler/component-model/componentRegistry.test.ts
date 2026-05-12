import { describe, expect, it } from "vitest";
import { buttonSchema } from "./button.schema";
import {
  componentRegistry,
  createComponentRegistry,
  findComponentRegistryEntry,
  getComponentSchema,
  listComponentRegistryEntries,
  listComponentRegistryNames,
  validateComponentRegistry
} from "./componentRegistry";
import { inputSchema } from "./input.schema";

describe("componentRegistry", () => {
  it("lists known components", () => {
    expect(listComponentRegistryNames(componentRegistry)).toEqual([
      "Button",
      "Input"
    ]);
    expect(listComponentRegistryEntries(componentRegistry)).toHaveLength(2);
  });

  it("looks up component entries by authored name", () => {
    expect(findComponentRegistryEntry(componentRegistry, "Button")).toEqual({
      authoredName: "Button",
      schema: buttonSchema
    });
    expect(getComponentSchema(componentRegistry, "Input")).toBe(inputSchema);
  });

  it("returns undefined for unknown authored names", () => {
    expect(
      findComponentRegistryEntry(componentRegistry, "Unknown")
    ).toBeUndefined();
    expect(getComponentSchema(componentRegistry, "Unknown")).toBeUndefined();
  });

  it("reports duplicate authored names with stable diagnostics", () => {
    const registry = createComponentRegistry([
      buttonSchema,
      {
        ...inputSchema,
        name: "Button"
      }
    ]);

    expect(validateComponentRegistry(registry)).toEqual({
      errors: ['Component registry authored name "Button" is duplicated.'],
      valid: false
    });
  });

  it("reports multiple duplicate authored names once in deterministic order", () => {
    const registry = createComponentRegistry([
      buttonSchema,
      inputSchema,
      {
        ...inputSchema,
        name: "Button"
      },
      {
        ...buttonSchema,
        name: "Badge"
      },
      {
        ...buttonSchema,
        name: "Input"
      },
      {
        ...inputSchema,
        name: "Button"
      },
      {
        ...inputSchema,
        name: "Badge"
      }
    ]);

    expect(validateComponentRegistry(registry)).toEqual({
      errors: [
        'Component registry authored name "Button" is duplicated.',
        'Component registry authored name "Input" is duplicated.',
        'Component registry authored name "Badge" is duplicated.'
      ],
      valid: false
    });
  });
});
