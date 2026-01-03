---
description: List all Periospot blog articles with their SEO optimization status, formatting issues, and priority ranking.
allowed-tools: Read, Grep, Glob, Bash(*)
---

# List Periospot Articles for Optimization

Generate a comprehensive list of all blog articles with their current optimization status.

## Analysis Process

1. **Read all posts** from `legacy-wordpress/content/posts.json`

2. **For each article, assess**:
   - Title quality (keyword presence, length)
   - First paragraph (does it answer a query directly?)
   - Heading structure (H2/H3 hierarchy)
   - Image issues (missing alt text, not centered)
   - YouTube embeds (broken or not responsive)
   - Content length
   - Categories assigned
   - Last modified date

3. **Score each article** (0-100):
   - Title & Meta: 15 points
   - Opening paragraph: 20 points (most important for LLM)
   - Structure: 15 points
   - Content quality: 20 points
   - Images & media: 15 points
   - Internal links: 15 points

4. **Identify formatting issues**:
   - `[IMG]` = Images not centered or missing alt text
   - `[YT]` = YouTube not properly embedded
   - `[STRUCT]` = Poor heading structure
   - `[LEAD]` = Weak opening paragraph
   - `[LINK]` = Missing internal links
   - `[META]` = Poor title/description

## Output Format

Generate a markdown table:

```markdown
## Periospot Article Optimization Status

| # | Slug | Title | Score | Issues | Priority |
|---|------|-------|-------|--------|----------|
| 1 | article-slug | Article Title | 45/100 | [LEAD][IMG][YT] | HIGH |
| 2 | another-slug | Another Title | 72/100 | [LINK] | MEDIUM |
```

### Priority Levels:
- **HIGH** (Score < 50): Major rewrite needed
- **MEDIUM** (Score 50-75): Optimization needed
- **LOW** (Score > 75): Minor tweaks only

## Quick Analysis Script

Run this to get a quick overview:

```javascript
// Read posts.json and analyze
const posts = require('./legacy-wordpress/content/posts.json');

posts.forEach(post => {
  const issues = [];

  // Check first paragraph for direct answer
  const firstP = post.content.match(/<p[^>]*>(.*?)<\/p>/i)?.[1] || '';
  if (firstP.length < 100 || firstP.includes('In this article')) {
    issues.push('[LEAD]');
  }

  // Check for images without alt
  if (/<img[^>]*alt=["']?\s*["']?[^>]*>/i.test(post.content)) {
    issues.push('[IMG]');
  }

  // Check for YouTube URLs not in embeds
  if (/youtube\.com\/watch|youtu\.be/.test(post.content) &&
      !/<iframe[^>]*youtube/i.test(post.content)) {
    issues.push('[YT]');
  }

  // Check heading structure
  if (!/<h2/i.test(post.content)) {
    issues.push('[STRUCT]');
  }

  // Check internal links
  if (!/<a[^>]*href=["']\/blog/i.test(post.content)) {
    issues.push('[LINK]');
  }

  // Calculate rough score
  let score = 50;
  score -= issues.length * 10;
  score = Math.max(0, Math.min(100, score));

  console.log(`${post.slug} | ${score}/100 | ${issues.join('')}`);
});
```

## Categories Summary

Also generate a summary by category:

```markdown
## Articles by Category

| Category | Total | High Priority | Medium | Low |
|----------|-------|---------------|--------|-----|
| Periodontics | 25 | 8 | 12 | 5 |
| Implantology | 18 | 5 | 9 | 4 |
```

## Recommended Optimization Order

1. **High-traffic articles first** (if analytics available)
2. **Articles with most issues** (biggest improvement potential)
3. **Foundational topics** (often linked to by others)
4. **Recent articles** (easier to optimize fresh content)

---

After running this command, use `/seo-optimize [slug]` to optimize individual articles.
