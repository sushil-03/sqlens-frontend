"use client";

import * as React from "react";
import { AlertCircle, ArrowLeft, Check, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Parsing SQL schema" },
  { label: "Loading data" },
  { label: "Analyzing tables & relationships" },
  { label: "Generating dashboard" },
];

export function LoadingScreen({
  fileCount,
  done,
  error,
  onDone,
  onBack,
}: {
  fileCount: number;
  done: boolean;
  error: string | null;
  onDone: () => void;
  onBack: () => void;
}) {
  const [activeStep, setActiveStep] = React.useState(0);

  // Animate through the first steps on timers, but hold on the final
  // "Generating dashboard" step until the real request completes.
  React.useEffect(() => {
    const timers = [0, 1, 2].map((i) =>
      setTimeout(() => setActiveStep((s) => Math.max(s, i + 1)), (i + 1) * 650)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  React.useEffect(() => {
    if (!done) return;
    setActiveStep(STEPS.length);
    const t = setTimeout(onDone, 500);
    return () => clearTimeout(t);
  }, [done, onDone]);

  if (error) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40" />
        <div className="relative z-10 w-full max-w-md animate-in-up rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[color-mix(in_oklch,var(--status-critical)_14%,transparent)]">
              <AlertCircle className="size-6 text-[var(--status-critical)]" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Couldn&apos;t process your files
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-6 gap-2" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Back to upload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[110px]" />

      <div className="relative z-10 w-full max-w-md animate-in-up rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-secondary">
            <Database className="size-6 text-primary" />
            <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Loader2 className="size-3.5 animate-spin" />
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Analyzing your data
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fileCount} file{fileCount === 1 ? "" : "s"} · Claude is designing
            your dashboard — this can take up to a minute
          </p>
        </div>

        <ul className="flex flex-col gap-1">
          {STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep || (i === STEPS.length - 1 && activeStep >= STEPS.length - 1 && !done);
            return (
              <li
                key={step.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  isActive && !isDone && "bg-accent/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isDone && "border-primary bg-primary text-primary-foreground",
                    isActive && !isDone && "border-primary",
                    !isDone && !isActive && "border-border"
                  )}
                >
                  {isDone ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : isActive ? (
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    isDone && "text-foreground",
                    isActive && !isDone && "font-medium text-foreground",
                    !isDone && !isActive && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.min((activeStep / STEPS.length) * 100, done ? 100 : 92)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
