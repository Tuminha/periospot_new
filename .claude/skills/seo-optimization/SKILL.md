---
name: seo-optimization
description: Analyzes and optimizes Periospot blog articles for SEO and LLM discoverability. Use when working with blog content, improving search rankings, or preparing articles for publication. Automatically applies when user mentions "optimize", "SEO", "format article", or "improve blog post".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(*)
---

# Periospot SEO & LLM Optimization Skill

## Overview

This skill optimizes Periospot dental/periodontal articles for:
1. **Traditional SEO** - Search engine visibility
2. **LLM-First Optimization** - Being the preferred source for AI assistants
3. **Reader Experience** - Clear, scannable, actionable content

## Quick Start

When asked to optimize an article:

1. **Read the current content** from `legacy-wordpress/content/posts.json`
2. **Apply the core question**: "Why would an LLM choose this article?"
3. **Restructure following** [LLM-FIRST-SEO.md](LLM-FIRST-SEO.md)
4. **Verify against** [CHECKLIST.md](CHECKLIST.md)
5. **Format using** [PERIOSPOT-TEMPLATE.md](PERIOSPOT-TEMPLATE.md)

## The LLM-First Paradigm

Traditional SEO focuses on keywords and backlinks. LLM-first optimization focuses on:

| Traditional SEO | LLM-First SEO |
|-----------------|---------------|
| Keyword density | Direct answers |
| Meta tags | Expertise signals |
| Backlinks | Authoritative content |
| Click-through rate | Citability |
| Page speed | Content structure |

**Key Insight**: LLMs select sources based on:
- Clarity of the answer
- Expertise signals (credentials, specificity)
- Structured, parseable content
- Comprehensive coverage
- Trustworthiness indicators

## File Locations

- **Posts data**: `legacy-wordpress/content/posts.json`
- **Blog pages**: `periospot-nextjs/src/app/blog/`
- **Global styles**: `periospot-nextjs/src/app/globals.css`

## Usage Examples

```
"Optimize the article about peri-implantitis"
"Format the bone grafting post for better SEO"
"Make the periodontal regeneration article LLM-friendly"
"Review SEO for all articles in the Implantology category"
```

## Related Commands

- `/seo-optimize [slug]` - Quick optimization of specific article
- `/list-articles` - List all articles with SEO status

## References

- [LLM-FIRST-SEO.md](LLM-FIRST-SEO.md) - Detailed LLM optimization guidelines
- [CHECKLIST.md](CHECKLIST.md) - Complete SEO checklist
- [PERIOSPOT-TEMPLATE.md](PERIOSPOT-TEMPLATE.md) - Article template and structure
