import { buttonSchema } from "./button.schema";
import type { ComponentName, ComponentSchema } from "./component.types";
import { inputSchema } from "./input.schema";

export type ComponentRegistryEntry = {
  authoredName: ComponentName;
  schema: ComponentSchema;
};

export type ComponentRegistry = {
  entries: readonly ComponentRegistryEntry[];
};

export type ComponentRegistryValidationResult = {
  errors: string[];
  valid: boolean;
};

export const componentRegistry = createComponentRegistry([
  buttonSchema,
  inputSchema
]);

export function createComponentRegistry(
  schemas: readonly ComponentSchema[]
): ComponentRegistry {
  return {
    entries: schemas.map((schema) => ({
      authoredName: schema.name,
      schema
    }))
  };
}

export function listComponentRegistryEntries(
  registry: ComponentRegistry
): readonly ComponentRegistryEntry[] {
  return registry.entries;
}

export function listComponentRegistryNames(
  registry: ComponentRegistry
): readonly ComponentName[] {
  return registry.entries.map((entry) => entry.authoredName);
}

export function findComponentRegistryEntry(
  registry: ComponentRegistry,
  authoredName: ComponentName
): ComponentRegistryEntry | undefined {
  return registry.entries.find((entry) => entry.authoredName === authoredName);
}

export function getComponentSchema(
  registry: ComponentRegistry,
  authoredName: ComponentName
): ComponentSchema | undefined {
  return findComponentRegistryEntry(registry, authoredName)?.schema;
}

export function validateComponentRegistry(
  registry: ComponentRegistry
): ComponentRegistryValidationResult {
  const errors = findDuplicateAuthoredNames(registry.entries).map(
    (authoredName) =>
      `Component registry authored name "${authoredName}" is duplicated.`
  );

  return {
    errors,
    valid: errors.length === 0
  };
}

function findDuplicateAuthoredNames(
  entries: readonly ComponentRegistryEntry[]
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  entries.forEach((entry) => {
    if (seen.has(entry.authoredName)) {
      duplicates.add(entry.authoredName);
      return;
    }

    seen.add(entry.authoredName);
  });

  return [...duplicates];
}
