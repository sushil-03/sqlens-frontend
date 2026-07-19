"use client";

import * as React from "react";
import { Loader2, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, getDashboard, updateContext, type ApiChart } from "@/lib/api";

export function KnowledgeDialog({
  sessionId,
  open,
  onOpenChange,
  currentContext,
  onSaved,
}: {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentContext: string;
  onSaved: (context: string, charts: ApiChart[], keyInsight: string) => void;
}) {
  const [text, setText] = React.useState(currentContext);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setText(currentContext);
      setError(null);
    }
  }, [open, currentContext]);

  const save = () => {
    setSaving(true);
    setError(null);
    updateContext(sessionId, text.trim())
      .then(() => getDashboard(sessionId))
      .then((dashboard) => {
        onSaved(text.trim(), dashboard.charts, dashboard.key_insight);
        onOpenChange(false);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof ApiError ? err.message : "Couldn't save that — please try again."
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="size-4 text-primary" />
            Add knowledge
          </DialogTitle>
          <DialogDescription>
            Give the AI business context it can&apos;t infer from the data alone —
            what columns mean, definitions, or what matters most. This applies to
            both the dashboard and chat, and regenerates the dashboard once saved.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 'status=Open means still active in the pipeline. Focus on the admissions funnel from Application Initiated through Paid.'"
          rows={6}
          maxLength={4000}
          className="resize-none text-sm"
        />

        {error && <p className="text-xs text-[var(--status-critical)]">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? "Saving…" : "Save & refresh dashboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
