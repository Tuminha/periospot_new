# Periospot SEO Audit (Next.js Migration)

Date: 2026-01-03  
Scope: `periospot-nextjs` (Next.js App Router), 24 page routes, 84 blog posts, product catalog, assessments, legal pages.

## Executive Summary

The site has a solid SEO foundation (sitewide metadata, robots + sitemap, JSON‑LD for Organization/Website/Article/Product, and alt text on images). The biggest gaps are **missing per‑page metadata** on key routes (home, auth, cart, checkout, search), **missing OG/Twitter tags on many routes**, **broken image assets for library/team**, and **sitemap/redirect inconsistencies**.  

Key wins already present:
- Global metadata (title template, description, OG, Twitter, robots, canonical base)
- Article schema on blog posts
- Product schema on product pages
- Sitemap + robots
- All `<Image>`/`<img>` tags include `alt`

Critical gaps:
- Home page has no dedicated metadata (uses defaults only)
- Many pages missing OpenGraph/Twitter metadata
- `sitemap.xml` contains `/contact` but no `/contact` page exists
- Hardcoded categories in sitemap (not derived from data)
- Author/category pages show images from a property that doesn’t exist in normalized content (`featured_image`)
- Missing OG image file (`/public/og-image.jpg`)
- Many pages that should be `noindex` are indexable (cart, checkout, auth, search, admin)

---

## Page-by-Page Audit (Metadata + Social + Canonical)

Legend: ✅ = implemented, ⚠️ = partial, ❌ = missing

| Route | Title/Desc | OG | Twitter | Canonical | Structured Data | Notes |
|---|---|---|---|---|---|---|
| `/` (Home) | ❌ | ❌ | ❌ | ❌ | ✅ (Org/WebSite in layout) | Uses global defaults only. Should have custom title/desc/OG/Twitter. |
| `/blog` | ✅ | ✅ | ❌ | ✅ | ❌ | Missing Twitter tags. |
| `/blog/[slug]` | ✅ | ✅ | ✅ | ✅ | ✅ (Article JSON‑LD) | Add OG/Twitter fallback image when no featured image. Filter drafts from SSG. |
| `/blog/category/[slug]` | ✅ | ✅ | ❌ | ❌ | ❌ | No canonical. Missing Twitter. |
| `/author/[slug]` | ✅ | ✅ | ❌ | ❌ | ❌ | No canonical. Missing Twitter. |
| `/library` | ✅ | ✅ | ❌ | ❌ | ❌ | Uses mock data + missing `/public/images` assets. |
| `/tienda` | ✅ | ✅ | ❌ | ❌ | ❌ | Missing Twitter + canonical. |
| `/tienda/[slug]` | ✅ | ✅ | ✅ | ❌ | ✅ (Product JSON‑LD) | Missing canonical. |
| `/assessments` | ✅ | ✅ | ❌ | ❌ | ❌ | Missing Twitter + canonical. |
| `/assessments/[id]` | ✅ | ✅ | ❌ | ❌ | ❌ | Missing Twitter + canonical. |
| `/team` | ✅ | ✅ | ❌ | ❌ | ❌ | Missing Twitter + canonical. No `/contact` page but sitemap references it. |
| `/about` | ✅ | ✅ | ❌ | ❌ | ❌ | Missing Twitter + canonical. |
| `/privacy` | ✅ | ❌ | ❌ | ❌ | ❌ | Missing OG/Twitter/canonical. |
| `/terms` | ✅ | ❌ | ❌ | ❌ | ❌ | Missing OG/Twitter/canonical. |
| `/cookies` | ✅ | ❌ | ❌ | ❌ | ❌ | Missing OG/Twitter/canonical. |
| `/cart` | ❌ | ❌ | ❌ | ❌ | ❌ | Should be `noindex`. |
| `/checkout` | ❌ | ❌ | ❌ | ❌ | ❌ | Should be `noindex`. |
| `/search` | ❌ | ❌ | ❌ | ❌ | ❌ | Should be `noindex`. |
| `/dashboard` | ⚠️ | ❌ | ❌ | ❌ | ❌ | Has metadata but should be `noindex`. |
| `/admin` | ❌ | ❌ | ❌ | ❌ | ❌ | Should be `noindex` + blocked in robots. |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | ❌ | ❌ | ❌ | ❌ | ❌ | Should be `noindex`. |

---

## Image & Asset Audit

✅ All `<Image>`/`<img>` tags include `alt` text.  
⚠️ **Missing image assets**: routes reference `/images/...` but there is no `public/images` directory (Team, Library). These will 404 and hurt SEO/UX.  
⚠️ OG image file referenced in metadata (`/og-image.jpg`) is missing from `public/`.

---

## Sitemap / Robots Audit

### `robots.txt`
✅ `robots.ts` exists, allows crawling and points to sitemap.  
⚠️ `disallow` should include `/admin`, `/cart`, `/checkout`, `/search`, `/login`, `/signup`, etc.  
⚠️ `disallow` includes `/dashboard`, but `/admin` is not blocked.

### `sitemap.xml`
✅ Generated dynamically for posts + products.  
⚠️ Contains `/contact` which has no page.  
⚠️ Blog categories are hardcoded; should be derived from actual categories.  
⚠️ `lastModified` uses `new Date()` for static pages every build (can look like frequent changes).

---

## Yoast Feature Parity (What’s Missing)

Yoast provides structured fields and enforcement. To match parity, we need:

**Required fields for every post/page**
- SEO Title (meta title)
- Meta description
- Canonical URL
- OpenGraph title/description/image
- Twitter title/description/image
- Focus keyword (for internal linting)
- Language / hreflang mapping
- Indexing flag (index/noindex)
- Published/Modified timestamps

**Schema**
- Article (posts) ✅
- Product (products) ✅
- BreadcrumbList ❌
- Organization/WebSite ✅
- FAQPage (where relevant) ❌

**Other Yoast features**
- Readability and keyword checks (not implemented)
- XML sitemap w/ taxonomy & author pages (partial)
- Redirect manager (partial in `next.config.ts`)

---

## Critical Issues & Fixes (Priority Order)

1. **Fix invalid references**
   - Add `public/og-image.jpg`
   - Add `public/images/*` or update Library/Team image paths
   - Remove `/contact` from sitemap or create `/contact` page

2. **Metadata gaps**
   - Add metadata + OG + Twitter to Home, Library, Tienda, Team, About, Assessments
   - Add canonical to all indexable pages

3. **Noindex sensitive pages**
   - Mark `/cart`, `/checkout`, `/search`, `/admin`, `/dashboard`, `/login`, `/signup`, `/reset` as `noindex, nofollow`
   - Add to robots disallow

4. **Data-driven SEO**
   - Import Yoast meta fields from WordPress
   - Extend posts JSON/DB with SEO fields: `meta_title`, `meta_description`, `og_image`, `canonical`, `focus_keyword`

5. **Blog integrity**
   - Filter drafts from `generateStaticParams`
   - Use fallback OG images when no featured image
   - Ensure blog category/author pages use `featuredImage` (not `featured_image`)

6. **Redirects**
   - Expand 301s for old WordPress slugs
   - Fix `/author/:slug` redirect (should go to `/author/:slug`, not `/team/:slug`)

---

## Best Practices Checklist (SEO Implementation Standard)

**Metadata**
- [ ] Unique title (50–60 chars)
- [ ] Unique meta description (140–160 chars)
- [ ] Canonical URL
- [ ] OG title/description/image
- [ ] Twitter card + image
- [ ] `robots` (index/noindex)
- [ ] `lang` attribute per locale

**Content**
- [ ] Single H1 per page
- [ ] Clean heading structure (H2/H3)
- [ ] Internal links to related content
- [ ] Descriptive alt text for all images
- [ ] Avoid thin or duplicate content

**Technical**
- [ ] Valid sitemap.xml with real URLs only
- [ ] robots.txt with correct disallow rules
- [ ] Proper 301 redirects from old URLs
- [ ] Structured data (Article/Product/Breadcrumbs)
- [ ] OG image file exists

**Performance**
- [ ] LCP optimized (hero images/video + preloads)
- [ ] Lazy load non-critical images
- [ ] Image compression (AVIF/WebP)

---

## Recommended Next Actions (Short-Term)

1. Add missing OG image file and `public/images` assets.
2. Add canonical + OG + Twitter metadata to all indexable pages.
3. Add `robots: { index: false, follow: false }` to auth/cart/checkout/search/admin.
4. Update sitemap to remove `/contact` and use dynamic categories.
5. Fix redirects for `/author/:slug`.

---

## Long-Term SEO Enhancements

1. **Full Yoast migration**
   - Add SEO fields to DB schema and import Yoast metadata
2. **Hreflang**
   - Implement language-specific routes and alternate tags
3. **Structured data**
   - BreadcrumbList, FAQPage, VideoObject for media pages
4. **Editorial checks**
   - Add SEO linting at content creation time

---

## Notes

- All images currently include `alt` text, but some images referenced by path don’t exist in `/public`.  
- Draft posts may be indexed because `generateStaticParams` uses all posts.  
- OpenGraph/Twitter metadata is present for posts/products only; most pages are missing them.  

If you want, I can implement the top‑priority fixes directly (metadata additions, robots/noindex, sitemap cleanup, OG image placeholder).
