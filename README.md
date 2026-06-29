# Eflin Portfolio

Production-ready portfolio for graphic designer **Eflin** — editorial aesthetic, case studies, contact form, and safe image fallbacks.

**Live site:** _add your URL after deploy_

---

## Deploy this project

**Start here:** **[FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md)** — step-by-step from `.env.local` to Vercel, domain, and smoke tests.

Pre-launch QA: **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)**

---

## Overview

- **Homepage** — hero, selected works, about, services, showcase, contact
- **Work** — `/en/work` and `/tr/work` with filters; localized case studies at `/[locale]/work/[slug]`
- **Contact** — `/en/contact` and `/tr/contact` via Resend
- **i18n** — English (`en`) and Turkish (`tr`); locale cookie, hreflang, language switcher
- **Admin panel** — Portfolio editor at `/admin` with sidebar navigation, Media Library, draft autosave, validation health panel, and bilingual EN/TR editing. See **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**.
- **SEO** — sitemap, robots, JSON-LD, Open Graph (both locales)

Missing images show gradient placeholders — no broken layouts or 404s on assets.

---

## Tech stack

Next.js 15 · TypeScript · Tailwind CSS 4 · Framer Motion · JSON Admin · Resend · Vercel

---

## Commands

Run from the project root:

```bash
npm run dev              # Local development (http://localhost:3000)
npm run validate:assets  # Image audit report
npm run lint             # ESLint
npm run typecheck        # TypeScript
npm run build            # Production build
```

Also useful:

```bash
npm run start            # Serve production build locally
npm install              # Install dependencies
```

Strict asset validation (fail when images missing):

```bash
npm run validate:assets -- --strict
```

CI runs `validate:assets` → `lint` → `typecheck` → `build` on every push/PR.

---

## Local setup

```bash
git clone <repository-url>
cd eflin-portfolio
npm install
cp .env.example .env.local
npm run dev
```

See [`.env.example`](./.env.example) for variables. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env.local` to access `/admin`. Contact form works locally without `RESEND_API_KEY` — submissions log to the terminal.

---

## Documentation

| Document | Purpose |
|---|---|
| [FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md) | **Deploy to Vercel** — env, domain, tests |
| [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) | Full pre-launch QA |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Env reference, browsers, API security |
| [ASSET_GUIDE.md](./ASSET_GUIDE.md) | Image sizes, naming, compression |
| [REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md) | Replace a project with real work |
| [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) | Case study writing |
| [public/images/README.md](./public/images/README.md) | Image folder quick reference |

---

## Project structure

```
src/app/          Routes and API
src/app/[locale]/ Locale-scoped pages (en, tr)
src/components/   UI and sections
src/data/         Projects, site config
src/i18n/         Locales, dictionaries, navigation helpers
public/images/    Portfolio assets
scripts/          validate-assets.mjs
```

---

## Internationalization (i18n)

The site is bilingual: **English** (`en`) and **Turkish** (`tr`).

| Route | Purpose |
|---|---|
| `/` | Redirects to `/en` or `/tr` (cookie → browser language → English) |
| `/en`, `/tr` | Homepage |
| `/en/work`, `/tr/work` | Work index |
| `/en/work/[slug]`, `/tr/work/[slug]` | Case studies |
| `/en/contact`, `/tr/contact` | Contact |

Legacy paths `/work`, `/contact`, and `/work/[slug]` redirect to English equivalents.

**Edit UI copy:** `src/i18n/dictionaries/en.ts` and `src/i18n/dictionaries/tr.ts`  
**Edit project content (EN):** `src/data/projects.ts`  
**Edit project content (TR):** `src/data/projects-i18n-tr.ts` (keyed by slug)  
**Add a language later:** extend `locales` in `src/i18n/config.ts`, add a dictionary file, register it in `get-dictionary.ts`, and update sitemap/SEO helpers.

See [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for writing and localization workflow.

---

## License

Private portfolio project. All rights reserved.
