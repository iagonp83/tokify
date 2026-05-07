import type { TokenBindingTarget } from "./component.types";

export type RuntimeStyleSource = "base" | "state";

export type ComponentStylePropertyDefinition = {
  readonly allowStateEmission: boolean;
  readonly cssProperty?: string;
  readonly derived: boolean;
  readonly inheritable: boolean;
  readonly runtimeEmittable: boolean;
};

type ComponentStylePropertyOptions = {
  readonly allowStateEmission?: boolean;
  readonly cssProperty?: string;
  readonly derived?: boolean;
  readonly inheritable?: boolean;
  readonly runtimeEmittable?: boolean;
};

function defineStyleProperty({
  allowStateEmission,
  cssProperty,
  derived = false,
  inheritable = false,
  runtimeEmittable = cssProperty !== undefined
}: ComponentStylePropertyOptions): ComponentStylePropertyDefinition {
  return {
    ...(cssProperty ? { cssProperty } : {}),
    allowStateEmission: allowStateEmission ?? runtimeEmittable,
    derived,
    inheritable,
    runtimeEmittable
  };
}

const tokenBindingTargetProperties = {
  background: defineStyleProperty({ cssProperty: "background" }),
  borderColor: defineStyleProperty({ allowStateEmission: false }),
  borderRadius: defineStyleProperty({ cssProperty: "borderRadius" }),
  boxShadow: defineStyleProperty({ cssProperty: "boxShadow" }),
  color: defineStyleProperty({
    cssProperty: "color",
    inheritable: true
  }),
  gap: defineStyleProperty({ cssProperty: "gap" }),
  height: defineStyleProperty({ cssProperty: "height" }),
  opacity: defineStyleProperty({ cssProperty: "opacity" }),
  paddingBlock: defineStyleProperty({ cssProperty: "paddingBlock" }),
  paddingInline: defineStyleProperty({ cssProperty: "paddingInline" }),
  transitionDelay: defineStyleProperty({
    cssProperty: "transitionDelay",
    inheritable: true
  }),
  transitionDuration: defineStyleProperty({
    cssProperty: "transitionDuration",
    inheritable: true
  }),
  transitionProperty: defineStyleProperty({
    cssProperty: "transitionProperty",
    inheritable: true
  }),
  transitionTimingFunction: defineStyleProperty({
    cssProperty: "transitionTimingFunction",
    inheritable: true
  })
} satisfies Record<TokenBindingTarget, ComponentStylePropertyDefinition>;

const derivedStyleProperties = {
  transition: defineStyleProperty({
    allowStateEmission: false,
    cssProperty: "transition",
    derived: true
  })
} satisfies Record<"transition", ComponentStylePropertyDefinition>;

export const componentStylePropertyRegistry = {
  ...tokenBindingTargetProperties,
  ...derivedStyleProperties
} as const;

export type ComponentStylePropertyName =
  keyof typeof componentStylePropertyRegistry;

const stylePropertyLookup = componentStylePropertyRegistry as Readonly<
  Record<string, ComponentStylePropertyDefinition | undefined>
>;

export function getComponentStyleProperty(property: string) {
  return stylePropertyLookup[property];
}

export function getCssPropertyForTokenBindingTarget(
  target: TokenBindingTarget
) {
  return tokenBindingTargetProperties[target].cssProperty;
}

export function isInheritableStyleProperty(property: string) {
  return getComponentStyleProperty(property)?.inheritable ?? false;
}

export function isRuntimeEmittableStyleProperty(
  property: string,
  source: RuntimeStyleSource
) {
  const definition = getComponentStyleProperty(property);

  if (!definition?.runtimeEmittable) {
    return false;
  }

  if (source === "state") {
    return definition.allowStateEmission;
  }

  return true;
}
