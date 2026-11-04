# 株式会社アクシス — Corporate Website

The corporate site of 株式会社アクシス (AXIS), built with [Next.js](https://nextjs.org) (App Router), Tailwind CSS and TypeScript.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site runs with no environment variables.

## Pages

| Route         | Page                                    |
| ------------- | --------------------------------------- |
| `/`           | Home                                    |
| `/service`    | Services                                |
| `/works`      | Work & case studies                     |
| `/technology` | Technology stack and development flow   |
| `/about`      | Company profile, mission, access map    |
| `/career`     | Careers                                 |
| `/contact`    | Contact form and access map             |
| `/privacy`    | Privacy policy                          |

## Where things live

- `lib/company.ts` — company name, address, Lancers URL and the Google Map link.
- `lib/i18n/ja.ts`, `lib/i18n/en.ts` — all wording, in Japanese and English.
- `lib/navigation.ts` — the main menu.
- `lib/portfolio/seed-data.ts` — the work list shown on `/works`; screenshots are in `public/sites`.
- `lib/portfolio/local-images.json` — list of available screenshots, regenerated before every build by `scripts/generate-portfolio-images.mjs`.
- `app/globals.css` — colours for the white (default) and space themes.
- `scripts/generate-icons.mjs` — rebuilds the favicon and app icons from `public/propile_avatar.png`.

## Environment variables (optional)

Nothing is required. Create `.env.local` only to turn these features on:

| Variable                                                      | Enables                                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`            | Sending the contact form by email. Without them the form asks visitors to use the Lancers profile.   |
| `CONTACT_EMAIL_TO`                                            | Where contact emails are delivered (defaults to `SMTP_USER`).                                        |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`             | Loading the work list from Supabase instead of `lib/portfolio/seed-data.ts`.                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `HIRAI_ADMIN_KEY`     | The work-list admin screen at `/hirai`.                                                              |

`.env*` files are git-ignored; never commit real keys.

## Deploying to Vercel

Connect the GitHub repo in the Vercel dashboard. `vercel.json` sets install/build commands that clear an injected `npm_config_cache_dir` env var current npm rejects. Node.js 24 comes from `engines` in `package.json`.

To turn on the optional features above, add the same variables under **Project → Settings → Environment Variables** and redeploy.

Server code must never read files from `public/` (for example with `fs` and `process.cwd()`). That makes Next.js copy the whole folder (300MB+ of images and video) into the serverless function and can fail Vercel’s function size limit. `public/` is served by the CDN; `next.config.ts` excludes it from the server bundle.
