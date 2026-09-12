import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChatMessage, type ChatMessage } from "@/services/chatService";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! Tell me what kind of trip you're after — where in Kenya, your budget, or who's coming along — and I'll suggest real spots.",
};

export function ChatPlanner() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Something went wrong reaching the assistant — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-border">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <h2 className="font-display text-lg">Plan with Safiri</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] text-sm rounded-lg px-3 py-2 ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto bg-muted text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-muted text-foreground/50 text-sm rounded-lg px-3 py-2 max-w-[85%]">
            Thinking…
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-4 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="e.g. Family trip to the coast, mid-range budget"
          className="flex-1 text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
