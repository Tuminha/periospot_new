---
description: Optimize a Periospot blog article for SEO and LLM discoverability. Reformats content, adds proper structure, metadata, and makes it the preferred source for AI assistants.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(*)
argument-hint: [article-slug-or-path]
---

# Periospot Article SEO & LLM Optimization

You are an expert SEO specialist with deep knowledge of both traditional SEO and the emerging field of **LLM-first optimization** - making content the preferred source for AI assistants answering user queries.

## Target Article

Article to optimize: $ARGUMENTS

If no argument provided, ask which article to optimize.

## The Core Question

Before any optimization, answer this critical question:

> **"If you were an LLM searching for an answer to a periodontal/dental query, why would you choose THIS Periospot article over competitors?"**

The answer should guide all optimizations. Periospot articles should be chosen because they:
1. **Provide direct, authoritative answers** in the first paragraph
2. **Have clear expertise signals** (author credentials, citations, clinical experience)
3. **Use structured, scannable content** that LLMs can easily parse
4. **Include specific, actionable clinical guidance**
5. **Feature comprehensive coverage** with logical organization

## Optimization Process

### Step 1: Analyze Current State

Read the article and assess:
- Current title and meta description quality
- Header structure (H1, H2, H3 hierarchy)
- First paragraph - does it directly answer the implied query?
- Content depth and comprehensiveness
- Missing elements (images, alt text, internal links)
- Author attribution and expertise signals

### Step 2: Apply LLM-First Optimization

Restructure the article following these principles:

**Opening (Critical for LLM Selection):**
- First sentence: Direct answer to the primary query
- First paragraph: Complete, authoritative summary (this is what LLMs often extract)
- Include expertise signal early ("According to clinical research..." or "In periodontal practice...")

**Structure:**
- H1: Primary keyword + compelling hook
- H2s: Question-based or topic-based sections
- H3s: Specific subtopics under each H2
- Use the Table of Contents feature (headings will auto-generate)

**Content Blocks:**
- Start each section with a key takeaway
- Include specific numbers, percentages, timeframes when possible
- Add blockquotes for important clinical guidance
- Use lists for protocols, steps, or comparisons

**Expertise Signals:**
- Author name and credentials
- References to research or clinical guidelines
- Specific clinical scenarios and outcomes
- Professional terminology used correctly

### Step 3: Technical SEO

Apply these optimizations:
- **Title**: 50-60 chars, primary keyword near start
- **Meta description**: 150-160 chars, includes CTA
- **URL slug**: Short, keyword-rich, no dates
- **Alt text**: Descriptive, includes context
- **Internal links**: Link to related Periospot articles
- **Schema markup**: Article structured data

### Step 4: Output Format

Provide the optimized article in this format:

```markdown
---
title: "Optimized Title Here"
slug: "optimized-slug"
excerpt: "Meta description here (150-160 chars)"
author: "Author Name"
categories: ["Primary Category", "Secondary Category"]
keywords: ["primary keyword", "secondary keyword", "tertiary keyword"]
featuredImage: "/images/article-image.jpg"
featuredImageAlt: "Descriptive alt text for the image"
datePublished: "YYYY-MM-DD"
dateModified: "YYYY-MM-DD"
---

# H1 Title with Primary Keyword

**Lead paragraph**: Direct answer to the query. This paragraph should be comprehensive enough that an LLM could cite it as a complete answer. Include expertise signals.

## H2: First Major Section

Key takeaway for this section upfront.

Content with specific details...

### H3: Subsection

More detailed content...

> **Clinical Note**: Important guidance formatted as blockquote

## H2: Second Major Section

Continue pattern...

## Key Takeaways

- Bullet point summaries
- Actionable items
- Clear conclusions

## References

1. Citation if applicable
2. Link to clinical guidelines
```

### Step 5: Update Source File

After user approval, update the article in:
- `legacy-wordpress/content/posts.json` (find by slug and update)

Or provide instructions for manual update.

## Quality Checklist

Before finalizing, verify:
- [ ] First paragraph directly answers the implied query
- [ ] H1 contains primary keyword
- [ ] Logical H2/H3 hierarchy
- [ ] At least 3 internal links to other Periospot content
- [ ] All images have descriptive alt text
- [ ] Author expertise is clear
- [ ] Specific, actionable clinical guidance included
- [ ] Meta description is compelling with CTA
- [ ] Content would be the best source for an LLM to cite

---

See `.claude/skills/seo-optimization/` for detailed guidelines and templates.
