# Design Audit — Eflin Portfolio

**Audit date:** June 2026  
**Scope:** Public portfolio + custom admin panel  
**Standard assumed:** World-class editorial portfolio (Apple / Pentagram / Linear tier)  
**Method:** Code review, component audit, WCAG 2.1 AA checklist, performance heuristics — no Lighthouse run

This audit is intentionally critical. The project is feature-complete and visually competent. It is **not** yet at the level where a top design studio would ship it without revision.

---

# Overall score

| Area | Score | Verdict |
|------|-------|---------|
| **Public portfolio** | **6.8 / 10** | Strong mood and motion craft; weak design-system discipline and accessibility |
| **Admin panel** | **6.2 / 10** | Functional CMS; feels like a developer tool dressed in portfolio colors |
| **Motion system** | **7.5 / 10** | Coherent easing; over-applied and not fully tokenized |
| **Design system** | **5.5 / 10** | Tokens exist; implementation is fragmented |
| **Accessibility** | **5.0 / 10** | Effort visible; would fail a formal WCAG AA audit |
| **Performance** | **6.5 / 10** | Reasonable for a motion portfolio; client boundary too wide |

**Composite: 6.3 / 10** — Good indie/agency portfolio. Not yet “world-class.”

---

# Public portfolio — section scores

Each score reflects **visual polish + UX + consistency + accessibility** together.

| Section | Score | Why |
|---------|-------|-----|
| **Hero** | **8 / 10** | Strong composition: clamp typography, 12-col grid, portrait + atmosphere. Letter stagger is memorable. Weaknesses: hardcoded gradient hex outside tokens; scroll indicator infinite bounce ignores reduced-motion nuance; `aria-label="Introduction"` is generic; hero competes with custom cursor for attention. |
| **Featured Works** | **7 / 10** | Editorial card grid works; hover overlay is elegant on desktop. **Broken `aria-labelledby="work-heading"`** — `SectionHeading` never assigns that id. Touch users never see overlay metadata — acceptable trade-off only if summary is visible elsewhere (it isn’t on card face). |
| **About** | **7 / 10** | 12-col split reads well. Same broken `aria-labelledby="about-heading"`. Body `leading-[1.85]` differs from other sections’ `leading-relaxed` — subtle rhythm break. |
| **Services** | **6 / 10** | Missing `border-t` that every other homepage section has — visual seam gap. Number + title hover is thin interaction design. Label tracking inconsistent with Hero (`0.3em` vs `0.15em`). |
| **Project Showcase** | **7 / 10** | Reuses card language well. Spacing matches Featured Works but grid gap values differ (`gap-y-16` vs `gap-y-14` elsewhere) — pixel-level inconsistency. |
| **Contact (homepage + page)** | **6.5 / 10** | Contact page H2 scale (`lg:text-7xl`) overshoots `SectionHeading` scale — three headline systems on one site. Form uses inline styles, not shared `Button`. Placeholder at `muted/50` likely fails contrast. Errors lack `aria-describedby`. |
| **Work index** | **7.5 / 10** | Best information architecture on the site. Category filter animation (`layoutId`) is polished. Filters lack `aria-pressed`, focus styles, and selected-state semantics. `lg:grid-cols-12` underused — cards don’t fully exploit editorial grid. |
| **Case study — Hero** | **8 / 10** | Scale hierarchy appropriate for detail page. Video → poster fallback with reduced motion is thoughtful. Scroll line animation redundant with global scroll progress. |
| **Case study — Meta / Narrative** | **7 / 10** | Readable long-form. Meta labels at `text-[10px]` push contrast limits on `#050505`. Narrative 3-col grid good on desktop; mobile stack is long with no jump links. |
| **Case study — Gallery** | **7 / 10** | Lightbox keyboard support exists. **No focus trap** — Tab escapes modal. Missing top border vs sibling sections. |
| **Case study — Navigation** | **6 / 10** | “Back” link has weaker focus treatment than “Next”. Asymmetric hover states. Fine functionally; feels rushed compared to Hero. |
| **Header** | **6.5 / 10** | Scroll blur transition works. Mobile menu: no Escape, no focus trap, no focus return. Nav links missing explicit `focus-visible` (rely on global outline — conflicts with components using ring). Hamburger → X animation good. |
| **Footer** | **7.5 / 10** | Strong closing statement; grain + divider on-brand. `xl:text-7xl` only here — orphan breakpoint usage. Back-to-top button easy to miss (no label, icon-only). |
| **Typography hierarchy** | **6 / 10** | Cormorant + DM Sans pairing is correct for editorial luxury. **No type scale document.** Hero uses `clamp`, sections use `text-4xl→6xl`, contact/footer use `7xl`, case study uses `8xl`. Overlines split between `text-xs` and `text-[10px]`. |
| **Editorial rhythm** | **6.5 / 10** | Homepage sections mostly `py-24 md:py-32 lg:py-40`. Case study uses shallower `py-16 md:py-24`. Intentional or not — feels like two sites stitched together. |
| **Grid consistency** | **7 / 10** | `Container` + 12-col pattern is solid. Gutter values consistent (`px-6 md:px-10 lg:px-16`). Internal grid gaps vary without documented logic. |
| **Vertical spacing** | **6 / 10** | Section heading margin `mb-16 md:mb-24` consistent. Component-internal spacing drifts (Services vs About vs form fields). |
| **Horizontal spacing** | **7.5 / 10** | Container max-width 1400px is appropriate. Header duplicates Container padding inline instead of composing — maintenance risk. |
| **Section transitions** | **7 / 10** | `border-t border-foreground/5` rhythm mostly works. Services + CaseStudyGallery break the pattern. |
| **Motion timing** | **7 / 10** | `motion.ts` centralizes easing/duration well. Tailwind `duration-300/500/700/900` used in parallel — two timing systems. |
| **Hover states** | **7.5 / 10** | ProjectCard image scale + overlay is the highlight. Nav hovers are color-only — fine but not distinctive. Mobile: hover-dependent UI on cards. |
| **Cursor behavior** | **6 / 10** | Custom cursor is on-brand for a designer portfolio. `cursor: none` without reduced-motion off-switch is hostile. RAF loop always running on desktop. Labels (`view`, `contact`) add delight but no keyboard equivalent. |
| **Scroll experience** | **7.5 / 10** | Smooth scroll + scroll progress bar + parallax — cohesive. `-80px` viewport margin triggers reveals early (content animates before user “arrives”). |
| **Mobile responsiveness** | **7 / 10** | Breakpoints used sensibly. Hero portrait stacks cleanly. Mobile nav full-screen works. Card metadata hidden on touch. |
| **Tablet responsiveness** | **6.5 / 10** | `md` breakpoint does heavy lifting; `lg` unlocks 12-col. Tablet landscape often gets desktop nav with cramped hero — untested edge. |
| **Desktop responsiveness** | **8 / 10** | Best experience tier. Wide cards and atmosphere shine. Content caps at 1400px — correct for readability. |
| **Accessibility (public)** | **5 / 10** | See dedicated section. Landmarks present; skip link, focus traps, broken ARIA refs, form associations missing. |
| **Color contrast** | **6.5 / 10** | Primary text excellent. Muted `#7a7670` on `#050505` borderline for small uppercase labels. Accent opacity variants (`/60`, `/80`) used on links. |
| **Focus states** | **5.5 / 10** | Global outline + per-component rings = inconsistent doubling. Header, filters, CaseStudy back link under-specified. |
| **Empty / loading states** | **4 / 10** | Almost none on public site. Admin has empty states; public assumes content always exists. No skeleton for images beyond blur placeholder. |
| **Performance (perceived)** | **7 / 10** | Blur placeholders help. Heavy motion on first paint. Custom cursor + gradient atmosphere + scroll listeners add main-thread work. |

---

# Admin panel — section scores

| Section | Score | Why |
|---------|-------|-----|
| **Dashboard** | **7 / 10** | Clear stat cards and quick actions. Validation panel hidden when zero issues — dashboard should celebrate “healthy” too. Cards clickable but no pressed/active state. |
| **Navigation** | **6 / 10** | Sidebar readable on desktop. Mobile: horizontal scroll nav works but **logout + live site link hidden below `lg`** — critical mobile UX bug. Unicode icons (`◆`, `⌂`) render inconsistently cross-platform. No URL routing — no deep links, back button breaks flow. |
| **Information hierarchy** | **6.5 / 10** | Section titles (`text-2xl font-light`) consistent. Media section lacks page-level `h2`. Settings split across Settings + Homepage confusing for non-technical user. |
| **Form layout** | **6 / 10** | `LocaleFieldInput` EN/TR grid is clear. Homepage collapsibles reduce overwhelm — good. Projects “English content” and “Turkish content” sections both render full bilingual fields — **TR section is misleading/redundant**. |
| **Button consistency** | **5.5 / 10** | Primary gold, secondary border pattern mostly holds. Import buttons, gallery ↑↓, copy path buttons use ad-hoc styles. No shared `adminButtonClass`. |
| **Inputs** | **6 / 10** | `adminInputClass` is consistent. Focus is border-color only — no ring, no `focus-visible` distinction. Select/checkbox sizes vary. Native checkboxes unstylized. |
| **Validation** | **6.5 / 10** | Health panel severity grouping is useful. Issues don’t link to fields. Save not blocked on errors. Completion score is helpful but algorithm opaque to user. |
| **Save workflow** | **7 / 10** | Dirty state, last saved, draft restore, beforeunload — strong. Missing: Cmd/Ctrl+S, reset confirmation, export-only “Go to Export” CTA, autosave feedback. |
| **Media library** | **6.5 / 10** | Thumbnail grid + picker modal workflow is good. No copy confirmation toast. No delete/rename. Modal: no Escape, no backdrop click close. |
| **Project editing** | **7 / 10** | Master-detail + search/filter + completion bars = best admin screen. Duplicate/delete present. Slug auto-gen only for `project-*` prefix — undocumented. |
| **Homepage editing** | **6.5 / 10** | Collapsible groups match mental model. Too many fields visible when expanded — no progress within section. Preview link on contact calls `PreviewLinks` with flags that render nothing useful. |
| **Mobile usability** | **4.5 / 10** | Usable for quick edits but not “world-class.” No logout, long scroll forms, small touch targets on gallery controls, toasts in bottom-right thumb zone. |
| **Login screen** | **7.5 / 10** | Best-looking admin screen. Matches brand mood. Input sizing differs from in-app forms. Blocked state doesn’t disable password field. |
| **Toasts** | **6 / 10** | Functional. No icons, no `aria-live`, not used for copy/upload/import success — fragmented feedback. |

---

# Motion audit

| Dimension | Score | Assessment |
|-----------|-------|------------|
| **Easing** | **8 / 10** | `easeOutExpo [0.16, 1, 0.3, 1]` used consistently in Framer — feels premium, Linear-adjacent. CSS transitions use default `ease` — mismatch. |
| **Duration** | **6.5 / 10** | Tokenized 0.4 / 0.7 / 0.9 / 1.0s. Tailwind `duration-[900ms]` on card hover bypasses tokens. Everything skews slow — fine for editorial, sluggish for UI micro-interactions. |
| **Stagger** | **7.5 / 10** | `staggerContainer` 0.1s / `staggerText` 0.06s — tasteful. Hero letter stagger 0.08s on large names can feel theatrical on repeat visits. |
| **Cursor** | **6 / 10** | Magnetic elements + custom cursor = high craft. Accessibility and performance costs are real. Not optional enough. |
| **Transitions** | **7 / 10** | Page enter via template is clean. Work filter `AnimatePresence` polished. Mobile menu uses different duration than tokens. |
| **Page transitions** | **7.5 / 10** | Subtle y+opacity — Stripe/Linear would approve. Reduced motion respected. SSR flash before hook resolves is a minor hydration flicker. |

### Motion improvements (do not implement in this pass — recommendations only)

1. Unify CSS transition durations with `motion.ts` or remove CSS transitions from motion-heavy components.
2. Cap simultaneous infinite animations (Hero bounce + GradientAtmosphere + scroll progress) — pick two, not four.
3. Disable custom cursor entirely when `prefers-reduced-motion: reduce`.
4. Add `will-change` sparingly on animated layers; audit GPU layer count on Hero.
5. Lazy-load `CustomCursor` and `GradientAtmosphere` below fold or on `requestIdleCallback`.

---

# Design system audit

| Token | Score | Findings |
|-------|-------|----------|
| **Spacing scale** | **5 / 10** | De facto scale (`4, 6, 8, 10, 16, 24, 32, 40`) but not named or enforced. Admin duplicates values as raw Tailwind. No `spacing-section-y` semantic token. |
| **Typography scale** | **4 / 10** | Two fonts declared in `@theme`. No size ramp. Five competing headline scales. Letter-spacing is copy-pasted, not tokenized. |
| **Radius** | **6 / 10** | Public: minimal radius (cards subtle). Admin: `rounded-lg`, `rounded-xl`, `rounded-2xl` mixed without rule. |
| **Shadows** | **N/A** | Intentionally flat — correct for editorial dark UI. Elevation via border + surface color only. |
| **Borders** | **6.5 / 10** | `--color-border` and `foreground/5`/`/10`/`/15`/`/20` — good opacity ladder. Not all sections use it consistently. |
| **Colors** | **7 / 10** | Palette is restrained and on-brand. `accent-glow` duplicates `accent`. Error red not tokenized. Admin hardcodes hex instead of `bg-background` etc. |
| **Elevation** | **6 / 10** | `surface` (#0f0f0f) vs `background` (#050505) — two-level system. Admin cards and public cards use same logic informally. |
| **Reusable components** | **6 / 10** | `Container`, `SectionHeading`, `Button`, `ProjectImage` — good core. ContactForm submit, admin buttons, and several inputs bypass shared components. |

---

# Accessibility audit (WCAG 2.1 AA target)

| Criterion | Status | Notes |
|-----------|--------|-------|
| **Perceivable — contrast** | ⚠️ Partial | Body text passes. Small muted labels and placeholders at risk. |
| **Operable — keyboard** | ❌ Fail | Skip link missing. Lightbox and mobile menu lack focus trap. |
| **Operable — pointer** | ⚠️ Partial | Custom cursor hides system pointer. Touch targets OK on primary CTAs; weak on admin secondary controls. |
| **Understandable — forms** | ⚠️ Partial | Labels present. Error association incomplete. |
| **Robust — ARIA** | ❌ Fail | Broken `aria-labelledby` on 4 homepage sections. Duplicate announcements on TextReveal. |
| **Reduced motion** | ⚠️ Partial | Hook + CSS exist. Custom cursor, SSR flash, some infinite animations exempt. |
| **Focus visible** | ⚠️ Partial | Global rule exists; uneven application. |
| **Screen readers** | ⚠️ Partial | Good aria-labels on cards/links. Section headings not wired. Admin: virtually no ARIA. |

**Accessibility score: 5.0 / 10**

Priority fixes if pursuing AA: skip link → fix aria-labelledby → focus traps → form describedby → admin aria-live on toasts.

---

# Performance audit

| Area | Score | Findings |
|------|-------|----------|
| **Bundle size** | **6 / 10** | Minimal deps (good). `framer-motion` ~12 dominates client JS. ~58 `"use client"` files — almost entire UI is client. |
| **Client/server boundaries** | **5 / 10** | Pages fetch server-side but render through client trees. Static copy (About body, Services list) could be RSC. |
| **Hydration** | **6.5 / 10** | `useReducedMotion` defaults false on server — animation flash. `HtmlLang` updates client-side; root `lang="en"` wrong for `/tr`. |
| **Rerenders** | **7 / 10** | No obvious runaway context. `CustomCursor` RAF loop is continuous cost, not React rerender. Admin context well memoized. |
| **Image loading** | **7.5 / 10** | `next/image`, blur placeholders, sensible `sizes` on cards. Default `sizes="100vw"` in wrapper is footgun. |
| **Animations** | **6 / 10** | Many scroll listeners + motion components. Acceptable for portfolio genre; hurts Lighthouse TBT. |
| **Lighthouse expectations** | **Est. 75–85** | Performance: mid-high if images optimized. Accessibility: low-mid 70s until ARIA/focus fixed. Best Practices: high. SEO: high (metadata solid; OG image from content unused). |

---

# Critical issues

Issues that would block a design-studio sign-off or fail accessibility audit.

1. **Broken `aria-labelledby` references** — `FeaturedWorks`, `About`, `Services` reference heading IDs that do not exist (`SectionHeading` renders no `id`). Screen readers cannot name these regions correctly.

2. **No skip navigation link** — Keyboard users must tab through header on every page load.

3. **Lightbox and mobile menu lack focus management** — Focus trap, Escape handling (menu), focus restore on close.

4. **Admin: logout inaccessible on mobile/tablet** — `hidden lg:block` on footer actions in `AdminShell.tsx`.

5. **Custom cursor hides system pointer** without a reduced-motion / accessibility off-ramp.

---

# High priority

1. Consolidate typography to a single responsive scale (one source of truth for H1/H2/H3/overline).

2. Fix focus system schism — choose outline XOR ring, apply everywhere including Header and WorkIndex filters.

3. Contact form: `aria-describedby` for errors; raise placeholder contrast; use shared `Button`.

4. Admin: URL-based section routing (`/admin?section=projects` or hash).

5. Validation issues should navigate to the offending field.

6. Admin: use design tokens (`bg-background`, `text-muted`) not hardcoded hex — prevents drift.

7. OG image from `site-content.json` not wired into metadata — social shares underwhelming.

8. `lang` attribute should reflect locale server-side for `/tr`.

---

# Medium priority

1. Services section missing top border — visual rhythm break.

2. CaseStudyGallery missing top border — inconsistent with Meta/Narrative.

3. Projects admin: separate EN-only and TR-only fields in respective collapsibles (currently both show EN+TR in each).

4. Copy-to-clipboard feedback (media library, image path fields).

5. Reset changes without confirmation — inconsistent with import confirm flow.

6. Cmd/Ctrl+S save shortcut in admin.

7. Modal UX: Escape + backdrop dismiss for MediaPickerModal.

8. Add `eslint-plugin-jsx-a11y` to CI.

9. Work index category filters: `aria-pressed`, visible selected state beyond layout animation.

10. Touch/mobile: surface project metadata without hover (category, year on card face).

---

# Low priority

1. Remove dead code: `getSiteThemeStyle()` always undefined, `IMAGE_PATH_HELP` unused, deprecated `PageReveal`.

2. Align admin login input padding with `adminInputClass`.

3. Replace Unicode nav icons with SVG for cross-platform consistency.

4. Footer back-to-top: add visible label or `aria-label` (verify current state).

5. Document intentional spacing difference between homepage and case study vertical rhythm.

6. Admin dashboard “healthy” empty state when zero validation issues.

7. Toast `aria-live="polite"` region.

8. `2xl` breakpoint unused — either use or document why 1400px cap suffices.

---

# Pixel-perfect improvements

Micro-level fixes a Pentagram art director would mark up in review:

| Location | Issue |
|----------|-------|
| Homepage section gaps | `Services` missing `border-t` — 1px seam absent vs neighbors |
| Featured vs Showcase grid | `gap-y-16` vs `gap-y-14` — align to single value |
| Overline labels | Standardize on either `text-xs tracking-[0.3em]` OR `text-[10px] tracking-[0.25em]` — not both |
| Header padding | Duplicates Container values — use `<Container>` or shared constant |
| Case study H1 | `leading-[0.95]` vs Hero `leading-[0.9]` — pick one display line-height |
| ProjectCard overlay | Title translation on hover — verify consistent `translate-y` across aspect ratios |
| Admin select inputs | Projects filter `text-xs py-1.5` vs form selects `text-sm py-2` — 2px misalignment |
| Admin card padding | Mix of `p-4`, `p-5`, `p-6` — pick one card padding token |
| Collapsible toggle | Text `+` / `−` misaligned vertically with title — use icon button 20×20 |
| Save button disabled state | Low contrast difference between disabled and enabled in export-only mode |
| Validation count badge | Dashboard “Issues 0” same visual weight as “Issues 12” — no celebratory differentiation |
| Preview links row | Wrap awkwardly on narrow admin content area — stack EN/TR pairs |

---

# Things to never change

These are genuine strengths. Protect them in any refactor.

1. **Color palette** — `#050505` / `#f5f2eb` / `#c4a574` / `#7a7670` — restrained, editorial, memorable. Do not “brighten for accessibility” without designer-led paired adjustments.

2. **Cormorant + DM Sans pairing** — Correct genre (luxury editorial + functional UI). Display for emotion, sans for utility.

3. **`motion.ts` easing curve** — `easeOutExpo` fits the brand. Do not swap to generic `ease-in-out`.

4. **ProjectCard hover treatment** — Image scale + gradient overlay + title shift — portfolio hero moment. Fix touch fallback, don’t remove desktop craft.

5. **Container width (1400px) and horizontal padding ramp** — Proportions feel right on large screens.

6. **Case study long-form structure** — Concept / Challenge / Solution narrative arc matches how design studios present work.

7. **JSON content architecture + bilingual model** — `{ en, tr }` with EN fallback is correct; admin side-by-side inputs match mental model.

8. **Draft autosave + export-only production mode** — Honest about hosting constraints; don’t over-promise cloud save.

9. **Grain overlay + editorial divider** — Subtle texture separates this from generic dark Tailwind templates.

10. **Work index filter animation** — `layoutId` indicator is exactly the kind of micro-detail that signals care.

---

# Final recommendation

**Do not ship this to a client pitch against Awwwards winners yet.** Ship it to real users, yes — it works and looks good in demos.

### Phase 1 — Trust (1–2 days)
Fix critical accessibility: skip link, aria-labelledby ids, lightbox/menu focus traps, mobile admin logout. These are non-negotiable for professional credibility.

### Phase 2 — System (3–5 days)
Extract a type scale, spacing scale, and focus mixin. Refactor admin to consume `@theme` tokens. One headline component with size variants — eliminate five competing scales.

### Phase 3 — Polish (3–5 days)
Touch fallbacks for cards, form/button unification, validation → field navigation, admin URL routing, clipboard/toast feedback consistency.

### Phase 4 — Performance (optional, 2–3 days)
Narrow client boundary: server-render static sections, lazy-load cursor/atmosphere, wire OG images.

**Bottom line:** The project demonstrates strong **taste** and **motion craft** — the hard parts many developers get wrong. It lacks the **systematic discipline** top studios enforce: one type scale, one spacing law, one focus language, zero broken ARIA, zero mobile dead-ends. Close that gap and the score moves from **6.3 → 8.5+** without changing the brand soul.

---

*This document is analysis only. No code was modified during this audit.*
