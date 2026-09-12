import { api } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const { data } = await api.post("/chat", { messages });
  return data.reply as string;
}
