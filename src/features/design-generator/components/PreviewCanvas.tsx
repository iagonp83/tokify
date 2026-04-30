import { Layers, MousePointer2, Wand2 } from "lucide-react";
import type { DesignState } from "../types";

type PreviewCanvasProps = {
  state: DesignState;
};

export function PreviewCanvas({ state }: PreviewCanvasProps) {
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
    </div>
  );
}
