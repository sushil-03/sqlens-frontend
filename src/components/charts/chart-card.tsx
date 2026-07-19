"use client";

import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  MoreHorizontal,
  RefreshCw,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DynamicChart, type ChartSize } from "@/components/charts/dynamic-chart";
import { downloadChartCsv, downloadChartImage } from "@/lib/chart-download";
import { runQuery, type ApiChart } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChartCard({
  chart,
  sessionId,
  size,
  className,
  style,
  onRemove,
}: {
  chart: ApiChart;
  sessionId: string;
  size?: ChartSize;
  className?: string;
  style?: React.CSSProperties;
  onRemove?: () => void;
}) {
  const [data, setData] = React.useState(chart.data);
  const [refreshing, setRefreshing] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const captureRef = React.useRef<HTMLDivElement>(null);

  const liveChart: ApiChart = { ...chart, data };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const result = await runQuery(sessionId, chart.sql);
      setData(result.data);
    } catch {
      // leave existing data in place — the SQL is already known-good from
      // dashboard generation, so a refresh failure is almost always transient
    } finally {
      setRefreshing(false);
    }
  };

  const downloadImage = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      await downloadChartImage(chart.title, captureRef.current);
    } finally {
      setDownloading(false);
    }
  };

  const compact = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        compact ? "p-3.5" : "p-5",
        className
      )}
      style={style}
    >
      <div className={cn("flex items-start justify-between gap-2", compact ? "mb-2" : "mb-3")}>
        <h3 className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{chart.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={refresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Refresh
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setExpanded(true)}>
              <Maximize2 className="size-3.5" /> Expand
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={downloading}>
                {downloading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                Download
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={downloadImage}>
                  <ImageIcon className="size-3.5" /> Image (PNG)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadChartCsv(chart.title, data)}>
                  <FileSpreadsheet className="size-3.5" /> Data (CSV)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {onRemove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onRemove}>
                  <X className="size-3.5" /> Remove
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={captureRef} className="rounded-lg bg-card">
        <DynamicChart chart={liveChart} size={size} />
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-3xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{chart.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <DynamicChart chart={liveChart} size="lg" />
            <div className="scrollbar-thin mt-4 max-h-60 overflow-auto rounded-lg border border-border/60">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/60">
                    {data[0] &&
                      Object.keys(data[0]).map((col) => (
                        <th
                          key={col}
                          className="px-2.5 py-1.5 text-left font-medium text-muted-foreground"
                        >
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-t border-border/50">
                      {Object.keys(row).map((col) => (
                        <td key={col} className="px-2.5 py-1.5 tabular-nums">
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
