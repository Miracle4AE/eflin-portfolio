# Launch Checklist

Full QA before sharing the portfolio publicly. For first-time deployment, complete **[FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md)** first, then use this list.

---

## 1. Local build

- [ ] `npm ci` completes without errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes locally
- [ ] `npm run start` — spot-check `/`, `/work`, one case study, `/contact`
- [ ] No critical console errors in browser devtools

---

## 2. Asset validation

- [ ] `npm run validate:assets` reviewed
- [ ] `cover.jpg` / `hero.jpg` present for key projects — or gradient fallbacks accepted for soft launch
- [ ] Gallery filenames match `projects.ts`
- [ ] `portrait.jpg` added if homepage should show a real photo
- [ ] No oversized files (see **ASSET_GUIDE.md**)
- [ ] Optional: `npm run validate:assets -- --strict` when all images are in place

---

## 3. SEO

- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain in Vercel
- [ ] Unique page titles on case studies
- [ ] `/sitemap.xml` lists all routes with production domain
- [ ] `/robots.txt` allows indexing
- [ ] JSON-LD in page source (WebSite, Person, CreativeWork)
- [ ] Open Graph preview tested ([opengraph.xyz](https://www.opengraph.xyz))

---

## 4. Contact form

- [ ] Vercel env vars set (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`)
- [ ] Resend sender domain verified
- [ ] Production test submission — email received
- [ ] Invalid input shows field errors, not crashes
- [ ] No API keys or stack traces in responses

---

## 5. Accessibility

- [ ] Keyboard: header, links, form, gallery lightbox
- [ ] Lightbox: Escape closes; arrow keys navigate
- [ ] Focus rings visible
- [ ] Alt text on all images
- [ ] Reduced motion: no video hero, no custom cursor
- [ ] Form labels and error states accessible

---

## 6. Mobile

- [ ] No horizontal scroll at 375px width
- [ ] Mobile menu works
- [ ] Gallery and lightbox usable on touch
- [ ] Contact form usable with mobile keyboard
- [ ] Images crop acceptably

---

## 7. Performance

- [ ] Lighthouse mobile Performance ≥ 85 (homepage)
- [ ] No major layout shift from fonts
- [ ] Build completes without warnings

---

## 8. Vercel & domain

- [ ] GitHub Actions CI green
- [ ] Production deploy successful
- [ ] Custom domain connected (if applicable)
- [ ] HTTPS active
- [ ] Analytics enabled if desired

---

## 9. Post-deploy smoke test

On **production URL**:

| URL | Check |
|---|---|
| `/` | Loads correctly |
| `/work` | Grid and filters work |
| `/work/nocturne` | Case study + lightbox |
| `/contact` | Form submits |
| `/sitemap.xml` | Valid XML, correct domain |
| `/robots.txt` | Allows `/` |
| `/api/contact` GET | Returns 405 |

- [ ] OG link preview correct
- [ ] Social links in footer point to real profiles

---

## Sign-off

- [ ] Real images in place OR gradient soft launch accepted
- [ ] Contact routing confirmed
- [ ] Ready to share with studios

**Deployed URL:** ___________________________

**Date:** ___________________________

---

## Docs

| Doc | Purpose |
|---|---|
| [FINAL_DEPLOY_STEPS.md](./FINAL_DEPLOY_STEPS.md) | Deploy procedure |
| [ASSET_GUIDE.md](./ASSET_GUIDE.md) | Image specs |
| [REAL_PROJECT_CHECKLIST.md](./REAL_PROJECT_CHECKLIST.md) | Add real project |
| [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) | Case study copy |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Env & browser reference |
| [README.md](./README.md) | Overview & commands |
