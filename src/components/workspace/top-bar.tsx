"use client";

import {
  Database,
  Download,
  MessageCircle,
  NotebookPen,
  RotateCcw,
  TableProperties,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UsageInfo } from "@/lib/api";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCost(n: number): string {
  return n < 0.01 ? "<$0.01" : `$${n.toFixed(2)}`;
}

export function TopBar({
  fileSummary,
  usage,
  onNewFile,
  onOpenSchema,
  onOpenKnowledge,
  onExport,
  onToggleChat,
}: {
  fileSummary: string;
  usage?: UsageInfo | null;
  onNewFile: () => void;
  onOpenSchema: () => void;
  onOpenKnowledge: () => void;
  onExport: () => void;
  onToggleChat: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-4 backdrop-blur supports-backdrop-filter:bg-card/40">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <Database className="size-4 text-primary" />
        </div>
        <span className="text-sm font-semibold tracking-tight">SQLens</span>
      </div>

      <Badge
        variant="secondary"
        className="hidden rounded-full font-normal text-muted-foreground sm:inline-flex"
      >
        {fileSummary}
      </Badge>

      <div className="ml-auto flex items-center gap-1.5">
        {usage && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent sm:flex">
                  <Zap className="size-3 text-primary" />
                  {formatTokens(usage.input_tokens + usage.output_tokens)} tokens
                  {usage.cost_usd !== undefined && (
                    <span className="text-muted-foreground/70">
                      · {formatCost(usage.cost_usd)}
                    </span>
                  )}
                </button>
              }
            />
            <TooltipContent>
              <div className="flex flex-col gap-0.5 tabular-nums">
                <span>Input: {usage.input_tokens.toLocaleString()} tokens</span>
                <span>Output: {usage.output_tokens.toLocaleString()} tokens</span>
                <span>Claude calls: {usage.claude_calls}</span>
                {usage.cost_usd !== undefined && (
                  <span>Est. cost: {formatCost(usage.cost_usd)}</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 text-muted-foreground sm:inline-flex"
          onClick={onOpenSchema}
        >
          <TableProperties className="size-4" />
          Schema
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 text-muted-foreground sm:inline-flex"
          onClick={onOpenKnowledge}
        >
          <NotebookPen className="size-4" />
          Knowledge
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={onNewFile}
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">New file</span>
        </Button>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Export report"
                className="size-8 text-muted-foreground"
                onClick={onExport}
              >
                <Download className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Export report (.md)</TooltipContent>
        </Tooltip>
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          className="size-8 lg:hidden"
          onClick={onToggleChat}
        >
          <MessageCircle className="size-4" />
        </Button>
      </div>
    </header>
  );
}
