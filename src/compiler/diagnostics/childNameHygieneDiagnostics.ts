import type { ComponentSchema } from "../component-model/component.types";
import {
  createDiagnostic,
  createDiagnosticPath,
  diagnosticLayers,
  diagnosticSeverities,
  sortDiagnostics,
  type DiagnosticEnvelope
} from "./diagnosticContract";

const childNameHygieneSource = {
  name: "childNameHygiene"
} as const;

const childNameHygieneOrderBucket = 100;

const childNameHygieneRuleRanks = {
  leadingWhitespace: 0,
  trailingWhitespace: 1,
  repeatedWhitespace: 2,
  tabOrNewline: 3,
  reservedDelimiter: 4,
  normalizedCollision: 5,
  caseCollision: 6
} as const;

type ChildNameHygieneRuleRank =
  (typeof childNameHygieneRuleRanks)[keyof typeof childNameHygieneRuleRanks];

export function collectChildNameHygieneDiagnostics(
  schema: ComponentSchema
): DiagnosticEnvelope[] {
  const children = schema.composition?.children ?? [];
  const diagnostics: DiagnosticEnvelope[] = [];
  const sequenceStride = children.length + 1;
  const normalizedNameGroups = new Map<string, Map<string, number[]>>();
  const caseInsensitiveNameGroups = new Map<string, Map<string, number[]>>();

  children.forEach((child, childIndex) => {
    const { name } = child;

    if (/^\s/.test(name)) {
      diagnostics.push(
        createChildNameHygieneDiagnostic({
          childIndex,
          code: "METADATA_CHILD_NAME_LEADING_WHITESPACE",
          message: "Child name starts with whitespace.",
          ruleRank: childNameHygieneRuleRanks.leadingWhitespace,
          sequenceStride
        })
      );
    }

    if (/\s$/.test(name)) {
      diagnostics.push(
        createChildNameHygieneDiagnostic({
          childIndex,
          code: "METADATA_CHILD_NAME_TRAILING_WHITESPACE",
          message: "Child name ends with whitespace.",
          ruleRank: childNameHygieneRuleRanks.trailingWhitespace,
          sequenceStride
        })
      );
    }

    if (hasRepeatedInternalAsciiSpaces(name)) {
      diagnostics.push(
        createChildNameHygieneDiagnostic({
          childIndex,
          code: "METADATA_CHILD_NAME_REPEATED_WHITESPACE",
          message: "Child name contains repeated internal whitespace.",
          ruleRank: childNameHygieneRuleRanks.repeatedWhitespace,
          sequenceStride
        })
      );
    }

    if (/[\t\r\n]/.test(name)) {
      diagnostics.push(
        createChildNameHygieneDiagnostic({
          childIndex,
          code: "METADATA_CHILD_NAME_TAB_OR_NEWLINE",
          message: "Child name contains a tab or line break.",
          ruleRank: childNameHygieneRuleRanks.tabOrNewline,
          sequenceStride
        })
      );
    }

    if (name.includes(".")) {
      diagnostics.push(
        createChildNameHygieneDiagnostic({
          childIndex,
          code: "PATH_CHILD_NAME_RESERVED_DELIMITER",
          message: "Child name contains the reserved instance-path delimiter.",
          ruleRank: childNameHygieneRuleRanks.reservedDelimiter,
          sequenceStride
        })
      );
    }

    addNameGroupEntry(normalizedNameGroups, normalizeWhitespace(name), {
      childIndex,
      name
    });
    addNameGroupEntry(caseInsensitiveNameGroups, name.toLowerCase(), {
      childIndex,
      name
    });
  });

  addCollisionDiagnostics({
    code: "METADATA_CHILD_NAME_NORMALIZED_COLLISION",
    diagnostics,
    groups: normalizedNameGroups,
    message: "Child name collides with a sibling after whitespace normalization.",
    ruleRank: childNameHygieneRuleRanks.normalizedCollision,
    sequenceStride
  });
  addCollisionDiagnostics({
    code: "METADATA_CHILD_NAME_CASE_COLLISION",
    diagnostics,
    groups: caseInsensitiveNameGroups,
    message: "Child name differs from a sibling only by case.",
    ruleRank: childNameHygieneRuleRanks.caseCollision,
    sequenceStride
  });

  return sortDiagnostics(diagnostics);
}

function createChildNameHygieneDiagnostic({
  childIndex,
  code,
  message,
  ruleRank,
  sequenceStride
}: {
  readonly childIndex: number;
  readonly code: string;
  readonly message: string;
  readonly ruleRank: ChildNameHygieneRuleRank;
  readonly sequenceStride: number;
}): DiagnosticEnvelope {
  return createDiagnostic({
    code,
    layer: diagnosticLayers.schema,
    message,
    order: {
      bucket: childNameHygieneOrderBucket,
      sequence: ruleRank * sequenceStride + childIndex
    },
    path: createDiagnosticPath("composition", "children", childIndex, "name"),
    severity: diagnosticSeverities.warning,
    source: childNameHygieneSource
  });
}

function hasRepeatedInternalAsciiSpaces(name: string): boolean {
  return /\S {2,}\S/.test(name);
}

function normalizeWhitespace(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function addNameGroupEntry(
  groups: Map<string, Map<string, number[]>>,
  groupKey: string,
  entry: {
    readonly childIndex: number;
    readonly name: string;
  }
): void {
  const authoredNameGroup = groups.get(groupKey) ?? new Map<string, number[]>();
  const childIndexes = authoredNameGroup.get(entry.name) ?? [];

  childIndexes.push(entry.childIndex);
  authoredNameGroup.set(entry.name, childIndexes);
  groups.set(groupKey, authoredNameGroup);
}

function addCollisionDiagnostics({
  code,
  diagnostics,
  groups,
  message,
  ruleRank,
  sequenceStride
}: {
  readonly code: string;
  readonly diagnostics: DiagnosticEnvelope[];
  readonly groups: Map<string, Map<string, number[]>>;
  readonly message: string;
  readonly ruleRank: ChildNameHygieneRuleRank;
  readonly sequenceStride: number;
}): void {
  groups.forEach((authoredNameGroup) => {
    if (authoredNameGroup.size < 2) {
      return;
    }

    authoredNameGroup.forEach((childIndexes) => {
      childIndexes.forEach((childIndex) => {
        diagnostics.push(
          createChildNameHygieneDiagnostic({
            childIndex,
            code,
            message,
            ruleRank,
            sequenceStride
          })
        );
      });
    });
  });
}
