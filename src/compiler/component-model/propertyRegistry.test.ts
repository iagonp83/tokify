import { describe, expect, it } from "vitest";
import {
  componentStylePropertyRegistry,
  getComponentStyleProperty,
  getCssPropertyForTokenBindingTarget,
  isInheritableStyleProperty,
  isRuntimeEmittableStyleProperty
} from "./propertyRegistry";

describe("componentStylePropertyRegistry", () => {
  it("looks up css property metadata for token binding targets", () => {
    expect(componentStylePropertyRegistry.background.cssProperty).toBe(
      "background"
    );
    expect(getCssPropertyForTokenBindingTarget("paddingInline")).toBe(
      "paddingInline"
    );
  });

  it("keeps unsupported binding targets registered but out of style output", () => {
    const borderColor = getComponentStyleProperty("borderColor");

    expect(borderColor?.cssProperty).toBeUndefined();
    expect(borderColor?.runtimeEmittable).toBe(false);
    expect(borderColor?.allowStateEmission).toBe(false);
  });

  it("exposes inheritance metadata for slot inheritance", () => {
    expect(isInheritableStyleProperty("color")).toBe(true);
    expect(isInheritableStyleProperty("transitionDuration")).toBe(true);
    expect(isInheritableStyleProperty("background")).toBe(false);
    expect(isInheritableStyleProperty("paddingInline")).toBe(false);
  });

  it("exposes runtime-emittable metadata", () => {
    expect(isRuntimeEmittableStyleProperty("background", "base")).toBe(true);
    expect(isRuntimeEmittableStyleProperty("background", "state")).toBe(true);
    expect(isRuntimeEmittableStyleProperty("borderColor", "base")).toBe(false);
    expect(isRuntimeEmittableStyleProperty("unknown", "base")).toBe(false);
  });

  it("marks transition shorthand as a derived base runtime property", () => {
    const transition = getComponentStyleProperty("transition");

    expect(transition).toMatchObject({
      allowStateEmission: false,
      cssProperty: "transition",
      derived: true,
      runtimeEmittable: true
    });
    expect(isRuntimeEmittableStyleProperty("transition", "base")).toBe(true);
    expect(isRuntimeEmittableStyleProperty("transition", "state")).toBe(false);
  });
});
