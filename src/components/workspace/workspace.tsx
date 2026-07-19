"use client";

import * as React from "react";
import { PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TopBar } from "./top-bar";
import { SchemaPanel } from "./schema-panel";
import { DashboardGrid } from "./dashboard-grid";
import { KnowledgeDialog } from "./knowledge-dialog";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useChat } from "@/hooks/use-chat";
import { getUsage, type ApiChart, type ApiSchema, type UsageInfo } from "@/lib/api";
import { buildSuggestedQuestions, schemaRelationships, schemaToTables } from "@/lib/types";
import { buildReportMarkdown, downloadMarkdown } from "@/lib/export-report";
import { cn } from "@/lib/utils";

export function Workspace({
  sessionId,
  schema,
  charts: initialCharts,
  initialKeyInsight = "",
  initialContext = "",
  fileSummary,
  onNewFile,
}: {
  sessionId: string;
  schema: ApiSchema;
  charts: ApiChart[];
  initialKeyInsight?: string;
  initialContext?: string;
  fileSummary: string;
  onNewFile: () => void;
}) {
  const [schemaOpen, setSchemaOpen] = React.useState(false);
  const [chatOpenMobile, setChatOpenMobile] = React.useState(false);
  const [chatCollapsed, setChatCollapsed] = React.useState(false);
  const [chatFullscreen, setChatFullscreen] = React.useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = React.useState(false);
  const [initialUsage, setInitialUsage] = React.useState<UsageInfo | null>(null);
  const [charts, setCharts] = React.useState(initialCharts);
  const [keyInsight, setKeyInsight] = React.useState(initialKeyInsight);
  const [context, setContext] = React.useState(initialContext);
  const chat = useChat(sessionId);

  // Dashboard generation happens before this mounts — fetch its token cost once;
  // afterwards the chat stream keeps usage current.
  React.useEffect(() => {
    getUsage(sessionId)
      .then((u) => setInitialUsage(u.session))
      .catch(() => {});
  }, [sessionId]);

  const usage = chat.usage ?? initialUsage;

  const tables = React.useMemo(() => schemaToTables(schema), [schema]);
  const relationships = React.useMemo(() => schemaRelationships(schema), [schema]);
  const suggestedQuestions = React.useMemo(() => buildSuggestedQuestions(schema), [schema]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar
        fileSummary={fileSummary}
        usage={usage}
        onNewFile={onNewFile}
        onOpenSchema={() => setSchemaOpen(true)}
        onOpenKnowledge={() => setKnowledgeOpen(true)}
        onExport={() => {
          const markdown = buildReportMarkdown({
            fileSummary,
            schema,
            charts,
            messages: chat.messages,
          });
          downloadMarkdown("sqlens-report.md", markdown);
        }}
        onToggleChat={() => setChatOpenMobile(true)}
      />

      <div className="relative flex min-h-0 flex-1">
        {/* Main dashboard content */}
        <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <DashboardGrid charts={charts} sessionId={sessionId} keyInsight={keyInsight} />
        </main>

        {/* Desktop persistent chat sidebar */}
        <aside
          className={cn(
            "hidden shrink-0 overflow-hidden border-l border-border transition-all duration-300 ease-in-out lg:block",
            chatFullscreen ? "w-0 border-l-0" : chatCollapsed ? "w-0 border-l-0" : "w-[380px]"
          )}
        >
          <div className="h-full w-[380px]">
            <ChatPanel
              chat={chat}
              suggestedQuestions={suggestedQuestions}
              onCollapse={() => setChatCollapsed(true)}
              isFullscreen={false}
              onToggleFullscreen={() => setChatFullscreen(true)}
            />
          </div>
        </aside>

        {/* Reopen affordance when collapsed, desktop only */}
        {chatCollapsed && !chatFullscreen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-6 right-6 hidden size-11 rounded-full shadow-lg lg:flex"
            onClick={() => setChatCollapsed(false)}
          >
            <PanelRightOpen className="size-4" />
          </Button>
        )}

        {/* Fullscreen chat overlay, desktop only */}
        {chatFullscreen && (
          <div className="absolute inset-0 z-50 hidden animate-in-up bg-card lg:block">
            <ChatPanel
              chat={chat}
              suggestedQuestions={suggestedQuestions}
              isFullscreen
              onToggleFullscreen={() => setChatFullscreen(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile schema sheet */}
      <Sheet open={schemaOpen} onOpenChange={setSchemaOpen}>
        <SheetContent side="left" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Schema</SheetTitle>
          </SheetHeader>
          <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-4">
            <SchemaPanel tables={tables} relationships={relationships} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile chat sheet */}
      <Sheet open={chatOpenMobile} onOpenChange={setChatOpenMobile}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <ChatPanel chat={chat} suggestedQuestions={suggestedQuestions} onClose={() => setChatOpenMobile(false)} />
        </SheetContent>
      </Sheet>

      <KnowledgeDialog
        sessionId={sessionId}
        open={knowledgeOpen}
        onOpenChange={setKnowledgeOpen}
        currentContext={context}
        onSaved={(newContext, newCharts, newKeyInsight) => {
          setContext(newContext);
          setCharts(newCharts);
          setKeyInsight(newKeyInsight);
        }}
      />
    </div>
  );
}
