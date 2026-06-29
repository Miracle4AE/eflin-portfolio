# Real Project Checklist

Use this when replacing one placeholder project with real work. No CMS required. Routes stay the same — only data and images change.

Estimated time: **1–2 hours** per project (export, copy, upload, test).

---

## Before you start

- [ ] Read **ASSET_GUIDE.md** (dimensions, naming, compression)
- [ ] Have final JPG exports ready (cover, hero, gallery)
- [ ] Confirm you have rights to show the work publicly
- [ ] Know the project `slug` or choose a new one (lowercase, hyphenated)

---

## Step 1 — Duplicate or edit project data

Open `src/data/projects.ts`.

**Option A — Replace placeholder:** Find the project block (e.g. `verdant`) and update in place.

**Option B — New project:** Copy an existing `{ ... }` block, paste at end of array, change `slug` and all fields.

### Text fields to edit

| Field | What to write |
|---|---|
| `slug` | URL segment — `my-project` → `/work/my-project` |
| `title` | Short project name |
| `category` | Display label — e.g. `Brand Identity` |
| `filterCategory` | Must match `src/data/categories.ts` |
| `year` | Completion year |
| `role` | Your role — honest and specific |
| `client` | `Client Name · City` |
| `summary` | One sentence for cards and SEO |
| `description` | Usually same as summary |
| `concept` | Brief — the idea |
| `challenge` | Context — constraints |
| `solution` | Response — what you delivered |
| `visualDirection` | Art direction notes |
| `typography` | Typefaces and usage |
| `palette` | Named colour swatches with hex |
| `tags` | 2–4 discipline tags |
| `galleryItems` | Array of gallery entries (see Step 3) |
| `images.imageAlt` | Primary alt text for project |
| `featured` | `true` = homepage + featured grid |
| `aspectRatio` | Cover card ratio: `portrait` \| `landscape` \| `square` |

See **CONTENT_GUIDE.md** for tone and writing rules.

---

## Step 2 — Create image folder

```text
public/images/projects/[slug]/
```

Example:

```text
public/images/projects/nocturne/
  cover.jpg
  hero.jpg
  gallery-01.jpg
  gallery-02.jpg
  gallery-03.jpg
  gallery-04.jpg
  hero.mp4          ← optional
```

Also ensure site portrait exists when ready:

```text
public/images/portrait.jpg
```

---

## Step 3 — Match galleryItems to files

Each gallery entry in `projects.ts` needs:

```typescript
{
  id: "n1",                    // unique within project
  file: "gallery-01.jpg",      // must exist on disk
  gradient: "from-[#...] ...", // fallback if file missing
  aspectRatio: "wide",         // wide | portrait | landscape | square
  caption: "Short label",
  alt: "Descriptive alt text",
}
```

Filename in `file` must **exactly** match the uploaded file.

---

## Step 4 — Test locally

```bash
npm run dev
```

Visit and check:

| URL | Check |
|---|---|
| `/work` | Card shows cover (or gradient if missing) |
| `/work/[slug]` | Hero, meta, gallery, design system |
| `/` | Project appears if `featured: true` |
| Mobile width | Images crop correctly |

Click every gallery image — lightbox should open without errors.

---

## Step 5 — Run asset validation

```bash
npm run validate:assets
```

Fix any **Warnings**:

- Missing `cover.jpg`, `hero.jpg`, or gallery files
- Oversized files — recompress per ASSET_GUIDE.md
- Wrong filenames — rename to lowercase convention

Review **Info** lines for empty placeholder folders or unreferenced files.

---

## Step 6 — Rebuild

```bash
npm run validate:assets
npm run lint
npm run typecheck
npm run build
```

Build must complete with no errors. Images are resolved at build time — a fresh build picks up new files.

---

## Step 7 — Deploy

Follow **[FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md)** steps 3–11 (push, Vercel, env vars, production tests).

After deploy, confirm real images load on production (not just locally).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Gradient instead of photo | Wrong path or filename — run `validate:assets` |
| Image looks soft | Export larger / sharpen — see ASSET_GUIDE.md |
| Gallery item missing | `file` in `projects.ts` does not match disk name |
| Project not in filter | Wrong `filterCategory` value |
| Video hero not playing | File must be MP4 H.264; provide `hero.jpg` poster |
| Build error | Run `npm run typecheck` — usually unrelated to images |

---

## One-page summary

1. Edit `src/data/projects.ts`
2. Add files to `public/images/projects/[slug]/`
3. `npm run dev` → visual check
4. `npm run validate:assets`
5. `npm run build`
6. Deploy — **FINAL_DEPLOY_STEPS.md**

The site never breaks from missing images — but real assets are what make the portfolio credible.
