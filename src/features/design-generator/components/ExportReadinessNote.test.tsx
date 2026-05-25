import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExportReadinessNote } from "./ExportReadinessNote";

describe("ExportReadinessNote", () => {
  it("clarifies current exports without implying generation or diagnostics are active", () => {
    const markup = renderToStaticMarkup(<ExportReadinessNote />);

    expect(markup).toContain("Export readiness");
    expect(markup).toContain("CSS and JSON exports are token-only.");
    expect(markup).toContain(
      "Export excludes component code generation, adapters, runtimePlan, emitted runtime variables, graph diagnostics, and composition graph data. Warnings, aggregate diagnostics, strict mode, and structured public diagnostics remain inactive."
    );
  });
});
