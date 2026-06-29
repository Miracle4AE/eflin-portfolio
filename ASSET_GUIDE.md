# Asset Guide

How to prepare, name, compress, and add portfolio images without breaking the site.

The portfolio resolves images at **build time**. Missing files never cause 404 errors — the site shows premium gradient placeholders instead. Adding real assets improves credibility; it does not change routes or architecture.

**Admin workflow:** In development, use **Media Library** at `/admin` to upload and pick images. See **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**. In production, commit files under `public/images/` and redeploy.

---

## Folder structure

```
public/images/
  portrait.jpg                 ← homepage hero (designer portrait)

  projects/
    nocturne/
      cover.jpg
      hero.jpg
      hero.mp4                 ← optional
      gallery-01.jpg
      gallery-02.jpg
      ...
    meridian/
      ...
    solstice/
    atlas/
    verdant/
    echo/
```

Project folder names **must match** the project `slug` in `content/site-content.json` (editable in `/admin` → Projects).

---

## Adding images via admin (development)

1. Run `npm run dev` and open `/admin` → **Media Library**.
2. Choose destination (portrait, cover, hero, gallery, or general) and project slug.
3. Drag & drop or choose a JPG, PNG, or WebP file.
4. In **Projects** or **Homepage**, click **Choose from Media Library** on the image field.
5. **Save** content JSON locally.

Upload limits (development):

| Type | Max size |
|---|---|
| Portrait | 800 KB |
| Cover / gallery / general | 1 MB |
| Hero | 1.5 MB |

**Production:** upload is disabled. Add files to `public/images/` locally, commit, push, and redeploy.

---

## Recommended dimensions

Export at these sizes (or larger at the same aspect ratio — the site scales down, never up).

| Asset | Dimensions | Aspect | Used on |
|---|---|---|---|
| `portrait.jpg` | **1200×1600** or **1600×2000** | 3:4 portrait | Homepage hero |
| `cover.jpg` | **1600×2000** or **2000×2500** | 3:4 portrait (typical) | Work grid cards, case study meta |
| `hero.jpg` | **2400×1600** or **3000×2000** | 3:2 / 16:9 wide | Case study hero, homepage showcase, Open Graph |
| Gallery — wide | **2400×1600** | 16:9 | First gallery image, full-bleed spreads |
| Gallery — portrait | **1600×2200** | ~3:4 | Vertical layouts, packaging |
| Gallery — landscape | **2000×1500** | 4:3 | Standard spreads |
| Gallery — square | **2000×2000** | 1:1 | Detail shots, logos |
| `hero.mp4` | **1920×1080** or **2160×1440** | 16:9 | Optional cinematic case study hero |

Match each project's `aspectRatio` field in `projects.ts` for `cover.jpg` (`portrait`, `landscape`, or `square`).

---

## File naming rules

| Rule | Example |
|---|---|
| Lowercase only | `cover.jpg` ✓ — `Cover.JPG` ✗ |
| Exact standard names | `cover.jpg`, `hero.jpg`, `hero.mp4` |
| Gallery sequence | `gallery-01.jpg`, `gallery-02.jpg`, … two-digit index |
| Hyphens, not underscores | `gallery-01.jpg` ✓ — `gallery_01.jpg` ✗ |
| No spaces | `hero.jpg` ✓ — `hero final.jpg` ✗ |
| JPG preferred | `.jpg` or `.webp` — avoid `.png` for photos |

Every `galleryItems[].file` value in `projects.ts` must match a real filename exactly.

---

## Cover image rules

The cover is the **thumbnail identity** of the project.

- Choose the single strongest still — readable at card size.
- Avoid fine type or small UI text; it will not read in the grid.
- Crop consistently across projects (similar margin / subject placement).
- Match the project's `aspectRatio` in data (`portrait`, `landscape`, `square`).
- One cover per project — always named `cover.jpg`.

---

## Hero image rules

The hero is the **opening statement** on the case study page and the homepage showcase (Nocturne by default).

- Use a wide composition — environmental, key spread, or flagship product shot.
- Keep critical subject matter centred; parallax and gradient overlays crop edges on mobile.
- This file is also used for **Open Graph** social previews — no extreme vertical crops.
- Always provide `hero.jpg` even if you add `hero.mp4` (video poster fallback).

---

## Gallery image rules

- **3–6 images per project** is ideal; minimum 3 for a credible case study.
- Vary aspect ratios (`wide`, `portrait`, `landscape`, `square`) — set in `galleryItems[].aspectRatio`.
- Write a short `caption` and descriptive `alt` for each item in `projects.ts`.
- Sequence tells a story: overview → detail → context → application.
- Do not upload duplicates of the same frame at different filenames.

---

## Portrait image rules

- Professional but not stock — muted tones fit the site palette.
- Face or upper body; avoid busy backgrounds.
- Same grading sensibility as project work (consistent colour temperature).
- Path: `public/images/portrait.jpg` only — no subfolder.

---

## Video hero rules

Optional file: `public/images/projects/[slug]/hero.mp4`

| Requirement | Detail |
|---|---|
| Format | MP4 (H.264), no audio required |
| Behaviour | Autoplay, muted, loop, inline (mobile-safe) |
| Poster | Always ship `hero.jpg` as fallback and poster frame |
| Duration | 5–15 seconds loop — no long reels |
| File size | Target **≤ 8 MB**, warn above 12 MB |
| Motion | Slow, stable — no rapid cuts or strobing |
| Accessibility | Reduced-motion users see `hero.jpg` automatically |

If the video fails to load, the site falls back to the poster image, then to the project gradient.

---

## Compression recommendations

| Asset | Target file size | Notes |
|---|---|---|
| `portrait.jpg` | ≤ 400 KB | Quality 80–85, sRGB |
| `cover.jpg` | ≤ 500 KB | Sharpen for web after resize |
| `hero.jpg` | ≤ 800 KB | Slightly higher quality OK — OG image |
| Gallery images | ≤ 400 KB each | Consistent export preset per project |
| `hero.mp4` | ≤ 8 MB | HandBrake or similar; 1080p sufficient |

**Export settings**

- Colour profile: **sRGB**
- Remove EXIF GPS / camera metadata before upload (optional privacy)
- Resize in Photoshop, Figma export, or Squoosh — never upload 6000px originals
- Use `2x` export for retina, then compress — do not rely on browser upscaling

**Tools**

- [Squoosh](https://squoosh.app) — JPG/WebP compression
- ImageOptim / TinyPNG — batch compression
- HandBrake — MP4 re-encode

---

## What not to upload

- **RAW, PSD, AI, INDD** — export flattened JPGs instead
- **PNG screenshots with transparency** for photos — use JPG unless logo on white
- **Uncompressed exports** — 5 MB+ JPGs slow the site and hurt Lighthouse scores
- **Wrong aspect ratios** stretched by CSS — crop before export
- **Watermarked comps** — use clean finals or tasteful mockups
- **Client-confidential unreleased work** without permission
- **Random filenames** — `IMG_4832.jpg`, `final-v3-new.jpg` will not be picked up

---

## Avoiding blurry images

1. **Export at or above recommended dimensions** — the site never upscales beyond `object-cover` crop.
2. **Match aspect ratio** to the slot (`aspectRatio` in data and CSS).
3. **Sharpen for web** at export size, not at full camera resolution.
4. **Do not over-compress** — banding in gradients and skies reads as cheap.
5. **Use `sizes` correctly** — already handled by components; your job is sufficient pixel density.
6. **Test on retina** — open `/work` at 100% and 200% zoom after adding files.

---

## Maintaining premium art direction

- **One grade per project** — match white balance and contrast across cover, hero, and gallery.
- **Restraint** — dark backgrounds, breathing room; avoid cluttered composites.
- **Typography in frame** — if showing type, ensure it is legible and intentional.
- **Physical craft** — photograph print, packaging, and paper when relevant.
- **Consistency across the portfolio** — six projects should feel like one author, six clients.

---

## Validate before deploy

```bash
npm run validate:assets
```

Reports missing files, oversized assets, bad names, and prints an expected manifest per project.

```bash
npm run validate:assets -- --strict
```

Exits with code 1 on warnings — useful in CI when assets should be complete.

Then:

```bash
npm run lint
npm run typecheck
npm run build
```

---

## Quick reference — current slugs

| Slug | Gallery files (from projects.ts) |
|---|---|
| nocturne | gallery-01 … gallery-04 |
| meridian | gallery-01 … gallery-03 |
| solstice | gallery-01 … gallery-04 |
| atlas | gallery-01 … gallery-03 |
| verdant | gallery-01 … gallery-03 |
| echo | gallery-01 … gallery-03 |

Run `npm run validate:assets` for the live manifest if `projects.ts` changes.

---

## Related docs

| Doc | Purpose |
|---|---|
| [FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md) | Deploy and post-deploy image test |
| [REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md) | Replace a project with real work |
| [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) | Case study copy |
| [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) | Full pre-launch QA |
| [public/images/README.md](./public/images/README.md) | Quick folder reminder |
