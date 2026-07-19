import type { ApiChart, ApiSchema } from "./api";
import type { ChatMessage } from "./types";

function markdownTable(rows: Record<string, unknown>[], limit = 10): string {
  if (rows.length === 0) return "_No data._";
  const columns = Object.keys(rows[0]);
  const header = `| ${columns.join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows
    .slice(0, limit)
    .map((row) => `| ${columns.map((c) => String(row[c] ?? "")).join(" | ")} |`)
    .join("\n");
  const truncated = rows.length > limit ? `\n\n_...and ${rows.length - limit} more rows._` : "";
  return `${header}\n${divider}\n${body}${truncated}`;
}

export function buildReportMarkdown({
  fileSummary,
  schema,
  charts,
  messages,
}: {
  fileSummary: string;
  schema: ApiSchema;
  charts: ApiChart[];
  messages: ChatMessage[];
}): string {
  const parts: string[] = [];
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  parts.push(`# SQLens Report`);
  parts.push(`_Generated ${now} · ${fileSummary}_`);

  parts.push(`## Dataset`);
  for (const table of schema.tables) {
    parts.push(
      `- **${table.name}** (from \`${table.source_file}\`) — ${table.row_count.toLocaleString()} rows, ${table.columns.length} columns`
    );
  }
  if (schema.relationships.length > 0) {
    parts.push(`\n**Relationships:**`);
    for (const rel of schema.relationships) {
      parts.push(`- \`${rel.from_table}.${rel.from_column}\` → \`${rel.to_table}.${rel.to_column}\``);
    }
  }

  if (charts.length > 0) {
    parts.push(`## Dashboard`);
    for (const chart of charts) {
      parts.push(`### ${chart.title}`);
      parts.push(`_Chart type: ${chart.chart_type}_`);
      parts.push("```sql\n" + chart.sql + "\n```");
      parts.push(markdownTable(chart.data));
    }
  }

  const chatMessages = messages.filter((m) => m.text || m.chart);
  if (chatMessages.length > 0) {
    parts.push(`## Chat transcript`);
    for (const m of chatMessages) {
      if (m.role === "user") {
        parts.push(`**You:** ${m.text}`);
        continue;
      }
      if (m.chart) {
        parts.push(`**Assistant:** _rendered chart "${m.chart.title}" (${m.chart.chart_type})_`);
        continue;
      }
      parts.push(`**Assistant:** ${m.text}`);
      if (m.sql) {
        parts.push("```sql\n" + m.sql + "\n```");
      }
    }
  }

  return parts.join("\n\n");
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
