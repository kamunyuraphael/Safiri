import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import { RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChatMessage, type ChatMessage } from "@/services/chatService";
import { getErrorCode, getErrorMessage } from "@/lib/errors";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! Tell me what kind of trip you're after: where in Kenya, your budget, or who's coming along, and I'll suggest real spots.",
};

const STARTERS = [
  "A quiet beach for a honeymoon, mid-range budget",
  "Family safari under 15,000 KES a day",
  "Best lake to visit in July",
];

const STORAGE_KEY = "safiri_chat_v1";
const MAX_INPUT = 500;

// Messages from the assistant can contain markdown. Links to our own pages
// become client-side router links; anything external opens in a new tab.
const markdownComponents: Components = {
  a: ({ href, children }) => {
    if (href && href.startsWith("/") && !href.startsWith("//")) {
      return (
        <Link to={href} className="font-medium text-terra-500 underline underline-offset-2 hover:text-terra-600">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-terra-500 underline underline-offset-2 hover:text-terra-600"
      >
        {children}
      </a>
    );
  },
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 last:mb-0 list-decimal pl-5 space-y-1">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

function loadSavedMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [GREETING];
    const parsed = JSON.parse(raw);
    const valid =
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
      );
    return valid ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

function friendlyError(err: unknown): string {
  switch (getErrorCode(err)) {
    case "RATE_LIMITED":
    case "AI_BUSY":
    case "AI_TIMEOUT":
    case "AI_UNAVAILABLE":
      return getErrorMessage(err);
    default:
      return getErrorMessage(err, "Something went wrong reaching the assistant. Please try again.");
  }
}

export function ChatPlanner() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadSavedMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the conversation across page refreshes (cleared when the tab closes).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage unavailable: chat still works, it just won't persist */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error]);

  async function requestReply(history: ChatMessage[]) {
    setError(null);
    setLoading(true);
    try {
      const reply = await sendChatMessage(history);
      setMessages([...history, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    void requestReply(next);
  }

  function retry() {
    if (loading) return;
    void requestReply(messages); // last message is still the user's unanswered one
  }

  function resetChat() {
    setMessages([GREETING]);
    setError(null);
    setInput("");
  }

  const showStarters = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <h2 className="font-display text-lg">Plan with Safiri</h2>
        </div>
        {messages.length > 1 && (
          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 text-xs text-forest-700/60 hover:text-terra-400 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New chat
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-5 pt-4 pb-2 space-y-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] text-sm rounded-lg px-3 py-2 ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground whitespace-pre-wrap"
                : "mr-auto bg-muted text-foreground"
            }`}
          >
            {m.role === "assistant" ? (
              <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
            ) : (
              m.content
            )}
          </div>
        ))}

        {showStarters && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs text-left border border-border rounded-full px-3 py-1.5 text-forest-700 hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="mr-auto bg-muted text-foreground/50 text-sm rounded-lg px-3 py-2 max-w-[85%]">
            Thinking…
          </div>
        )}

        {error && (
          <div className="mr-auto max-w-[85%] text-sm rounded-lg px-3 py-2 bg-terra-400/10 text-terra-600">
            <p>{error}</p>
            <button onClick={retry} disabled={loading} className="mt-1 font-medium underline underline-offset-2">
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-4 border-t border-border">
        <input
          value={input}
          maxLength={MAX_INPUT}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          aria-label="Message Safiri"
          placeholder="e.g. Family trip to the coast, mid-range budget"
          className="flex-1 text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
