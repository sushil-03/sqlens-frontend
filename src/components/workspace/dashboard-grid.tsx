"use client";

import * as React from "react";
import { BarChart3, Sparkles } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-card";
import { StatTile } from "@/components/charts/stat-tile";
import { formatNumber } from "@/components/charts/dynamic-chart";
import type { ApiChart } from "@/lib/api";

// Bento-style masonry: each chart is sized by what it actually needs (via
// ChartCard/DynamicChart's suggestedChartSize) instead of a uniform grid, so
// a trend chart gets room to breathe while a 2-bar comparison stays small.
// CSS multi-column layout packs charts of different heights tightly instead
// of leaving box-shaped gaps a fixed grid would.
const VISUALS_CONTAINER_CLASS =
  "columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid";

function statValue(chart: ApiChart): string {
  const row = chart.data[0];
  if (!row) return "—";
  const field =
    chart.y_fields.find((f) => f in row) ??
    Object.keys(row).find((k) => Number.isFinite(Number(row[k])));
  if (!field) return "—";
  return formatNumber(row[field]);
}

export function DashboardGrid({
  charts: allCharts,
  sessionId,
  keyInsight,
}: {
  charts: ApiChart[];
  sessionId: string;
  keyInsight?: string;
}) {
  const [removed, setRemoved] = React.useState<Set<string>>(new Set());
  const charts = allCharts.filter((c) => !removed.has(c.title));
  const stats = charts.filter((c) => c.chart_type === "stat");
  const visuals = charts.filter((c) => c.chart_type !== "stat");

  if (allCharts.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <BarChart3 className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No charts could be generated for this dataset.
          <br />
          Try asking a question in the chat instead.
        </p>
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <BarChart3 className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          You removed every chart from this dashboard.
        </p>
        <button
          onClick={() => setRemoved(new Set())}
          className="text-sm text-primary underline underline-offset-4"
        >
          Restore all charts
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {keyInsight && (
        <div className="animate-in-up flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Key insight
            </p>
            <p className="mt-0.5 text-sm leading-relaxed">{keyInsight}</p>
          </div>
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((chart, i) => (
            <div
              key={chart.title}
              className="animate-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <StatTile label={chart.title} value={statValue(chart)} />
            </div>
          ))}
        </div>
      )}

      <div className={VISUALS_CONTAINER_CLASS}>
        {visuals.map((chart, i) => (
          <ChartCard
            key={chart.title}
            chart={chart}
            sessionId={sessionId}
            className="animate-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
            onRemove={() => setRemoved((prev) => new Set(prev).add(chart.title))}
          />
        ))}
      </div>
    </div>
  );
}
