# Deployment Reference

Technical reference for hosting, environment variables, browser support, and API security.

**First-time deploy:** use **[FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md)** instead of this file.

**Full QA:** **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)**

---

## Environment variables

Copy `.env.example` to `.env.local` for local development.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | Public URL, e.g. `https://yourdomain.com` (no trailing slash) |
| `RESEND_API_KEY` | Production | Resend API key for contact form |
| `CONTACT_TO_EMAIL` | Production | Inbox for form submissions |
| `CONTACT_FROM_EMAIL` | Production | Verified sender in Resend |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Optional | `true` to enable Vercel Analytics |
| `ADMIN_PASSWORD` | Production | Protects `/admin` content panel |
| `BLOB_STORE_ID` | Production Save | Blob store id (auto-added when store is connected) |
| `VERCEL_OIDC_TOKEN` | Production Save | Short-lived OIDC token on Vercel (auto-rotated) |
| `BLOB_WEBHOOK_PUBLIC_KEY` | Production | Webhook verification for Blob uploads |
| `ADMIN_ENABLE_FILE_WRITE` | Optional | Legacy disk write in production (prefer Blob) |

See **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** for the JSON admin workflow. Content is stored in Vercel Blob in production (when connected) or `content/site-content.json` locally; static data in `src/data/` is fallback only.

### Vercel Blob setup (production Save)

1. **Vercel Dashboard → Storage → Create Blob store**
2. **Connect** the store to this project
3. Confirm **`BLOB_STORE_ID`**, **`VERCEL_OIDC_TOKEN`**, and **`BLOB_WEBHOOK_PUBLIC_KEY`** under **Settings → Environment Variables**
4. **Redeploy**
5. Test **`/admin` → Save changes** and verify `/en` / `/tr` update

Export JSON in the admin panel remains a backup if Blob access fails.

### Local contact form

Without `RESEND_API_KEY`, submissions are validated and logged to the server console. No email is sent.

---

## Portfolio images

Specifications: **[ASSET_GUIDE.md](./ASSET_GUIDE.md)**  
Replacement workflow: **[REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md)**

```
public/images/portrait.jpg
public/images/projects/[slug]/cover.jpg
public/images/projects/[slug]/hero.jpg
public/images/projects/[slug]/gallery-01.jpg
public/images/projects/[slug]/hero.mp4   (optional)
```

Images resolve at **build time**. After changes: `npm run validate:assets` → `npm run build` → push → Vercel redeploys.

---

## Vercel

- Framework: Next.js (auto-detected)
- Build: `npm run build`
- CI: `.github/workflows/ci.yml`

Deploy procedure: **[FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md)** steps 3–6.

---

## Browser compatibility

### Supported browsers

| Browser | Minimum |
|---|---|
| Chrome, Edge, Firefox | Last 2 versions |
| Safari | Last 2 versions (iOS 15+ recommended) |

Internet Explorer is not supported. JavaScript is required for navigation, motion, contact form, and gallery lightbox. Core content is server-rendered.

### Reduced motion

When `prefers-reduced-motion: reduce` is set:

- Video hero skipped — static `hero.jpg` or gradient
- No custom cursor or scroll progress bar
- Static ambient gradients (no Framer Motion loops)

### Custom cursor

Desktop-only (`pointer: fine`). Disabled on touch devices and when reduced motion is preferred. Loaded via dynamic import to limit mobile bundle size.

### Video hero fallback

1. Reduced motion → `hero.jpg`  
2. Video error → poster image  
3. No poster → gradient with accessible label  

Video is muted, looped, and inline-safe for mobile.

---

## Contact API security

`POST /api/contact` only — other methods return `405`.

- JSON body capped at 10 KB
- Honeypot field rejects bots
- Server-side validation with field length limits
- Generic production error messages
- In-memory rate limit: 5 requests / IP / hour (best-effort on serverless)
- Form payload includes `locale` (`en` or `tr`); confirmation emails note the submission language

For production-grade rate limiting, use [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or [Upstash Redis](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview). See `src/lib/rate-limit.ts`.

---

## Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/en` or `/tr` (locale cookie → browser language → English) |
| `/en`, `/tr` | Homepage |
| `/en/work`, `/tr/work` | Project index |
| `/en/work/[slug]`, `/tr/work/[slug]` | Case study |
| `/en/contact`, `/tr/contact` | Contact form |
| `/work`, `/contact`, `/work/[slug]` | Legacy redirects to English locale |
| `/sitemap.xml` | Dynamic sitemap (both locales) |
| `/robots.txt` | Robots rules |
| `/api/contact` | Form API (POST only) |

---

## Internationalization

- Locales: `en` (default), `tr`
- UI copy: `src/i18n/dictionaries/en.ts`, `src/i18n/dictionaries/tr.ts`
- Project content (TR): `src/data/projects-i18n-tr.ts`
- Locale cookie: `eflin_locale` (set by language switcher)
- SEO: canonical URLs and `hreflang` alternates (`en`, `tr`, `x-default`) via `src/lib/seo.ts`

See [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for editing copy and adding languages.

---

## Commands

See [README.md](./README.md) for the full command list.

Strict asset validation:

```bash
npm run validate:assets -- --strict
```
