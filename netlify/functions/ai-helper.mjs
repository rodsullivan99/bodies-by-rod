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
  const latestMessage = String([...messages].reverse().find((message) => message.role !== "assistant")?.content || "");
  const latest = latestMessage.toLowerCase();

  if (latestMessage.includes('"workouts"') || latestMessage.includes("JSON only")) {
    const days = Math.max(3, Math.min(6, parseInt((latestMessage.match(/(\d+)-day plan/) || [])[1] || "4", 10) || 4));
    const focus = (latestMessage.match(/Focus:([^.]*)/) || [])[1]?.trim() || "Full Body";
    const goal = (latestMessage.match(/Goal:([^ ](?:.*?)) Level:/) || [])[1]?.trim() || "Build Muscle";
    const templates = [
      ["Day 1 - Upper Power", [["Bench Press", "4x8", "Set your shoulder blades, lower under control, and drive the bar up hard."], ["Bent-Over Row", "4x10", "Brace your core, pull elbows back, and squeeze between the shoulder blades."], ["Incline Dumbbell Press", "3x10", "Keep wrists stacked and press without letting your shoulders roll forward."], ["Lat Pulldown", "3x12", "Pull to upper chest, keep ribs down, and control the stretch."], ["Plank", "3x45 sec", "Lock ribs and hips in place. Do not let your lower back sag."]]],
      ["Day 2 - Lower Strength", [["Back Squat", "4x8", "Feet planted, knees track over toes, sit between the hips, and stand tall."], ["Romanian Deadlift", "4x10", "Hinge back, keep the bar close, and feel hamstrings load before standing."], ["Walking Lunge", "3x12/leg", "Step long, stay balanced, and push through the front heel."], ["Leg Curl", "3x12", "Control the negative and squeeze hard at the top."], ["Calf Raise", "4x15", "Pause at the top and stretch fully at the bottom."]]],
      ["Day 3 - Conditioning + Core", [["Dumbbell Thruster", "4x12", "Squat clean, drive through the floor, and press overhead in one motion."], ["Kettlebell Swing", "4x15", "Snap the hips, keep arms loose, and do not squat the swing."], ["Push-Up", "3xAMRAP", "Hands under shoulders, body straight, chest to floor."], ["Mountain Climber", "4x30 sec", "Keep hips low and move fast without losing position."], ["Dead Bug", "3x10/side", "Press low back down and move slow."]]],
      ["Day 4 - Full Body Build", [["Deadlift", "4x6", "Brace first, push the floor away, and finish with glutes, not your lower back."], ["Dumbbell Shoulder Press", "4x10", "Keep ribs down and press straight overhead."], ["Goblet Squat", "3x12", "Stay tall, elbows inside knees, and own the bottom position."], ["Seated Cable Row", "3x12", "Pull to ribs and pause before returning."], ["Farmer Carry", "4x40 yd", "Stand tall, squeeze handles, and walk with control."]]],
      ["Day 5 - Athletic Finish", [["Box Jump", "5x5", "Land soft, step down, and make every rep explosive."], ["Front Squat", "4x8", "Elbows high, brace tight, and keep torso upright."], ["Pull-Up or Assisted Pull-Up", "4xAMRAP", "Start from a dead hang and drive elbows down."], ["Dumbbell RDL", "3x12", "Hips back, back flat, hamstrings loaded."], ["Bike Sprint", "8x20 sec", "Go all out, then recover 70 seconds."]]],
      ["Day 6 - Pump + Recovery", [["Incline Walk", "20 min", "Keep a steady pace and nasal breathe when possible."], ["Cable Fly", "3x15", "Stretch wide and hug the chest together."], ["Lateral Raise", "4x15", "Lead with elbows and stop at shoulder height."], ["Face Pull", "3x15", "Pull toward eyes and rotate thumbs back."], ["Hip Mobility Flow", "3 rounds", "Move slow through hips, hamstrings, and ankles."]]],
    ];
    return JSON.stringify({
      workouts: templates.slice(0, days).map(([day, exercises]) => ({
        day: `${day} (${focus} / ${goal})`,
        exercises: exercises.map(([name, sets, howTo]) => ({ name, sets, howTo })),
      })),
    });
  }

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
