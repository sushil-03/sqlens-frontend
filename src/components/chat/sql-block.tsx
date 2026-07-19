"use client";

import * as React from "react";
import { ChevronRight, Code2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SqlBlock({ sql }: { sql: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border/70">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 bg-secondary/60 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Code2 className="size-3.5 shrink-0" />
        <span className="flex-1">View SQL</span>
        <ChevronRight
          className={cn("size-3.5 transition-transform", open && "rotate-90")}
        />
      </button>
      {open && (
        <div className="animate-in-up relative">
          <pre className="scrollbar-thin overflow-x-auto bg-[var(--chart-surface)] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground/90">
            {sql}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sql);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
