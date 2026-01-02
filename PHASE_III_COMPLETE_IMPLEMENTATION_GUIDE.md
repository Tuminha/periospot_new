# PHASE III: COMPLETE CONTENT MIGRATION & FUNCTIONALITY IMPLEMENTATION
## Comprehensive Guide for GPT Codex

**Status:** Ready for Implementation
**Priority:** CRITICAL
**Timeline:** 8-10 weeks (9 phases)
**Complexity:** HIGH

---

## TABLE OF CONTENTS

1. Overview & Architecture
2. Content Types & Database Schema
3. Feature Implementation Roadmap
4. Component Specifications
5. Integration Requirements
6. Email System (Resend)
7. SEO & Yoast Migration
8. Implementation Phases
9. Testing Checklist
10. Deployment Strategy

---

## SECTION 1: OVERVIEW & ARCHITECTURE

### Current State
- **Frontend:** Vite + React + TypeScript + Tailwind CSS (smooth-landing-page foundation)
- **Backend:** Supabase (PostgreSQL database, authentication, real-time)
- **Email:** Resend (transactional emails)
- **Analytics:** Google Analytics 4
- **Deployment:** Vercel

### What Needs to Be Built
The new PerioSpot will have:
- **7 main content types** (articles, eBooks, products, assessments, pages, users, newsletter)
- **40+ blog articles** with full content migration
- **10+ eBooks** with download functionality
- **20+ products** with WooCommerce integration
- **Multiple assessments** (Typeform integration)
- **Newsletter system** (weekly "Periospot Brew")
- **Multi-language support** (English, Spanish, Portuguese, Chinese)
- **Full-text search** with filtering
- **User authentication** (email/password + Google OAuth)
- **User dashboard** with download history, saved articles, etc.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PERIOSPOT NEW                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ FRONTEND (Vite + React + TypeScript + Tailwind)     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • Home Page                                          │  │
│  │ • Blog/Articles (with search, filter, pagination)   │  │
│  │ • Library/eBooks (with email capture)               │  │
│  │ • Shop/Products (with cart, checkout)               │  │
│  │ • Assessments (Typeform integration)                │  │
│  │ • User Dashboard (profile, downloads, history)      │  │
│  │ • Authentication Pages (login, signup, reset)       │  │
│  │ • Resources Center                                  │  │
│  │ • Team & Contact                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API LAYER (Supabase + Custom Functions)            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • Articles API                                       │  │
│  │ • eBooks API                                        │  │
│  │ • Products API                                      │  │
│  │ • Users API                                         │  │
│  │ • Search API                                        │  │
│  │ • Newsletter API                                    │  │
│  │ • Downloads API                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ DATABASE (Supabase PostgreSQL)                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • articles                                           │  │
│  │ • ebooks                                             │  │
│  │ • products                                           │  │
│  │ • users                                              │  │
│  │ • downloads                                          │  │
│  │ • newsletter_subscribers                            │  │
│  │ • assessments                                        │  │
│  │ • comments                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ EXTERNAL SERVICES                                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • Resend (Email delivery)                           │  │
│  │ • Typeform (Assessments)                            │  │
│  │ • Google Analytics (Tracking)                       │  │
│  │ • Stripe/PayPal (Payments)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## SECTION 2: CONTENT TYPES & DATABASE SCHEMA

### 2.1 ARTICLES (Blog Posts)

**Table Name:** `articles`

**Fields:**
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  featured_image_url VARCHAR(500),
  author_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  language VARCHAR(10) DEFAULT 'en', -- en, es, pt, zh
  status VARCHAR(20) DEFAULT 'published', -- draft, published, archived
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  
  -- SEO Fields (from Yoast)
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  focus_keyword VARCHAR(100),
  readability_score VARCHAR(50),
  seo_score VARCHAR(50),
  canonical_url VARCHAR(500),
  
  -- Additional
  tags TEXT[], -- Array of tags
  related_articles UUID[], -- Array of related article IDs
  is_featured BOOLEAN DEFAULT FALSE,
  reading_time_minutes INTEGER
);
```

**Indexes:**
```sql
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_language ON articles(language);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_status ON articles(status);
```

**Sample Data (from old site):**
- Bone Remodeling After Tooth Extraction (26/11/2024)
- Socket Shield ruined men (31/10/2024)
- Mastering Dental Photography (05/04/2023)
- Clinical Advantages of the Platelet Rich Fibrin (11/03/2021)
- 40+ more articles...

**Migration Strategy:**
1. Export all articles from WordPress via JSON export
2. Parse JSON and extract: title, content, author, date, category, featured image
3. Extract Yoast SEO data for each article
4. Create SQL INSERT statements
5. Upload featured images to Supabase Storage
6. Insert articles into database
7. Create 301 redirects for old URLs

---

### 2.2 eBOOKS (Downloadable Resources)

**Table Name:** `ebooks`

**Fields:**
```sql
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  file_url VARCHAR(500) NOT NULL, -- URL to PDF/EPUB/ZIP
  file_type VARCHAR(20), -- pdf, epub, zip
  file_size_mb DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id),
  language VARCHAR(10) DEFAULT 'en',
  price DECIMAL(10, 2), -- 0 for free
  download_count INTEGER DEFAULT 0,
  email_capture_required BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Content
  preview_pages_count INTEGER, -- Number of preview pages
  total_pages INTEGER,
  tags TEXT[],
  related_ebooks UUID[]
);
```

**Sample eBooks (from old site):**
1. The 17 Immutable Laws In Implant Dentistry (Free)
2. Guided Bone Regeneration In Implant Dentistry (Free)
3. Connective Tissue Grafts Harvesting Techniques (Free)
4. 10 Tips About Aesthetic Implant Dentistry (Free)
5. Guided Bone Regeneration iBook (Paid)
6. Immediate Implants With Immediate Provisional Restorations (Paid)
7. Immediate Loading and Immediate Restorations With CAD/CAM (Paid)
8. 10+ more eBooks...

**Features:**
- Email capture before download (for free eBooks)
- Direct download for paid eBooks (after purchase)
- Download tracking
- Email delivery via Resend
- Preview pages display
- Related eBooks recommendations

---

### 2.3 PRODUCTS (WooCommerce)

**Table Name:** `products`

**Fields:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  sku VARCHAR(100) UNIQUE,
  category_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  gallery_images TEXT[], -- Array of image URLs
  stock_quantity INTEGER,
  status VARCHAR(20) DEFAULT 'published',
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Additional
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  weight DECIMAL(10, 2),
  dimensions VARCHAR(100),
  shipping_class VARCHAR(50)
);
```

**Product Categories (from old site):**
1. Speaker Packs (slide decks for dental speakers)
2. Periospot Accessories (gadgets, tools)
3. Periospot Animations (digital assets)
4. Periospot Dental Instruments (tools)
5. Implant Dentistry Books (physical/digital books)

**Sample Products:**
- Bone Dynamics After an Extraction (€10.00)
- Various speaker packs
- Dental instruments
- Books
- Digital animations

---

### 2.4 USERS & AUTHENTICATION

**Table Name:** `users` (extends Supabase auth)

**Fields:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,
  profession VARCHAR(100),
  country VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  newsletter_subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  
  -- Profile
  is_author BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  author_bio TEXT,
  author_image_url VARCHAR(500)
);
```

**Author Table (for article authors):**
```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  image_url VARCHAR(500),
  social_links JSONB, -- {twitter, linkedin, website}
  articles_count INTEGER DEFAULT 0
);
```

---

### 2.5 DOWNLOADS & HISTORY

**Table Name:** `downloads`

**Fields:**
```sql
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ebook_id UUID REFERENCES ebooks(id),
  download_url VARCHAR(500),
  downloaded_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);
```

**Table Name:** `user_activity`

**Fields:**
```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50), -- view, download, purchase, comment
  entity_type VARCHAR(50), -- article, ebook, product
  entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.6 NEWSLETTER SUBSCRIBERS

**Table Name:** `newsletter_subscribers`

**Fields:**
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'en',
  source VARCHAR(50), -- homepage, ebook, article, etc.
  confirmation_token VARCHAR(255),
  is_confirmed BOOLEAN DEFAULT FALSE
);
```

---

### 2.7 CATEGORIES & TAGS

**Table Name:** `categories`

**Fields:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  color VARCHAR(7), -- Hex color
  content_type VARCHAR(50), -- article, ebook, product
  language VARCHAR(10) DEFAULT 'en',
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Categories from old site:**
- Periodontics
- Implant Dentistry
- Aesthetics Dentistry
- Marketing Online

---

### 2.8 COMMENTS

**Table Name:** `comments`

**Fields:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, spam
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  parent_id UUID REFERENCES comments(id), -- For nested comments
  is_featured BOOLEAN DEFAULT FALSE
);
```

---

### 2.9 ASSESSMENTS (Typeform Integration)

**Table Name:** `assessments`

**Fields:**
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  typeform_id VARCHAR(255), -- Typeform form ID
  category_id UUID REFERENCES categories(id),
  language VARCHAR(10) DEFAULT 'en',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table Name:** `assessment_responses`

**Fields:**
```sql
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id),
  user_id UUID REFERENCES users(id),
  typeform_response_id VARCHAR(255),
  score INTEGER,
  result_text TEXT,
  recommendations TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);
```

---

## SECTION 3: FEATURE IMPLEMENTATION ROADMAP

### Phase 1: Blog/Articles System (Week 1-2)
**Deliverables:**
- ✅ Articles table created
- ✅ Articles API endpoints (GET, POST, PUT, DELETE)
- ✅ Article listing page with pagination
- ✅ Article detail page with full content
- ✅ Article search functionality
- ✅ Category filtering
- ✅ Author profiles
- ✅ Related articles
- ✅ Comments system
- ✅ SEO metadata display

**Components to Build:**
1. `ArticleList.tsx` - List all articles with pagination
2. `ArticleCard.tsx` - Individual article card
3. `ArticleDetail.tsx` - Full article page
4. `ArticleSearch.tsx` - Search bar with filters
5. `CategoryFilter.tsx` - Filter by category
6. `AuthorProfile.tsx` - Author information
7. `RelatedArticles.tsx` - Related articles sidebar
8. `CommentSection.tsx` - Comments display and form
9. `ArticleMetadata.tsx` - SEO metadata display
10. `ReadingTime.tsx` - Reading time indicator

**Database:**
- Create `articles` table
- Create `categories` table
- Create `authors` table
- Create `comments` table
- Create indexes for performance

**Migration:**
- Export 40+ articles from WordPress
- Parse JSON and extract content
- Extract Yoast SEO data
- Upload featured images
- Insert into Supabase

---

### Phase 2: eBooks & Downloads System (Week 3-4)
**Deliverables:**
- ✅ eBooks table created
- ✅ eBooks listing page
- ✅ Email capture form before download
- ✅ Download tracking
- ✅ Email delivery via Resend
- ✅ Download history in user dashboard
- ✅ Related eBooks recommendations

**Components to Build:**
1. `EbookList.tsx` - List all eBooks
2. `EbookCard.tsx` - Individual eBook card
3. `EbookDetail.tsx` - eBook detail page
4. `EmailCaptureModal.tsx` - Email form before download
5. `DownloadButton.tsx` - Download trigger
6. `DownloadHistory.tsx` - User's download history
7. `RelatedEbooks.tsx` - Related eBooks

**Features:**
- Email capture before download (for free eBooks)
- Automatic email delivery of eBook link
- Download tracking and analytics
- Preview pages display
- Related eBooks recommendations
- Download history in user dashboard

**Integrations:**
- Resend email delivery
- Supabase Storage for file hosting
- Download tracking

---

### Phase 3: Products & Shopping Cart (Week 5-6)
**Deliverables:**
- ✅ Products table created
- ✅ Product listing page
- ✅ Product detail page with reviews
- ✅ Shopping cart functionality
- ✅ Checkout process
- ✅ Payment integration (Stripe/PayPal)
- ✅ Order management

**Components to Build:**
1. `ProductList.tsx` - List all products
2. `ProductCard.tsx` - Individual product card
3. `ProductDetail.tsx` - Product detail page
4. `ProductReviews.tsx` - Reviews and ratings
5. `ShoppingCart.tsx` - Cart page
6. `CartItem.tsx` - Individual cart item
7. `Checkout.tsx` - Checkout form
8. `PaymentForm.tsx` - Payment processing
9. `OrderConfirmation.tsx` - Order confirmation page
10. `OrderHistory.tsx` - User's order history

**Features:**
- Product catalog with filtering
- Shopping cart (add, remove, update quantities)
- Checkout process
- Payment processing (Stripe/PayPal)
- Order confirmation emails
- Order tracking
- Product reviews and ratings

---

### Phase 4: Assessments & Typeform Integration (Week 7)
**Deliverables:**
- ✅ Assessments table created
- ✅ Typeform integration
- ✅ Assessment listing page
- ✅ Embedded Typeform forms
- ✅ Response tracking
- ✅ Result recommendations

**Components to Build:**
1. `AssessmentList.tsx` - List all assessments
2. `AssessmentCard.tsx` - Individual assessment card
3. `AssessmentEmbed.tsx` - Embedded Typeform
4. `AssessmentResults.tsx` - Results page
5. `AssessmentHistory.tsx` - User's assessment history

**Typeform Topics:**
- Periodontics
- Implant Dentistry
- Aesthetics Dentistry
- Marketing Online

---

### Phase 5: Newsletter System (Week 8)
**Deliverables:**
- ✅ Newsletter subscribers table
- ✅ Newsletter signup form
- ✅ Email templates
- ✅ Weekly email delivery
- ✅ Unsubscribe functionality

**Email Templates:**
1. Welcome email
2. Weekly newsletter (Periospot Brew)
3. eBook download confirmation
4. Order confirmation
5. Password reset
6. Email verification
7. Assessment results
8. Product review request
9. Abandoned cart reminder
10. Promotional emails

**Features:**
- Newsletter signup on homepage
- Email capture on eBook downloads
- Weekly "Periospot Brew" email
- Unsubscribe link in all emails
- Email preference management

---

### Phase 6: User Dashboard & Profiles (Week 9)
**Deliverables:**
- ✅ User dashboard page
- ✅ Profile management
- ✅ Download history
- ✅ Order history
- ✅ Saved articles
- ✅ Assessment history
- ✅ Email preferences

**Components to Build:**
1. `UserDashboard.tsx` - Main dashboard
2. `ProfileSettings.tsx` - Profile management
3. `DownloadHistory.tsx` - Downloads
4. `OrderHistory.tsx` - Orders
5. `SavedArticles.tsx` - Bookmarks
6. `AssessmentHistory.tsx` - Assessments
7. `EmailPreferences.tsx` - Email settings
8. `ChangePassword.tsx` - Password change

---

### Phase 7: Multi-language Support (Week 10)
**Deliverables:**
- ✅ Language switcher
- ✅ Content in 4 languages (EN, ES, PT, ZH)
- ✅ Language-specific URLs
- ✅ Translated navigation
- ✅ Translated emails

**Languages:**
- English (en)
- Spanish (es)
- Portuguese (pt)
- Chinese (zh)

**Implementation:**
- Use i18n library (react-i18next)
- Store language preference in user profile
- URL structure: `/en/articles`, `/es/articulos`, etc.
- Translate all UI text
- Translate email templates

---

### Phase 8: Search & Filtering (Week 11)
**Deliverables:**
- ✅ Full-text search
- ✅ Category filtering
- ✅ Author filtering
- ✅ Language filtering
- ✅ Date range filtering
- ✅ Search results page
- ✅ Advanced search

**Features:**
- Search across articles, eBooks, products
- Filter by category, author, language
- Sort by date, popularity, relevance
- Pagination of results
- Search suggestions/autocomplete
- Recent searches

---

### Phase 9: SEO & Analytics (Week 12)
**Deliverables:**
- ✅ Meta tags on all pages
- ✅ Structured data (schema.org)
- ✅ Sitemap generation
- ✅ Robots.txt
- ✅ 301 redirects from old URLs
- ✅ Google Analytics 4 setup
- ✅ Event tracking
- ✅ Yoast SEO data migration

**SEO Tasks:**
1. Add meta title and description to all pages
2. Implement Open Graph tags
3. Add structured data (Article, Product, Organization)
4. Generate XML sitemap
5. Create robots.txt
6. Set up 301 redirects for old URLs
7. Implement canonical URLs
8. Add schema.org markup

**Analytics:**
1. Install GA4 tracking code
2. Configure events (article view, download, purchase, etc.)
3. Set up goals and conversions
4. Configure user properties
5. Set up custom dimensions

---

## SECTION 4: COMPONENT SPECIFICATIONS

### Article Components

**ArticleList Component**
```typescript
interface ArticleListProps {
  language: string;
  category?: string;
  author?: string;
  page?: number;
  limit?: number;
}

Features:
- Pagination (12 articles per page)
- Category filter dropdown
- Author filter dropdown
- Language selector
- Search bar
- Sort options (date, popularity)
- Featured articles section
- Loading states
- Error handling
```

**ArticleDetail Component**
```typescript
interface ArticleDetailProps {
  slug: string;
  language: string;
}

Features:
- Full article content
- Featured image
- Author information with bio
- Publication date
- Reading time
- Share buttons
- Related articles (3-4)
- Comments section
- Comment form
- SEO metadata
- Table of contents (for long articles)
```

### eBook Components

**EbookList Component**
```typescript
interface EbookListProps {
  language: string;
  category?: string;
  page?: number;
}

Features:
- Grid layout (3 columns)
- eBook cards with cover image
- Price display
- Download count
- Featured eBooks section
- Category filter
- Search functionality
```

**EmailCaptureModal Component**
```typescript
interface EmailCaptureModalProps {
  ebookTitle: string;
  onSubmit: (email: string, name: string) => void;
  onClose: () => void;
}

Features:
- Email input field
- Name input field (optional)
- Newsletter checkbox
- Submit button
- Close button
- Validation
- Success message
```

### Product Components

**ShoppingCart Component**
```typescript
interface ShoppingCartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

Features:
- Cart items list
- Item quantity selector
- Remove item button
- Subtotal calculation
- Tax calculation
- Shipping calculation
- Proceed to checkout button
- Continue shopping button
```

**Checkout Component**
```typescript
interface CheckoutProps {
  cartItems: CartItem[];
  total: number;
}

Features:
- Shipping address form
- Billing address form
- Payment method selector
- Order review
- Place order button
- Order confirmation
```

---

## SECTION 5: INTEGRATION REQUIREMENTS

### 5.1 Supabase Integration

**Required Tables:**
- articles
- ebooks
- products
- users
- downloads
- newsletter_subscribers
- categories
- comments
- assessments
- assessment_responses
- authors
- user_activity

**Required Functions:**
- get_articles_by_category()
- search_articles()
- get_related_articles()
- track_download()
- get_user_downloads()
- subscribe_newsletter()
- unsubscribe_newsletter()

**Required Policies (RLS):**
- Public read access to published content
- User-specific access to downloads
- Admin-only access to moderation

---

### 5.2 Resend Email Integration

**Email Templates Needed:**
1. Welcome email (on signup)
2. eBook download confirmation
3. Order confirmation
4. Password reset
5. Email verification
6. Weekly newsletter
7. Product review request
8. Abandoned cart reminder
9. Assessment results
10. Promotional emails

**Implementation:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Send welcome email
await resend.emails.send({
  from: 'noreply@periospot.com',
  to: user.email,
  subject: 'Welcome to Periospot!',
  html: welcomeEmailTemplate(user.name)
});

// Send eBook download
await resend.emails.send({
  from: 'noreply@periospot.com',
  to: user.email,
  subject: `Your eBook: ${ebook.title}`,
  html: ebookDownloadTemplate(user.name, ebook.title, downloadUrl)
});
```

---

### 5.3 Typeform Integration

**Assessment Forms:**
- Periodontics Assessment
- Implant Dentistry Assessment
- Aesthetics Dentistry Assessment
- Marketing Online Assessment

**Implementation:**
```typescript
// Embed Typeform
<iframe
  src={`https://form.typeform.com/to/${typeformId}`}
  width="100%"
  height="500"
/>

// Track responses via webhook
POST /api/webhooks/typeform
{
  "event_id": "...",
  "form_response": {
    "form_id": "...",
    "token": "...",
    "landed_at": "...",
    "submitted_at": "...",
    "definition": { ... },
    "answers": [ ... ]
  }
}
```

---

### 5.4 Google Analytics 4

**Events to Track:**
- page_view (all pages)
- article_view (article detail)
- ebook_download (eBook download)
- product_view (product detail)
- add_to_cart (shopping cart)
- purchase (order completion)
- assessment_start (assessment start)
- assessment_complete (assessment completion)
- newsletter_signup (newsletter signup)
- search (search query)

**Implementation:**
```typescript
import { gtag } from '@react-ga/core';

// Track article view
gtag.event('article_view', {
  article_id: article.id,
  article_title: article.title,
  category: article.category
});

// Track eBook download
gtag.event('ebook_download', {
  ebook_id: ebook.id,
  ebook_title: ebook.title,
  value: ebook.price
});

// Track purchase
gtag.event('purchase', {
  transaction_id: order.id,
  value: order.total,
  currency: 'EUR',
  items: order.items
});
```

---

### 5.5 Payment Integration (Stripe/PayPal)

**Stripe Implementation:**
```typescript
import Stripe from '@stripe/stripe-js';

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(total * 100),
  currency: 'eur',
  metadata: {
    order_id: order.id,
    customer_email: user.email
  }
});

// Process payment
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: user.name }
  }
});
```

---

## SECTION 6: EMAIL SYSTEM (RESEND)

### Email Templates

**1. Welcome Email**
```
Subject: Welcome to Periospot!
Content:
- Welcome message
- What to expect
- Link to first article
- Link to library
- Social media links
```

**2. Weekly Newsletter (Periospot Brew)**
```
Subject: The Periospot Brew - Weekly Dental News
Content:
- Featured article
- Latest articles (3-4)
- eBook recommendation
- Upcoming assessment
- Tips & tricks
- Unsubscribe link
```

**3. eBook Download Confirmation**
```
Subject: Your eBook: [eBook Title]
Content:
- Download link
- eBook preview
- Related eBooks
- Author information
- Sharing options
```

**4. Order Confirmation**
```
Subject: Order Confirmation - #[Order ID]
Content:
- Order number
- Order date
- Items list
- Total amount
- Shipping address
- Tracking link
- Customer support contact
```

**5. Password Reset**
```
Subject: Reset Your Password
Content:
- Password reset link
- Link expiration time
- Support contact
- Security note
```

**6. Email Verification**
```
Subject: Verify Your Email Address
Content:
- Verification link
- Link expiration time
- Support contact
```

**7. Assessment Results**
```
Subject: Your Assessment Results
Content:
- Assessment name
- Score
- Result interpretation
- Recommendations
- Related resources
```

**8. Product Review Request**
```
Subject: How was your purchase?
Content:
- Product name
- Product image
- Review link
- Incentive (optional)
```

**9. Abandoned Cart Reminder**
```
Subject: You left something in your cart
Content:
- Cart items
- Total amount
- Continue shopping link
- Discount code (optional)
```

**10. Promotional Email**
```
Subject: Special Offer: [Promotion]
Content:
- Promotion details
- Discount code
- Expiration date
- Featured products
- Call to action
```

---

## SECTION 7: SEO & YOAST MIGRATION

### Yoast Data to Migrate

**From old site:**
- Meta titles
- Meta descriptions
- Focus keywords
- Readability scores
- SEO scores
- Canonical URLs
- Redirects

**Migration Process:**
1. Export Yoast data from WordPress (via plugin export)
2. Parse XML/JSON export
3. Extract SEO metadata for each article
4. Store in `articles` table (meta_title, meta_description, etc.)
5. Create 301 redirects for old URLs
6. Implement canonical URLs on new site

**SEO Implementation:**

**Meta Tags:**
```typescript
// In ArticleDetail component
<Helmet>
  <title>{article.meta_title}</title>
  <meta name="description" content={article.meta_description} />
  <meta name="keywords" content={article.meta_keywords} />
  <link rel="canonical" href={article.canonical_url} />
  
  {/* Open Graph */}
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={article.excerpt} />
  <meta property="og:image" content={article.featured_image_url} />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:type" content="article" />
  
  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={article.title} />
  <meta name="twitter:description" content={article.excerpt} />
  <meta name="twitter:image" content={article.featured_image_url} />
</Helmet>
```

**Structured Data (Schema.org):**
```typescript
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.excerpt,
  "image": article.featured_image_url,
  "author": {
    "@type": "Person",
    "name": article.author.name
  },
  "datePublished": article.published_at,
  "dateModified": article.updated_at
}
</script>
```

**Sitemap Generation:**
```typescript
// Generate sitemap.xml
import { SitemapStream, streamToPromise } from 'sitemap';

const sitemap = new SitemapStream({
  hostname: 'https://periospot-new.vercel.app'
});

// Add articles
articles.forEach(article => {
  sitemap.write({
    url: `/articles/${article.slug}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: article.updated_at
  });
});

// Add eBooks
ebooks.forEach(ebook => {
  sitemap.write({
    url: `/library/${ebook.slug}`,
    changefreq: 'monthly',
    priority: 0.7
  });
});

sitemap.end();
```

**301 Redirects:**
```typescript
// In next.config.js or vercel.json
{
  "redirects": [
    {
      "source": "/blog/:slug",
      "destination": "/articles/:slug",
      "permanent": true
    },
    {
      "source": "/library/:slug",
      "destination": "/ebooks/:slug",
      "permanent": true
    }
  ]
}
```

---

## SECTION 8: IMPLEMENTATION PHASES

### Timeline Overview

```
Week 1-2:   Blog/Articles System
Week 3-4:   eBooks & Downloads
Week 5-6:   Products & Shopping Cart
Week 7:     Assessments & Typeform
Week 8:     Newsletter System
Week 9:     User Dashboard
Week 10:    Multi-language Support
Week 11:    Search & Filtering
Week 12:    SEO & Analytics
```

### Phase Breakdown

**PHASE 1: Blog/Articles (Week 1-2)**

Day 1-2: Database setup
- Create articles table
- Create categories table
- Create authors table
- Create comments table
- Create indexes

Day 3-4: API development
- GET /api/articles (list)
- GET /api/articles/:id (detail)
- POST /api/articles (create - admin only)
- PUT /api/articles/:id (update - admin only)
- DELETE /api/articles/:id (delete - admin only)
- GET /api/articles/search (search)
- GET /api/articles/category/:id (by category)

Day 5-6: Frontend components
- ArticleList component
- ArticleCard component
- ArticleDetail component
- ArticleSearch component
- CategoryFilter component

Day 7-8: Data migration
- Export articles from WordPress
- Parse JSON
- Extract Yoast SEO data
- Upload featured images
- Insert into database

Day 9-10: Testing & refinement
- Unit tests
- Integration tests
- E2E tests
- Performance optimization
- Bug fixes

Day 11-12: Deployment
- Deploy to Vercel
- Test on production
- Monitor performance
- Gather feedback

**PHASE 2: eBooks & Downloads (Week 3-4)**

Day 1-2: Database setup
- Create ebooks table
- Create downloads table
- Create indexes

Day 3-4: API development
- GET /api/ebooks (list)
- GET /api/ebooks/:id (detail)
- POST /api/ebooks/download (track download)
- POST /api/ebooks/email-capture (capture email)

Day 5-6: Frontend components
- EbookList component
- EbookCard component
- EbookDetail component
- EmailCaptureModal component
- DownloadButton component

Day 7-8: Email integration
- Set up Resend
- Create email templates
- Implement email sending
- Test email delivery

Day 9-10: Data migration
- Export eBooks from old site
- Upload files to Supabase Storage
- Insert metadata into database

Day 11-12: Testing & deployment
- Test email delivery
- Test download tracking
- Deploy to Vercel
- Monitor

**PHASE 3: Products & Shopping Cart (Week 5-6)**

Day 1-2: Database setup
- Create products table
- Create orders table
- Create order_items table
- Create reviews table

Day 3-4: API development
- GET /api/products (list)
- GET /api/products/:id (detail)
- POST /api/cart/add (add to cart)
- POST /api/cart/remove (remove from cart)
- POST /api/orders (create order)
- POST /api/payments (process payment)

Day 5-6: Frontend components
- ProductList component
- ProductCard component
- ProductDetail component
- ShoppingCart component
- Checkout component
- PaymentForm component

Day 7-8: Payment integration
- Set up Stripe
- Implement payment processing
- Create order confirmation emails

Day 9-10: Data migration
- Export products from WooCommerce
- Upload product images
- Insert into database

Day 11-12: Testing & deployment
- Test checkout flow
- Test payment processing
- Deploy to Vercel

**PHASE 4: Assessments (Week 7)**

Day 1-2: Database setup
- Create assessments table
- Create assessment_responses table

Day 3-4: Typeform integration
- Get Typeform form IDs
- Set up webhooks
- Implement response tracking

Day 5-6: Frontend components
- AssessmentList component
- AssessmentCard component
- AssessmentEmbed component
- AssessmentResults component

Day 7: Testing & deployment
- Test Typeform integration
- Deploy to Vercel

**PHASE 5: Newsletter (Week 8)**

Day 1-2: Database setup
- Create newsletter_subscribers table

Day 3-4: Email templates
- Create newsletter template
- Create welcome email template
- Create unsubscribe email

Day 5-6: Frontend components
- NewsletterSignup component
- EmailPreferences component

Day 7: Testing & deployment
- Test newsletter signup
- Test email delivery
- Deploy to Vercel

**PHASE 6: User Dashboard (Week 9)**

Day 1-2: Frontend components
- UserDashboard component
- ProfileSettings component
- DownloadHistory component
- OrderHistory component

Day 3-4: API development
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/downloads
- GET /api/users/orders

Day 5-6: Testing & deployment
- Test dashboard functionality
- Deploy to Vercel

**PHASE 7: Multi-language (Week 10)**

Day 1-2: i18n setup
- Install react-i18next
- Create translation files
- Set up language switcher

Day 3-4: Translate content
- Translate UI text
- Translate email templates
- Translate database content

Day 5-6: Testing & deployment
- Test language switching
- Deploy to Vercel

**PHASE 8: Search & Filtering (Week 11)**

Day 1-2: API development
- Implement full-text search
- Implement filtering
- Implement sorting

Day 3-4: Frontend components
- SearchBar component
- SearchResults component
- FilterPanel component

Day 5-6: Testing & deployment
- Test search functionality
- Deploy to Vercel

**PHASE 9: SEO & Analytics (Week 12)**

Day 1-2: SEO implementation
- Add meta tags
- Add structured data
- Generate sitemap
- Create robots.txt
- Set up 301 redirects

Day 3-4: Analytics setup
- Install GA4
- Configure events
- Set up goals
- Configure custom dimensions

Day 5-6: Testing & deployment
- Test SEO
- Test analytics
- Deploy to Vercel
- Monitor performance

---

## SECTION 9: TESTING CHECKLIST

### Unit Tests
- [ ] Article API endpoints
- [ ] eBook API endpoints
- [ ] Product API endpoints
- [ ] User authentication
- [ ] Email sending
- [ ] Payment processing
- [ ] Search functionality
- [ ] Filtering functionality

### Integration Tests
- [ ] Article creation and retrieval
- [ ] eBook download and email
- [ ] Product purchase flow
- [ ] User registration and login
- [ ] Newsletter signup
- [ ] Assessment submission

### E2E Tests
- [ ] User signup and login
- [ ] Browse articles
- [ ] Download eBook
- [ ] Add product to cart and checkout
- [ ] Submit assessment
- [ ] Subscribe to newsletter
- [ ] User dashboard

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] Image optimization
- [ ] Code splitting

### SEO Tests
- [ ] Meta tags present on all pages
- [ ] Structured data valid (schema.org)
- [ ] Sitemap.xml valid
- [ ] Robots.txt present
- [ ] 301 redirects working
- [ ] Canonical URLs correct

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Accessibility Tests
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Alt text on images

---

## SECTION 10: DEPLOYMENT STRATEGY

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Database backups created
- [ ] Environment variables configured
- [ ] CDN configured
- [ ] Monitoring set up

### Deployment Steps
1. Deploy to staging environment
2. Run smoke tests on staging
3. Get stakeholder approval
4. Deploy to production
5. Monitor for errors
6. Verify all features working
7. Check analytics
8. Monitor performance

### Post-Deployment
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Check SEO rankings
- [ ] Check analytics data
- [ ] Gather user feedback
- [ ] Plan next iterations

### Rollback Plan
- [ ] Keep previous version available
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Have rollback plan ready

---

## CRITICAL SUCCESS FACTORS

### Content Quality
- ✅ All 40+ articles migrated with full content
- ✅ All 10+ eBooks available for download
- ✅ All products properly categorized
- ✅ All SEO metadata preserved

### Performance
- ✅ Page load time < 3 seconds
- ✅ API response time < 500ms
- ✅ Database optimized with indexes
- ✅ Images optimized

### User Experience
- ✅ Intuitive navigation
- ✅ Fast search
- ✅ Easy checkout
- ✅ Mobile responsive

### Reliability
- ✅ 99.9% uptime
- ✅ Automated backups
- ✅ Error monitoring
- ✅ Performance monitoring

### Security
- ✅ HTTPS everywhere
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection

---

## QUESTIONS FOR GPT CODEX

Before starting implementation, please clarify:

1. **Content Access:** Do you have access to all WordPress export files? Can you provide:
   - posts.json (articles)
   - pages.json (pages)
   - products.json (WooCommerce products)
   - users.json (authors)
   - media.json (featured images)

2. **eBooks:** Where are the eBook files stored? Can you provide:
   - File URLs or local paths
   - File types (PDF, EPUB, ZIP)
   - File sizes
   - Cover images

3. **Typeform:** What are the Typeform form IDs for each assessment?

4. **Payment:** Do you want to use Stripe, PayPal, or both?

5. **Email:** Should we use Resend for all emails or integrate with existing email service?

6. **Analytics:** Should we set up Google Analytics 4 or use another service?

7. **Hosting:** Should eBook files be hosted on Supabase Storage or external CDN?

8. **Redirects:** Do you have a list of old URLs that need 301 redirects?

---

## NEXT STEPS

1. **Clarify questions above**
2. **Gather all data exports from WordPress**
3. **Set up Supabase tables** (I'll provide SQL)
4. **Start Phase 1: Blog/Articles**
5. **Follow timeline for remaining phases**
6. **Test thoroughly at each phase**
7. **Deploy to production**
8. **Monitor and optimize**

---

**This is your complete roadmap for Phase III. Everything is documented, organized, and ready for execution. You have all the information needed to build the new PerioSpot successfully!**

**Ready to start? Let's build! 🚀**
