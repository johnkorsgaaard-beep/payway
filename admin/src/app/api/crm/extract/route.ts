import { NextRequest } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const EXTRACT_PROMPT = `You are an AI assistant that extracts business lead information. You will receive either:
1. A screenshot of a storefront, business card, or website
2. A business name or description

Extract as much structured data as you can and return ONLY valid JSON (no markdown fences) with these fields:
{
  "title": "Deal title — use format: Company Name — brief context",
  "company": "Company/business name",
  "contactName": "Contact person name if visible, otherwise empty string",
  "contactEmail": "Email if visible, otherwise empty string",
  "contactPhone": "Phone if visible, otherwise empty string",
  "tags": ["array", "of", "relevant", "tags"],
  "notes": "Any extra context you can infer (type of business, location, what they sell, etc.)",
  "estimatedValue": 0,
  "priority": "low"
}

Guidelines:
- For estimatedValue: small café/kiosk = 1500-3000, restaurant/bar = 3000-8000, hotel/chain = 8000-20000, large chain = 15000+
- For priority: if the business seems like a strong PayWay fit (food, retail, café) use "medium" or "high"
- Tags should include business type, location if known
- Keep notes concise and useful for a sales rep
- If you only have a name, research what you know about the business and fill in what you can
- ALWAYS return valid JSON, nothing else`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const { image, text } = await req.json();

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: EXTRACT_PROMPT },
    ];

    if (image) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: text || "Extract business information from this image." },
          { type: "image_url", image_url: { url: image, detail: "low" } },
        ],
      });
    } else if (text) {
      messages.push({
        role: "user",
        content: `Extract business lead information for: ${text}`,
      });
    } else {
      return Response.json({ error: "No input provided" }, { status: 400 });
    }

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 600,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const data = JSON.parse(cleaned);

    return Response.json({ lead: data });
  } catch (err: unknown) {
    console.error("CRM extract error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
