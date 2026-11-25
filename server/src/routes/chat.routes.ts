import { Router } from "express";
import { sendChatMessage } from "../controllers/chat.controller";
import { validate } from "../middleware/validate.middleware";
import { chatBurstLimiter, chatHourlyLimiter } from "../middleware/rateLimit.middleware";
import { chatSchema } from "../validation/schemas";

const router = Router();

router.post("/", chatBurstLimiter, chatHourlyLimiter, validate(chatSchema), sendChatMessage);

export default router;
