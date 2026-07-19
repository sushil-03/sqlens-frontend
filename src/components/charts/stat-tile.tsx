"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta?: number;
  trend?: "up" | "down";
}) {
  const isGood = trend === "up";
  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <span className="line-clamp-2 text-sm text-muted-foreground">{label}</span>
      <div className="mt-auto flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {delta !== undefined && trend !== undefined && (
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
            isGood
              ? "bg-[color-mix(in_oklch,var(--status-good)_14%,transparent)] text-[var(--status-good-text)]"
              : "bg-[color-mix(in_oklch,var(--status-critical)_14%,transparent)] text-[var(--status-critical)]"
          )}
        >
          {isGood ? (
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          ) : (
            <ArrowDownRight className="size-3" strokeWidth={2.5} />
          )}
          {Math.abs(delta)}%
        </span>
        )}
      </div>
    </div>
  );
}
