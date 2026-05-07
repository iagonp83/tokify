import { describe, expect, it } from "vitest";
import { createFlatSlotVariableName } from "./runtimePlan";

describe("createFlatSlotVariableName", () => {
  it("omits the root slot from flat variable names", () => {
    expect(createFlatSlotVariableName("Button", "root", "background")).toBe(
      "--button-background"
    );
  });

  it("includes non-root slot names in flat variable names", () => {
    expect(createFlatSlotVariableName("Button", "label", "color")).toBe(
      "--button-label-color"
    );
    expect(createFlatSlotVariableName("Button", "icon", "size")).toBe(
      "--button-icon-size"
    );
  });

  it("normalizes schema-derived names to kebab-case segments", () => {
    expect(
      createFlatSlotVariableName("SearchInput", "leadingIcon", "borderRadius")
    ).toBe("--search-input-leading-icon-border-radius");
  });
});
