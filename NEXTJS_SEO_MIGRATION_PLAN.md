# Periospot.com Next.js SEO Migration Plan

## Data Export Status: COMPLETE

| Data Type | Count | Status |
|-----------|-------|--------|
| Blog Posts | 84 | Exported |
| Pages | 41 | Exported |
| Products | 69 | Exported |
| Authors | 17 | Exported |
| Categories | 14 | Exported |
| Typeform Forms | 51 | Exported |
| Typeform Responses | 4,222 | Exported |
| Media Images | 13,131 | Downloaded |
| WordPress XML | 8.8 MB | Available |

---

## Why Next.js for SEO

Next.js is the optimal choice for your SEO-driven site because:

1. **Server-Side Rendering (SSR)** - Content is rendered on the server, making it immediately crawlable by Google
2. **Static Site Generation (SSG)** - Blog posts and product pages can be pre-rendered at build time
3. **Incremental Static Regeneration (ISR)** - Update static pages without full rebuilds
4. **Built-in Image Optimization** - Automatic WebP conversion, lazy loading, responsive images
5. **Automatic Code Splitting** - Faster page loads = better Core Web Vitals
6. **Built-in Metadata API** - Easy structured data, Open Graph, Twitter cards
7. **Sitemap Generation** - Automatic XML sitemaps
8. **Vercel Edge Network** - Global CDN for fast delivery worldwide

---

## Project Architecture

```
periospot-nextjs/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Homepage
│   ├── blog/
│   │   ├── page.tsx              # Blog listing (SSG with ISR)
│   │   └── [slug]/
│   │       └── page.tsx          # Blog post (SSG)
│   ├── tienda/                   # Shop (Spanish URL preserved)
│   │   ├── page.tsx              # Product listing
│   │   └── [slug]/
│   │       └── page.tsx          # Product detail
│   ├── library/
│   │   └── page.tsx              # eBooks/Resources
│   ├── assessments/
│   │   ├── page.tsx              # Assessment listing
│   │   └── [slug]/
│   │       └── page.tsx          # Individual assessment
│   ├── about/
│   │   └── page.tsx              # About page
│   ├── team/
│   │   └── page.tsx              # Team page
│   ├── contact/
│   │   └── page.tsx              # Contact page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── api/                      # API Routes
│   │   ├── newsletter/route.ts
│   │   ├── contact/route.ts
│   │   └── assessments/route.ts
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts                 # Robots.txt
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── blog/
│   │   ├── PostCard.tsx
│   │   ├── PostContent.tsx
│   │   └── AuthorCard.tsx
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   └── ProductGallery.tsx
│   ├── assessments/
│   │   ├── QuizEngine.tsx
│   │   └── ResultsDisplay.tsx
│   └── ui/                       # ShadCN components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── content.ts                # Content fetching
│   └── seo.ts                    # SEO utilities
├── content/                      # Static content (MDX optional)
│   ├── posts/                    # Blog posts as JSON/MDX
│   └── pages/                    # Static pages
└── public/
    ├── images/                   # Optimized images
    └── fonts/                    # Bariol fonts
```

---

## SEO Implementation Strategy

### 1. Metadata Configuration

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://periospot.com'),
  title: {
    default: 'Periospot - Where Learning Dentistry is Easy',
    template: '%s | Periospot'
  },
  description: 'Educational platform for dental professionals. Learn implantology, periodontics, and aesthetic dentistry.',
  keywords: ['dental education', 'implantology', 'periodontics', 'dentistry courses'],
  authors: [{ name: 'Francisco Teixeira Barbosa' }],
  creator: 'Periospot',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://periospot.com',
    siteName: 'Periospot',
    images: ['/og-image.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    site: '@periospot',
    creator: '@periospot'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code'
  }
}
```

### 2. Blog Post SEO (Per-Page)

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      images: [post.featuredImage]
    },
    alternates: {
      canonical: `https://periospot.com/blog/${post.slug}`
    }
  }
}
```

### 3. Structured Data (JSON-LD)

```typescript
// components/seo/ArticleSchema.tsx
export function ArticleSchema({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author.name
    },
    publisher: {
      '@type': 'Organization',
      name: 'Periospot',
      logo: {
        '@type': 'ImageObject',
        url: 'https://periospot.com/logo.png'
      }
    },
    datePublished: post.date,
    dateModified: post.modified
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 4. Dynamic Sitemap

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()
  const products = await getAllProducts()

  const blogUrls = posts.map(post => ({
    url: `https://periospot.com/blog/${post.slug}`,
    lastModified: post.modified,
    changeFrequency: 'monthly' as const,
    priority: 0.8
  }))

  const productUrls = products.map(product => ({
    url: `https://periospot.com/tienda/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9
  }))

  return [
    { url: 'https://periospot.com', priority: 1.0 },
    { url: 'https://periospot.com/blog', priority: 0.9 },
    { url: 'https://periospot.com/tienda', priority: 0.9 },
    { url: 'https://periospot.com/library', priority: 0.8 },
    { url: 'https://periospot.com/assessments', priority: 0.8 },
    ...blogUrls,
    ...productUrls
  ]
}
```

### 5. 301 Redirects (Critical for SEO)

```typescript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // Preserve old WordPress URLs
      { source: '/producto/:slug', destination: '/tienda/:slug', permanent: true },
      { source: '/category/:slug', destination: '/blog/category/:slug', permanent: true },
      { source: '/author/:slug', destination: '/team/:slug', permanent: true },
      // Add all old URLs from WordPress
    ]
  }
}
```

---

## URL Structure (SEO Optimized)

| Content Type | Old WordPress URL | New Next.js URL |
|--------------|-------------------|-----------------|
| Blog Post | `/bone-dynamics-after-extraction/` | `/blog/bone-dynamics-after-extraction` |
| Product | `/producto/socket-shield-kit/` | `/tienda/socket-shield-kit` |
| Category | `/category/implantology/` | `/blog/category/implantology` |
| Author | `/author/cisco/` | `/team/cisco` |
| eBook | `/library/` | `/library` |
| Assessment | `/assessments/` | `/assessments` |

---

## Static Generation Strategy

### Blog Posts (SSG + ISR)

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

// Revalidate every 24 hours
export const revalidate = 86400
```

### Products (SSG + ISR)

```typescript
// app/tienda/[slug]/page.tsx
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map(product => ({ slug: product.slug }))
}

// Revalidate every hour for price updates
export const revalidate = 3600
```

---

## Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'periospot.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}
```

---

## Phase-by-Phase Implementation

### Phase 1: Foundation (Week 1)
- [ ] Initialize Next.js 14 project with App Router
- [ ] Configure Supabase connection
- [ ] Set up Tailwind CSS + ShadCN UI
- [ ] Create base layout (Header, Footer, Navigation)
- [ ] Configure metadata defaults
- [ ] Set up Bariol fonts

### Phase 2: Content Pages (Week 2)
- [ ] Build Blog listing page with pagination
- [ ] Build Blog post page with full SEO
- [ ] Build static pages (About, Contact, Team)
- [ ] Implement structured data (JSON-LD)
- [ ] Create sitemap.ts and robots.ts

### Phase 3: E-commerce (Week 3)
- [ ] Build Shop listing page
- [ ] Build Product detail page
- [ ] Integrate with WooCommerce API (or migrate to Stripe)
- [ ] Build Cart and Checkout flow
- [ ] Implement product schema markup

### Phase 4: Assessments (Week 4)
- [ ] Build Assessment listing page
- [ ] Build Quiz engine component
- [ ] Migrate Typeform data to Supabase
- [ ] Build results display with PDF generation
- [ ] Add assessment tracking

### Phase 5: Authentication & User Features (Week 5)
- [ ] Implement Supabase Auth
- [ ] Build user dashboard
- [ ] Purchase history display
- [ ] Assessment results history
- [ ] Newsletter subscription

### Phase 6: SEO & Performance (Week 6)
- [ ] Generate all 301 redirects from old URLs
- [ ] Test all canonical URLs
- [ ] Submit sitemap to Google Search Console
- [ ] Optimize Core Web Vitals (LCP, FID, CLS)
- [ ] Set up analytics (GA4, Search Console)

### Phase 7: Launch Preparation
- [ ] Configure Vercel deployment
- [ ] Set up custom domain
- [ ] SSL certificate verification
- [ ] Final SEO audit
- [ ] Performance testing
- [ ] Backup old WordPress site

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ajueupqlrodkhfgkegnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WooCommerce (if keeping)
WOOCOMMERCE_URL=https://periospot.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxx

# Email
RESEND_API_KEY=re_xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-xxx

# Typeform (for migration only)
TYPEFORM_API_KEY=tfp_xxx
```

---

## Key SEO Metrics to Monitor

1. **Core Web Vitals**
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

2. **Indexing**
   - Pages indexed in Google Search Console
   - Crawl errors
   - Mobile usability issues

3. **Rankings**
   - Track top 20 keywords
   - Monitor position changes
   - Click-through rates

4. **Traffic**
   - Organic search traffic
   - Page views per session
   - Bounce rate

---

## Quick Start Commands

```bash
# Initialize Next.js project
npx create-next-app@latest periospot-nextjs --typescript --tailwind --eslint --app --src-dir

# Install dependencies
cd periospot-nextjs
npm install @supabase/supabase-js @supabase/ssr
npm install next-themes class-variance-authority clsx tailwind-merge
npx shadcn@latest init

# Development
npm run dev

# Build
npm run build

# Deploy to Vercel
vercel
```

---

## Files to Create First

1. `app/layout.tsx` - Root layout with metadata
2. `app/page.tsx` - Homepage
3. `lib/supabase/server.ts` - Server-side Supabase client
4. `lib/content.ts` - Content fetching utilities
5. `app/sitemap.ts` - Dynamic sitemap
6. `app/robots.ts` - Robots.txt

---

## Summary

This migration plan will give you:

- **100% SEO-friendly** server-rendered pages
- **Fast page loads** with static generation
- **Proper URL structure** with 301 redirects
- **Rich snippets** with structured data
- **Automatic sitemaps** for Google
- **Image optimization** built-in
- **Multilingual support** ready (ES, PT, EN, CN)

Ready to start implementation when you are!
