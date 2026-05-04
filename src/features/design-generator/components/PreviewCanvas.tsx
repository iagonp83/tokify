import { useState, type CSSProperties } from "react";
import { Layers, MousePointer2, Wand2 } from "lucide-react";
import { buttonSchema } from "../../../compiler/component-model/button.schema";
import type {
  ComponentStateName,
  ResolvedComponentBinding
} from "../../../compiler/component-model/component.types";
import { resolveComponent } from "../../../compiler/component-model/resolveComponent";
import { createTokenResolver } from "../../../compiler/component-model/tokenResolver";
import type { DesignState } from "../types";
import { useDesignTokens } from "../useDesignTokens";

type PreviewCanvasProps = {
  state: DesignState;
};

const previewStates: ComponentStateName[] = [
  "default",
  "hover",
  "active",
  "focus",
  "disabled"
];

function toCssProperty(target: ResolvedComponentBinding["target"]) {
  switch (target) {
    case "background":
    case "borderRadius":
    case "boxShadow":
    case "color":
    case "gap":
    case "height":
    case "opacity":
    case "paddingBlock":
    case "paddingInline":
    case "transitionDuration":
    case "transitionTimingFunction":
      return target;
    default:
      return undefined;
  }
}

function createSlotStyle(bindings: ResolvedComponentBinding[]) {
  return bindings.reduce<CSSProperties>((styleObject, binding) => {
    const cssProperty = toCssProperty(binding.target);

    if (!cssProperty) {
      return styleObject;
    }

    return {
      ...styleObject,
      [cssProperty]: binding.value
    };
  }, {});
}

export function PreviewCanvas({ state }: PreviewCanvasProps) {
  const [uiState, setUiState] = useState<ComponentStateName>("default");
  const tokens = useDesignTokens(state);
  const tokenResolver = createTokenResolver(tokens, state.component.kind);
  const previewTokenResolver = {
    get(path: string) {
      if (path === "semantic.state.active.opacity") {
        return "0.8";
      }

      if (path === "semantic.state.disabled.opacity") {
        return "0.48";
      }

      if (path === "semantic.state.focus.ring") {
        return "0 0 0 3px rgba(47, 125, 105, 0.35)";
      }

      if (path === "semantic.state.hover.background") {
        return "#3168b7";
      }

      return tokenResolver.get(path);
    }
  };
  const resolved = resolveComponent(buttonSchema, previewTokenResolver, {
    intent: "secondary",
    size: "sm",
    state: uiState
  });
  const bindingsBySlot = resolved.bindings.reduce<
    Record<string, ResolvedComponentBinding[]>
  >(
    (slots, binding) => ({
      ...slots,
      [binding.slot]: [...(slots[binding.slot] ?? []), binding]
    }),
    {}
  );
  const rootStyle = createSlotStyle(bindingsBySlot.root ?? []);
  const rootStyleWithLayout: CSSProperties = {
    ...rootStyle,
    alignItems: "center",
    color:
      rootStyle.color === rootStyle.background ? undefined : rootStyle.color,
    display: "inline-flex",
    gap: rootStyle.gap ?? "8px",
    justifyContent: "center"
  };
  const labelStyle: CSSProperties = {
    ...createSlotStyle(bindingsBySlot.label ?? []),
    opacity: 1,
    outline: "1px solid red"
  };
  const iconStyle: CSSProperties = {
    ...createSlotStyle(bindingsBySlot.icon ?? []),
    outline: "1px solid blue"
  };
  const hasIconSlot = resolved.schema.slots.some((slot) => slot.name === "icon");

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
      <div>
        {previewStates.map((stateName) => (
          <button
            key={stateName}
            onClick={() => setUiState(stateName)}
            type="button"
          >
            {stateName}
          </button>
        ))}
      </div>
      <button style={rootStyleWithLayout}>
        {hasIconSlot ? <span style={iconStyle}>{"\u2022"}</span> : null}
        <span style={labelStyle}>Button</span>
      </button>
    </div>
  );
}
