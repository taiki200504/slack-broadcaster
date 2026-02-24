import { useState, useRef } from "react";
import type { Workspace, SendResult } from "../types";
import { broadcastMessage } from "../lib/slack";
import { SendResultList } from "./SendResult";

interface Props {
  workspaces: Workspace[];
  message: string;
  setMessage: (msg: string) => void;
}

export function MessageForm({ workspaces, message, setMessage }: Props) {
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const enabledCount = workspaces.filter((ws) => ws.enabled).length;

  const handleSend = async () => {
    if (!message.trim() || enabledCount === 0) return;

    setSending(true);
    setResults([]);

    const sendResults = await broadcastMessage(workspaces, message.trim());
    setResults(sendResults);
    setSending(false);

    if (sendResults.every((r) => r.success)) {
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力... (Cmd+Enter で送信)"
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {enabledCount} ワークスペースに送信
        </span>
        <button
          onClick={handleSend}
          disabled={sending || !message.trim() || enabledCount === 0}
          className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {sending && (
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {sending ? "送信中..." : "送信"}
        </button>
      </div>

      <SendResultList results={results} />
    </div>
  );
}
