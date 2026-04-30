import type { UserDesignPreset } from "../types";

export const STORAGE_KEY = "design-motion-lab:user-presets";

export function loadUserPresets(): UserDesignPreset[] {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isUserDesignPreset);
  } catch {
    return [];
  }
}

export function saveUserPreset(preset: UserDesignPreset) {
  const existingPresets = loadUserPresets();
  const nextPresets = [
    preset,
    ...existingPresets.filter(
      (existingPreset) => existingPreset.id !== preset.id
    )
  ];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPresets));
  return nextPresets;
}

export function deleteUserPreset(id: string) {
  const nextPresets = loadUserPresets().filter((preset) => preset.id !== id);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPresets));
  return nextPresets;
}

function isUserDesignPreset(value: unknown): value is UserDesignPreset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as UserDesignPreset;

  return (
    typeof candidate.createdAt === "string" &&
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    Boolean(candidate.state?.color) &&
    Boolean(candidate.state?.component) &&
    Boolean(candidate.state?.layout) &&
    Boolean(candidate.state?.motion)
  );
}
