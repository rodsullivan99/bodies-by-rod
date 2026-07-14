import type { Config } from "@netlify/functions";

type Meal = {
  meal: string;
  food: string;
  macros: string;
};

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getFromEmail = () => {
  const fromEmail =
    process.env.MEAL_PLAN_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.SENDGRID_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error("Meal plan sender email is not configured");
  }

  return fromEmail;
};

const buildText = (name: string, goal: string, diet: string, meals: Meal[]) => {
  const greeting = name ? `What's up ${name},` : "What's up,";
  const mealLines = meals.map((meal) => `${meal.meal}: ${meal.food} (${meal.macros})`).join("\n");

  return `${greeting}

Here is your free 7-day Bodies by Rod meal plan for ${goal} with ${diet} meals.

${mealLines}

Shopping list:
- Lean protein for each meal
- Rice, oats, potatoes, or approved carb source
- Vegetables for lunch and dinner
- Healthy fats that match your plan
- Water and zero-calorie electrolytes

Prep notes:
- Cook proteins and carbs in bulk 2 times per week.
- Portion meals before the day starts.
- Keep protein consistent and adjust carbs based on energy and training.

Rod will follow up with next steps.`;
};

const buildHtml = (name: string, goal: string, diet: string, meals: Meal[]) => {
  const rows = meals
    .map(
      (meal) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #222;color:#f0ebe3;font-weight:700;">${escapeHtml(meal.meal)}</td>
          <td style="padding:10px;border-bottom:1px solid #222;color:#c9c3ba;">${escapeHtml(meal.food)}</td>
          <td style="padding:10px;border-bottom:1px solid #222;color:#d4a843;white-space:nowrap;">${escapeHtml(meal.macros)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b0b0b;color:#f0ebe3;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
      <h1 style="margin:0 0 8px;color:#e8192c;font-size:30px;line-height:1;">Bodies by Rod</h1>
      <p style="margin:0 0 20px;color:#c9c3ba;">${escapeHtml(name || "Your")} free 7-day meal plan for <strong style="color:#fff;">${escapeHtml(goal)}</strong> with ${escapeHtml(diet)} meals.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#141414;border:1px solid #262626;">
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:20px;padding:16px;background:#141414;border:1px solid #262626;">
        <h2 style="margin:0 0 10px;color:#d4a843;font-size:18px;">Shopping List</h2>
        <p style="margin:0;color:#c9c3ba;line-height:1.6;">Lean protein, approved carb sources, vegetables, healthy fats, water, and zero-calorie electrolytes.</p>
      </div>
      <div style="margin-top:14px;padding:16px;background:#141414;border:1px solid #262626;">
        <h2 style="margin:0 0 10px;color:#d4a843;font-size:18px;">Prep Notes</h2>
        <p style="margin:0;color:#c9c3ba;line-height:1.6;">Cook proteins and carbs in bulk twice per week. Portion meals before the day starts. Keep protein consistent and adjust carbs based on energy and training.</p>
      </div>
    </div>
  </body>
</html>`;
};

const sendWithResend = async (to: string, subject: string, html: string, text: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) throw new Error("Resend rejected the email request");
};

const sendWithSendGrid = async (to: string, subject: string, html: string, text: string) => {
  const from = getFromEmail();
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: from.includes("<") ? { email: from.match(/<([^>]+)>/)?.[1] || from } : { email: from },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!response.ok) throw new Error("SendGrid rejected the email request");
};

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const goal = typeof body.goal === "string" ? body.goal.trim().slice(0, 80) : "Starter Plan";
    const diet = typeof body.diet === "string" ? body.diet.trim().slice(0, 80) : "Regular";
    const meals = Array.isArray(body.meals)
      ? body.meals
          .slice(0, 10)
          .map((meal: unknown) => {
            const item = meal && typeof meal === "object" ? (meal as Partial<Meal>) : {};
            return {
              meal: String(item.meal || "").slice(0, 60),
              food: String(item.food || "").slice(0, 240),
              macros: String(item.macros || "").slice(0, 80),
            };
          })
          .filter((meal: Meal) => meal.meal && meal.food)
      : [];

    if (!isValidEmail(email)) {
      return json({ error: "A valid email is required." }, 400);
    }

    if (!meals.length) {
      return json({ error: "Meal plan content is required." }, 400);
    }

    if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
      console.warn("Meal plan email provider is not configured; lead was captured by Netlify Forms.");
      return json({ ok: true, emailSent: false, reason: "email_provider_not_configured" });
    }

    const subject = "Your Free 7-Day Bodies by Rod Meal Plan";
    const text = buildText(name, goal, diet, meals);
    const html = buildHtml(name, goal, diet, meals);

    if (process.env.RESEND_API_KEY) {
      await sendWithResend(email, subject, html, text);
    } else {
      await sendWithSendGrid(email, subject, html, text);
    }

    return json({ ok: true, emailSent: true });
  } catch (error) {
    console.error("Meal plan email failed", error);
    return json({ error: "Meal plan email could not be sent right now." }, 500);
  }
};

export const config: Config = {
  path: "/api/send-meal-plan",
  method: "POST",
};
