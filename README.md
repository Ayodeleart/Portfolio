# Octopus Fur — Portfolio

Next.js 14 + Tailwind v3 + Framer Motion + Supabase + Groq.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Project Settings → API → service_role key (this project: "Commission works")
- `ADMIN_PASSWORD` — whatever password you want for `/admin`
- `ADMIN_SESSION_SECRET` — any long random string
- `GROQ_API_KEY` — from console.groq.com

```bash
npm run dev
```

## What's live

- `/` — Hero (color switcher), About, Projects (pulled live from Supabase `portfolio_projects`), Footer (social links from `portfolio_social_links`)
- `/admin/login` — password gate
- `/admin` — add/delete projects, upload screenshots (stored in existing `octopusfur-media` bucket under `portfolio/`), generate write-ups via Groq, edit social links

## Still needed

- Real hero composite image (currently a placeholder box in `components/Hero.tsx`)
- App icons for `public/manifest.json` (192px / 512px) — once logo is ready
- `npx tsc --noEmit` and `npm run build` before deploying, per usual workflow

## Data

Tables live in the shared "Commission works" Supabase project, prefixed `portfolio_*` to stay isolated from other apps in that project:
- `portfolio_projects`
- `portfolio_social_links`
