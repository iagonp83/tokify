import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { initialDesignState } from "../presets";
import { PreviewCanvas } from "./PreviewCanvas";

describe("PreviewCanvas runtime emission", () => {
  it("attaches emitted variables while Button and Input roots consume them", () => {
    const markup = renderToStaticMarkup(
      <PreviewCanvas
        onButtonVariantChange={() => undefined}
        state={initialDesignState}
      />
    );

    expect(markup).toContain("--button-background:");
    expect(markup).toContain("--button-color:");
    expect(markup).toContain("--button-label-color:");
    expect(markup).toContain("--button-icon-color:");
    expect(markup).toContain("--input-background:");
    expect(markup).toContain("--input-color:");
    expect(markup).toContain("background:var(--button-background)");
    expect(markup).toContain("color:var(--button-color)");
    expect(markup).toContain("background:var(--input-background)");
    expect(markup).toContain("color:var(--input-color)");
    expect(markup).toContain("display:inline-flex");
    expect(markup).toContain("min-width:220px");
    expect(markup).not.toContain("--button-hover-background");
    expect(markup).not.toContain("--input-hover-background");
  });
});
