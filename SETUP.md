# Going live: Netlify + Supabase

About 15 minutes, once. Both services are free to start.

## 1. Supabase (client logins)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the whole of `supabase/schema.sql`, and press **Run**.
3. Open **Project Settings > API** and keep the **Project URL** and the **anon public** key handy for step 2.3.

## 2. Netlify (hosting and forms)

1. At [netlify.com](https://netlify.com) choose **Add new site > Import an existing project > GitHub** and pick `coaching-site`. Netlify reads the build settings from `netlify.toml`, so just press **Deploy**.
2. Under **Forms**, turn on **form detection**, then redeploy. Under **Forms > Form notifications**, add an email notification to the address that should receive enquiries.
3. Under **Site configuration > Environment variables**, add:
   - `VITE_SUPABASE_URL`: the Project URL from Supabase
   - `VITE_SUPABASE_ANON_KEY`: the anon public key from Supabase
   - Later, when you have them: `VITE_BOOKING_URL` (Cal.com or Calendly consultation page) and `VITE_STRIPE_PORTAL_URL` (Stripe customer portal link)

   Then **Deploys > Trigger deploy**.

## 3. Connect the two

1. Copy your Netlify site address (for example `https://last-mile.netlify.app`).
2. In Supabase, **Authentication > URL Configuration**: set **Site URL** to that address, and add `https://<your-site>/account` under **Redirect URLs**.

## 4. Make yourself a coach

1. On the live site, sign in at `/login` with your email.
2. In Supabase, **Table Editor > profiles**, find your row and set `role` to `coach`. Do the same for each coach.

## Adding a client's training (for now)

Until there's a coach dashboard, coaches add data in Supabase's **Table Editor**:

- **profiles**: once a client has signed in, set their `full_name`, `coach_name` and `plan_name`.
- **sessions**: one row per session, with `client_id` (the client's profile id), `day`, `title` and `detail`. Clients see the current week and tick sessions off.
- **checkins**: the next call, with `starts_at`, `duration_min`, `kind` and an optional video `link`.
- **coach_notes**: a short note; clients see the latest one.

## Payments

Pricing is agreed case by case, so nothing is listed on the site. Send each client an invoice or Payment Link from Stripe. If you turn on Stripe's customer portal and set `VITE_STRIPE_PORTAL_URL`, clients get an "Invoices & payment details" link in their client area.
