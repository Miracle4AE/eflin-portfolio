# Admin Guide — Eflin Portfolio

This portfolio uses a **self-contained JSON admin** at `/admin`. No external CMS, no Sanity, no third-party content API.

Content lives in **`content/site-content.json`** (development) or **Vercel Blob** (production when configured). The public site reads the latest stored JSON at runtime. If storage is missing or invalid, static TypeScript fallback data in `src/data/` is used instead.

---

## For the portfolio owner

1. Open **`/admin`** on your site (e.g. `http://localhost:3000/admin`).
2. Sign in with your **username and password** (set in `.env.local` or your host environment).
3. Edit **Homepage**, **Projects**, **Media Library**, **Health**, **Settings**, or **Export** from the sidebar.
4. Use **Choose from Media Library** on image fields instead of typing paths by hand.
5. Click **Save changes** — writes locally in development, or to Vercel Blob in production when configured. **Export JSON** remains available as a backup.

You never edit TypeScript or React files for day-to-day content changes.

---

## Admin sections

| Section | What you can edit |
|---|---|
| **Dashboard** | Overview cards, quick actions, preview links, content health summary |
| **Homepage** | Identity, hero, about, services, showcase, contact, footer, social, SEO — grouped sections |
| **Projects** | Search, filters, completion score, collapsible EN/TR/media/SEO editors, live preview |
| **Media Library** | Browse thumbnails, copy paths, upload in development, filter by project/type |
| **Health** | Validation panel — errors, warnings, suggestions |
| **Settings** | Email, phone, location, availability |
| **Export** | Download JSON, timestamped backup, import with diff preview |

---

## Draft safety

The editor automatically saves a **local draft** to your browser every ~12 seconds while you edit.

- If you return to `/admin` after closing the tab, you may see **Restore draft**
- **Reset changes** reverts to the last saved version
- Leaving with unsaved changes triggers a browser warning
- Use **Backup** in the header before resetting if you want a JSON file

---

## Preview links

Use **Preview Homepage EN/TR**, **Preview Work**, or per-project preview buttons to open the live site in a new tab while editing.

---

## Project completion score

Each project shows **Content**, **Images**, and **SEO** completion percentages so you can see what still needs work before publishing.

---

## Bilingual fields (EN / TR)

Most editable text uses `{ "en": "...", "tr": "..." }` in the JSON file. The admin shows side-by-side EN and TR inputs. If Turkish is empty on the public site, English is used as fallback.

---

## Images & Media Library

### Choose from library (recommended)

On **Homepage**, **Projects**, **SEO**, and gallery fields, click **Choose from Media Library**. Pick a thumbnail — the path fills in automatically.

### Media Library section

Open **Media Library** in the admin sidebar to:

- See all images under `public/images/`
- Filter by type (portrait, cover, hero, gallery, other) or project slug
- Copy a path with one click
- **Upload in development** — drag & drop JPG, PNG, or WebP

### Development upload

When running `npm run dev`, you can upload directly in **Media Library**:

| Destination | Saves as |
|---|---|
| Portrait | `/images/portrait.jpg` |
| Project cover | `/images/projects/[slug]/cover.jpg` |
| Project hero | `/images/projects/[slug]/hero.jpg` |
| Project gallery | `/images/projects/[slug]/gallery-01.jpg` (auto-numbered) |
| General | `/images/general/[filename]` |

**Production:** uploads are disabled. Add files locally, commit `public/images/`, export JSON, and redeploy — or configure external storage later.

### Manual paths (still supported)

You can still type paths like `/images/projects/nocturne/cover.jpg` if you added files via Finder/Explorer.

The site uses gradient placeholders when image files are missing.

### Recommended sizes

See **[ASSET_GUIDE.md](./ASSET_GUIDE.md)** for dimensions and compression targets.

---

## Content warnings

When saving or loading content, the admin may show **warnings** (not blockers) for:

- Image paths that do not exist locally
- Gallery items missing alt text
- Duplicate gallery images in one project
- Featured projects missing cover or hero paths

Fix warnings before exporting for production when possible.

---

## Health / validation panel

Open **Health** in the sidebar for a full content audit:

| Severity | Examples |
|---|---|
| **Errors** | Missing required fields, duplicate slugs |
| **Warnings** | Missing EN/TR copy, SEO too short/long, missing images |
| **Suggestions** | Missing alt text, broken image paths, gallery tips |

Click an issue to jump to the relevant section when possible.

---

## Export & import backup

In **Export**:

1. **Download JSON** — current editor state
2. **Download backup** — same file with a timestamp in the filename
3. **Import JSON** — validates structure, shows a diff summary (projects added/removed, field changes), then asks for confirmation before replacing content

Recommended workflow before risky edits: **Backup → edit → Save or Import**.

---

### Development (`npm run dev`)

- **Save changes** writes directly to `content/site-content.json` on your machine.
- Restart is not required; refresh the public site to see changes.

### Production (Vercel)

When a **Vercel Blob store is connected** to the project (OIDC via `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`):

- **Save changes** writes `site-content.json` to Vercel Blob.
- The public site reads from Blob on each request (with local/fallback backup).
- Pages are revalidated automatically after save — no redeploy required for content edits.

If Blob access is **not available**:

- The Save button is disabled with a clear message.
- Use **Export → Download JSON** as a backup workflow:
  1. Edit in `/admin`
  2. **Export / Import → Download site-content.json**
  3. Replace `content/site-content.json` in the repo
  4. Commit, push — Vercel rebuilds with new content

#### Set up Vercel Blob (one-time)

1. **Vercel Dashboard → Storage**
2. **Create Blob store**
3. **Connect** the store to this project
4. Confirm **`BLOB_STORE_ID`**, **`VERCEL_OIDC_TOKEN`**, and **`BLOB_WEBHOOK_PUBLIC_KEY`** appear under **Settings → Environment Variables**
5. **Redeploy**
6. Open **`/admin`**, edit content, click **Save changes**, then verify `/en` and `/tr`

---

## Environment variables

| Variable | Purpose |
|---|---|
| `ADMIN_USERNAME` | Required — admin login username |
| `ADMIN_PASSWORD` | Required — admin login password |
| `BLOB_STORE_ID` | Production Save — added when Blob store is connected |
| `VERCEL_OIDC_TOKEN` | Production Save — short-lived token on Vercel deployments |
| `BLOB_WEBHOOK_PUBLIC_KEY` | Blob webhook verification (added with connected store) |
| `ADMIN_ENABLE_FILE_WRITE` | Legacy — allow POST save to disk in production (prefer Blob) |

Add both credentials to **`.env.local`** for local development:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Ae080919
```

The admin panel **always requires login** in development and production. If either variable is missing, `/admin` is unavailable.

Credentials are verified server-side only and never exposed to the browser.

---

## Adding a project

1. Go to **Projects → + Add**
2. Set a unique **slug** (lowercase, hyphens only)
3. Fill EN/TR copy and metadata
4. Set image paths under `public/images/projects/[slug]/`
5. Toggle **Featured** if it should appear on the homepage
6. Save or export JSON

---

## Developer setup

Generate initial JSON from static fallback data:

```bash
npm run generate:content
```

This writes `content/site-content.json`. Commit it to the repo.

Regenerate after changing static seed data in `src/data/`.

---

## Limitations

- **Production media upload** disabled — use local dev upload + git commit
- Nav labels and form validation messages remain in code dictionaries (UI chrome)
- Export JSON remains the fallback when Blob is not configured

## Related docs

- [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) — writing case studies
- [FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md) — deploy checklist
- [ASSET_GUIDE.md](./ASSET_GUIDE.md) — preparing images
