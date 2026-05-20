import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createCompilerFlowStatus } from "../compilerFlowStatus";
import { initialDesignState } from "../presets";
import { CompilerFlowStatusPanel } from "./CompilerFlowStatusPanel";

describe("CompilerFlowStatusPanel", () => {
  it("renders the internal read-only compiler flow status without generation claims", () => {
    const markup = renderToStaticMarkup(
      <CompilerFlowStatusPanel
        status={createCompilerFlowStatus(initialDesignState)}
      />
    );

    expect(markup).toContain("Internal compiler-flow status");
    expect(markup).toContain("Button schema validation");
    expect(markup).toContain("Input schema validation");
    expect(markup).toContain("Component-type graph validation");
    expect(markup).toContain("Preview availability");
    expect(markup).toContain("CSS token export");
    expect(markup).toContain("JSON token export");
    expect(markup).toContain("Current export is token export only.");
    expect(markup).toContain("Component code generation and adapters are not active.");
    expect(markup).toContain(
      "Warnings, strict mode, aggregate diagnostics, and structured public diagnostics are inactive."
    );
  });
});
