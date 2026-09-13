import axios from "axios";
import { GEMINI_API_URL, getGeminiApiKey } from "../config/gemini";
import Destination from "../models/Destination.model";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Safiri's travel assistant, helping people plan trips within Kenya.

Rules:
- Only recommend destinations that appear in the "Known destinations" context provided below the conversation — never invent a destination or make up costs, seasons, or wildlife that aren't given to you.
- If the context doesn't include a good match for what the person is asking, say so honestly and suggest they browse the full destinations list instead of guessing.
- Keep answers conversational and concise (a few sentences, not a long report) — this is a chat widget, not a document.
- When you recommend a destination, briefly say why it fits (budget, season, traveler type) using the data given.
- If the person hasn't shared budget, travel dates, or who they're traveling with, and it would change your answer, ask one clarifying question rather than guessing.
- Prices are in KES unless the person asks otherwise.`;

/**
 * Very simple retrieval step: pulls the most relevant seeded destinations
 * for the user's latest message using MongoDB's text index, and formats
 * them as grounding context for the model. Keeps the assistant honest
 * about only recommending real, seeded places.
 */
async function getRelevantDestinationsContext(query: string): Promise<string> {
  let matches = await Destination.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(5);

  // Fall back to a small general sample so the assistant always has
  // something to ground on, even for vague opening messages like "hi".
  if (matches.length === 0) {
    matches = await Destination.find({}).sort({ avgRating: -1 }).limit(5);
  }

  if (matches.length === 0) return "No destinations are seeded in the database yet.";

  return matches
    .map((d) => {
      const mid = d.estimatedCosts.midRange;
      const dailyMidRange = mid.accommodation + mid.food + mid.transport + mid.activities;
      const recommendedSeasons = d.bestSeasons
        .filter((s) => s.isRecommended)
        .map((s) => `${s.name} (${s.months.join(", ")})`)
        .join("; ");

      return [
        `- ${d.name} (${d.category}, ${d.region}/${d.county})`,
        `  ${d.shortDescription}`,
        `  Mid-range cost: ~${mid.currency} ${dailyMidRange}/day/person. Suitable for: ${d.suitableFor.join(", ")}.`,
        `  Best time: ${recommendedSeasons || "see full seasonal breakdown"}.`,
        `  Slug: ${d.slug}`,
      ].join("\n");
    })
    .join("\n\n");
}

export async function getChatReply(messages: ChatMessage[]): Promise<string> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const context = await getRelevantDestinationsContext(lastUserMessage);

  const apiKey = getGeminiApiKey();

  // Gemini uses "model" instead of "assistant" for the AI's turns, and
  // takes the system prompt as a separate systemInstruction field.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents,
      systemInstruction: {
        parts: [{ text: `${SYSTEM_PROMPT}\n\nKnown destinations relevant to this conversation:\n\n${context}` }],
      },
      generationConfig: {
        maxOutputTokens: 700,
      },
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "I couldn't come up with a response — try rephrasing that?";
}
