# Final Deploy Steps

Step-by-step guide to go from your machine to a live portfolio on Vercel. No developer required after the first GitHub push.

**Related:** [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) (full QA) · [DEPLOYMENT.md](./DEPLOYMENT.md) (env reference, browser notes)

---

## Before you start

- [ ] Node.js 20+ installed ([nodejs.org](https://nodejs.org))
- [ ] GitHub account
- [ ] Vercel account (sign in with GitHub)
- [ ] Resend account for contact email ([resend.com](https://resend.com)) — free tier is enough to start

---

## Step 1 — Create `.env.local`

In the project root, copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Contact form — optional locally (messages log to terminal without a key)
RESEND_API_KEY=
CONTACT_TO_EMAIL=your-inbox@example.com
CONTACT_FROM_EMAIL=Your Name <onboarding@resend.dev>

# Analytics — optional
NEXT_PUBLIC_ANALYTICS_ENABLED=false

# Admin panel (see ADMIN_GUIDE.md)
ADMIN_PASSWORD=
ADMIN_ENABLE_FILE_WRITE=false
```

**Important:** Never commit `.env.local`. It is already in `.gitignore`.

For local testing, you can leave `RESEND_API_KEY` empty — the form still validates; output appears in the terminal where `npm run dev` is running.

---

## Step 2 — Install and run local checks

From the project folder:

```bash
npm install
npm run validate:assets
npm run lint
npm run typecheck
npm run build
```

| Command | What it checks |
|---|---|
| `npm run validate:assets` | Missing or oversized images (warnings OK before real photos are added) |
| `npm run lint` | Code quality |
| `npm run typecheck` | TypeScript errors |
| `npm run build` | Production build (same as Vercel) |

All four must pass before deploying.

Preview locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — verify `/` redirects, then click through `/en`, `/en/work`, one case study, `/en/contact`. Switch to Turkish with the header language toggle and confirm `/tr` routes load the same pages.

Open `/admin` — edit content or export JSON. In development, Save writes to `content/site-content.json`.

Optional production preview:

```bash
npm run start
```

---

## Step 3 — Push to GitHub

If the repo is not on GitHub yet:

```bash
git init
git add .
git commit -m "Initial portfolio deploy"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

If CI is enabled (`.github/workflows/ci.yml`), confirm the workflow is green on GitHub before deploying.

---

## Step 4 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` (default)
5. Output directory: default (leave empty)
6. **Do not deploy yet** — add environment variables first (Step 5), then click **Deploy**

After deploy, Vercel gives you a URL like `https://your-project.vercel.app`.

---

## Step 5 — Environment variables in Vercel

In Vercel: **Project → Settings → Environment Variables**

Add these for **Production** (and Preview if you want contact form on preview URLs):

| Variable | Value | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your live URL, e.g. `https://yourdomain.com` (no trailing slash) | Yes |
| `RESEND_API_KEY` | From Resend dashboard → API Keys | Yes (production contact) |
| `CONTACT_TO_EMAIL` | Where form submissions arrive | Yes |
| `CONTACT_FROM_EMAIL` | Verified sender in Resend, e.g. `Eflin <hello@yourdomain.com>` | Yes |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `true` to enable Vercel Analytics | Optional |
| `ADMIN_PASSWORD` | Protects `/admin` in production | Yes (production) |
| `ADMIN_ENABLE_FILE_WRITE` | Allow server save on production hosts | Optional |

After adding or changing variables, ** redeploy** (Deployments → ⋯ → Redeploy) so the build picks up `NEXT_PUBLIC_SITE_URL`.

**Resend setup:** Verify your sending domain in Resend before using a custom `@yourdomain.com` from address. Until then, use Resend’s test sender shown in their dashboard.

---

## Step 6 — Custom domain (optional)

1. Vercel → **Project → Settings → Domains**
2. Add your domain (e.g. `eflin.studio` or `www.yourdomain.com`)
3. Follow Vercel’s DNS instructions at your registrar (A/CNAME records)
4. Wait for SSL (usually a few minutes)
5. Update `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com` and **redeploy**

---

## Step 7 — Test the contact form

On your **production URL** (not localhost):

1. Open `/en/contact` (or `/tr/contact`)
2. Fill out the form with a real test message
3. Confirm the success message appears
4. Check `CONTACT_TO_EMAIL` inbox (and spam folder)
5. Try an invalid email — field error should show, not a crash

If the form says unavailable: check `RESEND_API_KEY` is set and redeploy. Check Vercel **Functions** logs for errors.

---

## Step 8 — Test sitemap and robots

Replace `YOUR_DOMAIN` with your live domain:

| URL | Expected |
|---|---|
| `https://YOUR_DOMAIN/sitemap.xml` | XML listing `/en`, `/tr`, work index, contact, and all localized `/[locale]/work/[slug]` pages |
| `https://YOUR_DOMAIN/robots.txt` | Allows crawlers; references sitemap URL |

Confirm sitemap URLs use your production domain (not `localhost`) — if not, fix `NEXT_PUBLIC_SITE_URL` and redeploy.

---

## Step 9 — Test images

**Before real photos:** Gradient placeholders are normal. The site should look complete, not broken.

**After adding images** (see [ASSET_GUIDE.md](./ASSET_GUIDE.md)):

1. Place files in `public/images/` per project slug
2. Run locally:

```bash
npm run validate:assets
npm run build
```

3. Commit, push — Vercel redeploys automatically
4. On production, check `/en/work`, `/tr/work`, case study heroes, and gallery lightbox

Images are resolved at **build time**. A redeploy is required after every image change.

---

## Step 10 — After changing images

Every time you add or replace portfolio files:

1. Save JPGs to `public/images/projects/[slug]/`
2. `npm run validate:assets` — fix warnings
3. `npm run build` — must pass locally
4. `git add` → `git commit` → `git push`
5. Wait for Vercel deploy to finish
6. Hard-refresh the live page (Ctrl+Shift+R) to clear cache

Optional strict check when all assets should exist:

```bash
npm run validate:assets -- --strict
```

---

## Step 11 — Before sending the link to studios

Quick final pass on production URL:

- [ ] Homepage (`/en`, `/tr`), work index, and at least two case studies load cleanly in both locales
- [ ] Language switcher keeps the same page when toggling EN ↔ TR
- [ ] Legacy `/work` and `/contact` redirect to English routes
- [ ] Contact form delivers email to your inbox
- [ ] `/sitemap.xml` shows correct domain
- [ ] Link preview looks right (paste URL in iMessage, Slack, or [opengraph.xyz](https://www.opengraph.xyz))
- [ ] Mobile check on phone — menu, gallery, form usable
- [ ] Social links in footer point to your real profiles (`src/data/site.ts`)

For the full QA list, use **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)**.

For replacing placeholder projects with real work: **[REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md)**.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails on Vercel | Run `npm run build` locally; fix errors; push again |
| Sitemap shows localhost | Set `NEXT_PUBLIC_SITE_URL` in Vercel; redeploy |
| Contact form 503 | Add `RESEND_API_KEY`; verify sender in Resend |
| Images still gradients after upload | Wrong filename or folder; run `validate:assets`; redeploy |
| Old content after push | Wait for deploy; hard-refresh browser |
| `/admin` blocked in production | Set `ADMIN_PASSWORD` in Vercel env; redeploy |

---

## Documentation map

| Doc | When to use |
|---|---|
| **FINAL_DEPLOY_STEPS.md** (this file) | First deploy |
| [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) | Full pre-launch QA |
| [ASSET_GUIDE.md](./ASSET_GUIDE.md) | Preparing images |
| [REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md) | Adding a real project |
| [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) | Writing case study copy |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Env vars, browsers, API security |
| [README.md](./README.md) | Project overview and commands |

**Deployed URL:** ___________________________

**Date:** ___________________________
