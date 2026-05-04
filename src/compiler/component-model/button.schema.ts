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
        size: "sm"
      },
      slot: "root",
      target: "paddingBlock",
      token: "component.button.size.sm.paddingBlock"
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
        size: "lg"
      },
      slot: "root",
      target: "paddingBlock",
      token: "component.button.size.lg.paddingBlock"
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
      target: "transitionDuration",
      token: "motion.duration.fast"
    },
    {
      slot: "root",
      target: "transitionTimingFunction",
      token: "motion.ease.standard"
    },
    {
      conditions: {
        intent: "secondary"
      },
      slot: "root",
      target: "borderRadius",
      token: "component.button.intent.secondary.radius"
    },
    {
      conditions: {
        state: "hover"
      },
      slot: "root",
      target: "borderRadius",
      token: "component.button.state.hover.radius"
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
      target: "boxShadow",
      token: "component.button.state.focus.ring"
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
