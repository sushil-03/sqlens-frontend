import type { ApiChart, ApiSchema } from "./api";

export type ColumnDef = { name: string; type: string; pk?: boolean; fk?: string };

export type TableDef = {
  name: string;
  file: string;
  rowCount: number;
  columns: ColumnDef[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sql?: string;
  chart?: ApiChart;
  isError?: boolean;
};

export const sampleDatasets = [{ id: "ecommerce", label: "E-commerce orders", tables: 4 }];

const DATE_COLUMN_RE = /date|time|created|updated|_at$/i;
const SKIP_BREAKDOWN_RE = /^id$|_id$|email|url|password|token/i;

/** Build chat suggestion chips from the actual uploaded schema instead of a
 * generic static list — references real table/column names so the first
 * thing a user sees feels tailored to their data. */
export function buildSuggestedQuestions(schema: ApiSchema): string[] {
  if (schema.tables.length === 0) {
    return ["Give me an overview of this dataset"];
  }

  const byRowCount = [...schema.tables].sort((a, b) => b.row_count - a.row_count);
  const biggest = byRowCount[0];

  const questions: string[] = [`Give me an overview of the ${biggest.name} table`];

  const rel = schema.relationships[0];
  if (rel) {
    questions.push(`How does ${rel.from_table} relate to ${rel.to_table}?`);
  } else if (schema.tables.length > 1) {
    questions.push("Which table has the most rows?");
  } else {
    const breakdownCol = biggest.columns.find(
      (c) => c.type.toUpperCase().includes("TEXT") && !SKIP_BREAKDOWN_RE.test(c.name)
    );
    questions.push(
      breakdownCol
        ? `Break down ${biggest.name} by ${breakdownCol.name}`
        : "What are the key patterns in this data?"
    );
  }

  const dateTable = schema.tables.find((t) => t.columns.some((c) => DATE_COLUMN_RE.test(c.name)));
  questions.push(
    dateTable ? `Show me the trend over time in ${dateTable.name}` : "Show me the most interesting trend"
  );

  return questions;
}

export function schemaToTables(schema: ApiSchema): TableDef[] {
  const fkByColumn = new Map<string, string>();
  for (const rel of schema.relationships) {
    fkByColumn.set(
      `${rel.from_table}.${rel.from_column}`,
      `${rel.to_table}.${rel.to_column}`
    );
  }

  return schema.tables.map((t) => ({
    name: t.name,
    file: t.source_file,
    rowCount: t.row_count,
    columns: t.columns.map((c) => ({
      name: c.name,
      type: c.type,
      pk: c.is_primary_key || undefined,
      fk: fkByColumn.get(`${t.name}.${c.name}`),
    })),
  }));
}

export function schemaRelationships(schema: ApiSchema): { from: string; to: string }[] {
  return schema.relationships.map((r) => ({
    from: `${r.from_table}.${r.from_column}`,
    to: `${r.to_table}.${r.to_column}`,
  }));
}

export function buildFileSummary(schema: ApiSchema, fileCount: number): string {
  const totalRows = schema.tables.reduce((sum, t) => sum + t.row_count, 0);
  const files = `${fileCount} file${fileCount === 1 ? "" : "s"}`;
  const tables = `${schema.tables.length} table${schema.tables.length === 1 ? "" : "s"}`;
  return `${files} · ${tables}, ${totalRows.toLocaleString()} rows`;
}
