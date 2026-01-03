# Periospot Article Template & Formatting Fixes

This template ensures articles render correctly with proper image centering, YouTube embeds, and consistent formatting.

---

## Common Formatting Issues to Fix

When optimizing articles, always check and fix these issues:

### 1. Images Not Centered

**Problem**: Images appear left-aligned or have inconsistent positioning.

**Fix**: Wrap images in a figure with proper classes:

```html
<!-- WRONG -->
<img src="image.jpg" alt="Description">

<!-- CORRECT - Centered with caption -->
<figure class="wp-block-image aligncenter">
  <img src="image.jpg" alt="Descriptive alt text explaining the clinical image">
  <figcaption>Caption explaining the clinical significance</figcaption>
</figure>

<!-- CORRECT - Full width -->
<figure class="wp-block-image alignfull">
  <img src="image.jpg" alt="Descriptive alt text">
</figure>
```

### 2. YouTube Videos Not Embedded

**Problem**: YouTube links appear as plain text or broken embeds.

**Fix**: Convert YouTube URLs to proper responsive embeds:

```html
<!-- WRONG - Plain link -->
https://www.youtube.com/watch?v=VIDEO_ID

<!-- WRONG - Old embed style -->
<iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>

<!-- CORRECT - Responsive embed -->
<figure class="wp-block-embed is-type-video is-provider-youtube">
  <div class="wp-block-embed__wrapper">
    <iframe
      src="https://www.youtube.com/embed/VIDEO_ID"
      title="Video title for accessibility"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
</figure>
```

**YouTube URL Patterns to Convert**:
- `https://www.youtube.com/watch?v=VIDEO_ID` → extract VIDEO_ID
- `https://youtu.be/VIDEO_ID` → extract VIDEO_ID
- `https://www.youtube.com/embed/VIDEO_ID` → already embed format

### 3. Missing or Poor Alt Text

**Problem**: Images have empty or generic alt text.

**Fix**: Add descriptive, clinically relevant alt text:

```html
<!-- WRONG -->
<img src="implant.jpg" alt="">
<img src="implant.jpg" alt="image">
<img src="implant.jpg" alt="implant.jpg">

<!-- CORRECT -->
<img src="implant.jpg" alt="Periapical radiograph showing 4mm bone loss around dental implant #14">
```

### 4. Broken Internal Links

**Problem**: Links to old WordPress URLs or broken paths.

**Fix**: Update to new Next.js routes:

```html
<!-- WRONG - Old WordPress URLs -->
<a href="https://periospot.com/?p=123">Related article</a>
<a href="/wp-content/uploads/2023/article.pdf">Download PDF</a>

<!-- CORRECT - New routes -->
<a href="/blog/article-slug">Related article</a>
<a href="/resources/article.pdf">Download PDF</a>
```

### 5. Inconsistent Heading Hierarchy

**Problem**: Headings skip levels or are inconsistent.

**Fix**: Ensure proper hierarchy:

```html
<!-- WRONG -->
<h1>Title</h1>
<h3>Section</h3>  <!-- Skipped H2 -->
<h4>Subsection</h4>

<!-- CORRECT -->
<h1>Title</h1>  <!-- Only in page header, not content -->
<h2>Section</h2>
<h3>Subsection</h3>
```

### 6. Unformatted Lists

**Problem**: Lists appear as plain text with dashes or asterisks.

**Fix**: Convert to proper HTML lists:

```html
<!-- WRONG -->
<p>- Item one</p>
<p>- Item two</p>
<p>* Another item</p>

<!-- CORRECT -->
<ul>
  <li>Item one</li>
  <li>Item two</li>
  <li>Another item</li>
</ul>
```

### 7. Missing Blockquote Formatting

**Problem**: Important quotes or clinical tips appear as regular paragraphs.

**Fix**: Use blockquotes for emphasis:

```html
<!-- WRONG -->
<p>Clinical Tip: Always verify stability before loading.</p>

<!-- CORRECT -->
<blockquote>
  <p><strong>Clinical Tip</strong>: Always verify implant stability before loading. ISQ values >65 indicate adequate stability for immediate loading.</p>
</blockquote>
```

### 8. Tables Not Responsive

**Problem**: Wide tables break on mobile.

**Fix**: Wrap tables in responsive container:

```html
<!-- Add wrapper for horizontal scroll on mobile -->
<div class="table-responsive">
  <table>
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Content Transformation Regex Patterns

Use these patterns when batch-fixing articles:

### YouTube Link to Embed
```javascript
// Pattern to find YouTube URLs
const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g

// Replacement
const embed = `<figure class="wp-block-embed is-type-video is-provider-youtube">
  <div class="wp-block-embed__wrapper">
    <iframe src="https://www.youtube.com/embed/$1" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
  </div>
</figure>`
```

### Center Standalone Images
```javascript
// Find images not in figure tags
const imgPattern = /<p>\s*<img([^>]+)>\s*<\/p>/g

// Wrap in centered figure
const centered = `<figure class="wp-block-image aligncenter"><img$1></figure>`
```

### Fix Empty Alt Text
```javascript
// Find images with empty or missing alt
const emptyAltPattern = /<img([^>]*)\s+alt=["']?\s*["']?([^>]*)>/g

// Flag for manual review (can't auto-generate good alt text)
// Mark with TODO comment
```

---

## Article JSON Structure

When updating `legacy-wordpress/content/posts.json`:

```json
{
  "id": "unique-id",
  "title": "SEO-Optimized Title with Primary Keyword",
  "slug": "url-friendly-slug",
  "excerpt": "Meta description 150-160 chars. Direct answer to query. Call to action.",
  "content": "<p class=\"lead\">Lead paragraph with direct answer...</p><h2>Section</h2>...",
  "date": "2025-01-03T00:00:00Z",
  "modified": "2025-01-03T00:00:00Z",
  "author": {
    "id": "author-slug",
    "name": "Dr. Author Name",
    "email": "author@periospot.com"
  },
  "categories": ["Primary Category", "Secondary Category"],
  "featuredImage": "https://periospot.com/images/article-image.jpg",
  "status": "publish"
}
```

---

## Complete Article Template

```html
<p class="lead">Direct answer to the primary query in the first sentence. Include a key statistic (e.g., affects 12-43% of implants). Overview of treatment or key points. Reference to clinical guidelines or expertise signal.</p>

<h2 id="overview">Overview and Clinical Significance</h2>

<p>Key takeaway for this section stated upfront.</p>

<p>Detailed content with specific clinical information.</p>

<figure class="wp-block-image aligncenter">
  <img src="/images/clinical-image.jpg" alt="Descriptive alt text with clinical context">
  <figcaption>Figure 1: Caption explaining clinical significance</figcaption>
</figure>

<h2 id="etiology">Etiology and Risk Factors</h2>

<p>Key takeaway about causes and risk factors.</p>

<ul>
  <li><strong>Risk Factor 1</strong> (OR 2.5) - Explanation</li>
  <li><strong>Risk Factor 2</strong> (OR 4.7) - Explanation</li>
  <li><strong>Risk Factor 3</strong> (OR 3.6) - Explanation</li>
</ul>

<h2 id="diagnosis">Diagnosis</h2>

<p>Key takeaway about diagnostic approach.</p>

<ol>
  <li>First diagnostic step</li>
  <li>Second diagnostic step</li>
  <li>Third diagnostic step</li>
</ol>

<blockquote>
  <p><strong>Clinical Tip</strong>: Important guidance that clinicians should remember.</p>
</blockquote>

<h2 id="treatment">Treatment Protocols</h2>

<p>Overview of treatment approach.</p>

<h3 id="non-surgical">Non-Surgical Treatment</h3>

<p>Details about non-surgical approach with success rates.</p>

<h3 id="surgical">Surgical Treatment</h3>

<p>Details about surgical approach when indicated.</p>

<figure class="wp-block-embed is-type-video is-provider-youtube">
  <div class="wp-block-embed__wrapper">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Surgical technique demonstration" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
  </div>
</figure>

<h2 id="prevention">Prevention and Maintenance</h2>

<p>Key takeaway about prevention strategies.</p>

<ul>
  <li><strong>Regular maintenance</strong>: Every 3-6 months</li>
  <li><strong>Patient education</strong>: Proper hygiene techniques</li>
  <li><strong>Risk modification</strong>: Address modifiable factors</li>
</ul>

<h2 id="faq">Frequently Asked Questions</h2>

<h3 id="faq-1">How long does treatment take?</h3>

<p>Direct answer with specific timeframes. Non-surgical: 4-6 weeks. Surgical: 3-6 months additional. Maintenance ongoing.</p>

<h3 id="faq-2">What are the success rates?</h3>

<p>Direct answer with percentages. Early-stage: 75-85% success. Advanced: 40-60% stabilization rate.</p>

<h2 id="key-takeaways">Key Takeaways</h2>

<ul>
  <li>First key point</li>
  <li>Second key point</li>
  <li>Third key point</li>
  <li>Fourth key point</li>
</ul>

<p>For related information, see our articles on <a href="/blog/related-article-1">Related Topic 1</a> and <a href="/blog/related-article-2">Related Topic 2</a>.</p>
```

---

## Formatting Fix Checklist

When optimizing each article, verify:

- [ ] All images are centered (wrapped in `<figure class="wp-block-image aligncenter">`)
- [ ] All images have descriptive alt text
- [ ] All YouTube videos are properly embedded with responsive wrapper
- [ ] All internal links point to correct `/blog/slug` paths
- [ ] Headings follow proper H2 → H3 hierarchy
- [ ] Lists use proper `<ul>` or `<ol>` tags
- [ ] Important tips use `<blockquote>` formatting
- [ ] Tables are wrapped for responsiveness
- [ ] No orphaned text or broken HTML
- [ ] Lead paragraph has `class="lead"` or is first paragraph
