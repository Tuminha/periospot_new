# Periospot Project Instructions

## About Periospot

Periospot is a dental education platform focused on implantology and periodontics. The site contains:
- 84 blog posts (English, Spanish, Portuguese, Chinese)
- 69 products (animations, speaker packs, instruments, accessories)
- Educational content for dental professionals

## Key Commands

### Content & SEO
- `/list-articles` - List all articles with optimization status
- `/seo-optimize [slug]` - Optimize article for SEO and LLM discoverability

### Affiliate & Monetization (Affiliate Machine)
- `/monetize` - Full monetization opportunity analysis
- `/affiliate-lookup [product]` - Search existing links in Tana before creating new ones
- `/affiliate-inject [slug]` - Auto-inject affiliate links into blog posts
- `/affiliate-suggest` - Get proactive suggestions for affiliate programs and products

### Natural Language Commands
Just ask naturally:
- "Create an affiliate link for [book name]"
- "What affiliate links do we have for loupes?"
- "Suggest products for the socket shield article"

## IMPORTANT: Monetization Focus

**Flag monetization opportunities in EVERY conversation** about Periospot content.

### When to Flag

1. **Content mentions books/textbooks** → Flag Amazon affiliate opportunity
2. **Content discusses equipment** → Flag product affiliate opportunity
3. **Article has no CTA** → Flag internal product cross-sell
4. **Technique article** → Flag related Speaker Pack/Animation
5. **Any new content** → Ensure monetization is considered

### Affiliate Tag

Amazon Associates: `advaimpldigid-20`

### Current Affiliate Partners

- Amazon Associates
- Geni.us (link management)
- ShareASale
- LeadPages
- Bluehost

### Products for Cross-Selling

| Product | Price | Use For |
|---------|-------|---------|
| Socket Shield Kit | €297 | Socket shield articles |
| Speaker Packs | €45-87 | Technique presentations |
| Animations | €10-15 | Educational content |
| Accessories | €8-40 | General audience |

## Project Structure

```
periospot_new_page/
├── periospot-nextjs/       # Next.js 14 site (production)
├── legacy-wordpress/       # Exported WordPress content
│   └── content/
│       ├── posts.json      # 84 blog posts
│       ├── products.json   # 69 products
│       └── categories.json # Content categories
├── scripts/                # Utility scripts
└── .claude/
    ├── commands/           # Slash commands
    ├── skills/             # Skill definitions
    └── docs/               # Documentation (including MONETIZATION.md)
```

## Content Categories

- Implantology (42 posts) - Highest traffic
- Periodontics (16 posts)
- Periospot Hacks (17 posts)
- Blog español (22 posts)
- Blog português (4 posts)

## SEO & Monetization Integration

When optimizing content, always:
1. Check for missing affiliate links
2. Add internal product CTAs
3. Ensure affiliate disclosure is present
4. Consider email capture opportunities

## Affiliate Machine (Automated Workflow)

When I create affiliate links, the system automatically:
1. **Creates Genius Link** - Geo-targeted link via API
2. **Saves to Tana** - With #affiliate-links supertag
3. **Generates markdown** - Ready to paste into content
4. **Tracks in dashboard** - View at /admin/affiliates

### Quick Product Catalog (85+ products)
```bash
node scripts/affiliate-manager.cjs quick   # List all quick products
```

Categories: Dental Books, Business Books, Loupes, Photography, Instruments, Tech, Health, Lifestyle

### Affiliate Programs Tracker
```bash
node scripts/affiliate-programs.cjs suggest HIGH  # High priority programs to join
```

### Admin Dashboard
Visit `/admin/affiliates` (only cisco@periospot.com) to:
- View all affiliate links and clicks
- Track revenue and conversions
- See broken links
- Discover new opportunities

## Documentation

- [Monetization Strategy](.claude/docs/MONETIZATION.md)
- [SEO Optimization Guide](.claude/skills/seo-optimization/LLM-FIRST-SEO.md)
- [Affiliate Commands](.claude/commands/)
