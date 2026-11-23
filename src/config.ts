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
  // Public scheduling page (Cal.com or Calendly) for free consultations, shown on /book.
  bookingUrl: (env.VITE_BOOKING_URL as string | undefined) || '',
  // Stripe customer portal link, so clients can see invoices and update their card.
  // Pricing is agreed case by case, so payments are sent per client from Stripe.
  stripePortalUrl: (env.VITE_STRIPE_PORTAL_URL as string | undefined) || '',
}

