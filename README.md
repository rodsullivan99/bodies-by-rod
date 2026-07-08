# Bodies by Rod — R.O.D. Ready On Demand

Elite fitness coaching platform.

## Netlify Environment Setup

Stripe checkout requires `STRIPE_SECRET_KEY` plus one Stripe Price ID per checkout option:

Package checkout:

| Button | GRIND | HUSTLE | EMPIRE |
| --- | --- | --- | --- |
| Full monthly checkout | `STRIPE_PRICE_GRIND` | `STRIPE_PRICE_HUSTLE` | `STRIPE_PRICE_EMPIRE` |
| Start Weekly | `STRIPE_PRICE_GRIND_WEEKLY` | `STRIPE_PRICE_HUSTLE_WEEKLY` | `STRIPE_PRICE_EMPIRE_WEEKLY` |
| Split payment | `STRIPE_PRICE_GRIND_SPLIT` | `STRIPE_PRICE_HUSTLE_SPLIT` | `STRIPE_PRICE_EMPIRE_SPLIT` |

Session checkout:

- `STRIPE_PRICE_SESSION_ONLINE_SINGLE`
- `STRIPE_PRICE_SESSION_INPERSON_SINGLE`
- `STRIPE_PRICE_SESSION_CHECKIN_SINGLE`
- `STRIPE_PRICE_SESSION_ONLINE_1X`
- `STRIPE_PRICE_SESSION_ONLINE_2X`
- `STRIPE_PRICE_SESSION_ONLINE_3X`
- `STRIPE_PRICE_SESSION_ONLINE_4X`
- `STRIPE_PRICE_SESSION_INPERSON_1X`
- `STRIPE_PRICE_SESSION_INPERSON_2X`
- `STRIPE_PRICE_SESSION_INPERSON_3X`
- `STRIPE_PRICE_SESSION_INPERSON_4X`
- `STRIPE_PRICE_SESSION_CHECKIN_1X`
- `STRIPE_PRICE_SESSION_CHECKIN_2X`
- `STRIPE_PRICE_SESSION_CHECKIN_3X`
- `STRIPE_PRICE_SESSION_CHECKIN_4X`

Each `STRIPE_PRICE_*` value must be a Stripe Price ID that starts with `price_`.

Meal plan emails require either `RESEND_API_KEY` or `SENDGRID_API_KEY`. Optional sender variables are `MEAL_PLAN_FROM_EMAIL`, `RESEND_FROM_EMAIL`, or `SENDGRID_FROM_EMAIL`. If no email provider is configured, the app still captures the lead through Netlify Forms and shows a follow-up message instead of an error.
