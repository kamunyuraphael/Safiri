import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getChatReply, ChatMessage } from "../services/chat.service";

// POST /api/chat
export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const messages: ChatMessage[] = req.body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages[] is required" });
  }

  const reply = await getChatReply(messages);
  res.json({ reply });
});
