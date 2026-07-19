"use client";

import * as React from "react";
import { ChevronDown, KeyRound, Link2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableDef } from "@/lib/types";

function TableRow({ table }: { table: TableDef }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
      >
        <Table2 className="size-3.5 shrink-0 text-primary" />
        <span className="flex-1 truncate font-mono text-xs font-medium">
          {table.name}
        </span>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {table.rowCount.toLocaleString()} rows
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="animate-in-up border-t border-border/60 px-2.5 py-2">
          <p className="mb-1.5 truncate text-[10px] text-muted-foreground">
            from {table.file}
          </p>
          <ul className="flex flex-col gap-1">
            {table.columns.map((col) => (
              <li
                key={col.name}
                className="flex items-center gap-1.5 font-mono text-[11px]"
              >
                {col.pk ? (
                  <KeyRound className="size-3 shrink-0 text-[var(--chart-4)]" />
                ) : col.fk ? (
                  <Link2 className="size-3 shrink-0 text-[var(--chart-5)]" />
                ) : (
                  <span className="size-3 shrink-0" />
                )}
                <span>{col.name}</span>
                <span className="text-muted-foreground">{col.type}</span>
                {col.fk && (
                  <span className="ml-auto truncate text-[10px] text-muted-foreground">
                    → {col.fk}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SchemaPanel({
  tables,
  relationships,
}: {
  tables: TableDef[];
  relationships: { from: string; to: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tables
        </h3>
        <div className="flex flex-col gap-1.5">
          {tables.map((t) => (
            <TableRow key={t.name} table={t} />
          ))}
        </div>
      </div>

      {relationships.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Relationships
          </h3>
          <ul className="flex flex-col gap-1">
            {relationships.map((r) => (
              <li
                key={r.from}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-[11px] text-muted-foreground"
              >
                <span>{r.from}</span>
                <Link2 className="size-3 shrink-0 text-[var(--chart-5)]" />
                <span>{r.to}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
