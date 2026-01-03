# Per-Article Monetization Checklist

Use this checklist when creating or reviewing ANY Periospot content.

---

## Pre-Publish Monetization Checklist

### 1. Affiliate Links (25 points)

- [ ] **Book mentions** have Amazon affiliate links (`tag=advaimpldigid-20`)
- [ ] **Equipment mentions** have relevant affiliate links
- [ ] **Course/CE mentions** have education affiliate links
- [ ] **All affiliate links** use geni.us or are properly tagged
- [ ] **Links open in new tab** (`target="_blank"`)

### 2. Internal Product Cross-Sell (20 points)

- [ ] **Relevant Periospot product** is mentioned/linked
- [ ] **Product CTA** appears after key content section
- [ ] **Related animations** are embedded or linked
- [ ] **Speaker Pack** promoted (for technique articles)

### 3. Email Capture (15 points)

- [ ] **Newsletter signup** form present
- [ ] **Lead magnet** offered (if applicable)
- [ ] **Content upgrade** available (checklist, PDF, etc.)

### 4. Affiliate Disclosure (10 points)

- [ ] **Disclosure statement** present at top or bottom
- [ ] **Disclosure page** linked

### 5. Call-to-Action (15 points)

- [ ] **Primary CTA** clear and visible
- [ ] **Secondary CTA** (email, product, related content)
- [ ] **End-of-article CTA** present

### 6. Revenue Maximization (15 points)

- [ ] **Comparison table** (for buying guide content)
- [ ] **Product images** with affiliate links
- [ ] **Price context** provided ("Around €XX")
- [ ] **Multiple affiliate touchpoints** throughout

---

## Quick Monetization Additions

### Amazon Book Link Template

```html
<p>I recommend reading
<a href="https://www.amazon.com/dp/ASIN?tag=advaimpldigid-20"
   target="_blank" rel="noopener sponsored">
   Book Title
</a> (affiliate link).
</p>
```

### Product CTA Box

```html
<div class="product-cta">
  <h4>Master This Technique</h4>
  <p>Get our <a href="/products/[slug]">Product Name</a>
  for complete resources including animations and presentations.</p>
</div>
```

### Affiliate Disclosure

```html
<p class="disclosure">
  <em>Disclosure: This article contains affiliate links.
  Periospot earns a commission at no extra cost to you.</em>
</p>
```

### Email Capture CTA

```html
<div class="email-cta">
  <h4>Get Free Updates</h4>
  <p>Join 10,000+ dental professionals receiving our weekly insights.</p>
  <a href="/newsletter" class="btn">Subscribe Free</a>
</div>
```

---

## Content-Type Specific Monetization

### Technique Articles (e.g., Socket Shield)

1. Link to related Animation (€10-15)
2. Link to Speaker Pack (€45-87)
3. Link to Instrument Kit (€297)
4. Amazon links for mentioned books
5. Course/CE recommendations

### Book Reviews / Reading Lists

1. Amazon affiliate link for EACH book
2. Include book images
3. Add "Buy on Amazon" buttons
4. Create comparison table
5. Link to related Periospot products

### Equipment / Technology Articles

1. Amazon links for cameras, loupes
2. Manufacturer affiliate links
3. Comparison tables
4. "Best of" structured content
5. Email capture for buying guide PDF

### Clinical Case Studies

1. Link to technique animation
2. Link to instrument products
3. Course recommendations
4. Related article links
5. Newsletter signup

---

## Monetization Scoring

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | Optimized | Minor tweaks only |
| 70-89 | Good | Add 1-2 elements |
| 50-69 | Needs Work | Add affiliates + CTAs |
| Below 50 | Critical | Full monetization needed |

---

## Post-Publish Tracking

After publishing, track:

- [ ] Affiliate link clicks (via geni.us dashboard)
- [ ] Product page visits (analytics)
- [ ] Email signups (email platform)
- [ ] Revenue attributed to article

---

## Reference

Full strategy: [MONETIZATION.md](../../docs/MONETIZATION.md)
Monetization command: `/monetize [slug]`
