"use client";

import * as React from "react";
import {
  ApiError,
  chatSocketUrl,
  sendChat,
  type ChatEvent,
  type UsageInfo,
} from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

export type ChatState = {
  messages: ChatMessage[];
  isThinking: boolean;
  status: string | null;
  usage: UsageInfo | null;
  send: (text: string) => void;
  retry: () => void;
};

export function useChat(sessionId: string): ChatState {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [usage, setUsage] = React.useState<UsageInfo | null>(null);
  const socketRef = React.useRef<WebSocket | null>(null);
  const lastUserMessageRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [sessionId]);

  const appendAssistant = React.useCallback(
    (message: Omit<ChatMessage, "id" | "role">) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", ...message },
      ]);
    },
    []
  );

  const finish = React.useCallback(() => {
    setIsThinking(false);
    setStatus(null);
  }, []);

  const handleEvent = React.useCallback(
    (event: ChatEvent) => {
      switch (event.type) {
        case "sql":
          setStatus("Running SQL against your data…");
          break;
        case "chart":
          setStatus("Rendering chart…");
          appendAssistant({ text: "", chart: event.chart });
          break;
        case "result":
          if (event.reply.trim()) {
            appendAssistant({
              text: event.reply,
              sql:
                event.sql_used.length > 0 ? event.sql_used.join("\n\n") : undefined,
            });
          }
          break;
        case "error":
          appendAssistant({ text: event.detail, isError: true });
          break;
        case "done":
          if (event.usage) setUsage(event.usage);
          finish();
          break;
      }
    },
    [appendAssistant, finish]
  );

  const sendViaRest = React.useCallback(
    (text: string) => {
      sendChat(sessionId, text)
        .then((result) => {
          if (result.usage) setUsage(result.usage);
          for (const chart of result.charts) {
            appendAssistant({ text: "", chart });
          }
          if (result.reply.trim()) {
            appendAssistant({
              text: result.reply,
              sql:
                result.sql_used.length > 0 ? result.sql_used.join("\n\n") : undefined,
            });
          }
        })
        .catch((err: unknown) => {
          appendAssistant({
            text:
              err instanceof ApiError
                ? err.message
                : "Something went wrong answering that — please try again.",
            isError: true,
          });
        })
        .finally(finish);
    },
    [sessionId, appendAssistant, finish]
  );

  const openSocket = React.useCallback((): Promise<WebSocket> => {
    const existing = socketRef.current;
    if (existing && existing.readyState === WebSocket.OPEN) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(chatSocketUrl(sessionId));
      socket.onopen = () => resolve(socket);
      socket.onerror = () => reject(new Error("WebSocket connection failed"));
      socket.onmessage = (raw: MessageEvent) => {
        try {
          handleEvent(JSON.parse(raw.data as string) as ChatEvent);
        } catch {
          // ignore malformed frames
        }
      };
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
      };
      socketRef.current = socket;
    });
  }, [sessionId, handleEvent]);

  const dispatch = React.useCallback(
    (text: string) => {
      setIsThinking(true);
      setStatus("Thinking…");

      openSocket()
        .then((socket) => socket.send(JSON.stringify({ message: text })))
        .catch(() => sendViaRest(text));
    },
    [openSocket, sendViaRest]
  );

  const send = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      lastUserMessageRef.current = trimmed;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text: trimmed },
      ]);
      dispatch(trimmed);
    },
    [isThinking, dispatch]
  );

  const retry = React.useCallback(() => {
    const last = lastUserMessageRef.current;
    if (!last || isThinking) return;
    dispatch(last);
  }, [isThinking, dispatch]);

  return { messages, isThinking, status, usage, send, retry };
}
