import { useEffect, useState, type CSSProperties } from "react";
import { Layers, MousePointer2, Wand2 } from "lucide-react";
import { buttonSchema } from "../../../compiler/component-model/button.schema";
import { inputSchema } from "../../../compiler/component-model/input.schema";
import type { ComponentStateName } from "../../../compiler/component-model/component.types";
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

export function PreviewCanvas({ state }: PreviewCanvasProps) {
  const [uiState, setUiState] = useState<ComponentStateName>("default");
  const [isMotionPreviewAnimating, setIsMotionPreviewAnimating] =
    useState(false);
  const tokens = useDesignTokens(state);
  const tokenResolver = createTokenResolver(tokens, state.component.kind);
  const resolved = resolveComponent(buttonSchema, tokenResolver, {
    intent: "secondary",
    size: "sm",
    state: uiState
  });
  const resolvedInput = resolveComponent(inputSchema, tokenResolver, {
    state: uiState
  });
  const stateStyles = resolved.styles.states[uiState] ?? {};
  const inputStateStyles = resolvedInput.styles.states[uiState] ?? {};
  const rootStyle = {
    ...(resolved.styles.base.root ?? {}),
    ...(stateStyles.root ?? {})
  };
  const inputRootStyle = {
    ...(resolvedInput.styles.base.root ?? {}),
    ...(inputStateStyles.root ?? {})
  };
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
    ...(resolved.styles.base.label ?? {}),
    ...(stateStyles.label ?? {}),
    opacity: 1
  };
  const iconStyle = {
    ...(resolved.styles.base.icon ?? {}),
    ...(stateStyles.icon ?? {})
  };
  const hasIconSlot = resolved.schema.slots.some((slot) => slot.name === "icon");
  const buttonMotionDuration = String(rootStyle.transitionDuration ?? "0ms");
  const buttonMotionDurationMs = parseDurationMs(buttonMotionDuration);
  const inputStyle: CSSProperties = {
    ...inputRootStyle,
    border: 0,
    boxSizing: "border-box",
    minWidth: 220,
    outline: 0
  };

  useEffect(() => {
    setIsMotionPreviewAnimating(false);

    const animationFrame = window.requestAnimationFrame(() => {
      setIsMotionPreviewAnimating(true);
    });
    const timeout = window.setTimeout(() => {
      setIsMotionPreviewAnimating(false);
    }, buttonMotionDurationMs);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
    };
  }, [buttonMotionDuration, buttonMotionDurationMs, uiState]);

  return (
    <div className="preview-canvas">
      <style>
        {`
          @keyframes component-motion-preview-pulse {
            0% {
              transform: scale(1);
            }
            50% {
              box-shadow: 0 18px 44px rgb(18 28 23 / 0.24);
              opacity: 0.92;
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
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
      <button
        style={{
          ...rootStyleWithLayout,
          animation: isMotionPreviewAnimating
            ? `component-motion-preview-pulse ${buttonMotionDuration} ${rootStyle.transitionTimingFunction ?? "ease"}`
            : undefined
        }}
      >
        {hasIconSlot ? <span style={iconStyle}>{"\u2022"}</span> : null}
        <span style={labelStyle}>Button</span>
      </button>
      <input
        aria-label="Input preview"
        disabled={uiState === "disabled"}
        readOnly
        style={inputStyle}
        value="Input"
      />
    </div>
  );
}

function parseDurationMs(duration: string) {
  const trimmedDuration = duration.trim();

  if (trimmedDuration.endsWith("ms")) {
    return Number.parseFloat(trimmedDuration);
  }

  if (trimmedDuration.endsWith("s")) {
    return Number.parseFloat(trimmedDuration) * 1000;
  }

  return Number.parseFloat(trimmedDuration) || 0;
}
