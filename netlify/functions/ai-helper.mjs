const MODEL = "claude-sonnet-4-5";
const SITE_SYSTEM = [
  "You are the AI helper for Bodies by Rod, also called R.O.D. Ready On Demand.",
  "Help visitors choose between GRIND at $480/month, HUSTLE at $550/month, EMPIRE at $1,500/month, the $75 strategy consult, meal prep, check-ins, referrals, LifeWave patches, and booking Rod for a phone consult.",
  "Be direct, concise, and practical. Do not say you do not know who Rod or Bodies by Rod is.",
  "If a visitor wants Rod on the phone, send them to the $75 strategy consult or the site booking flow. Do not invent phone numbers, email addresses, social handles, or off-site contact methods.",
  "Do not promise payment completion, exact availability, medical results, or that Rod personally saw a message unless the site flow says so.",
].join(" ");
const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, max-age=0",
};

const respond = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers || {}),
    },
  });

const fallbackAnswer = (messages) => {
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

const providerReplyMissedSiteContext = (text) => {
  const normalized = String(text || "").toLowerCase();
  return (
    normalized.includes("i'm claude") ||
    normalized.includes("i am claude") ||
    normalized.includes("made by anthropic") ||
    normalized.includes("could you tell me more about what service") ||
    normalized.includes("trying to reach someone named rod")
  );
};

export default async (req) => {
  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, { status: 405 });
  }

  let messages = [];

  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
    const system = typeof body.system === "string" ? body.system : undefined;
    const effectiveSystem = system ? `${SITE_SYSTEM}\n\n${system}` : SITE_SYSTEM;
    const maxTokens = Number.isFinite(body.maxTokens) ? Math.min(Math.max(body.maxTokens, 80), 1200) : 500;

    if (!messages.length) {
      return respond({ error: "Missing messages" }, { status: 400 });
    }

    const baseUrl = process.env.ANTHROPIC_BASE_URL || process.env.NETLIFY_AI_GATEWAY_BASE_URL;
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY;

    if (!baseUrl || !apiKey) {
      return respond({ text: fallbackAnswer(messages), fallback: true, reason: "gateway_unavailable" });
    }

    const gatewayMessages = messages.map((message, index) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content:
        index === messages.length - 1 && message.role !== "assistant"
          ? `${effectiveSystem}\n\nVisitor question: ${String(message.content || "").slice(0, 4000)}`
          : String(message.content || "").slice(0, 4000),
    }));

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: effectiveSystem,
        messages: gatewayMessages,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway HTTP error", response.status);
      return respond({ text: fallbackAnswer(messages), fallback: true, reason: "gateway_error" });
    }

    const data = await response.json();
    const text = Array.isArray(data.content)
      ? data.content
          .filter((part) => part.type === "text")
          .map((part) => part.text || "")
          .join("\n")
          .trim()
      : "";

    if (!text || providerReplyMissedSiteContext(text)) {
      return respond({ text: fallbackAnswer(messages), fallback: true, reason: "site_context_guard" });
    }

    return respond({ text, fallback: false });
  } catch (error) {
    console.error("AI helper failed", error);
    return respond({ text: fallbackAnswer(messages), fallback: true, reason: "function_error" });
  }
};
