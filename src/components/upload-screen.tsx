"use client";

import * as React from "react";
import {
  Database,
  Sparkles,
  UploadCloud,
  X,
  FileCode2,
  FileSpreadsheet,
  ArrowRight,
  NotebookPen,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { sampleDatasets } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".sql", ".csv", ".xlsx", ".xls"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAccepted(filename: string) {
  const lower = filename.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function FileIcon({ name }: { name: string }) {
  const isTabular = /\.(csv|xlsx|xls)$/i.test(name);
  return isTabular ? (
    <FileSpreadsheet className="size-4 shrink-0 text-primary" />
  ) : (
    <FileCode2 className="size-4 shrink-0 text-primary" />
  );
}

export function UploadScreen({
  onSubmit,
  onSample,
}: {
  onSubmit: (files: File[], context?: string) => void;
  onSample: (id: string, context?: string) => void;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);
  const [context, setContext] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).filter((f) => isAccepted(f.name));
    if (next.length === 0) return;
    setFiles((prev) => {
      const names = new Set(prev.map((p) => p.name));
      return [...prev, ...next.filter((f) => !names.has(f.name))];
    });
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-xl animate-in-up">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <Database className="size-6 text-primary" />
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            SQLens
            <Sparkles className="size-4 text-primary" />
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload SQL, CSV, or Excel files. Get an instant dashboard and a
            chatbot that knows your data.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              isDragging
                ? "border-primary bg-accent"
                : "border-input hover:border-primary/50 hover:bg-accent/40"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <UploadCloud
              className={cn(
                "mb-3 size-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="text-sm font-medium">
              Drag & drop .sql, .csv, or .xlsx files, or{" "}
              <span className="text-primary underline underline-offset-4">
                browse
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Multiple related files are fine — e.g. customers.csv, orders.sql,
              products.xlsx
            </p>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1.5">
              {files.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm animate-in-up"
                >
                  <FileIcon name={f.name} />
                  <span className="flex-1 truncate font-mono text-xs">
                    {f.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(f.size)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(f.name);
                    }}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Extra knowledge / business context, optional */}
          <div className="mt-4 rounded-lg border border-border/60">
            <button
              onClick={() => setContextOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <NotebookPen className="size-3.5 shrink-0" />
              <span className="flex-1">
                Add context for the AI
                {context.trim() && (
                  <span className="ml-1.5 text-primary">· added</span>
                )}
              </span>
              <ChevronDown
                className={cn("size-3.5 transition-transform", contextOpen && "rotate-180")}
              />
            </button>
            {contextOpen && (
              <div className="animate-in-up border-t border-border/60 p-3">
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Anything Claude should know — what the columns mean, business terms, what you care about most (e.g. 'status=Open means still active; focus on the admissions funnel')"
                  rows={3}
                  className="resize-none text-xs"
                  maxLength={4000}
                />
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="mt-4 w-full gap-2"
            disabled={files.length === 0}
            onClick={() => onSubmit(files, context)}
          >
            Generate Dashboard
            <ArrowRight className="size-4" />
          </Button>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              or try a sample dataset
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {sampleDatasets.map((s) => (
              <Badge
                key={s.id}
                variant="secondary"
                className="cursor-pointer gap-1.5 rounded-full px-3 py-1.5 text-xs font-normal transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => onSample(s.id, context)}
              >
                {s.label}
                <span className="text-muted-foreground">· {s.tables} tables</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
