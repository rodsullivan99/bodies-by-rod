import Stripe from "stripe";
import type { Config } from "@netlify/functions";

type CheckoutItem = {
  priceEnv: string;
  mode: "payment" | "subscription";
};

const ALLOWED_TRIAL_DAYS = new Set([7]);

const CHECKOUT_ITEMS: Record<string, CheckoutItem> = {
  grind_full: { priceEnv: "STRIPE_PRICE_GRIND", mode: "subscription" },
  grind_weekly: { priceEnv: "STRIPE_PRICE_GRIND_WEEKLY", mode: "subscription" },
  grind_split: { priceEnv: "STRIPE_PRICE_GRIND_SPLIT", mode: "payment" },
  hustle_full: { priceEnv: "STRIPE_PRICE_HUSTLE", mode: "subscription" },
  hustle_weekly: { priceEnv: "STRIPE_PRICE_HUSTLE_WEEKLY", mode: "subscription" },
  hustle_split: { priceEnv: "STRIPE_PRICE_HUSTLE_SPLIT", mode: "payment" },
  empire_full: { priceEnv: "STRIPE_PRICE_EMPIRE", mode: "subscription" },
  empire_weekly: { priceEnv: "STRIPE_PRICE_EMPIRE_WEEKLY", mode: "subscription" },
  empire_split: { priceEnv: "STRIPE_PRICE_EMPIRE_SPLIT", mode: "payment" },
  session_online_single: { priceEnv: "STRIPE_PRICE_SESSION_ONLINE_SINGLE", mode: "payment" },
  session_inperson_single: { priceEnv: "STRIPE_PRICE_SESSION_INPERSON_SINGLE", mode: "payment" },
  session_checkin_single: { priceEnv: "STRIPE_PRICE_SESSION_CHECKIN_SINGLE", mode: "payment" },
  session_online_1x: { priceEnv: "STRIPE_PRICE_SESSION_ONLINE_1X", mode: "subscription" },
  session_online_2x: { priceEnv: "STRIPE_PRICE_SESSION_ONLINE_2X", mode: "subscription" },
  session_online_3x: { priceEnv: "STRIPE_PRICE_SESSION_ONLINE_3X", mode: "subscription" },
  session_online_4x: { priceEnv: "STRIPE_PRICE_SESSION_ONLINE_4X", mode: "subscription" },
  session_inperson_1x: { priceEnv: "STRIPE_PRICE_SESSION_INPERSON_1X", mode: "subscription" },
  session_inperson_2x: { priceEnv: "STRIPE_PRICE_SESSION_INPERSON_2X", mode: "subscription" },
  session_inperson_3x: { priceEnv: "STRIPE_PRICE_SESSION_INPERSON_3X", mode: "subscription" },
  session_inperson_4x: { priceEnv: "STRIPE_PRICE_SESSION_INPERSON_4X", mode: "subscription" },
  session_checkin_1x: { priceEnv: "STRIPE_PRICE_SESSION_CHECKIN_1X", mode: "subscription" },
  session_checkin_2x: { priceEnv: "STRIPE_PRICE_SESSION_CHECKIN_2X", mode: "subscription" },
  session_checkin_3x: { priceEnv: "STRIPE_PRICE_SESSION_CHECKIN_3X", mode: "subscription" },
  session_checkin_4x: { priceEnv: "STRIPE_PRICE_SESSION_CHECKIN_4X", mode: "subscription" },
};

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const getOrigin = (req: Request) => {
  const url = new URL(req.url);
  return process.env.URL || `${url.protocol}//${url.host}`;
};

const cleanMetadata = (metadata: unknown) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined && value !== null)
      .slice(0, 20)
      .map(([key, value]) => [key.slice(0, 40), String(value).slice(0, 450)])
  );
};

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return json({ error: "Missing STRIPE_SECRET_KEY in Netlify environment variables." }, 503);
  }

  try {
    const body = await req.json();
    const itemKey = typeof body.itemKey === "string" ? body.itemKey : "";
    const item = CHECKOUT_ITEMS[itemKey];

    if (!item) {
      return json({ error: "Invalid checkout item." }, 400);
    }

    const price = process.env[item.priceEnv];
    if (!price) {
      return json({ error: `Missing ${item.priceEnv} in Netlify environment variables.` }, 503);
    }

    const email = typeof body.email === "string" && body.email.includes("@") ? body.email.trim() : undefined;
    const requestedTrialDays = Number(body.trialDays);
    const trialDays =
      item.mode === "subscription" && ALLOWED_TRIAL_DAYS.has(requestedTrialDays) ? requestedTrialDays : undefined;
    const origin = getOrigin(req);
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      line_items: [{ price, quantity: 1 }],
      ...(trialDays ? { subscription_data: { trial_period_days: trialDays } } : {}),
      ...(email ? { customer_email: email } : {}),
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/?checkout=success&item=${encodeURIComponent(itemKey)}`,
      cancel_url: `${origin}/?checkout=cancelled&item=${encodeURIComponent(itemKey)}`,
      metadata: {
        item_key: itemKey,
        ...cleanMetadata(body.metadata),
      },
    });

    if (!session.url) {
      return json({ error: "Stripe did not return a checkout URL." }, 502);
    }

    return json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session failed", error);
    return json({ error: "Stripe checkout is unavailable right now." }, 500);
  }
};

export const config: Config = {
  path: "/api/create-checkout-session",
  method: "POST",
};
