---
description: Analyze and identify monetization opportunities in Periospot content. Flags affiliate gaps, missing product CTAs, and revenue optimization opportunities.
allowed-tools: Read, Grep, Glob, Bash(*)
---

# Periospot Monetization Opportunity Analyzer

Scan content for monetization opportunities and generate actionable recommendations.

## What This Skill Does

1. **Scans for existing affiliate links** (Amazon, geni.us, ShareASale, etc.)
2. **Identifies monetization gaps** in content
3. **Suggests affiliate additions** based on content topics
4. **Flags internal product cross-sell opportunities**
5. **Generates revenue optimization recommendations**

## Usage

```
/monetize                    # Analyze all content
/monetize [slug]             # Analyze specific article
/monetize --report           # Generate full monetization report
```

## Analysis Process

### 1. Scan for Existing Affiliate Links

Check for these affiliate patterns in content:
- `amazon.com`, `amzn.to`, `geni.us`
- `tag=` (Amazon affiliate tag)
- `shareasale.com`, `pxf.io`, `grsm.io`
- `rover.ebay.com`
- TradeDoubler, CJ Affiliate patterns

### 2. Identify Monetization Keywords

Flag content containing these high-value topics without affiliate links:

| Keyword | Affiliate Opportunity |
|---------|----------------------|
| `implant` | Implant systems, courses |
| `book`, `textbook` | Amazon book links |
| `bone graft`, `membrane` | Geistlich, BioHorizons |
| `instrument`, `curette`, `scaler` | Hu-Friedy, LM-Dental |
| `loupe`, `microscope` | Orascoptic, Carl Zeiss |
| `camera`, `photo` | Amazon equipment |
| `CBCT`, `scanner` | Manufacturer leads |
| `course`, `CE`, `webinar` | Education affiliates |
| `software` | SaaS affiliate programs |

### 3. Check for Internal Product CTAs

Every post should have:
- [ ] Related Periospot product suggestion
- [ ] Link to relevant Speaker Pack or Animation
- [ ] Merchandise/Accessories mention (if appropriate)

### 4. Revenue Opportunity Scoring

Score each piece of content (0-100):

| Factor | Points |
|--------|--------|
| Has relevant affiliate links | 25 |
| Internal product CTA present | 20 |
| Email capture form | 15 |
| Comparison/review content | 15 |
| High-traffic topic | 15 |
| Proper disclosure | 10 |

## Output Format

### For Single Article Analysis

```markdown
## Monetization Analysis: [Article Title]

**Current Score:** 35/100
**Revenue Potential:** HIGH

### Existing Monetization
- [x] Amazon affiliate link (1)
- [ ] Internal product CTA
- [ ] Email capture
- [ ] Affiliate disclosure

### Opportunities Identified

1. **Add Book Affiliate Links**
   - Content mentions "Lindhe textbook"
   - Recommendation: Add Amazon affiliate link
   - Template: `[Lindhe Clinical Periodontology](https://amazon.com/...?tag=advaimpldigid-20)`

2. **Cross-Sell Internal Product**
   - Topic: Socket Shield Technique
   - Recommended Product: Socket Shield PET Kit (€297)
   - CTA: "Master this technique with our Socket Shield Kit"

3. **Add Instrument Affiliates**
   - Mentions suturing techniques
   - Partner opportunity: Hu-Friedy suture instruments

### Recommended Additions

```html
<!-- Add after second paragraph -->
<div class="affiliate-box">
  <h4>Recommended Resources</h4>
  <ul>
    <li><a href="...">Clinical Periodontology (Amazon)</a></li>
    <li><a href="/products/socket-shield-kit">Socket Shield Kit</a></li>
  </ul>
</div>
```
```

### For Full Site Analysis

```markdown
## Periospot Monetization Report

### Summary
- Total Articles: 84
- Articles with Affiliate Links: 12 (14%)
- Articles with Product CTAs: 8 (10%)
- **Revenue Opportunity Gap: 72 articles**

### Top Priority Articles (Highest Impact)

| Article | Traffic Est. | Current $ | Potential $ | Priority |
|---------|-------------|-----------|-------------|----------|
| 4 Implant Books | HIGH | €5/mo | €50/mo | CRITICAL |
| Socket Shield | MEDIUM | €0 | €100/mo | HIGH |
| Photography Equip | HIGH | €10/mo | €80/mo | HIGH |

### Quick Wins (Easy Implementation)

1. **Add Amazon links to book mentions** (49 posts)
   - Search: Posts containing "book" without amazon links
   - Estimated lift: €200-500/month

2. **Add product CTAs to technique articles** (42 posts)
   - Link to: Animations, Speaker Packs
   - Estimated lift: €300-800/month

3. **Create buying guide pages** (0 exist)
   - "Best Dental Loupes 2025"
   - "Implant Dentistry Books Guide"
   - Estimated potential: €500-1500/month

### Affiliate Program Gaps

Currently NOT using:
- [ ] Dental manufacturer programs (Straumann, Geistlich)
- [ ] CE/Course affiliates (Coursera, ADA)
- [ ] Software affiliates (Dentrix, Eaglesoft)
- [ ] Equipment affiliates (Orascoptic, Surgitel)
```

## Quick Analysis Script

Run the monetization analyzer:

```bash
node scripts/analyze-monetization.cjs
```

---

## API Integrations

### Genius Link API (Create Smart Affiliate Links)

Automatically create geo-targeted affiliate links that work worldwide:

```bash
# Create link from any Amazon URL
node scripts/geniuslink-api.cjs create "https://amazon.com/dp/B08N5WRWNW"

# Create link from ASIN only
node scripts/geniuslink-api.cjs asin B08N5WRWNW

# Output:
# Short URL: https://geni.us/hTWu
# Tagged URL: https://amazon.com/dp/B08N5WRWNW?tag=advaimpldigid-20
```

**API Configuration:**
- API Key: `847ce64e10274a2ebb731e9f2e6e44c5`
- Default Group: `416233` (PerioSpot)
- Domain: `geni.us`

### Tana API (Save Affiliate Links)

Save affiliate links to Tana with #affiliate-links supertag:

```bash
# Test connection
node scripts/tana-api.cjs test

# Add affiliate link
node scripts/tana-api.cjs add "Product Name" "https://geni.us/xxx" amazon books
```

**Note:** Tana Input API is write-only. To READ existing links, set up [supertag-cli MCP](https://github.com/jcfischer/supertag-cli).

### Combined Affiliate Manager

Create Genius Link AND save to Tana in one command:

```bash
# From URL
node scripts/affiliate-manager.cjs create-link "Lindhe Periodontology" "https://amazon.com/dp/123" books

# From ASIN
node scripts/affiliate-manager.cjs from-asin "Dental Loupes" "B07QXMZF1Y" equipment

# Quick products (pre-defined)
node scripts/affiliate-manager.cjs quick misch-implant
node scripts/affiliate-manager.cjs quick lindhe-periodontology
node scripts/affiliate-manager.cjs quick dental-loupe

# Generate markdown only
node scripts/affiliate-manager.cjs markdown "https://geni.us/xxx" "Product Name" books
```

**Pre-defined Products:**
- `misch-implant` - Contemporary Implant Dentistry (Misch)
- `lindhe-periodontology` - Clinical Periodontology (Lindhe)
- `dental-loupe` - Dental Loupes 3.5x
- `dental-headlight` - LED Dental Headlight
- `dental-camera` - Canon EOS R5
- `ring-flash` - Canon MR-14EX II

---

## Integration with Other Skills

After analysis, use:
- `/seo-optimize [slug]` - Add monetization while optimizing SEO
- `/list-articles` - See which articles need monetization first

## Monetization Best Practices

### Affiliate Disclosure (Required)

Add to every monetized page:

```html
<p class="affiliate-disclosure">
  <em>Disclosure: This article contains affiliate links.
  Periospot may earn a commission at no extra cost to you.</em>
</p>
```

### Link Placement Guidelines

1. **First affiliate link:** Within first 300 words
2. **Product boxes:** After key sections
3. **Comparison tables:** For buying guides
4. **End of article:** "Recommended Resources" section

### Amazon Affiliate Best Practices

- Use tag: `advaimpldigid-20`
- Include product images when possible
- Add price context ("Around €50")
- Update links quarterly (price/availability changes)

## Periospot Products to Cross-Sell

| Product | Price | Best For Topics |
|---------|-------|-----------------|
| Socket Shield Package | €45 | Socket shield, immediate implants |
| Socket Shield PET Kit | €297 | Socket shield technique |
| Alveolar Ridge Preservation | €45 | Bone grafting, extractions |
| Bone Defects Presentation | €75 | GBR, bone regeneration |
| Suturing Animations | €10-15 | Suturing techniques |
| Implant Animations | €10-15 | Implantology articles |

---

## Reference: Full Monetization Strategy

See: [.claude/docs/MONETIZATION.md](../docs/MONETIZATION.md)

---

*Remember: Every piece of content is a monetization opportunity. Flag gaps whenever reviewing or creating content.*
