import { useEffect, useState, type CSSProperties } from "react";
import { Layers, MousePointer2, Wand2 } from "lucide-react";
import { buttonSchema } from "../../../compiler/component-model/button.schema";
import { inputSchema } from "../../../compiler/component-model/input.schema";
import type {
  ComponentResolutionContext,
  ComponentVariantAxisName,
  ComponentStateName
} from "../../../compiler/component-model/component.types";
import { resolveComponent } from "../../../compiler/component-model/resolveComponent";
import { createTokenResolver } from "../../../compiler/component-model/tokenResolver";
import type { AuthoredComponentNamespace, DesignState } from "../types";
import { useDesignTokens } from "../useDesignTokens";

type PreviewCanvasProps = {
  onButtonVariantChange: (
    axis: ComponentVariantAxisName,
    value: string
  ) => void;
  state: DesignState;
};

type MotionPreviewPhase = "enter" | "exit" | "idle";

const previewStates: ComponentStateName[] = [
  "default",
  "hover",
  "active",
  "focus",
  "disabled"
];

export function PreviewCanvas({
  onButtonVariantChange,
  state
}: PreviewCanvasProps) {
  const [uiState, setUiState] = useState<ComponentStateName>("default");
  const [motionPreviewPhase, setMotionPreviewPhase] =
    useState<MotionPreviewPhase>("idle");
  const tokens = useDesignTokens(state);
  const tokenResolver = createTokenResolver(tokens, state.component.kind);
  const resolved = resolveComponent(
    buttonSchema,
    tokenResolver,
    createPreviewResolutionContext(state, "button", uiState)
  );
  const resolvedInput = resolveComponent(
    inputSchema,
    tokenResolver,
    createPreviewResolutionContext(state, "input", uiState)
  );
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
  const buttonEnterDuration = getButtonMotionDuration(
    tokens,
    "--button-enter-motion-duration"
  );
  const buttonExitDuration = getButtonMotionDuration(
    tokens,
    "--button-exit-motion-duration"
  );
  const buttonEnterDurationMs = parseDurationMs(buttonEnterDuration);
  const buttonExitDurationMs = parseDurationMs(buttonExitDuration);
  const buttonPulseStyle = createButtonPulseStyle(
    motionPreviewPhase,
    buttonEnterDuration,
    buttonExitDuration
  );
  const inputStyle: CSSProperties = {
    ...inputRootStyle,
    border: 0,
    boxSizing: "border-box",
    minWidth: 220,
    outline: 0
  };

  useEffect(() => {
    setMotionPreviewPhase("idle");

    const animationFrame = window.requestAnimationFrame(() => {
      setMotionPreviewPhase("enter");
    });
    const exitTimeout = window.setTimeout(() => {
      setMotionPreviewPhase("exit");
    }, buttonEnterDurationMs);
    const idleTimeout = window.setTimeout(() => {
      setMotionPreviewPhase("idle");
    }, buttonEnterDurationMs + buttonExitDurationMs);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(exitTimeout);
      window.clearTimeout(idleTimeout);
    };
  }, [
    buttonEnterDuration,
    buttonEnterDurationMs,
    buttonExitDuration,
    buttonExitDurationMs,
    uiState
  ]);

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
        {buttonSchema.variants.map((axis) => (
          <div key={axis.name}>
            <span>{axis.name}</span>
            {axis.options.map((option) => (
              <button
                aria-pressed={resolved.selection[axis.name] === option}
                key={option}
                onClick={() => onButtonVariantChange(axis.name, option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        ))}
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
        onPointerDown={() => setUiState("active")}
        onPointerLeave={() => setUiState("default")}
        onPointerUp={() => setUiState("default")}
        style={{
          ...rootStyleWithLayout,
          ...buttonPulseStyle
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

function createPreviewResolutionContext(
  designState: DesignState,
  namespace: AuthoredComponentNamespace,
  previewState: ComponentStateName
): ComponentResolutionContext {
  return {
    ...designState.variantSelections[namespace],
    state: previewState
  };
}

function getButtonMotionDuration(
  tokens: Record<string, string>,
  tokenName:
    | "--button-enter-motion-duration"
    | "--button-exit-motion-duration"
) {
  return tokens[tokenName] ?? tokens["--button-motion-duration"] ?? "0ms";
}

function createButtonPulseStyle(
  phase: MotionPreviewPhase,
  enterDuration: string,
  exitDuration: string
): CSSProperties {
  if (phase === "enter") {
    return {
      boxShadow: "0 18px 44px rgb(18 28 23 / 0.24)",
      opacity: 0.92,
      transform: "scale(1.05)",
      transitionDuration: enterDuration
    };
  }

  if (phase === "exit") {
    return {
      opacity: 1,
      transform: "scale(1)",
      transitionDuration: exitDuration
    };
  }

  return {};
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
