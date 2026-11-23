# Last Mile Endurance

The coaching website, built from the Figma Make design "Distance Coaching Website".

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files in dist/
```

## What's here

- **Pages:** Home, Coaches, Philosophy, Resources (with a page per field note), Free consultation booking, Contact, Client login, the client area, and a 404 page.
- **Contact form** (`/contact`): name, email, discipline, preferred coach, goal race, message, and a free-consultation option. Coach pages link straight to it with the coach pre-selected.
- **Newsletter sign-up** on the Resources page.
- **Forms:** sent through Netlify Forms when the site is on Netlify (or to `VITE_FORM_ENDPOINT` if set). Running locally, they open the visitor's email app instead.
- **Consultation booking** (`/book`): set `VITE_BOOKING_URL` to a Cal.com or Calendly page and the calendar appears inline. Until then, the page offers a consultation request form. Booking is for free consultations only; coaches arrange client check-ins directly.
- **Payments:** pricing is case by case, so no prices are listed. Coaches bill each client from Stripe; `VITE_STRIPE_PORTAL_URL` adds an invoices link to the client area.
- **Client login** (`/login`, `/account`): email-link sign-in through Supabase, and a client area with the week's sessions (clients tick them off), next check-in, latest coach note and billing. Without Supabase settings it runs in **preview mode** with sample data. Database tables and privacy rules: `supabase/schema.sql`.
- **Geometric accents** in the style of [Book of Shapes](https://bookofshapes.com) (free for commercial use) live in `src/components/Shapes.tsx`.
- **Sketch pad** (`src/components/InkCanvas.tsx`): our own ink-style drawing pad on the home page.

## Editing content

- Site email and service settings: `src/config.ts` and `.env` (see `.env.example`)
- Coaches, principles and field notes: `src/content.ts` (the field-note text is a draft to replace)

## Going live

The site is set up for Netlify (hosting, forms) and Supabase (client logins). Step-by-step: [SETUP.md](SETUP.md).
