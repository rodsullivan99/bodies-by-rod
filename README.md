# Bodies by Rod — R.O.D. Ready On Demand

Elite fitness coaching platform.

## Netlify Environment Setup

Stripe checkout requires `STRIPE_SECRET_KEY` plus one Stripe Price ID per checkout option:

- `STRIPE_PRICE_GRIND`
- `STRIPE_PRICE_GRIND_WEEKLY`
- `STRIPE_PRICE_GRIND_SPLIT`
- `STRIPE_PRICE_HUSTLE`
- `STRIPE_PRICE_HUSTLE_WEEKLY`
- `STRIPE_PRICE_HUSTLE_SPLIT`
- `STRIPE_PRICE_EMPIRE`
- `STRIPE_PRICE_EMPIRE_WEEKLY`
- `STRIPE_PRICE_EMPIRE_SPLIT`

Each `STRIPE_PRICE_*` value must be a Stripe Price ID that starts with `price_`.

Meal plan emails require either `RESEND_API_KEY` or `SENDGRID_API_KEY`. Optional sender variables are `MEAL_PLAN_FROM_EMAIL`, `RESEND_FROM_EMAIL`, or `SENDGRID_FROM_EMAIL`. If no email provider is configured, the app still captures the lead through Netlify Forms and shows a follow-up message instead of an error.
