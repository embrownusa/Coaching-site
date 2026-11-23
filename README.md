# Last Mile Endurance

The coaching website, built from the Figma Make design "Distance Coaching Website".

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files in dist/
```

## What's here

- **Pages:** Home, Coaches, Philosophy, Resources (with a page per field note), Plans, Book a call, Contact, Client login, the client area, and a 404 page.
- **Contact form** (`/contact`): name, email, discipline, preferred coach, goal race, message, and a free-consultation option. Coach pages link straight to it with the coach pre-selected.
- **Newsletter sign-up** on the Resources page.
- **Forms:** set `VITE_FORM_ENDPOINT` (see `.env.example`) to send submissions to a form service such as Formspree. Until then, forms open the visitor's email app with their details filled in.
- **Booking** (`/book`): set `VITE_BOOKING_URL` to a Cal.com or Calendly page and the calendar appears inline. Until then, the page offers a "request a call" form.
- **Payments** (`/plans`): three plans (prices in `src/content.ts` are placeholders). Set a Stripe Payment Link per plan (`VITE_STRIPE_LINK_*`) and "Get started" goes to Stripe checkout. Until then it opens the contact form with the plan named.
- **Client login** (`/login`, `/account`): sign-in and a client area with the week's training, next check-in, coach note and billing. It runs in **preview mode** (`src/auth.ts`): any email signs in and the data is sample data. Going live needs a login service such as Supabase; only `src/auth.ts` and the sample data in `src/pages/Account.tsx` change.
- **Geometric accents** in the style of [Book of Shapes](https://bookofshapes.com) (free for commercial use) live in `src/components/Shapes.tsx`.
- **Sketch pad** (`src/components/InkCanvas.tsx`): an ink-style drawing area on the home page, standing in for [Ink Draw](https://www.bubbbly.com/ink-draw).

## Editing content

- Site email, booking and Stripe settings: `src/config.ts` and `.env`
- Coaches, principles, plans and field notes: `src/content.ts` (the field-note text is a draft to replace)

## Hosting note

Pages use clean URLs like `/coaches`, so the host must serve `index.html` for unknown paths (a one-line setting on Netlify, Vercel or Cloudflare Pages).
