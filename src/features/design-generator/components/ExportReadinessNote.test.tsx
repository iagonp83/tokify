import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExportReadinessNote } from "./ExportReadinessNote";

describe("ExportReadinessNote", () => {
  it("clarifies current exports without implying generation or diagnostics are active", () => {
    const markup = renderToStaticMarkup(<ExportReadinessNote />);

    expect(markup).toContain("Export readiness");
    expect(markup).toContain("Token exports only");
    expect(markup).toContain(
      "CSS and JSON exports include the current token payloads only."
    );
    expect(markup).toContain(
      "Generated component code and adapters are not included."
    );
    expect(markup).toContain(
      "runtimePlan, emitted runtime variables, graph diagnostics, and composition graph data are not included."
    );
    expect(markup).toContain(
      "Warnings, aggregate diagnostics, strict mode, and structured public diagnostics are not active here."
    );
  });
});
