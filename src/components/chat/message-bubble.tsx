"use client";

import { AlertCircle, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SqlBlock } from "./sql-block";
import { Markdown } from "./markdown";
import { DynamicChart } from "@/components/charts/dynamic-chart";
import type { ChatMessage } from "@/lib/types";

export function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: () => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-in-up">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 animate-in-up">
      <div
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          message.isError
            ? "bg-[color-mix(in_oklch,var(--status-critical)_14%,transparent)] text-[var(--status-critical)]"
            : "bg-accent text-accent-foreground"
        )}
      >
        {message.isError ? (
          <AlertCircle className="size-3.5" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
      </div>
      <div className="min-w-0 max-w-[88%] flex-1">
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm border bg-card px-3.5 py-2.5 text-sm",
            message.isError
              ? "border-[color-mix(in_oklch,var(--status-critical)_40%,transparent)]"
              : "border-border"
          )}
        >
          {message.text && !message.isError && <Markdown text={message.text} />}
          {message.text && message.isError && (
            <div className="flex flex-col gap-2">
              <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-1.5 text-xs"
                  onClick={onRetry}
                >
                  <RotateCw className="size-3" />
                  Retry
                </Button>
              )}
            </div>
          )}
          {message.chart && (
            <div className="mt-1">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {message.chart.title}
              </p>
              <div className="rounded-lg border border-border/60 bg-[var(--chart-surface)] p-2">
                <DynamicChart chart={message.chart} />
              </div>
              <SqlBlock sql={message.chart.sql} />
            </div>
          )}
          {message.sql && <SqlBlock sql={message.sql} />}
        </div>
      </div>
    </div>
  );
}
