"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useSearchParams } from "next/navigation";
import { chatAPI } from "@/lib/api/chat";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content: "Hi! Ask me anything about your store or products.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Get workspace ID from context or search params
    const workspaceId = currentWorkspace?.id || searchParams.get("ws");

    if (!workspaceId) {
      alert("Please select a workspace first");
      return;
    }

    setSending(true);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      // Call the chat API with workspace ID
      const response = await chatAPI.sendMessage(workspaceId, {
        message: text,
      });

      // Extract content from the answer string
      // The answer is a stringified RunOutput object, we need to extract content from it
      let content = "";
      try {
        if (response && typeof response.answer === "string") {
          // Match content='...'
          const match = response.answer.match(/content='([\s\S]*?)'/);

          if (match && match[1]) {
            content = match[1]
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t")
              .replace(/\\\\/g, "\\")
              .replace(/\\"/g, '"');
          } else {
            // Fallback if not found
            content = response.answer;
          }
        } else if (
          response &&
          response.answer &&
          typeof response.answer === "object" &&
          "content" in response.answer &&
          typeof (response.answer as { content?: unknown }).content === "string"
        ) {
          // If API already returns structured JSON (sometimes happens)
          content = (response.answer as { content: string }).content;
        } else {
          content = JSON.stringify(response);
        }
      } catch (err) {
        console.error("Error extracting assistant content:", err);
        const fallbackAnswer = response?.answer;
        content =
          typeof fallbackAnswer === "string"
            ? fallbackAnswer
            : JSON.stringify(fallbackAnswer ?? "");
      }

      console.log("Extracted Content:\n", content);

      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage =
        error?.message || "Failed to send message. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* subtract header height */}
      <div className="yeti-card rounded-2xl p-0 yeti-shadow flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-purple-100 bg-white/60 backdrop-blur flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            <p className="text-xs text-gray-500">
              {currentWorkspace?.name
                ? `Workspace: ${currentWorkspace.name}`
                : searchParams.get("ws")
                ? `Workspace ID: ${searchParams.get("ws")?.substring(0, 8)}...`
                : "No workspace selected"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 overflow-auto px-5 py-4 space-y-4 bg-gradient-to-b from-white/70 to-purple-50/40"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc list-inside space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal list-inside space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-2">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold mb-2">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold mb-2">{children}</h3>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-purple-100 p-4 bg-white/70 backdrop-blur">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
