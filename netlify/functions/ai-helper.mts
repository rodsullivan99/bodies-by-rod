import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const MODEL = "claude-sonnet-4-5";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const system = typeof body.system === "string" ? body.system : undefined;
    const maxTokens = Number.isFinite(body.maxTokens) ? Math.min(Math.max(body.maxTokens, 80), 1200) : 500;

    if (!messages.length) {
      return Response.json({ error: "Missing messages" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: messages.map((message: { role?: string; content?: string }) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content || "").slice(0, 4000),
      })),
    });

    const text = response.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();

    return Response.json({ text });
  } catch (error) {
    console.error("AI helper failed", error);
    return Response.json({ error: "AI helper unavailable" }, { status: 500 });
  }
};
