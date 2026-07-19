"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { ApiChart } from "@/lib/api";
import { ChartTooltip } from "./chart-tooltip";

export type ChartSize = "sm" | "md" | "lg";

const HEIGHTS: Record<ChartSize, number> = { sm: 150, md: 220, lg: 320 };
const DONUT_SIZE: Record<ChartSize, number> = { sm: 110, md: 140, lg: 190 };

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function formatNumber(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value ?? "—");
  if (Math.abs(n) >= 10000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

/** Pick the category axis field: the declared x_field if present in the data,
 * otherwise the first key that isn't one of the numeric y_fields. */
function resolveXField(chart: ApiChart): string | null {
  const first = chart.data[0];
  if (!first) return null;
  if (chart.x_field && chart.x_field in first) return chart.x_field;
  return Object.keys(first).find((k) => !chart.y_fields.includes(k)) ?? null;
}

function resolveYFields(chart: ApiChart): string[] {
  const first = chart.data[0];
  if (!first) return [];
  const present = chart.y_fields.filter((f) => f in first);
  if (present.length > 0) return present;
  const xField = resolveXField(chart);
  return Object.keys(first).filter(
    (k) => k !== xField && Number.isFinite(Number(first[k]))
  );
}

function SeriesLegend({ fields }: { fields: string[] }) {
  if (fields.length < 2) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {fields.map((f, i) => (
        <span key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
          />
          {f}
        </span>
      ))}
    </div>
  );
}

function AreaOrLine({
  chart,
  xField,
  yFields,
  size,
}: {
  chart: ApiChart;
  xField: string;
  yFields: string[];
  size: ChartSize;
}) {
  const gradientId = `fill-${chart.title.replace(/\W/g, "")}`;
  return (
    <>
      <ResponsiveContainer width="100%" height={HEIGHTS[size]}>
        <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--gridline)" strokeDasharray="3 3" />
          <XAxis
            dataKey={xField}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickFormatter={formatNumber}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: "var(--axis)", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={({ active, label, payload }) => (
              <ChartTooltip
                active={active}
                label={label}
                payload={payload?.map((p, i) => ({
                  name: String(p.dataKey),
                  value: p.value as number,
                  color: PALETTE[i % PALETTE.length],
                }))}
                valueFormatter={formatNumber}
              />
            )}
          />
          {yFields.map((field, i) => (
            <Area
              key={field}
              type="monotone"
              dataKey={field}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              fill={i === 0 && yFields.length === 1 ? `url(#${gradientId})` : "transparent"}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <SeriesLegend fields={yFields} />
    </>
  );
}

function Bars({
  chart,
  xField,
  yFields,
  size,
}: {
  chart: ApiChart;
  xField: string;
  yFields: string[];
  size: ChartSize;
}) {
  // A handful of categories stretched across a wide card just leaves the rest
  // of the card empty — cap the plotted width so sparse bar charts (e.g. a
  // 2-category "active vs inactive" split) stay visually proportionate
  // instead of one skinny bar floating in a huge card.
  const categoryCount = chart.data.length;
  const capWidth = categoryCount <= 4 ? Math.max(160, categoryCount * 130) : null;

  return (
    <>
      <div style={capWidth ? { maxWidth: capWidth, margin: "0 auto" } : undefined}>
        <ResponsiveContainer width="100%" height={HEIGHTS[size]}>
          <BarChart data={chart.data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--gridline)" strokeDasharray="3 3" />
            <XAxis
              dataKey={xField}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={8}
              interval={0}
              tickFormatter={(v: unknown) => {
                const s = String(v);
                return s.length > 10 ? `${s.slice(0, 9)}…` : s;
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={formatNumber}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)" }}
              content={({ active, label, payload }) => (
                <ChartTooltip
                  active={active}
                  label={label}
                  payload={payload?.map((p, i) => ({
                    name: String(p.dataKey),
                    value: p.value as number,
                    color: PALETTE[i % PALETTE.length],
                  }))}
                  valueFormatter={formatNumber}
                />
              )}
            />
            {yFields.map((field, i) => (
              <Bar
                key={field}
                dataKey={field}
                fill={PALETTE[i % PALETTE.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SeriesLegend fields={yFields} />
    </>
  );
}

function Donut({
  chart,
  xField,
  yFields,
  size,
}: {
  chart: ApiChart;
  xField: string;
  yFields: string[];
  size: ChartSize;
}) {
  const valueField = yFields[0];
  const data = chart.data.map((row) => ({
    name: String(row[xField] ?? "—"),
    value: Number(row[valueField]) || 0,
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const ringSize = DONUT_SIZE[size];

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <ResponsiveContainer width={ringSize} height={ringSize}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={ringSize * 0.31}
              outerRadius={ringSize * 0.46}
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={payload?.map((p) => ({
                    name: p.name as string,
                    value: p.value as number,
                    color: PALETTE[
                      data.findIndex((d) => d.name === p.name) % PALETTE.length
                    ],
                  }))}
                  valueFormatter={formatNumber}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums">{formatNumber(total)}</span>
          <span className="text-[10px] text-muted-foreground">total</span>
        </div>
      </div>

      <ul className="scrollbar-thin flex max-h-[180px] flex-1 flex-col gap-2 overflow-y-auto">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="ml-auto shrink-0 font-medium tabular-nums">
              {total > 0 ? `${((d.value / total) * 100).toFixed(0)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FunnelViz({
  chart,
  xField,
  yFields,
  size,
}: {
  chart: ApiChart;
  xField: string;
  yFields: string[];
  size: ChartSize;
}) {
  const valueField = yFields[0];
  const data = chart.data
    .map((row, i) => ({
      name: String(row[xField] ?? "—"),
      value: Number(row[valueField]) || 0,
      fill: PALETTE[i % PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);
  const max = data[0]?.value || 1;

  return (
    <>
      <ResponsiveContainer width="100%" height={HEIGHTS[size]}>
        <FunnelChart>
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                payload={payload?.map((p) => ({
                  name: (p.payload as { name: string })?.name ?? "",
                  value: p.value as number,
                  color: (p.payload as { fill: string })?.fill,
                }))}
                valueFormatter={formatNumber}
              />
            )}
          />
          <Funnel data={data} dataKey="value" nameKey="name" isAnimationActive={false}>
            <LabelList
              dataKey="name"
              position="right"
              fill="var(--muted-foreground)"
              fontSize={11}
              offset={12}
            />
            <LabelList
              dataKey="value"
              position="center"
              fill="var(--primary-foreground)"
              fontSize={11}
              fontWeight={600}
              formatter={(v: unknown) => formatNumber(v)}
            />
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
      <ul className="mt-1 flex flex-col gap-1">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="ml-auto shrink-0 font-medium tabular-nums">
              {formatNumber(d.value)}
              {i > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({((d.value / max) * 100).toFixed(0)}%)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ScatterViz({
  chart,
  xField,
  yFields,
  size,
}: {
  chart: ApiChart;
  xField: string;
  yFields: string[];
  size: ChartSize;
}) {
  const yField = yFields[0];
  return (
    <ResponsiveContainer width="100%" height={HEIGHTS[size]}>
      <ScatterChart margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="var(--gridline)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey={xField}
          name={xField}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={formatNumber}
          dy={8}
        />
        <YAxis
          type="number"
          dataKey={yField}
          name={yField}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={formatNumber}
          width={48}
        />
        <ZAxis range={[60, 60]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: "var(--axis)" }}
          content={({ active, payload }) => (
            <ChartTooltip
              active={active}
              payload={payload?.map((p) => ({
                name: String((p.payload as Record<string, unknown>)?.[xField] ?? xField),
                value: Number((p.payload as Record<string, unknown>)?.[yField]) || 0,
                color: "var(--chart-1)",
              }))}
              valueFormatter={formatNumber}
            />
          )}
        />
        <Scatter data={chart.data} fill="var(--chart-1)" fillOpacity={0.75} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/** Suggested size for a chart based on its type and data shape — a feature
 * trend or funnel earns more room, a sparse or already-compact chart doesn't
 * need it. Callers may still override via the `size` prop. */
export function suggestedChartSize(chart: ApiChart): ChartSize {
  if (chart.chart_type === "line" || chart.chart_type === "area" || chart.chart_type === "funnel") {
    return "lg";
  }
  if (chart.chart_type === "bar" && chart.data.length > 5) return "md";
  if (chart.chart_type === "scatter") return "md";
  return "sm";
}

export function DynamicChart({ chart, size }: { chart: ApiChart; size?: ChartSize }) {
  const xField = resolveXField(chart);
  const yFields = resolveYFields(chart);
  const resolvedSize = size ?? suggestedChartSize(chart);

  if (chart.data.length === 0 || !xField || yFields.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No data for this chart
      </div>
    );
  }

  switch (chart.chart_type) {
    case "line":
    case "area":
      return <AreaOrLine chart={chart} xField={xField} yFields={yFields} size={resolvedSize} />;
    case "pie":
      return <Donut chart={chart} xField={xField} yFields={yFields} size={resolvedSize} />;
    case "funnel":
      return <FunnelViz chart={chart} xField={xField} yFields={yFields} size={resolvedSize} />;
    case "scatter":
      return <ScatterViz chart={chart} xField={xField} yFields={yFields} size={resolvedSize} />;
    case "bar":
    default:
      return <Bars chart={chart} xField={xField} yFields={yFields} size={resolvedSize} />;
  }
}
