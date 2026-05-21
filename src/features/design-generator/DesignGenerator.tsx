import {
  Code2,
  FileInput,
  RotateCcw,
  Save,
  Sparkles,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { ControlGroup } from "../../components/ControlGroup";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SliderField } from "../../components/SliderField";
import type { ComponentVariantAxisName } from "../../compiler/component-model/component.types";
import { downloadTextFile } from "../../lib/downloadTextFile";
import { clamp } from "../../lib/number";
import { CompilerFlowStatusPanel } from "./components/CompilerFlowStatusPanel";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { TokenInspector } from "./components/TokenInspector";
import { createCompilerFlowStatus } from "./compilerFlowStatus";
import { exportCss } from "./export/exportCss";
import { exportJson } from "./export/exportJson";
import {
  createImportErrorFeedback,
  createImportReadErrorFeedback
} from "./import/importFeedback";
import { parseDesignState } from "./import/importTokens";
import { accentOptions, designPresets, initialDesignState } from "./presets";
import { designSystemProfiles } from "./profiles/profiles";
import {
  deleteUserPreset,
  loadUserPresets,
  saveUserPreset
} from "./storage/presetStorage";
import type {
  ComponentKind,
  ComponentNamespace,
  DesignPreset,
  DesignState,
  UserDesignPreset
} from "./types";
import {
  hasAuthoredComponentNamespaceOverride,
  hasComponentFieldOverride,
  resolveComponentNamespaceTokens,
  resetComponentFieldOverride,
  resetAuthoredComponentNamespaceOverride,
  updateComponentNamespaceTokens
} from "./tokens/componentTokens";
import { useDesignTokens } from "./useDesignTokens";

const componentOptions: Array<{ label: string; value: ComponentKind }> = [
  { label: "Card", value: "card" },
  { label: "Toolbar", value: "toolbar" },
  { label: "Panel", value: "panel" }
];

const componentNamespaceOptions: Array<{
  label: string;
  value: ComponentNamespace;
}> = [
  { label: "Card", value: "card" },
  { label: "Toolbar", value: "toolbar" },
  { label: "Panel", value: "panel" },
  { label: "Button", value: "button" },
  { label: "Input", value: "input" }
];

const presetOptions = designPresets.map((preset) => ({
  label: preset.label,
  value: preset.id
}));

const profileOptions = designSystemProfiles.map((profile) => ({
  label: profile.label,
  value: profile.id
}));

export function DesignGenerator() {
  const [designState, setDesignState] =
    useState<DesignState>(initialDesignState);
  const [editingNamespace, setEditingNamespace] =
    useState<ComponentNamespace>(initialDesignState.component.kind);
  const [selectedProfileId, setSelectedProfileId] = useState("minimal");
  const [userPresets, setUserPresets] = useState<UserDesignPreset[]>([]);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingNamespaceTokens = resolveComponentNamespaceTokens(
    designState,
    editingNamespace
  );
  const isEditingAuthoredNamespace = isAuthoredNamespace(editingNamespace);
  const hasEditingNamespaceOverride = hasAuthoredComponentNamespaceOverride(
    designState,
    editingNamespace
  );
  const overrideFieldCount = isEditingAuthoredNamespace
    ? [
        hasComponentFieldOverride(
          designState,
          editingNamespace,
          "layout",
          "radius"
        ),
        hasComponentFieldOverride(
          designState,
          editingNamespace,
          "layout",
          "density"
        ),
        hasComponentFieldOverride(
          designState,
          editingNamespace,
          "layout",
          "elevation"
        ),
        hasComponentFieldOverride(
          designState,
          editingNamespace,
          "motion",
          "duration"
        )
      ].filter(Boolean).length
    : 0;
  const getSliderSourceLabel = (
    group: "layout" | "motion",
    field: "density" | "duration" | "elevation" | "radius"
  ) => {
    if (!isEditingAuthoredNamespace) {
      return undefined;
    }

    return hasComponentFieldOverride(
      designState,
      editingNamespace,
      group,
      field
    )
      ? "Override"
      : `Inherited from ${designState.component.kind}`;
  };
  const renderSliderSource = (
    group: "layout" | "motion",
    field: "density" | "duration" | "elevation" | "radius"
  ) => {
    const sliderSourceLabel = getSliderSourceLabel(group, field);
    const hasFieldOverride =
      isEditingAuthoredNamespace &&
      hasComponentFieldOverride(designState, editingNamespace, group, field);

    if (!sliderSourceLabel) {
      return null;
    }

    return (
      <div className="slider-source">
        <span>{sliderSourceLabel}</span>
        {hasFieldOverride ? (
          <button
            onClick={() =>
              setDesignState((current) =>
                resetComponentFieldOverride(
                  current,
                  editingNamespace,
                  group,
                  field
                )
              )
            }
            type="button"
          >
            Reset
          </button>
        ) : null}
      </div>
    );
  };
  const tokens = useDesignTokens(designState);
  const compilerFlowStatus = useMemo(
    () => createCompilerFlowStatus(designState),
    [designState]
  );

  useEffect(() => {
    setUserPresets(loadUserPresets());
  }, []);

  const updateDomain = <TDomain extends keyof DesignState>(
    domain: TDomain,
    value: Partial<DesignState[TDomain]>
  ) => {
    setDesignState((current) => ({
      ...current,
      [domain]: {
        ...current[domain],
        ...value
      }
    }));
  };

  const applyPreset = (presetId: string) => {
    const preset = designPresets.find(
      (candidatePreset) => candidatePreset.id === presetId
    );

    if (!preset) {
      return;
    }

    setDesignState((current) => applyPresetOverrides(current, preset));
  };

  const applyProfile = (profileId: string) => {
    const profile = designSystemProfiles.find(
      (candidateProfile) => candidateProfile.id === profileId
    );

    if (!profile) {
      return;
    }

    setSelectedProfileId(profile.id);
    setDesignState((current) => ({
      ...current,
      color: profile.defaults.color,
      layout: profile.defaults.layout,
      motion: profile.defaults.motion
    }));
  };

  const cssSnippet = useMemo(() => exportCss(tokens), [tokens]);

  const handleExportCss = () => {
    const cssOutput = exportCss(tokens);

    console.log(cssOutput);
    downloadTextFile("tokens.css", cssOutput, "text/css");
  };

  const handleExportJson = () => {
    const jsonOutput = JSON.stringify(exportJson(tokens, designState), null, 2);

    console.log(jsonOutput);
    downloadTextFile("tokens.json", jsonOutput, "application/json");
  };

  const handleSaveUserPreset = () => {
    const presetName = window.prompt("Nombre del preset");
    const label = presetName?.trim();

    if (!label) {
      return;
    }

    const preset: UserDesignPreset = {
      createdAt: new Date().toISOString(),
      id: createPresetId(),
      label,
      state: designState
    };

    setUserPresets(saveUserPreset(preset));
  };

  const handleLoadUserPreset = (preset: UserDesignPreset) => {
    setDesignState(normalizeDesignState(preset.state));
  };

  const handleDeleteUserPreset = (presetId: string) => {
    setUserPresets(deleteUserPreset(presetId));
  };

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    setImportErrorMessage(null);

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = String(reader.result);
        const importedState = normalizeDesignState(
          parseDesignState(JSON.parse(fileContent))
        );

        setDesignState(importedState);
        setImportErrorMessage(null);
      } catch (error) {
        console.error("No se pudo importar tokens.json", error);
        setImportErrorMessage(createImportErrorFeedback(error));
      } finally {
        resetFileInput();
      }
    };

    reader.onerror = () => {
      console.error("No se pudo leer el archivo tokens.json", reader.error);
      setImportErrorMessage(createImportReadErrorFeedback());
      resetFileInput();
    };

    reader.readAsText(file);
  };

  const handleActiveComponentChange = (value: ComponentKind) => {
    updateDomain("component", { kind: value });
    setEditingNamespace((currentNamespace) =>
      isComponentKind(currentNamespace) ? value : currentNamespace
    );
  };

  const handleButtonVariantChange = (
    axis: ComponentVariantAxisName,
    value: string
  ) => {
    setDesignState((current) => ({
      ...current,
      variantSelections: {
        ...current.variantSelections,
        button: {
          ...current.variantSelections.button,
          [axis]: value
        }
      }
    }));
  };

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
            label="Profile"
            onChange={applyProfile}
            options={profileOptions}
            value={selectedProfileId}
          />
          <SegmentedControl
            label="Componente"
            onChange={handleActiveComponentChange}
            options={componentOptions}
            value={designState.component.kind}
          />
          <SegmentedControl
            label="Microanimacion"
            onChange={applyPreset}
            options={presetOptions}
            value={designState.motion.presetId}
          />
        </ControlGroup>

        <CompilerFlowStatusPanel status={compilerFlowStatus} />

        <ControlGroup title="Sistema visual">
          <SegmentedControl
            label="Editando"
            onChange={setEditingNamespace}
            options={componentNamespaceOptions}
            value={editingNamespace}
          />
          {isEditingAuthoredNamespace ? (
            <div className="component-override-status">
              <p>
                {hasEditingNamespaceOverride
                  ? `Override · ${overrideFieldCount} ${
                      overrideFieldCount === 1 ? "field" : "fields"
                    }`
                  : "Reference"}
              </p>
              <p>
                {hasEditingNamespaceOverride
                  ? `Fallback: ${designState.component.kind}`
                  : `Inheriting from: ${designState.component.kind}`}
              </p>
              {hasEditingNamespaceOverride ? (
                <Button
                  onClick={() =>
                    setDesignState((current) =>
                      resetAuthoredComponentNamespaceOverride(
                        current,
                        editingNamespace
                      )
                    )
                  }
                  variant="ghost"
                >
                  Reset
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className="swatch-row" aria-label="Color principal">
            {accentOptions.map((accent) => (
              <button
                aria-label={`Usar color ${accent}`}
                aria-pressed={designState.color.accent === accent}
                key={accent}
                onClick={() => updateDomain("color", { accent })}
                style={{ backgroundColor: accent }}
                type="button"
              />
            ))}
          </div>
          <div className="slider-with-source">
            <SliderField
              label="Radio"
              max={22}
              min={2}
              onChange={(value) =>
                setDesignState((current) =>
                  updateComponentNamespaceTokens(current, editingNamespace, {
                    layout: { radius: value }
                  })
                )
              }
              suffix="px"
              value={editingNamespaceTokens.layout.radius}
            />
            {renderSliderSource("layout", "radius")}
          </div>
          <div className="slider-with-source">
            <SliderField
              label="Densidad"
              max={72}
              min={36}
              onChange={(value) =>
                setDesignState((current) =>
                  updateComponentNamespaceTokens(current, editingNamespace, {
                    layout: { density: value }
                  })
                )
              }
              suffix="px"
              value={editingNamespaceTokens.layout.density}
            />
            {renderSliderSource("layout", "density")}
          </div>
          {editingNamespace === "input" ? null : (
            <div className="slider-with-source">
              <SliderField
                label="Elevacion"
                max={60}
                min={0}
                onChange={(value) =>
                  setDesignState((current) =>
                    updateComponentNamespaceTokens(current, editingNamespace, {
                      layout: { elevation: value }
                    })
                  )
                }
                value={editingNamespaceTokens.layout.elevation}
              />
              {renderSliderSource("layout", "elevation")}
            </div>
          )}
          <div className="slider-with-source">
            <SliderField
              label="Duracion"
              max={900}
              min={160}
              onChange={(value) =>
                setDesignState((current) =>
                  updateComponentNamespaceTokens(current, editingNamespace, {
                    motion: { duration: clamp(value, 160, 900) }
                  })
                )
              }
              step={20}
              suffix="ms"
              value={editingNamespaceTokens.motion.duration}
            />
            {renderSliderSource("motion", "duration")}
          </div>
        </ControlGroup>

        <ControlGroup title="Mis presets">
          <div className="user-presets">
            <Button
              icon={<Save aria-hidden="true" size={18} />}
              onClick={handleSaveUserPreset}
              variant="secondary"
            >
              Guardar preset
            </Button>
            {userPresets.length > 0 ? (
              <div className="user-presets__list">
                {userPresets.map((preset) => (
                  <div className="user-presets__item" key={preset.id}>
                    <button
                      className="user-presets__load"
                      onClick={() => handleLoadUserPreset(preset)}
                      type="button"
                    >
                      <span>{preset.label}</span>
                      <small>
                        {new Intl.DateTimeFormat("es", {
                          dateStyle: "medium"
                        }).format(new Date(preset.createdAt))}
                      </small>
                    </button>
                    <button
                      aria-label={`Eliminar preset ${preset.label}`}
                      className="user-presets__delete"
                      onClick={() => handleDeleteUserPreset(preset.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="user-presets__empty">No hay presets guardados.</p>
            )}
          </div>
        </ControlGroup>

        <div className="sidebar-actions">
          <input
            accept="application/json"
            className="file-input"
            onChange={(event) => handleImportFile(event.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
          {importErrorMessage ? (
            <p className="import-feedback" role="alert">
              {importErrorMessage}
            </p>
          ) : null}
          <Button
            icon={<RotateCcw aria-hidden="true" size={18} />}
            onClick={() =>
              setDesignState(getInitialStateForProfile(selectedProfileId))
            }
            variant="ghost"
          >
            Reiniciar
          </Button>
          <Button
            icon={<Code2 aria-hidden="true" size={18} />}
            onClick={handleExportCss}
            variant="primary"
          >
            Export CSS
          </Button>
          <Button
            icon={<Code2 aria-hidden="true" size={18} />}
            onClick={handleExportJson}
            variant="primary"
          >
            Export JSON
          </Button>
          <Button
            icon={<FileInput aria-hidden="true" size={18} />}
            onClick={handleImportJson}
            variant="secondary"
          >
            Import JSON
          </Button>
        </div>
      </aside>

      <section className="generator-stage" aria-label="Vista previa">
        <PreviewCanvas
          onButtonVariantChange={handleButtonVariantChange}
          state={designState}
        />
        <TokenInspector code={cssSnippet} state={designState} />
      </section>
    </main>
  );
}

function applyPresetOverrides(
  current: DesignState,
  preset: DesignPreset
): DesignState {
  return {
    ...current,
    motion: {
      ...current.motion,
      ...preset.overrides.motion
    }
  };
}

function getInitialStateForProfile(profileId: string): DesignState {
  const profile = designSystemProfiles.find(
    (candidateProfile) => candidateProfile.id === profileId
  );

  if (!profile) {
    return initialDesignState;
  }

  return {
    ...initialDesignState,
    ...profile.defaults
  };
}

function normalizeDesignState(state: DesignState): DesignState {
  return {
    ...state,
    componentTokens: {
      ...initialDesignState.componentTokens,
      ...state.componentTokens
    },
    variantSelections: {
      ...initialDesignState.variantSelections,
      ...state.variantSelections
    }
  };
}

function createPresetId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `preset-${Date.now()}`;
}

function isComponentKind(
  namespace: ComponentNamespace
): namespace is ComponentKind {
  return namespace === "card" || namespace === "toolbar" || namespace === "panel";
}

function isAuthoredNamespace(namespace: ComponentNamespace) {
  return namespace === "button" || namespace === "input";
}
