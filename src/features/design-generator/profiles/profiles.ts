import type { DesignSystemProfile } from "../types";

export const designSystemProfiles: DesignSystemProfile[] = [
  {
    id: "minimal",
    label: "Minimal",
    defaults: {
      color: {
        accent: "#2f7d69"
      },
      layout: {
        density: 48,
        elevation: 34,
        radius: 8
      },
      motion: {
        delay: 0,
        distance: 2,
        duration: 420,
        ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        presetId: "focused",
        stagger: 40
      }
    }
  },
  {
    id: "expressive",
    label: "Expressive",
    defaults: {
      color: {
        accent: "#7a4aa0"
      },
      layout: {
        density: 54,
        elevation: 44,
        radius: 12
      },
      motion: {
        delay: 0,
        distance: 2,
        duration: 567,
        ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        presetId: "expressive",
        stagger: 40
      }
    }
  },
  {
    id: "dense",
    label: "Dense",
    defaults: {
      color: {
        accent: "#3168b7"
      },
      layout: {
        density: 36,
        elevation: 28,
        radius: 6
      },
      motion: {
        delay: 0,
        distance: 2,
        duration: 320,
        ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        presetId: "calm",
        stagger: 40
      }
    }
  }
];
