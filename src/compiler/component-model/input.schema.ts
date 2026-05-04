import type { ComponentSchema } from "./component.types";

export const inputSchema = {
  editable: {
    fields: ["states", "tokenBindings"],
    tokenOnly: true
  },
  name: "Input",
  slots: [
    {
      description: "Input control element.",
      name: "root",
      required: true,
      role: "control"
    }
  ],
  states: [
    { name: "default" },
    { name: "hover" },
    { name: "focus" },
    { name: "disabled" }
  ],
  tokenBindings: [
    {
      slot: "root",
      target: "background",
      token: "semantic.color.onAccent"
    },
    {
      slot: "root",
      target: "color",
      token: "semantic.color.accent"
    },
    {
      slot: "root",
      target: "borderRadius",
      token: "component.input.radius"
    },
    {
      slot: "root",
      target: "paddingBlock",
      token: "component.input.paddingBlock"
    },
    {
      slot: "root",
      target: "paddingInline",
      token: "component.input.paddingInline"
    },
    {
      slot: "root",
      target: "transitionProperty",
      token: "motion.transition.property"
    },
    {
      slot: "root",
      target: "transitionDuration",
      token: "component.input.motion.duration"
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
        state: "focus"
      },
      slot: "root",
      target: "boxShadow",
      token: "semantic.state.focus.ring"
    },
    {
      conditions: {
        state: "disabled"
      },
      slot: "root",
      target: "opacity",
      token: "semantic.state.disabled.opacity"
    }
  ],
  variants: [],
  version: "0.1.0"
} as const satisfies ComponentSchema;
