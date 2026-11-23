# Last Mile Endurance

The coaching website, built from the Figma Make design "Distance Coaching Website".

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files in dist/
```

## What's here

- **Pages:** Home, Coaches, Philosophy, Resources (with a page per field note), Contact, and a 404 page.
- **Contact form** (`/contact`): name, email, discipline, preferred coach, goal race, message, and a free-consultation option. Coach pages link straight to it with the coach pre-selected.
- **Newsletter sign-up** on the Resources page.
- **Forms:** set `VITE_FORM_ENDPOINT` (see `.env.example`) to send submissions to a form service such as Formspree. Until then, forms open the visitor's email app with their details filled in.
- **Geometric accents** in the style of [Book of Shapes](https://bookofshapes.com) (free for commercial use) live in `src/components/Shapes.tsx`.
- **Sketch pad** (`src/components/InkCanvas.tsx`): an ink-style drawing area on the home page, standing in for [Ink Draw](https://www.bubbbly.com/ink-draw).

## Editing content

- Site email and form settings: `src/config.ts`
- Coaches, principles and field notes: `src/content.ts` (the field-note text is a draft to replace)

## Hosting note

Pages use clean URLs like `/coaches`, so the host must serve `index.html` for unknown paths (a one-line setting on Netlify, Vercel or Cloudflare Pages).
