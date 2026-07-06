import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-5";
const jsonHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

const fallbackAnswer = (messages: Array<{ role?: string; content?: string }>) => {
  const latest = String([...messages].reverse().find((message) => message.role !== "assistant")?.content || "").toLowerCase();

  if (latest.includes("package") || latest.includes("price") || latest.includes("cost")) {
    return "Packages start with GRIND at $480/month, HUSTLE at $550/month, and EMPIRE at $1,500/month. If you are not sure where to start, book the $75 strategy consult first.";
  }

  if (latest.includes("book") || latest.includes("consult") || latest.includes("appointment")) {
    return "Start with the $75 strategy consult. It is built to lock in your goal, choose the right plan, and map the next move before you commit to a full package.";
  }

  if (latest.includes("meal") || latest.includes("nutrition") || latest.includes("food")) {
    return "Use the meal plan tool for a quick starting point, then match it to your goal, schedule, and consistency level. The real win is having meals ready before the week starts.";
  }

  if (latest.includes("check") || latest.includes("accountability") || latest.includes("habit")) {
    return "Use the check-in and habits tools to track what happened today, not what you meant to do. Consistent check-ins make it easier to adjust before you drift off plan.";
  }

  if (latest.includes("refer") || latest.includes("referral") || latest.includes("loyalty")) {
    return "The referral and loyalty tools help track who you send in and the rewards connected to your progress. Open those sections to see the current options.";
  }

  if (latest.includes("phone") || latest.includes("call") || latest.includes("rod")) {
    return "If you want Rod on the phone, start with the $75 strategy consult. It covers your goal, the best package, and the next step before you commit.";
  }

  if (latest.includes("ai") || latest.includes("help") || latest.includes("box")) {
    return "The AI Helper can answer questions about Bodies by Rod packages, the $75 consult, meal prep, check-ins, referrals, LifeWave patches, and where to start. Tell me your goal and I will point you to the right section.";
  }

  return "I can help with Bodies by Rod packages, booking a phone consult with Rod, meal prep, check-ins, referrals, LifeWave patches, and where to start. Ask me what you are trying to accomplish and I will point you to the right next step.";
};

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: jsonHeaders });
  }

  let messages: Array<{ role?: string; content?: string }> = [];

  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
    const system = typeof body.system === "string" ? body.system : undefined;
    const maxTokens = Number.isFinite(body.maxTokens) ? Math.min(Math.max(body.maxTokens, 80), 1200) : 500;

    if (!messages.length) {
      return Response.json({ error: "Missing messages" }, { status: 400, headers: jsonHeaders });
    }

    const anthropic = new Anthropic();
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

    return Response.json({ text: text || fallbackAnswer(messages), fallback: !text }, { headers: jsonHeaders });
  } catch (error) {
    console.error("AI helper failed", error);
    return Response.json({ text: fallbackAnswer(messages), fallback: true }, { headers: jsonHeaders });
  }
};
