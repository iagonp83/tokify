export type ComponentName = string;

export type ComponentSlotName = string;

export type ComponentSlotRole =
  | "root"
  | "content"
  | "icon"
  | "label"
  | "control";

export type ComponentSlot = {
  description?: string;
  name: ComponentSlotName;
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

export type ComponentVariantAxisName = string;

export type ComponentVariantAxis<Option extends string = string> = {
  default: Option;
  name: ComponentVariantAxisName;
  options: readonly Option[];
};

export type ComponentVariantSelection = Partial<
  Record<ComponentVariantAxisName, string>
>;

export type ResolvedComponentVariantSelection = Record<
  ComponentVariantAxisName,
  string
>;

export type ComponentResolutionContext = ComponentVariantSelection & {
  state?: ComponentStateName;
};

export type ComponentVariantCondition = ComponentVariantSelection;

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
  | "transitionDelay"
  | "transitionDuration"
  | "transitionProperty"
  | "transitionTimingFunction";

export type ComponentTokenBinding = {
  conditions?: ComponentVariantCondition & { state?: ComponentStateName };
  slot: ComponentSlotName;
  target: TokenBindingTarget;
  token: string;
};

export type ComponentCompositionSlotRelation = {
  description?: string;
  parentSlot?: ComponentSlotName;
  slot: ComponentSlotName;
};

export type ComponentCompositionPart = {
  description?: string;
  name: string;
  required?: boolean;
  slot: ComponentSlotName;
};

export type ComponentCompositionChild = {
  component: ComponentName;
  description?: string;
  name: string;
  required?: boolean;
  slot: ComponentSlotName;
};

export type ComponentCompositionMetadata = {
  children?: readonly ComponentCompositionChild[];
  parts?: readonly ComponentCompositionPart[];
  slotRelations?: readonly ComponentCompositionSlotRelation[];
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
  composition?: ComponentCompositionMetadata;
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
  value: string;
};

export type ResolvedComponentStyle = Record<string, string>;

export type ResolvedComponentSlotStyles = Record<string, ResolvedComponentStyle>;

export type ResolvedComponentStateStyles = Partial<
  Record<ComponentStateName, ResolvedComponentSlotStyles>
>;

export type ResolvedComponent = {
  bindings: readonly ResolvedComponentBinding[];
  schema: ComponentSchema;
  selection: ResolvedComponentVariantSelection;
  state: ComponentStateName;
  styles: {
    base: ResolvedComponentSlotStyles;
    states: ResolvedComponentStateStyles;
  };
};
