// Site-wide settings. Change these in one place.
// Values starting with import.meta.env come from a .env file (see .env.example),
// so accounts can be connected without touching the code.
const env = import.meta.env

export const site = {
  name: 'Last Mile Endurance',
  email: 'embrown348@gmail.com',
  // Form service for the contact and newsletter forms. Without it, forms open
  // the visitor's email app.
  formEndpoint: (env.VITE_FORM_ENDPOINT as string | undefined) || '',
  // Public scheduling page (Cal.com or Calendly) shown on /book.
  bookingUrl: (env.VITE_BOOKING_URL as string | undefined) || '',
  // Stripe customer portal link, so clients can manage billing.
  stripePortalUrl: (env.VITE_STRIPE_PORTAL_URL as string | undefined) || '',
}

/** Stripe Payment Link for each plan, keyed by plan id (see content.ts). */
export const stripeLinks: Record<string, string> = {
  monthly: (env.VITE_STRIPE_LINK_MONTHLY as string | undefined) || '',
  'race-block': (env.VITE_STRIPE_LINK_RACE_BLOCK as string | undefined) || '',
  'plan-review': (env.VITE_STRIPE_LINK_PLAN_REVIEW as string | undefined) || '',
}
