import { Code2, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { ControlGroup } from "../../components/ControlGroup";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SliderField } from "../../components/SliderField";
import { clamp } from "../../lib/number";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { TokenInspector } from "./components/TokenInspector";
import { accentOptions, initialDesignState } from "./presets";
import type { ComponentKind, DesignState, MotionIntent } from "./types";
import { useDesignTokens } from "./useDesignTokens";

const componentOptions: Array<{ label: string; value: ComponentKind }> = [
  { label: "Card", value: "card" },
  { label: "Toolbar", value: "toolbar" },
  { label: "Panel", value: "panel" }
];

const intentOptions: Array<{ label: string; value: MotionIntent }> = [
  { label: "Calma", value: "calm" },
  { label: "Foco", value: "focused" },
  { label: "Expresiva", value: "expressive" }
];

export function DesignGenerator() {
  const [designState, setDesignState] =
    useState<DesignState>(initialDesignState);
  const tokens = useDesignTokens(designState);

  const updateState = <TKey extends keyof DesignState>(
    key: TKey,
    value: DesignState[TKey]
  ) => {
    setDesignState((current) => ({ ...current, [key]: value }));
  };

  const cssSnippet = useMemo(
    () => `.component {
  --accent: ${designState.accent};
  --radius: ${designState.radius}px;
  --density: ${designState.density}px;
  --motion-duration: ${designState.speed}ms;
}`,
    [designState]
  );

  return (
    <main className="generator-shell" style={tokens}>
      <aside className="generator-sidebar" aria-label="Controles del generador">
        <div className="brand-lockup">
          <Sparkles aria-hidden="true" size={24} />
          <div>
            <p>Design Motion Lab</p>
            <h1>Generador de diseno</h1>
          </div>
        </div>

        <ControlGroup
          description="Define el tipo de pieza y el caracter de movimiento."
          title="Composicion"
        >
          <SegmentedControl
            label="Componente"
            onChange={(value) => updateState("component", value)}
            options={componentOptions}
            value={designState.component}
          />
          <SegmentedControl
            label="Microanimacion"
            onChange={(value) => updateState("intent", value)}
            options={intentOptions}
            value={designState.intent}
          />
        </ControlGroup>

        <ControlGroup title="Sistema visual">
          <div className="swatch-row" aria-label="Color principal">
            {accentOptions.map((accent) => (
              <button
                aria-label={`Usar color ${accent}`}
                aria-pressed={designState.accent === accent}
                key={accent}
                onClick={() => updateState("accent", accent)}
                style={{ backgroundColor: accent }}
                type="button"
              />
            ))}
          </div>
          <SliderField
            label="Radio"
            max={22}
            min={2}
            onChange={(value) => updateState("radius", value)}
            suffix="px"
            value={designState.radius}
          />
          <SliderField
            label="Densidad"
            max={72}
            min={36}
            onChange={(value) => updateState("density", value)}
            suffix="px"
            value={designState.density}
          />
          <SliderField
            label="Elevacion"
            max={60}
            min={0}
            onChange={(value) => updateState("elevation", value)}
            value={designState.elevation}
          />
          <SliderField
            label="Duracion"
            max={900}
            min={160}
            onChange={(value) => updateState("speed", clamp(value, 160, 900))}
            step={20}
            suffix="ms"
            value={designState.speed}
          />
        </ControlGroup>

        <div className="sidebar-actions">
          <Button
            icon={<RotateCcw aria-hidden="true" size={18} />}
            onClick={() => setDesignState(initialDesignState)}
            variant="ghost"
          >
            Reiniciar
          </Button>
          <Button icon={<Code2 aria-hidden="true" size={18} />} variant="primary">
            Exportar tokens
          </Button>
        </div>
      </aside>

      <section className="generator-stage" aria-label="Vista previa">
        <PreviewCanvas state={designState} />
        <TokenInspector code={cssSnippet} state={designState} />
      </section>
    </main>
  );
}
