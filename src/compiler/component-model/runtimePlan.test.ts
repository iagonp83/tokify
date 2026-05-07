import { describe, expect, it } from "vitest";
import type { ComponentSchema } from "./component.types";
import {
  createComponentRuntimePlan,
  createFlatSlotVariableName
} from "./runtimePlan";

const runtimePlanSchema = {
  editable: {
    fields: ["tokenBindings"],
    tokenOnly: true
  },
  name: "RuntimePlanComponent",
  slots: [
    {
      name: "root",
      required: true,
      role: "root"
    }
  ],
  states: [{ name: "default" }, { name: "hover" }],
  tokenBindings: [],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;

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

describe("createComponentRuntimePlan", () => {
  it("uses registry metadata while keeping runtime variables flat", () => {
    const runtimePlan = createComponentRuntimePlan(runtimePlanSchema, {
      base: {
        root: {
          background: "base-bg",
          borderColor: "base-border",
          transition: "background-color 120ms ease-out"
        }
      },
      states: {
        hover: {
          root: {
            color: "hover-color",
            transition: "opacity 80ms ease-out"
          }
        }
      }
    });

    expect(runtimePlan.variables).toEqual([
      {
        name: "--runtime-plan-component-background",
        property: "background",
        slot: "root",
        source: "base",
        sourceType: "explicit",
        styleLayer: "base"
      },
      {
        name: "--runtime-plan-component-transition",
        property: "transition",
        slot: "root",
        source: "base",
        sourceType: "derived",
        styleLayer: "base"
      },
      {
        name: "--runtime-plan-component-color",
        property: "color",
        slot: "root",
        source: "state",
        sourceType: "explicit",
        state: "hover",
        styleLayer: "state"
      }
    ]);
  });

  it("uses provided provenance metadata for inherited runtime variables", () => {
    const runtimePlan = createComponentRuntimePlan(
      runtimePlanSchema,
      {
        base: {
          root: {
            color: "base-color"
          }
        },
        states: {}
      },
      {
        base: {
          root: {
            color: "inherited"
          }
        }
      }
    );

    expect(runtimePlan.variables).toEqual([
      {
        name: "--runtime-plan-component-color",
        property: "color",
        slot: "root",
        source: "base",
        sourceType: "inherited",
        styleLayer: "base"
      }
    ]);
  });
});
