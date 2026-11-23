// Site-wide settings. Change these in one place.
export const site = {
  name: 'Last Mile Endurance',
  email: 'hello@lastmileendurance.com',
  // Set VITE_FORM_ENDPOINT in a .env file (see .env.example) to send form
  // submissions to a form service. Without it, forms open the visitor's email app.
  formEndpoint: (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) || '',
}
