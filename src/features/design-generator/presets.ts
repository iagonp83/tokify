import type { DesignPreset, DesignState } from "./types";

export const initialDesignState: DesignState = {
  color: {
    accent: "#2f7d69"
  },
  component: {
    kind: "card"
  },
  componentTokens: {
    card: {},
    panel: {},
    toolbar: {}
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
};

export const accentOptions = [
  "#2f7d69",
  "#3168b7",
  "#9a5a2f",
  "#7a4aa0",
  "#b03755"
];

export const designPresets: DesignPreset[] = [
  {
    id: "calm",
    label: "Calma",
    overrides: {
      layout: {
        elevation: 24,
        radius: 10
      },
      motion: {
        delay: 0,
        distance: 2,
        duration: 294,
        ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        presetId: "calm",
        stagger: 40
      }
    }
  },
  {
    id: "focused",
    label: "Foco",
    overrides: {
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
    label: "Expresiva",
    overrides: {
      color: {
        accent: "#7a4aa0"
      },
      layout: {
        elevation: 44
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
  }
];
