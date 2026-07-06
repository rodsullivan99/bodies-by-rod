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
    const key = goal === "Lose Weight" || focus === "Cardio + Strength" ? "conditioning" : goal === "Athletic Performance" ? "athletic" : goal === "Increase Strength" ? "strength" : goal === "Tone & Define" ? "tone" : "muscle";
    const plans = {
      muscle: [
        ["Day 1 - Push: Chest, Shoulders, Triceps", [["Barbell Bench Press", "4x8", "Set shoulder blades, lower under control, and press without bouncing."], ["Incline Dumbbell Press", "3x10", "Keep elbows slightly tucked and press over upper chest."], ["Seated Shoulder Press", "3x8-10", "Brace ribs down and press straight overhead."], ["Cable Fly", "3x12-15", "Stretch wide and squeeze chest without shrugging."], ["Rope Triceps Pressdown", "3x12-15", "Pin elbows and finish every rep hard."]]],
        ["Day 2 - Pull: Back, Rear Delts, Biceps", [["Pull-Up or Lat Pulldown", "4x8", "Pull elbows to ribs and control the stretch."], ["Chest-Supported Row", "3x10", "Keep chest on pad and pull through elbows."], ["Single-Arm Dumbbell Row", "3x10/side", "Reach, then drive elbow toward hip."], ["Face Pull", "3x15", "Pull to eye level and rotate thumbs back."], ["Dumbbell Curl", "3x10-12", "Keep elbows still and lower slow."]]],
        ["Day 3 - Legs: Quads, Hamstrings, Glutes", [["Back Squat", "4x8", "Brace, knees over toes, and stand tall."], ["Romanian Deadlift", "3x10", "Push hips back and load hamstrings."], ["Leg Press", "3x12", "Control full range without hips lifting."], ["Walking Lunge", "3x10/leg", "Step long and push through front heel."], ["Standing Calf Raise", "4x12-15", "Pause high and stretch low."]]],
        ["Day 4 - Upper Volume", [["Incline Bench Press", "4x8-10", "Keep tension on chest with clean reps."], ["Seated Cable Row", "4x10", "Pull to ribs and pause."], ["Dumbbell Lateral Raise", "4x12-15", "Lead with elbows, no swinging."], ["Close-Grip Push-Up", "3xAMRAP", "Stop before form breaks."], ["Hammer Curl", "3x12", "Keep wrists neutral."]]],
        ["Day 5 - Lower Volume + Core", [["Front Squat", "4x8", "Elbows high and torso upright."], ["Hip Thrust", "4x10", "Squeeze glutes at the top."], ["Leg Curl", "3x12-15", "Control the negative."], ["Split Squat", "3x10/leg", "Drop straight down and drive up."], ["Hanging Knee Raise", "3x12", "Curl pelvis without swinging."]]],
        ["Day 6 - Weak Point Pump", [["Machine Chest Press", "3x12", "Smooth reps and no lockout slam."], ["Neutral-Grip Pulldown", "3x12", "Pull elbows down, shoulders away from ears."], ["Cable Lateral Raise", "3x15/side", "Keep constant tension."], ["Reverse Pec Deck", "3x15", "Open through rear delts."], ["Incline Walk", "15 min", "Steady finish."]]],
      ],
      conditioning: [
        ["Day 1 - Strength Circuit + Zone 2", [["Goblet Squat", "3x12", "Stay tall and own the bottom."], ["Push-Up", "3xAMRAP", "Body straight, chest down."], ["TRX or Cable Row", "3x12", "Pull shoulder blades back."], ["Kettlebell Deadlift", "3x12", "Hinge and squeeze glutes."], ["Incline Walk or Bike", "20-30 min", "Hard but controlled breathing."]]],
        ["Day 2 - Intervals + Core", [["Bike Sprint", "10x20 sec", "Hard sprint, easy recovery."], ["Dead Bug", "3x10/side", "Low back pressed down."], ["Side Plank", "3x30 sec/side", "Stack shoulders and hips."], ["Step-Up", "3x10/leg", "Drive through working leg."], ["Farmer Carry", "4x40 yd", "Walk tall and tight."]]],
        ["Day 3 - Full Body Metabolic", [["Dumbbell Thruster", "4x10", "Squat clean and press strong."], ["Romanian Deadlift", "3x12", "Hamstrings loaded, back flat."], ["Lat Pulldown", "3x12", "Control the stretch."], ["Reverse Lunge", "3x10/leg", "Step back and stay tall."], ["Row Machine", "8x250 m", "Hard repeatable pace."]]],
        ["Day 4 - Endurance Base", [["Brisk Walk, Bike, or Elliptical", "35-45 min", "Steady pace without stopping."], ["Bodyweight Squat", "3x15", "Clean depth and knee tracking."], ["Incline Push-Up", "3x12", "Pick a height that keeps form clean."], ["Band Pull-Apart", "3x20", "Squeeze upper back."], ["Mobility Flow", "8-10 min", "Hips, hamstrings, calves, and t-spine."]]],
        ["Day 5 - Conditioning Ladder", [["Sled Push", "6x30 sec", "Drive hard and recover with quality."], ["Dumbbell Clean", "4x8/side", "Hips first and tight core."], ["Walking Lunge", "3x12/leg", "Long step and steady torso."], ["Plank Shoulder Tap", "3x20 taps", "Keep hips quiet."], ["Easy Cooldown", "10 min", "Bring breathing down."]]],
        ["Day 6 - Recovery Cardio + Core", [["Zone 2 Cardio", "30-40 min", "Steady, no sprinting."], ["Cable Wood Chop", "3x12/side", "Rotate through trunk."], ["Glute Bridge", "3x15", "Squeeze glutes and ribs down."], ["Face Pull", "3x15", "Pull to eyes."], ["Stretch Reset", "10 min", "Hips, chest, lats, calves."]]],
      ],
      athletic: [
        ["Day 1 - Acceleration + Lower Power", [["Sprint Build-Up", "6x20 yd", "Accelerate without popping up."], ["Trap Bar Deadlift", "5x3", "Explode from floor with bracing."], ["Box Jump", "5x3", "Land soft and step down."], ["Rear-Foot Elevated Split Squat", "3x8/leg", "Control down, drive up."], ["Pallof Press", "3x12/side", "Resist rotation."]]],
        ["Day 2 - Upper Power + Pull", [["Medicine Ball Chest Pass", "5x5", "Throw hard and reset."], ["Push Press", "4x5", "Dip, drive, finish overhead."], ["Weighted Pull-Up or Pulldown", "4x6-8", "Pull fast with control."], ["Single-Arm Cable Row", "3x10/side", "Pull elbow to hip."], ["Face Pull", "3x15", "Keep shoulders healthy."]]],
        ["Day 3 - Conditioning Agility", [["Shuttle Run", "8 rounds", "Change direction low."], ["Lateral Bound", "4x6/side", "Stick each landing."], ["Kettlebell Swing", "4x15", "Snap hips."], ["Walking Lunge", "3x10/leg", "Own balance."], ["Hollow Hold", "3x30 sec", "Ribs tucked."]]],
        ["Day 4 - Total Body Strength", [["Front Squat", "4x5", "Elbows high, bar fast."], ["Bench Press", "4x5", "Control down, drive up."], ["Romanian Deadlift", "3x8", "Load hamstrings."], ["Chest-Supported Row", "3x10", "Pull strong and pause."], ["Farmer Carry", "5x30 yd", "Heavy and controlled."]]],
        ["Day 5 - Speed Endurance", [["Tempo Run", "10x100 m", "Fast but smooth."], ["Sled Push", "6x20 yd", "Drive knees."], ["Dumbbell Snatch", "4x5/side", "Hips first, punch overhead."], ["Copenhagen Plank", "3x20 sec/side", "Keep hips high."], ["Mobility Reset", "10 min", "Open ankles, hips, t-spine."]]],
        ["Day 6 - Recovery Skill Work", [["Easy Bike or Jog", "25-35 min", "Light and conversational."], ["Jump Rope", "8x45 sec", "Relax shoulders."], ["Single-Leg RDL", "3x8/leg", "Balance and hinge."], ["Band External Rotation", "3x15/side", "Control the shoulder."], ["Breathing Reset", "5 min", "Slow exhale."]]],
      ],
      strength: [
        ["Day 1 - Squat Strength", [["Back Squat", "5x5", "Brace, hit depth, drive through whole foot."], ["Pause Squat", "3x3", "Hold bottom without relaxing."], ["Romanian Deadlift", "4x6", "Heavy hinge and tight lats."], ["Leg Press", "3x8", "Controlled depth."], ["Weighted Plank", "3x40 sec", "Ribs to hips locked."]]],
        ["Day 2 - Bench Strength", [["Bench Press", "5x5", "Set upper back and press through same path."], ["Close-Grip Bench Press", "4x6", "Elbows tucked."], ["Chest-Supported Row", "4x8", "Strong upper-back work."], ["Dumbbell Shoulder Press", "3x8", "Ribs down."], ["Rope Pressdown", "3x12", "Finish lockout."]]],
        ["Day 3 - Deadlift Strength", [["Deadlift", "5x3", "Brace before the pull."], ["Block Pull", "3x4", "Start tight."], ["Front Squat", "3x6", "Torso upright."], ["Hamstring Curl", "3x10", "Control both directions."], ["Farmer Carry", "4x40 yd", "Grip hard."]]],
        ["Day 4 - Overhead + Pull Strength", [["Standing Overhead Press", "5x5", "Glutes tight, bar straight."], ["Weighted Pull-Up", "4x6", "Full hang to finish."], ["Barbell Row", "4x6", "Pull to lower ribs."], ["Incline Dumbbell Press", "3x8", "Controlled reps."], ["Hammer Curl", "3x10", "Grip strength."]]],
        ["Day 5 - Strength Volume", [["Front Squat", "4x5", "Speed from bottom."], ["Bench Press", "4x6", "Clean volume."], ["Trap Bar Deadlift", "3x5", "Powerful reps."], ["Seated Cable Row", "3x10", "Pause at ribs."], ["Ab Wheel", "3x8", "Control range."]]],
        ["Day 6 - Recovery + Carries", [["Incline Walk", "20 min", "Low-stress conditioning."], ["Sled Drag", "6x40 yd", "Smooth steps."], ["Goblet Squat", "3x12", "Open hips."], ["Face Pull", "3x15", "Shoulder health."], ["Suitcase Carry", "3x40 yd/side", "Do not lean."]]],
      ],
      tone: [
        ["Day 1 - Lower Body Shape", [["Goblet Squat", "4x12", "Stay tall."], ["Hip Thrust", "4x12", "Pause at top."], ["Romanian Deadlift", "3x12", "Slow lower."], ["Walking Lunge", "3x12/leg", "Long step."], ["Incline Walk", "15 min", "Steady finish."]]],
        ["Day 2 - Upper Body Definition", [["Incline Dumbbell Press", "3x12", "Controlled reps."], ["Lat Pulldown", "3x12", "Pull to chest."], ["Dumbbell Lateral Raise", "4x15", "No swinging."], ["Seated Cable Row", "3x12", "Pause at ribs."], ["Rope Triceps Pressdown", "3x15", "Elbows locked."]]],
        ["Day 3 - Conditioning Core", [["Kettlebell Swing", "5x15", "Snap hips."], ["Step-Up", "3x12/leg", "Drive through box leg."], ["Mountain Climber", "4x30 sec", "Hips low."], ["Dead Bug", "3x10/side", "Slow and controlled."], ["Bike or Row", "12 min intervals", "45 strong, 45 easy."]]],
        ["Day 4 - Glutes + Back", [["Sumo Deadlift", "4x8", "Knees out, chest tall."], ["Bulgarian Split Squat", "3x10/leg", "Drop straight down."], ["Single-Arm Row", "3x12/side", "Elbow to hip."], ["Face Pull", "3x15", "Rear delts."], ["Cable Kickback", "3x15/leg", "Squeeze glute."]]],
        ["Day 5 - Total Body Burn", [["Dumbbell Squat to Press", "4x10", "Smooth squat, strong press."], ["Push-Up", "3xAMRAP", "Clean reps only."], ["Reverse Lunge", "3x12/leg", "Control step back."], ["Cable Wood Chop", "3x12/side", "Rotate strong."], ["Zone 2 Cardio", "20 min", "Steady pace."]]],
        ["Day 6 - Mobility + Easy Sweat", [["Brisk Walk", "30 min", "Consistent pace."], ["Bodyweight Squat", "3x15", "Full range."], ["Band Row", "3x20", "Squeeze shoulder blades."], ["Glute Bridge", "3x20", "Pause every rep."], ["Mobility Flow", "10 min", "Hips and chest."]]],
      ],
    };
    const templates = plans[key];
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
