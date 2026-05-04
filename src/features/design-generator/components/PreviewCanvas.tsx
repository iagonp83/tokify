import type { CSSProperties } from "react";
import { Layers, MousePointer2, Wand2 } from "lucide-react";
import { buttonSchema } from "../../../compiler/component-model/button.schema";
import { resolveComponent } from "../../../compiler/component-model/resolveComponent";
import { createTokenResolver } from "../../../compiler/component-model/tokenResolver";
import type { DesignState } from "../types";
import { useDesignTokens } from "../useDesignTokens";

type PreviewCanvasProps = {
  state: DesignState;
};

export function PreviewCanvas({ state }: PreviewCanvasProps) {
  const tokens = useDesignTokens(state);
  const tokenResolver = createTokenResolver(tokens);
  const resolved = resolveComponent(buttonSchema, tokenResolver, {
    intent: "primary",
    size: "md",
    state: "default"
  });
  const buttonStyle = resolved.bindings.reduce<CSSProperties>(
    (styleObject, binding) => ({
      ...styleObject,
      [binding.target]: binding.value
    }),
    {}
  );

  return (
    <div className="preview-canvas">
      <div
        className={`preview-card preview-card--${state.component.kind} component-preview component-preview--${state.component.kind}`}
        data-component={state.component.kind}
      >
        <div className="preview-card__toolbar">
          <span />
          <span />
          <span />
        </div>
        <div className="preview-card__body">
          <div className="preview-icon">
            <Wand2 aria-hidden="true" size={22} />
          </div>
          <div>
            <p>{state.component.kind}</p>
            <h2>Interaction blueprint</h2>
          </div>
        </div>
        <div className="preview-card__meta">
          <span>
            <MousePointer2 aria-hidden="true" size={16} />
            Hover
          </span>
          <span>
            <Layers aria-hidden="true" size={16} />
            Reusable
          </span>
        </div>
      </div>
      <button style={buttonStyle}>Button</button>
    </div>
  );
}
