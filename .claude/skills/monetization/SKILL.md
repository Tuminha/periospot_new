# Monetization Skill for Periospot

## Purpose

This skill ensures monetization opportunities are identified and flagged whenever working with Periospot content.

## Automatic Triggers

Flag monetization opportunities when:
- Creating or editing blog content
- Reviewing articles for SEO
- Discussing products or equipment
- Mentioning books, courses, or tools

## Opportunity Markers

Use these tags in analysis:

- `[MONEY:AMAZON]` - Can add Amazon affiliate link
- `[MONEY:PRODUCT]` - Can cross-sell Periospot product
- `[MONEY:AFFILIATE]` - Can add other affiliate link
- `[MONEY:CTA]` - Missing call-to-action
- `[MONEY:EMAIL]` - Can add email capture
- `[MONEY:SPONSOR]` - Sponsored content opportunity

## Quick Reference

### Amazon Affiliate Tag
```
tag=advaimpldigid-20
```

### High-Value Keywords to Flag

| Keyword | Monetization Type |
|---------|-------------------|
| book, textbook | Amazon books |
| implant system | Manufacturer affiliate |
| instrument, curette | Hu-Friedy affiliate |
| loupe, microscope | Orascoptic/Zeiss |
| camera, photo | Amazon equipment |
| course, CE credit | Education affiliate |
| software | SaaS affiliate |
| membrane, graft | Geistlich affiliate |

### Periospot Products to Cross-Sell

- **Socket Shield Kit** (€297) - For socket shield articles
- **Speaker Packs** (€45-87) - For technique articles
- **Animations** (€10-15) - For educational content
- **Accessories** - For general audience content

## Integration

This skill works alongside:
- `/seo-optimize` - Add monetization during SEO work
- `/list-articles` - Prioritize by monetization potential
- `/monetize` - Full monetization analysis

## Documentation

Full strategy: [.claude/docs/MONETIZATION.md](../../docs/MONETIZATION.md)
