# PerioSpot Comprehensive Migration & Implementation Roadmap

**Priority Level:** 🔴 CRITICAL - This is the foundation for all functionality
**Target:** GPT Codex
**Status:** Ready for Implementation
**Last Updated:** January 2, 2026

---

## Executive Summary

This document provides a **deep-dive, comprehensive roadmap** for migrating ALL content, features, and functionality from the old PerioSpot (WordPress) to the new PerioSpot (Vite + React + Supabase). This includes:

- **Blog Posts & Articles** - All content with metadata
- **eBooks & Downloads** - With download tracking and email delivery via Resend
- **Questionnaires** - Typeform integration and assessment system
- **Product Catalog** - WooCommerce products with pricing
- **User Assessments** - Diagnostic questionnaires with results
- **Newsletter System** - Email subscription and delivery
- **Media Library** - All images, videos, and documents
- **SEO Data** - Yoast SEO migration (meta tags, structured data, redirects)
- **User Profiles** - Authentication and profile management

---

## Part 1: Content Inventory & Analysis

### 1.1 Blog Posts & Articles

**Current State (WordPress):**
- Location: `/legacy-wordpress/content/posts.json`
- Format: JSON export from WordPress
- Estimated Count: 50-100+ articles
- Metadata: Title, slug, content, author, date, category, tags, featured image

**What Needs to Happen:**
1. Parse `posts.json` file
2. Extract all articles with metadata
3. Create Supabase table for posts
4. Migrate content to database
5. Create article detail pages
6. Implement article listing with filtering
7. Add search functionality
8. Create author pages
9. Create category pages
10. Implement related articles

**Database Schema:**

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  featured_image_url TEXT,
  featured_image_alt TEXT,
  status TEXT DEFAULT 'published', -- published, draft, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  read_time_minutes INT,
  view_count INT DEFAULT 0,
  
  -- SEO Fields (from Yoast)
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  seo_focus_keyword TEXT,
  canonical_url TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  
  -- Structured Data
  schema_json JSONB,
  
  -- Internal Links
  related_post_ids UUID[],
  
  -- Analytics
  yoast_score INT,
  readability_score INT
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_tag_relations (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

**Implementation Tasks:**
- [ ] Parse posts.json and extract all articles
- [ ] Create posts table in Supabase
- [ ] Create categories table
- [ ] Create tags system
- [ ] Migrate all posts to database
- [ ] Create ArticleDetail page component
- [ ] Create ArticleList page component
- [ ] Create CategoryPage component
- [ ] Create AuthorPage component
- [ ] Implement article search
- [ ] Add related articles widget
- [ ] Create article breadcrumbs

---

### 1.2 eBooks & Downloadable Resources

**Current State (WordPress):**
- Location: `/periospot-assets/` (media files)
- Format: PDF, EPUB, ZIP files
- Estimated Count: 10-20+ eBooks
- Metadata: Title, description, cover image, file size, download count

**What Needs to Happen:**
1. Inventory all eBook files in periospot-assets
2. Create Supabase table for eBooks
3. Create eBook detail pages
4. Implement download tracking
5. Create eBook listing page
6. Integrate with Resend for email delivery
7. Create download confirmation email
8. Implement email capture for downloads
9. Create eBook preview system
10. Add eBook recommendations

**Database Schema:**

```sql
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT, -- pdf, epub, zip
  file_size_mb DECIMAL,
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  download_count INT DEFAULT 0,
  status TEXT DEFAULT 'published', -- published, draft, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  
  -- SEO Fields (from Yoast)
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  
  -- Structured Data
  schema_json JSONB,
  
  -- Pricing (if premium)
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL,
  currency TEXT DEFAULT 'USD',
  
  -- Preview
  preview_url TEXT,
  preview_pages INT
);

CREATE TABLE ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  downloaded_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE ebook_email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  captured_at TIMESTAMP DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP
);
```

**Implementation Tasks:**
- [ ] Inventory all eBook files
- [ ] Create ebooks table in Supabase
- [ ] Create eBook detail page component
- [ ] Create eBook listing page
- [ ] Implement email capture form
- [ ] Integrate Resend for email delivery
- [ ] Create download confirmation email template
- [ ] Create eBook preview system
- [ ] Implement download tracking
- [ ] Add eBook recommendations
- [ ] Create eBook categories
- [ ] Add eBook search and filtering
- [ ] Create eBook bundles

---

### 1.3 Questionnaires & Assessments (Typeform Integration)

**Current State (WordPress):**
- Location: Typeform embedded forms
- Estimated Count: 5-10+ questionnaires
- Data: Form responses stored in Typeform

**What Needs to Happen:**
1. Document all Typeform questionnaires
2. Create Supabase table for assessments
3. Create assessment detail pages
4. Implement assessment form display
5. Integrate Typeform API for responses
6. Create assessment result pages
7. Implement result email delivery
8. Create assessment history tracking
9. Add assessment recommendations
10. Create assessment analytics

**Database Schema:**

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  typeform_id TEXT NOT NULL,
  estimated_time_minutes INT,
  result_email_template_id UUID,
  status TEXT DEFAULT 'published', -- published, draft, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- SEO Fields (from Yoast)
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  
  -- Structured Data
  schema_json JSONB,
  
  -- Analytics
  completion_count INT DEFAULT 0,
  average_completion_time_seconds INT
);

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  typeform_response_id TEXT,
  responses JSONB,
  score INT,
  result_category TEXT,
  completed_at TIMESTAMP DEFAULT NOW(),
  result_email_sent BOOLEAN DEFAULT FALSE,
  result_email_sent_at TIMESTAMP
);

CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score_range_min INT,
  score_range_max INT,
  result_title TEXT,
  result_description TEXT,
  recommendations TEXT,
  related_resources JSONB, -- Links to articles, ebooks, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  email TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  time_spent_seconds INT
);
```

**Implementation Tasks:**
- [ ] Document all Typeform questionnaires
- [ ] Get Typeform API access
- [ ] Create assessments table
- [ ] Create assessment detail page
- [ ] Implement Typeform embed
- [ ] Create assessment result page
- [ ] Integrate Typeform API for responses
- [ ] Create result email template
- [ ] Implement email delivery via Resend
- [ ] Add assessment history tracking
- [ ] Create assessment recommendations
- [ ] Add related resources to results
- [ ] Implement assessment analytics

---

### 1.4 Products & WooCommerce Integration

**Current State (WordPress):**
- Location: WooCommerce products
- Estimated Count: 20-50+ products
- Metadata: Title, description, price, images, categories, tags

**What Needs to Happen:**
1. Extract all WooCommerce products
2. Create Supabase table for products
3. Create product detail pages
4. Implement product listing with filtering
5. Create shopping cart system
6. Integrate WooCommerce API
7. Create product search
8. Add product reviews
9. Implement wishlist
10. Create product recommendations

**Database Schema:**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  woocommerce_id INT,
  sku TEXT UNIQUE,
  category_id UUID REFERENCES categories(id),
  featured_image_url TEXT,
  gallery_images JSONB, -- Array of image URLs
  status TEXT DEFAULT 'published', -- published, draft, archived
  stock_quantity INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- SEO Fields (from Yoast)
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  
  -- Structured Data
  schema_json JSONB,
  
  -- Analytics
  view_count INT DEFAULT 0,
  purchase_count INT DEFAULT 0,
  average_rating DECIMAL,
  review_count INT DEFAULT 0
);

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  order_number TEXT UNIQUE,
  total_amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation Tasks:**
- [ ] Extract all WooCommerce products
- [ ] Create products table
- [ ] Create product detail page
- [ ] Create product listing page
- [ ] Implement product filtering
- [ ] Create shopping cart
- [ ] Implement checkout process
- [ ] Integrate WooCommerce API
- [ ] Add product reviews
- [ ] Create product search
- [ ] Add product recommendations
- [ ] Implement wishlist

---

### 1.5 Newsletter & Email Subscription

**Current State (WordPress):**
- Location: Newsletter plugin or custom implementation
- Estimated Subscribers: 1,000-10,000+
- Metadata: Email, name, subscription date, status

**What Needs to Happen:**
1. Export existing newsletter subscribers
2. Create Supabase table for subscribers
3. Implement subscription form
4. Integrate Resend for email delivery
5. Create email templates
6. Implement email scheduling
7. Create newsletter archive
8. Add unsubscribe functionality
9. Implement email analytics
10. Create subscriber segments

**Database Schema:**

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  bounce_count INT DEFAULT 0,
  last_email_sent_at TIMESTAMP,
  preferences JSONB, -- Email preferences, frequency, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  status TEXT DEFAULT 'draft', -- draft, scheduled, sent, failed
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Analytics
  recipient_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  bounced_count INT DEFAULT 0,
  unsubscribed_count INT DEFAULT 0
);

CREATE TABLE newsletter_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_email TEXT,
  opened_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE newsletter_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_email TEXT,
  link_url TEXT,
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

**Implementation Tasks:**
- [ ] Export existing newsletter subscribers
- [ ] Create newsletter_subscribers table
- [ ] Implement subscription form
- [ ] Integrate Resend for email delivery
- [ ] Create email templates
- [ ] Implement email scheduling
- [ ] Add unsubscribe functionality
- [ ] Create newsletter archive page
- [ ] Implement email analytics tracking
- [ ] Add subscriber preferences
- [ ] Create newsletter segments
- [ ] Implement double opt-in

---

### 1.6 Media Library & Assets

**Current State (WordPress):**
- Location: `/periospot-assets/` directory
- Types: Images (JPG, PNG, WebP), Videos (MP4, WebM), Documents (PDF)
- Estimated Count: 500-2000+ files
- Metadata: Filename, size, dimensions, alt text, upload date

**What Needs to Happen:**
1. Inventory all media files
2. Organize media by type and category
3. Create Supabase table for media
4. Implement image optimization
5. Create CDN/storage strategy
6. Implement lazy loading
7. Create image gallery components
8. Add image search
9. Implement media analytics
10. Create media backup strategy

**Database Schema:**

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_type TEXT, -- image, video, document, audio
  mime_type TEXT,
  file_size_bytes INT,
  url TEXT NOT NULL,
  cdn_url TEXT,
  
  -- Image specific
  width INT,
  height INT,
  alt_text TEXT,
  caption TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  -- Organization
  category TEXT,
  tags TEXT[],
  
  -- Usage tracking
  used_in_posts INT DEFAULT 0,
  used_in_products INT DEFAULT 0,
  view_count INT DEFAULT 0,
  
  -- Optimization
  has_thumbnail BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  has_webp BOOLEAN DEFAULT FALSE,
  webp_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  used_in_type TEXT, -- post, product, page, etc.
  used_in_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation Tasks:**
- [ ] Inventory all media files
- [ ] Create media table
- [ ] Organize media by type
- [ ] Implement image optimization
- [ ] Set up CDN/storage
- [ ] Create image gallery component
- [ ] Implement lazy loading
- [ ] Add image search
- [ ] Create media analytics
- [ ] Implement media backup

---

### 1.7 SEO Data Migration (Yoast SEO)

**Current State (WordPress):**
- Yoast SEO plugin with all metadata
- Meta titles, descriptions, keywords
- Readability scores, SEO scores
- Redirects, canonical URLs
- XML sitemaps
- Structured data (schema.org)
- Open Graph tags

**What Needs to Happen:**
1. Export all Yoast SEO metadata
2. Create SEO table in Supabase
3. Implement meta tag rendering
4. Create structured data generation
5. Implement canonical URLs
6. Create 301 redirects system
7. Generate XML sitemaps
8. Create robots.txt
9. Implement Open Graph tags
10. Add schema.org structured data

**Database Schema:**

```sql
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT, -- post, product, page, etc.
  content_id UUID,
  
  -- Yoast SEO Data
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  focus_keyword TEXT,
  
  -- Scores
  yoast_seo_score INT, -- 0-100
  readability_score INT, -- 0-100
  
  -- URLs
  canonical_url TEXT,
  permalink TEXT,
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'article',
  
  -- Twitter Card
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  twitter_card_type TEXT,
  
  -- Structured Data
  schema_type TEXT, -- Article, Product, Person, etc.
  schema_json JSONB,
  
  -- Internal Links
  internal_links JSONB,
  
  -- Readability
  flesch_kincaid_grade INT,
  word_count INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_url TEXT NOT NULL,
  new_url TEXT NOT NULL,
  status_code INT DEFAULT 301, -- 301, 302, 307, 308
  type TEXT DEFAULT 'permanent', -- permanent, temporary
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL,
  search_volume INT,
  difficulty INT,
  content_id UUID,
  content_type TEXT,
  ranking_position INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation Tasks:**
- [ ] Export all Yoast SEO metadata
- [ ] Create seo_metadata table
- [ ] Create redirects table
- [ ] Implement meta tag rendering
- [ ] Create structured data generation
- [ ] Implement canonical URLs
- [ ] Create 301 redirects system
- [ ] Generate XML sitemaps
- [ ] Create robots.txt
- [ ] Add Open Graph tags
- [ ] Implement schema.org data
- [ ] Create SEO analytics dashboard

---

## Part 2: Feature Implementation Roadmap

### 2.1 Blog/Articles System

**Components to Build:**
1. **ArticleList.tsx** - Display all articles with pagination
2. **ArticleDetail.tsx** - Individual article page
3. **ArticleCard.tsx** - Article preview card
4. **CategoryPage.tsx** - Articles by category
5. **AuthorPage.tsx** - Articles by author
6. **SearchArticles.tsx** - Article search functionality
7. **RelatedArticles.tsx** - Show related articles
8. **ArticleComments.tsx** - Comment system
9. **ArticleShare.tsx** - Social sharing buttons
10. **ArticleTableOfContents.tsx** - TOC for long articles

**Features:**
- Full-text search
- Filtering by category, author, date
- Pagination
- Reading time estimation
- View count tracking
- Comment system
- Social sharing
- Related articles
- Breadcrumbs
- Table of contents

---

### 2.2 eBook System

**Components to Build:**
1. **EbookList.tsx** - Display all eBooks
2. **EbookDetail.tsx** - Individual eBook page
3. **EbookCard.tsx** - eBook preview card
4. **EbookDownloadForm.tsx** - Email capture + download
5. **EbookPreview.tsx** - Preview pages
6. **EbookRecommendations.tsx** - Related eBooks
7. **DownloadConfirmation.tsx** - Confirmation page

**Features:**
- Email capture before download
- Download tracking
- Email delivery via Resend
- Preview pages
- Download history
- eBook recommendations
- Category filtering
- Search functionality
- Download analytics

---

### 2.3 Assessment/Questionnaire System

**Components to Build:**
1. **AssessmentList.tsx** - Display all assessments
2. **AssessmentDetail.tsx** - Assessment page
3. **AssessmentForm.tsx** - Typeform embed
4. **AssessmentResults.tsx** - Results page
5. **ResultsEmail.tsx** - Email template for results
6. **AssessmentHistory.tsx** - User's past assessments
7. **AssessmentRecommendations.tsx** - Recommended resources

**Features:**
- Typeform integration
- Response capture
- Result calculation
- Email delivery
- Result history
- Recommendations
- Analytics tracking
- Assessment sharing

---

### 2.4 Product Catalog

**Components to Build:**
1. **ProductList.tsx** - Display all products
2. **ProductDetail.tsx** - Individual product page
3. **ProductCard.tsx** - Product preview
4. **ProductFilters.tsx** - Filtering and search
5. **ShoppingCart.tsx** - Cart management
6. **Checkout.tsx** - Checkout process
7. **ProductReviews.tsx** - Review system
8. **Wishlist.tsx** - Wishlist management
9. **ProductRecommendations.tsx** - Related products

**Features:**
- Product filtering
- Search functionality
- Shopping cart
- Checkout process
- Payment integration
- Product reviews
- Wishlist
- Order history
- Product recommendations

---

### 2.5 Newsletter System

**Components to Build:**
1. **NewsletterSubscribe.tsx** - Subscription form
2. **NewsletterArchive.tsx** - Past newsletters
3. **NewsletterDetail.tsx** - Individual newsletter
4. **UnsubscribeConfirmation.tsx** - Unsubscribe page
5. **SubscriptionPreferences.tsx** - Preference management

**Features:**
- Email subscription
- Double opt-in
- Preference management
- Newsletter archive
- Unsubscribe functionality
- Email delivery via Resend
- Analytics tracking

---

### 2.6 User Profile & Dashboard

**Components to Build:**
1. **UserDashboard.tsx** - Main dashboard
2. **UserProfile.tsx** - Profile management
3. **EditProfile.tsx** - Profile editing
4. **DownloadHistory.tsx** - Download history
5. **AssessmentHistory.tsx** - Assessment history
6. **OrderHistory.tsx** - Order history
7. **SavedItems.tsx** - Saved articles/products
8. **ChangePassword.tsx** - Password management
9. **AccountSettings.tsx** - Account settings
10. **DeleteAccount.tsx** - Account deletion

**Features:**
- Profile management
- Download history
- Assessment history
- Order history
- Saved items
- Password management
- Account settings
- Account deletion

---

## Part 3: Email System (Resend Integration)

### 3.1 Email Templates Needed

1. **Welcome Email** - New user signup
2. **Email Confirmation** - Email verification
3. **Password Reset** - Password recovery
4. **eBook Download** - eBook delivery
5. **Assessment Results** - Assessment completion
6. **Newsletter** - Weekly/monthly newsletter
7. **Order Confirmation** - Purchase confirmation
8. **Order Shipped** - Shipping notification
9. **Product Review Request** - Review invitation
10. **Unsubscribe Confirmation** - Unsubscribe confirmation

### 3.2 Email Implementation

**Tasks:**
- [ ] Create email template components
- [ ] Integrate Resend API
- [ ] Implement email queue system
- [ ] Add email scheduling
- [ ] Create email analytics
- [ ] Implement retry logic
- [ ] Add email preview
- [ ] Create email testing

---

## Part 4: Database Migration Strategy

### 4.1 Data Sources

1. **posts.json** - Blog posts from WordPress export
2. **pages.json** - Static pages
3. **products.json** - WooCommerce products
4. **authors.json** - Author information
5. **categories.json** - Post categories
6. **tags.json** - Post tags
7. **media files** - Images, videos, documents
8. **Typeform** - Assessment responses

### 4.2 Migration Process

**Step 1: Parse JSON Files**
```bash
# Parse posts.json and extract data
npm run migrate:posts

# Parse products.json
npm run migrate:products

# Parse pages.json
npm run migrate:pages
```

**Step 2: Create Supabase Tables**
- Run SQL migrations
- Create indexes
- Set up RLS policies

**Step 3: Import Data**
- Batch import posts
- Batch import products
- Batch import media metadata

**Step 4: Verify Data**
- Count records
- Check data integrity
- Verify relationships

---

## Part 5: Implementation Timeline & Phases

### Phase 1: Core Content Migration (Week 1-2)
- [ ] Parse and migrate blog posts
- [ ] Create posts table and components
- [ ] Create article listing and detail pages
- [ ] Implement article search and filtering

### Phase 2: eBooks & Downloads (Week 2-3)
- [ ] Inventory eBook files
- [ ] Create ebooks table
- [ ] Create eBook pages
- [ ] Implement email capture
- [ ] Integrate Resend for delivery

### Phase 3: Assessments & Questionnaires (Week 3-4)
- [ ] Document Typeform questionnaires
- [ ] Create assessments table
- [ ] Integrate Typeform API
- [ ] Create assessment pages
- [ ] Implement result emails

### Phase 4: Products & Shop (Week 4-5)
- [ ] Extract WooCommerce products
- [ ] Create products table
- [ ] Create product pages
- [ ] Implement shopping cart
- [ ] Create checkout process

### Phase 5: Newsletter & Email (Week 5-6)
- [ ] Export newsletter subscribers
- [ ] Create newsletter tables
- [ ] Implement subscription form
- [ ] Create email templates
- [ ] Integrate Resend

### Phase 6: Media & Assets (Week 6-7)
- [ ] Organize media files
- [ ] Create media table
- [ ] Implement image optimization
- [ ] Set up CDN
- [ ] Create media components

### Phase 7: SEO Migration (Week 7-8)
- [ ] Export Yoast SEO metadata
- [ ] Create SEO tables
- [ ] Implement meta tags
- [ ] Create redirects
- [ ] Generate sitemaps

### Phase 8: Testing & Optimization (Week 8-9)
- [ ] Test all functionality
- [ ] Optimize performance
- [ ] Fix bugs
- [ ] User testing

### Phase 9: Launch & Monitoring (Week 9-10)
- [ ] Final checks
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Handle issues

---

## Part 6: Detailed File Structure

```
frontend/periospot-vite/src/
├── components/
│   ├── Auth/
│   │   ├── AuthContext.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── Articles/
│   │   ├── ArticleList.tsx
│   │   ├── ArticleDetail.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── AuthorPage.tsx
│   │   ├── SearchArticles.tsx
│   │   ├── RelatedArticles.tsx
│   │   ├── ArticleComments.tsx
│   │   └── ArticleTableOfContents.tsx
│   ├── Ebooks/
│   │   ├── EbookList.tsx
│   │   ├── EbookDetail.tsx
│   │   ├── EbookCard.tsx
│   │   ├── EbookDownloadForm.tsx
│   │   ├── EbookPreview.tsx
│   │   └── DownloadConfirmation.tsx
│   ├── Assessments/
│   │   ├── AssessmentList.tsx
│   │   ├── AssessmentDetail.tsx
│   │   ├── AssessmentForm.tsx
│   │   ├── AssessmentResults.tsx
│   │   └── AssessmentHistory.tsx
│   ├── Products/
│   │   ├── ProductList.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ShoppingCart.tsx
│   │   ├── Checkout.tsx
│   │   └── ProductReviews.tsx
│   ├── Newsletter/
│   │   ├── NewsletterSubscribe.tsx
│   │   ├── NewsletterArchive.tsx
│   │   └── UnsubscribeConfirmation.tsx
│   ├── User/
│   │   ├── UserDashboard.tsx
│   │   ├── UserProfile.tsx
│   │   ├── DownloadHistory.tsx
│   │   └── OrderHistory.tsx
│   └── Common/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Navigation.tsx
│       ├── Breadcrumbs.tsx
│       └── SEO.tsx
├── pages/
│   ├── Home.tsx
│   ├── Articles.tsx
│   ├── ArticleDetail.tsx
│   ├── Ebooks.tsx
│   ├── EbookDetail.tsx
│   ├── Assessments.tsx
│   ├── AssessmentDetail.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   └── NotFound.tsx
├── services/
│   ├── supabase.ts
│   ├── api.ts
│   ├── typeform.ts
│   ├── resend.ts
│   ├── woocommerce.ts
│   └── analytics.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   ├── useEbooks.ts
│   ├── useAssessments.ts
│   ├── useProducts.ts
│   └── useNewsletter.ts
├── utils/
│   ├── seo.ts
│   ├── formatting.ts
│   ├── validation.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   ├── posts.ts
│   ├── ebooks.ts
│   ├── assessments.ts
│   ├── products.ts
│   └── users.ts
└── App.tsx
```

---

## Part 7: API Integrations Required

### 7.1 Typeform API
- Get form details
- Get responses
- Create webhooks for new responses
- Update form settings

### 7.2 WooCommerce API
- Get products
- Get orders
- Get customers
- Update inventory

### 7.3 Resend Email API
- Send emails
- Create templates
- Track opens/clicks
- Manage subscribers

### 7.4 Supabase API
- CRUD operations
- Authentication
- Real-time subscriptions
- File storage

---

## Part 8: Performance Considerations

### 8.1 Image Optimization
- Use WebP format
- Implement lazy loading
- Create thumbnails
- Optimize for mobile

### 8.2 Database Optimization
- Create indexes on frequently queried fields
- Use pagination for large datasets
- Implement caching
- Use connection pooling

### 8.3 Frontend Optimization
- Code splitting
- Lazy loading components
- Minify assets
- Use CDN for static files

---

## Part 9: Testing Checklist

### 9.1 Functional Testing
- [ ] All articles display correctly
- [ ] eBook downloads work
- [ ] Assessments complete successfully
- [ ] Products display with correct pricing
- [ ] Shopping cart functions
- [ ] Checkout process works
- [ ] Newsletter subscription works
- [ ] User authentication works
- [ ] Email delivery works
- [ ] Search functionality works

### 9.2 Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Image loading optimized
- [ ] Database queries optimized
- [ ] API responses < 500ms
- [ ] No memory leaks

### 9.3 Security Testing
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Data encryption

### 9.4 SEO Testing
- [ ] Meta tags present
- [ ] Structured data valid
- [ ] Sitemaps generated
- [ ] Redirects working
- [ ] Mobile responsive

---

## Part 10: Handoff to GPT Codex

### What GPT Codex Needs to Do

1. **Parse JSON Files**
   - Extract all posts from `posts.json`
   - Extract all products from `products.json`
   - Extract all pages from `pages.json`
   - Extract all media metadata

2. **Create Supabase Tables**
   - Run all SQL migrations
   - Create indexes
   - Set up RLS policies

3. **Implement Components**
   - Create all React components listed above
   - Implement routing
   - Add styling with Tailwind CSS

4. **Integrate APIs**
   - Typeform API integration
   - WooCommerce API integration
   - Resend email integration

5. **Implement Features**
   - Search functionality
   - Filtering and sorting
   - Email delivery
   - Analytics tracking

6. **Test Everything**
   - Functional testing
   - Performance testing
   - Security testing
   - SEO testing

---

## Critical Success Factors

✅ **Complete Data Migration**
- All posts, products, media migrated
- All metadata preserved
- No data loss

✅ **Seamless User Experience**
- Fast page loads
- Intuitive navigation
- Mobile responsive

✅ **Email Delivery**
- All emails sent successfully
- Proper formatting
- Tracking enabled

✅ **SEO Preservation**
- All meta tags migrated
- Redirects working
- Rankings maintained

✅ **Performance**
- Page load < 3 seconds
- API response < 500ms
- No errors

---

## Questions for GPT Codex

Before starting, please clarify:

1. **Data Access**: Can you access all JSON files in `/legacy-wordpress/content/`?
2. **API Keys**: Do you have Typeform API key and WooCommerce API credentials?
3. **Media Files**: Can you access all files in `/periospot-assets/`?
4. **Database Access**: Can you connect to Supabase and run migrations?
5. **Email Templates**: Do you have existing email templates to use?
6. **Styling**: Should we use the smooth-landing-page styling as base?
7. **Timeline**: What's your estimated timeline for completion?
8. **Blockers**: Are there any blockers or dependencies?

---

## Next Steps

1. ✅ Review this roadmap
2. ✅ Clarify any questions
3. ✅ Start with Phase 1: Blog Posts Migration
4. ✅ Create Supabase tables
5. ✅ Parse JSON files
6. ✅ Implement components
7. ✅ Test functionality
8. ✅ Move to Phase 2

---

**Status:** Ready for GPT Codex Implementation
**Priority:** 🔴 CRITICAL
**Estimated Duration:** 8-10 weeks
**Last Updated:** January 2, 2026

---

## Appendix: Useful Commands

```bash
# Parse posts.json
npm run migrate:posts

# Create Supabase tables
npm run db:migrate

# Seed test data
npm run db:seed

# Run tests
npm run test

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

---

**This is your comprehensive roadmap. Everything is documented in detail. You have all the information needed to execute this migration successfully!** 🚀
