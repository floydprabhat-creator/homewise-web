# homewise-web

The web app for HomeWise, a household budget, spending and bills tracker for Indian families. Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + TanStack Query. It talks to [homewise-api](https://github.com/floydprabhat-creator/homewise-api).

## Screens

- **Log in, sign up, forgot password**, and joining a family from an invite link.
- **Onboarding:** "Just me" or a family, the monthly budget and its Essentials / Lifestyle / Savings split.
- **Dashboard:** this month's figures, bucket cards, a breakdown donut, the comparison with last month, upcoming bills and recent spending.
- **Spending:** entries with photo or PDF attachments, filters, search and pagination.
- **Bills:** due and overdue bills, mark paid, and managing recurring bills.
- **Budget:** usage against the split, savings targets, and editing the amount and split.
- **Settings:** family members and invites, categories, and profile (photo, name, password).
- **Notifications:** the bell with unread count, and a due-soon / overdue panel.
- **AI (shown only when the API has a Gemini key):** "Fill in from a bill" in the Add spending and Add bill forms, and "Plan with AI" on the Budget page for the head.

Light and dark themes, built for phone and desktop widths.

## Local setup

Requires Node.js 22+, pnpm, and [homewise-api](https://github.com/floydprabhat-creator/homewise-api) running (by default on port 4000).

```bash
cp .env.example .env.local   # API_URL=http://localhost:4000
pnpm install
pnpm dev                     # http://localhost:3000
```

Log in with the API's demo account (`demo@homewise.app` / `password123`, created by `pnpm db:seed` in the API).

## How it talks to the API

The browser only ever calls this app's own domain. `next.config.ts` rewrites `/api/*` to `API_URL`, so the session cookie stays first-party and no CORS setup is needed. `src/proxy.ts` sends logged-out visitors to `/login` based on the cookie alone; the API does the real session check.

Set `API_URL` before building, since the rewrite is read at build time.

## Code layout

| Folder | Holds |
| --- | --- |
| `src/app/` | Routes and layouts: `(auth)`, `(onboarding)` and `(app)` groups |
| `src/features/<name>/` | One feature's components, its TanStack Query hooks (`api.ts`) and its form schemas (`schemas.ts`) |
| `src/components/ui/` | Generic building blocks (button, field, modal, chip…), no data fetching |
| `src/components/layout/` | App shell, sidebar, header, logo, theme toggle |
| `src/lib/` | API client, query keys, formatting, dates |
| `src/types/` | API response types and constants mirrored from the API |

Forms check input with Zod for instant feedback; the API is the real check. Only a feature's `api.ts` calls the API.

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build and serve it |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |

## Deploying

Live at https://homewise-web-dusky.vercel.app, on Vercel. Pushes to `main` deploy automatically.

The only setting is `API_URL`, the API's public URL (now `https://homewise-api-5wmf.onrender.com`, with no trailing slash or `/api`). The API runs on Render's free plan, which sleeps when idle, so the first request after a quiet spell can take up to a minute.

## Commits

Subjects start with `feat:`, `add:` or `update:`.
