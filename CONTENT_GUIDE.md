# Portfolio Content Guide

A reference for writing, structuring, and replacing project content on the Eflin portfolio. Content is managed via the **JSON admin** at `/admin` (see **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**) or by editing `content/site-content.json` directly.

---

## Writing a Strong Case Study

A credible case study answers four questions in order:

1. **What is it?** — One sentence. Client, category, outcome.
2. **Why does it exist?** — The brief or strategic context. Not a mood board.
3. **What was hard?** — A real constraint: timeline, format, audience, production, brand politics.
4. **What did you do?** — Specific decisions: type choices, grid logic, colour rules, deliverables.

### Tone

- Write like a senior designer explaining the work to a creative director.
- Use concrete nouns: *wordmark*, *grid*, *poster*, *guidelines*, *UI component*.
- Keep paragraphs to 2–4 sentences. Case study fields are short by design.
- British/international English is fine (`colour`, `favour`) — stay consistent within a project.

### Avoid

- Empty superlatives: *world-class*, *cutting-edge*, *revolutionary*
- Repeated adjectives: *luxury*, *premium*, *cinematic*, *timeless*
- Vague claims: *elevated the brand*, *redefined the space*
- AI filler: *In today's fast-paced world…*
- Long essays — save depth for interviews, not the portfolio

### Field mapping

| Data field | UI label | Purpose |
|---|---|---|
| `summary` | Card + hero excerpt | One-line hook for grids and SEO |
| `concept` | Brief | The idea behind the work |
| `challenge` | Context | Constraints and problem |
| `solution` | Response | What you actually made |
| `visualDirection` | Art Direction | Look, feel, photographic or material rules |
| `typography` | Typography | Typefaces and how they are used |
| `palette[].name` | Colour Palette | Named swatches — use project-specific names, not generic labels |

---

## Project Titles

Good titles are **short, memorable, and category-neutral**.

| Strong | Weak |
|---|---|
| Nocturne | Luxury Fragrance Rebrand 2025 |
| Meridian | Art Book Design Project |
| Atlas | Travel Magazine Editorial |

Rules:

- One word or two at most
- No client name in the title (client goes in `client` field)
- No year in the title (year goes in `year` field)
- Title should work on a poster, not just in a spreadsheet

---

## Image Requirements

Dimensions, compression, naming, and video rules → **[ASSET_GUIDE.md](./ASSET_GUIDE.md)**

Replacement workflow → **[REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md)**

Missing files fall back to gradient placeholders — the site never breaks.

Validate anytime:

```bash
npm run validate:assets
```

---

## Alt Text

Write alt text as a **description of what is visible**, not marketing copy.

| Good | Bad |
|---|---|
| Nocturne fragrance carton and bottle label on black surface | Beautiful luxury packaging design |
| Meridian book interior spread with full-bleed photography | Stunning editorial layout |

Rules:

- Include project name once in the primary `images.imageAlt` field
- Gallery items: describe the specific frame (*poster series*, *mobile screen*, *label detail*)
- Do not start with *Image of* or *Photo of*
- Keep under ~125 characters where possible

---

## What Global Studios Expect

When applying to agencies, in-house teams, or cultural institutions, reviewers typically scan for:

1. **Role clarity** — What you did vs. what a team did. Use `role` honestly (*Lead Designer*, *Art Director*, *Editorial Designer*).
2. **Process, not just outcome** — Brief / context / response structure shows how you think.
3. **System thinking** — Guidelines, grids, templates, component logic — not one hero image.
4. **Typographic discipline** — Name typefaces and explain hierarchy.
5. **Restraint** — Six strong projects beat fifteen mediocre ones.
6. **Live links** — If the work is public, add a URL later (field can be extended when needed).
7. **Consistency** — Same structure across all case studies makes the portfolio feel authored.

---

## Replacing Placeholder Content

Full step-by-step (data fields, images, test, deploy) → **[REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md)**

Quick summary:

1. Edit project block in `src/data/projects.ts` (English)
2. Add Turkish strings in `src/data/projects-i18n-tr.ts` if publishing both locales
2. Add images per **ASSET_GUIDE.md**
3. `npm run dev` → visual check
4. `npm run validate:assets` → `npm run build`
5. Deploy per **FINAL_DEPLOY_STEPS.md**

---

## Microcopy Reference

Site-wide UI strings live in the i18n dictionaries:

- **English:** `src/i18n/dictionaries/en.ts`
- **Turkish:** `src/i18n/dictionaries/tr.ts`

Update labels there — not scattered in components — to keep wording consistent across the site.

Key labels:

- **Selected Works** — Work index and navigation (`work.indexTitle`, `caseStudy.allWorks`)
- **View Case Study** — Card and link aria labels
- **Project Overview** — Case study meta block
- **Process Notes** — Brief / Context / Response section
- **Design System** — Typography, art direction, palette
- **Next Project** — Case study footer navigation
- **Start a Conversation** — Contact section heading

---

## Localization (English & Turkish)

The portfolio serves international studios and Turkish clients with locale-based routes (`/en`, `/tr`).

### UI copy

| Language | File |
|---|---|
| English | `src/i18n/dictionaries/en.ts` |
| Turkish | `src/i18n/dictionaries/tr.ts` |

Both files share the same typed structure (`src/i18n/types.ts`). Add or edit keys in English first, then mirror in Turkish with natural, professional phrasing — not word-for-word translation.

### Project content

| Language | File | Notes |
|---|---|---|
| English | `src/data/projects.ts` | Source of truth; slug, images, palette hex, year stay here |
| Turkish | `src/data/projects-i18n-tr.ts` | Localized strings keyed by project `slug` |

Shared fields (slug, category key, filterCategory, year, featured, image paths, aspect ratios) remain in `projects.ts`. Only translatable text lives in the TR overlay.

### Categories

Filter keys are stable (`branding`, `editorial`, `identity`, etc.). Labels appear in `dictionaries/*/categories` for the work index filters.

### Adding a third language later

1. Add locale code to `src/i18n/config.ts`
2. Create `src/i18n/dictionaries/[locale].ts`
3. Register in `src/i18n/get-dictionary.ts`
4. Add project translations file if needed (same pattern as `projects-i18n-tr.ts`)
5. Update `sitemap.ts` and verify hreflang in `src/lib/seo.ts`

### Locale routes

- `/` redirects using cookie `eflin_locale`, then `Accept-Language` (Turkish → `/tr`, else `/en`)
- Language switcher in the header keeps the current page path when switching
- Old routes `/work` and `/contact` redirect to `/en/work` and `/en/contact`

---

## Checklist Before Sending to a Studio

- [ ] Every featured project has real images (not gradient fallbacks)
- [ ] Summaries are distinct — no copy-paste between projects
- [ ] Client names and roles are accurate
- [ ] Alt text is written for every image
- [ ] No placeholder lorem or generic AI phrasing
- [ ] `/en/work`, `/tr/work`, and all `/[locale]/work/[slug]` routes build without errors
- [ ] Contact form tested on production URL — see **FINAL_DEPLOY_STEPS.md** step 7
- [ ] `NEXT_PUBLIC_SITE_URL` set to live domain before deploy

---

## Suggested Next Phase

After content is in place:

1. **Real photography** — Replace gradient fallbacks project by project
2. **Portrait** — Add `public/images/portrait.jpg` for the homepage hero
3. **CMS or MDX** — When project count grows beyond manual editing comfort
4. **Analytics review** — Check `@vercel/analytics` after first month live
5. **PDF case studies** — Optional downloadable sheets for recruitment packets
