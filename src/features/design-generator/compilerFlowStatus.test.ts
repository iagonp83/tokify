import { describe, expect, it } from "vitest";
import { createCompilerFlowStatus } from "./compilerFlowStatus";
import { initialDesignState } from "./presets";
import type { DesignState } from "./types";

describe("createCompilerFlowStatus", () => {
  it("reports the current Button/Input product-compiler flow", () => {
    const status = createCompilerFlowStatus(initialDesignState);
    const items = collectItemsById(status);

    expect(Object.keys(items)).toEqual([
      "token-state",
      "button-schema-validation",
      "input-schema-validation",
      "registry-authored-name-validation",
      "component-type-graph-validation",
      "button-resolution",
      "input-resolution",
      "button-runtime-emission",
      "input-runtime-emission",
      "preview-availability",
      "css-token-export",
      "json-token-export"
    ]);
    expect(Object.values(items).every((item) => item.status === "ready")).toBe(
      true
    );
    expect(items["css-token-export"].detail).toContain("token-only");
    expect(items["json-token-export"].detail).toContain("no component code");
    expect(items["json-token-export"].detail).toContain("adapters");
    expect(status.constraints).toEqual([
      "Exports remain token-only.",
      "Component generation and adapters remain inactive.",
      "Warnings, strict mode, aggregate diagnostics, and structured public diagnostics remain inactive."
    ]);
  });

  it("adapts current legacy outputs for display without exposing validator APIs", () => {
    const status = createCompilerFlowStatus(initialDesignState);
    const keys = collectObjectKeys(status);

    expect(keys).not.toContain("valid");
    expect(keys).not.toContain("errors");
    expect(keys).not.toContain("diagnostics");
    expect(keys).not.toContain("severity");
    expect(keys).not.toContain("code");
    expect(keys).not.toContain("runtimePlan");
    expect(keys).not.toContain("variables");
  });

  it("reports blocked resolver/export status without mutating DesignState", () => {
    const state = {
      ...initialDesignState,
      color: {}
    } as DesignState;
    const beforeStatus = JSON.stringify(state);
    const status = createCompilerFlowStatus(state);
    const items = collectItemsById(status);

    expect(items["token-state"].status).toBe("blocked");
    expect(items["button-resolution"].status).toBe("blocked");
    expect(items["input-resolution"].status).toBe("blocked");
    expect(items["css-token-export"].status).toBe("blocked");
    expect(items["json-token-export"].status).toBe("blocked");
    expect(JSON.stringify(state)).toBe(beforeStatus);
  });
});

type StatusForTest = ReturnType<typeof createCompilerFlowStatus>;
type StatusItemForTest = StatusForTest["sections"][number]["items"][number];

function collectItemsById(status: StatusForTest) {
  return Object.fromEntries(
    status.sections.flatMap((section) =>
      section.items.map((item) => [item.id, item])
    )
  ) as Record<string, StatusItemForTest>;
}

function collectObjectKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => [
    key,
    ...collectObjectKeys(nestedValue)
  ]);
}
