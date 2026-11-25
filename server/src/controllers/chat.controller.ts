import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getChatReply } from "../services/chat.service";

// POST /api/chat  (body is validated by chatSchema before it gets here)
export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const reply = await getChatReply(req.body.messages);
  res.json({ reply });
});
