import type { ComponentSchema } from "./component.types";

export const buttonSchema = {
  editable: {
    fields: ["variants", "tokenBindings"],
    tokenOnly: true
  },
  name: "Button",
  slots: [
    {
      description: "Interactive button element.",
      name: "root",
      required: true,
      role: "root"
    },
    {
      description: "Button text content.",
      name: "label",
      required: true,
      role: "label"
    },
    {
      description: "Optional leading or trailing icon.",
      name: "icon",
      required: false,
      role: "icon"
    }
  ],
  states: [
    { name: "default" },
    { name: "hover" },
    { name: "active" },
    { name: "focus" },
    { name: "disabled" },
    { name: "loading" }
  ],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "semantic.color.accent"
    },
    {
      slot: "root",
      target: "color",
      token: "semantic.color.onAccent"
    },
    {
      slot: "root",
      target: "borderRadius",
      token: "component.button.radius"
    },
    {
      slot: "root",
      target: "boxShadow",
      token: "component.button.elevation"
    },
    {
      slot: "root",
      target: "paddingBlock",
      token: "component.button.paddingBlock"
    },
    {
      slot: "root",
      target: "paddingInline",
      token: "component.button.paddingInline"
    },
    {
      conditions: {
        intent: "primary"
      },
      slot: "root",
      target: "background",
      token: "component.button.intent.primary.background"
    },
    {
      conditions: {
        intent: "primary"
      },
      slot: "root",
      target: "color",
      token: "component.button.intent.primary.color"
    },
    {
      conditions: {
        intent: "secondary"
      },
      slot: "root",
      target: "background",
      token: "component.button.intent.secondary.background"
    },
    {
      conditions: {
        intent: "secondary"
      },
      slot: "root",
      target: "color",
      token: "component.button.intent.secondary.color"
    },
    {
      conditions: {
        intent: "danger"
      },
      slot: "root",
      target: "background",
      token: "component.button.intent.danger.background"
    },
    {
      conditions: {
        intent: "danger"
      },
      slot: "root",
      target: "color",
      token: "component.button.intent.danger.color"
    },
    {
      conditions: {
        intent: "neutral"
      },
      slot: "root",
      target: "background",
      token: "component.button.intent.neutral.background"
    },
    {
      conditions: {
        intent: "neutral"
      },
      slot: "root",
      target: "color",
      token: "component.button.intent.neutral.color"
    },
    {
      conditions: {
        size: "sm"
      },
      slot: "root",
      target: "paddingBlock",
      token: "component.button.size.sm.paddingBlock"
    },
    {
      conditions: {
        size: "sm"
      },
      slot: "root",
      target: "paddingInline",
      token: "component.button.size.sm.paddingInline"
    },
    {
      conditions: {
        size: "md"
      },
      slot: "root",
      target: "paddingBlock",
      token: "component.button.size.md.paddingBlock"
    },
    {
      conditions: {
        size: "md"
      },
      slot: "root",
      target: "paddingInline",
      token: "component.button.size.md.paddingInline"
    },
    {
      conditions: {
        size: "lg"
      },
      slot: "root",
      target: "paddingBlock",
      token: "component.button.size.lg.paddingBlock"
    },
    {
      conditions: {
        size: "lg"
      },
      slot: "root",
      target: "paddingInline",
      token: "component.button.size.lg.paddingInline"
    },
    {
      conditions: {
        state: "disabled"
      },
      slot: "root",
      target: "opacity",
      token: "semantic.state.disabled.opacity"
    },
    {
      slot: "root",
      target: "transitionProperty",
      token: "motion.transition.property"
    },
    {
      slot: "root",
      target: "transitionDuration",
      token: "component.button.motion.duration"
    },
    {
      slot: "root",
      target: "transitionTimingFunction",
      token: "motion.ease.standard"
    },
    {
      slot: "root",
      target: "transitionDelay",
      token: "motion.delay.none"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "background",
      token: "semantic.state.hover.background"
    },
    {
      conditions: {
        state: "active"
      },
      slot: "root",
      target: "opacity",
      token: "semantic.state.active.opacity"
    },
    {
      conditions: {
        state: "focus"
      },
      slot: "root",
      target: "boxShadow",
      token: "semantic.state.focus.ring"
    },
    {
      conditions: {
        state: "active"
      },
      slot: "root",
      target: "paddingInline",
      token: "component.button.state.active.paddingInline"
    },
    {
      conditions: {
        state: "focus"
      },
      slot: "root",
      target: "paddingBlock",
      token: "component.button.state.focus.paddingBlock"
    }
  ],
  variants: [
    {
      default: "primary",
      name: "intent",
      options: ["primary", "secondary", "danger", "neutral"]
    },
    {
      default: "md",
      name: "size",
      options: ["sm", "md", "lg"]
    }
  ],
  version: "0.1.0"
} as const satisfies ComponentSchema;
