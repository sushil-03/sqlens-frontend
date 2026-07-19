"use client";

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (v: number) => v.toLocaleString(),
}: {
  active?: boolean;
  label?: string | number;
  payload?: { name: string; value: number; color?: string }[];
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg shadow-black/10">
      {label && (
        <div className="mb-1 font-medium text-popover-foreground">{label}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.color && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-medium tabular-nums text-popover-foreground">
              {valueFormatter(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
