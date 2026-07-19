"use client";

import * as React from "react";
import {
  ArrowUp,
  Minimize2,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./message-bubble";
import type { ChatState } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export function ChatPanel({
  chat,
  suggestedQuestions,
  onClose,
  onCollapse,
  isFullscreen,
  onToggleFullscreen,
}: {
  chat: ChatState;
  suggestedQuestions: string[];
  onClose?: () => void;
  onCollapse?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  const { messages, isThinking, status, send, retry } = chat;
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    send(trimmed);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3.5">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-medium">Ask your data</h2>
        {onToggleFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-7 text-muted-foreground", !onCollapse && "ml-auto")}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        )}
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-7 text-muted-foreground", !onToggleFullscreen && "ml-auto")}
            onClick={onCollapse}
          >
            <PanelRightOpen className="size-4" />
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-7 text-muted-foreground lg:hidden",
              !onCollapse && !onToggleFullscreen && "ml-auto"
            )}
            onClick={onClose}
          >
            <PanelRightClose className="size-4" />
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && !isThinking && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-secondary">
                <Sparkles className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Ask anything about your data</p>
              <p className="max-w-[240px] text-xs text-muted-foreground">
                Questions are answered by AI, which writes and runs SQL
                against your uploaded dataset.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              onRetry={m.isError && i === messages.length - 1 ? retry : undefined}
            />
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 animate-in-up">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="size-3.5" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-3">
                <span className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
                {status && (
                  <span className="text-xs text-muted-foreground">{status}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={isThinking}
              className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2 rounded-xl border border-input bg-secondary/30 p-1.5 transition-colors focus-within:border-primary/50">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask a question about your data..."
            rows={1}
            className="max-h-24 min-h-9 flex-1 resize-none border-none bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0"
          />
          <Button
            size="icon"
            className={cn("size-8 shrink-0 rounded-lg transition-transform", input.trim() && "scale-100")}
            disabled={!input.trim() || isThinking}
            onClick={() => submit(input)}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
