import { api } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// The server only reads the most recent turns, so don't send more than that.
const MAX_HISTORY = 12;

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const { data } = await api.post("/chat", { messages: messages.slice(-MAX_HISTORY) });
  return data.reply as string;
}
