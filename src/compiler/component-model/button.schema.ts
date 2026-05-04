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
      token: {
        namespace: "semantic",
        path: "color.accent",
        type: "color"
      }
    },
    {
      slot: "root",
      target: "color",
      token: {
        namespace: "semantic",
        path: "color.onAccent",
        type: "color"
      }
    },
    {
      slot: "root",
      target: "borderRadius",
      token: {
        namespace: "component",
        path: "button.radius",
        type: "radius"
      }
    },
    {
      slot: "root",
      target: "paddingBlock",
      token: {
        namespace: "component",
        path: "button.paddingBlock",
        type: "spacing"
      }
    },
    {
      slot: "root",
      target: "paddingInline",
      token: {
        namespace: "component",
        path: "button.paddingInline",
        type: "spacing"
      }
    },
    {
      conditions: {
        size: "sm"
      },
      slot: "root",
      target: "height",
      token: {
        namespace: "component",
        path: "button.size.sm.height",
        type: "spacing"
      }
    },
    {
      conditions: {
        size: "md"
      },
      slot: "root",
      target: "height",
      token: {
        namespace: "component",
        path: "button.size.md.height",
        type: "spacing"
      }
    },
    {
      conditions: {
        size: "lg"
      },
      slot: "root",
      target: "height",
      token: {
        namespace: "component",
        path: "button.size.lg.height",
        type: "spacing"
      }
    },
    {
      conditions: {
        state: "disabled"
      },
      slot: "root",
      target: "opacity",
      token: {
        namespace: "semantic",
        path: "state.disabled.opacity",
        type: "number"
      }
    },
    {
      slot: "root",
      target: "transitionDuration",
      token: {
        namespace: "motion",
        path: "duration.fast",
        type: "duration"
      }
    },
    {
      slot: "root",
      target: "transitionTimingFunction",
      token: {
        namespace: "motion",
        path: "ease.standard",
        type: "easing"
      }
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
