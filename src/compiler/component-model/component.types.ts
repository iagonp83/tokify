export type ComponentName = string;

export type ComponentSlotRole =
  | "root"
  | "content"
  | "icon"
  | "label"
  | "control";

export type ComponentSlot = {
  description?: string;
  name: string;
  required: boolean;
  role: ComponentSlotRole;
};

export type ComponentStateName =
  | "default"
  | "hover"
  | "active"
  | "focus"
  | "disabled"
  | "loading";

export type ComponentState = {
  description?: string;
  name: ComponentStateName;
};

export type ComponentVariantAxisName = "intent" | "size";

export type ComponentVariantAxis<Option extends string = string> = {
  default: Option;
  name: ComponentVariantAxisName;
  options: readonly Option[];
};

export type ComponentVariantSelection = Partial<
  Record<ComponentVariantAxisName, string>
>;

export type ComponentResolutionContext = ComponentVariantSelection & {
  state?: ComponentStateName;
};

export type ComponentVariantCondition = Partial<
  Record<ComponentVariantAxisName, string>
>;

export type TokenNamespace =
  | "raw"
  | "semantic"
  | "component"
  | "motion"
  | "layout"
  | "dataViz";

export type TokenValueType =
  | "color"
  | "duration"
  | "easing"
  | "number"
  | "radius"
  | "shadow"
  | "spacing";

export type TokenReference = {
  namespace: TokenNamespace;
  path: string;
  type: TokenValueType;
};

export type TokenBindingTarget =
  | "background"
  | "borderColor"
  | "borderRadius"
  | "boxShadow"
  | "color"
  | "gap"
  | "height"
  | "opacity"
  | "paddingBlock"
  | "paddingInline"
  | "transitionDuration"
  | "transitionTimingFunction";

export type ComponentTokenBinding = {
  conditions?: ComponentVariantCondition & { state?: ComponentStateName };
  slot: string;
  target: TokenBindingTarget;
  token: TokenReference;
};

export type EditableComponentField =
  | "slots"
  | "states"
  | "variants"
  | "tokenBindings";

export type ComponentEditPolicy = {
  fields: readonly EditableComponentField[];
  tokenOnly: boolean;
};

export type ComponentSchema = {
  editable: ComponentEditPolicy;
  name: ComponentName;
  slots: readonly ComponentSlot[];
  states: readonly ComponentState[];
  tokenBindings: readonly ComponentTokenBinding[];
  variants: readonly ComponentVariantAxis[];
  version: string;
};

export type ResolvedComponentBinding = ComponentTokenBinding & {
  id: string;
};

export type ResolvedComponent = {
  bindings: readonly ResolvedComponentBinding[];
  schema: ComponentSchema;
  selection: Required<Record<ComponentVariantAxisName, string>>;
  state: ComponentStateName;
};
