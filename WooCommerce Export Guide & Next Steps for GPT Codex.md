# WooCommerce Export Guide & Next Steps for GPT Codex
## Clear Instructions to Get products.json Ready

**Status:** Phase 1 Ready, Phase 2 Blocked by products.json
**Priority:** HIGH
**For:** Cisco (WooCommerce Export) & GPT Codex (Phase 1 Scaffolding)

---

## SECTION 1: WOOCOMMERCE EXPORT - STEP BY STEP

### Why You're Confused

WooCommerce is a plugin on top of WordPress that handles products and orders. It has its own export system separate from WordPress posts. Here's how to export it:

---

### Step 1: Access WooCommerce Admin

1. Go to: **https://periospot.com/wp-admin/**
2. In the left sidebar, find: **WooCommerce**
3. Click on: **WooCommerce → Products**

You should see a list of all your products (20+ items).

---

### Step 2: Export Products (Method 1 - Easiest)

**Using WooCommerce Built-in Export:**

1. In **WooCommerce → Products**, you should see all products listed
2. Look for an **"Export"** button (usually at the top or in a dropdown menu)
3. If you don't see it, try:
   - **WooCommerce → Tools → Export** (if available)
   - Or use a plugin like "Product CSV Import Suite"

4. Click **Export**
5. Select:
   - Format: **CSV** (we'll convert to JSON)
   - Products: **All** (or select specific ones)
6. Click **Download**
7. Save the file as: **products_export.csv**

---

### Step 3: Export Products (Method 2 - REST API)

If the built-in export doesn't work, use the REST API:

**Get WooCommerce API Keys:**

1. Go to: **https://periospot.com/wp-admin/**
2. Navigate to: **WooCommerce → Settings**
3. Click on: **Advanced** tab
4. Click on: **REST API**
5. Click: **Create an API key**
6. Fill in:
   - Description: "PerioSpot Migration"
   - Permissions: **Read** (minimum)
7. Click: **Generate API key**
8. You'll get:
   - **Consumer Key:** `ck_...`
   - **Consumer Secret:** `cs_...`
9. Copy both (we'll use them next)

**Export via REST API:**

```bash
# Set your credentials
CONSUMER_KEY="ck_..."
CONSUMER_SECRET="cs_..."

# Export all products
curl -s -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  "https://periospot.com/wp-json/wc/v3/products?per_page=100" \
  > products.json

# If you have more than 100 products, get page 2:
curl -s -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  "https://periospot.com/wp-json/wc/v3/products?per_page=100&page=2" \
  >> products.json
```

This will create a products.json file directly!

---

### Step 4: Export Products (Method 3 - Database)

If both above methods fail, export directly from the database:

```sql
SELECT 
  p.ID as id,
  p.post_title as title,
  p.post_name as slug,
  p.post_content as description,
  pm1.meta_value as price,
  pm2.meta_value as sale_price,
  pm3.meta_value as sku,
  pm4.meta_value as stock_quantity
FROM wp_posts p
LEFT JOIN wp_postmeta pm1 ON p.ID = pm1.post_id AND pm1.meta_key = '_regular_price'
LEFT JOIN wp_postmeta pm2 ON p.ID = pm2.post_id AND pm2.meta_key = '_sale_price'
LEFT JOIN wp_postmeta pm3 ON p.ID = pm3.post_id AND pm3.meta_key = '_sku'
LEFT JOIN wp_postmeta pm4 ON p.ID = pm4.post_id AND pm4.meta_key = '_stock'
WHERE p.post_type = 'product' AND p.post_status = 'publish'
ORDER BY p.post_date DESC;
```

---

### Step 5: Export Product Categories

```bash
# Via REST API
curl -s -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  "https://periospot.com/wp-json/wc/v3/products/categories" \
  > product_categories.json
```

---

### Step 6: Convert CSV to JSON (If Needed)

If you got a CSV file, convert it to JSON using this Python script:

**File: convert-products-csv-to-json.py**

```python
import csv
import json
import sys

def csv_to_json(csv_file, json_file):
    """Convert WooCommerce CSV export to JSON"""
    products = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Clean up the row
                product = {
                    'id': row.get('ID') or row.get('id'),
                    'title': row.get('Name') or row.get('title'),
                    'slug': row.get('Slug') or row.get('slug'),
                    'description': row.get('Description') or row.get('description'),
                    'price': float(row.get('Regular price') or row.get('price') or 0),
                    'sale_price': float(row.get('Sale price') or row.get('sale_price') or 0),
                    'sku': row.get('SKU') or row.get('sku'),
                    'category': row.get('Categories') or row.get('category'),
                    'stock_quantity': int(row.get('Stock') or row.get('stock_quantity') or 0),
                    'status': 'published'
                }
                products.append(product)
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Converted {csv_file} to {json_file}")
        print(f"✅ Total products: {len(products)}")
        return True
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert-products-csv-to-json.py <csv_file> [output_json_file]")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    json_file = sys.argv[2] if len(sys.argv) > 2 else 'products.json'
    
    csv_to_json(csv_file, json_file)
```

**Usage:**
```bash
python convert-products-csv-to-json.py products_export.csv products.json
```

---

## SECTION 2: WHAT SHOULD BE IN products.json

**Expected structure:**

```json
[
  {
    "id": "1",
    "title": "Bone Dynamics After an Extraction",
    "slug": "bone-dynamics-after-extraction",
    "description": "Product description...",
    "price": 10.00,
    "sale_price": 8.00,
    "sku": "PROD-001",
    "category": "Implant Dentistry",
    "stock_quantity": 100,
    "status": "published"
  },
  {
    "id": "2",
    "title": "Another Product",
    "slug": "another-product",
    "description": "...",
    "price": 15.00,
    "sale_price": 0,
    "sku": "PROD-002",
    "category": "Accessories",
    "stock_quantity": 50,
    "status": "published"
  }
]
```

---

## SECTION 3: ANSWERS TO GPT CODEX'S QUESTIONS

### Question 1: "Should I start Phase 1 migration script now?"

**ANSWER: ✅ YES, START IMMEDIATELY**

**What to do:**
1. Build the public.posts mapping + migration script stub
2. Wire the article data layer to posts.json
3. Create API endpoints for articles
4. Create React components for articles
5. Test with the 84 posts you have

**Why now:**
- posts.json is ready (84 posts)
- Don't wait for products.json
- Phase 1 and Phase 2 are independent
- Get articles working while Cisco exports products

---

### Question 2: "What's the priority?"

**ANSWER: Phase 1 First, Then Phase 2**

**Phase 1 (Articles) - START NOW:**
1. Migration script (export.xml → public.posts)
2. Data mapping (WordPress fields → Supabase)
3. API endpoints (GET /api/posts, GET /api/posts/:id, etc.)
4. React components (ArticleList, ArticleDetail, etc.)
5. Test everything

**Phase 2 (Products) - AFTER products.json:**
1. Migration script (products.json → public.products)
2. Data mapping
3. API endpoints
4. React components
5. Shopping cart

---

### Question 3: "What about the other JSON files?"

**ANSWER: Focus on posts.json First**

**Priority Order:**
1. ✅ **posts.json** - READY (84 posts)
2. ⏳ **products.json** - WAITING (Cisco exporting)
3. ⏳ **ebooks.json** - WAITING (Cisco collecting URLs)
4. ⏳ **comments.json** - WAITING (Cisco exporting)
5. ⏳ **assessments.json** - WAITING (Cisco getting Typeform IDs)

**For now:** Focus on Phase 1 with posts.json

---

## SECTION 4: PHASE 1 SCAFFOLDING - WHAT TO BUILD

### 1. Migration Script

**File: scripts/migrate-posts.js**

```javascript
// This script will:
// 1. Read posts.json
// 2. Transform WordPress fields to Supabase schema
// 3. Insert into public.posts table
// 4. Handle featured images
// 5. Extract Yoast SEO data

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migratePostsFromJson(jsonFile) {
  console.log(`📖 Reading posts from ${jsonFile}...`);
  
  const posts = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  console.log(`📖 Found ${posts.length} posts`);
  
  let inserted = 0;
  let errors = 0;
  
  for (const post of posts) {
    try {
      // Transform WordPress data to Supabase schema
      const supabasePost = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featured_image_url: post.featured_image_url,
        author: post.author,
        category: post.category,
        language: 'en',
        status: post.status === 'publish' ? 'published' : 'draft',
        published_at: post.published_at,
        updated_at: new Date().toISOString(),
        
        // Yoast SEO
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        meta_keywords: post.meta_keywords,
        focus_keyword: post.focus_keyword,
        canonical_url: post.url
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert([supabasePost]);
      
      if (error) {
        console.error(`❌ Error inserting post "${post.title}":`, error);
        errors++;
      } else {
        console.log(`✅ Inserted: ${post.title}`);
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Error processing post:`, err);
      errors++;
    }
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`✅ Inserted: ${inserted}`);
  console.log(`❌ Errors: ${errors}`);
}

// Run migration
migratePostsFromJson('legacy-wordpress/content/posts.json')
  .catch(console.error);
```

### 2. API Endpoints

**File: src/api/posts.ts**

```typescript
import { supabase } from '@/lib/supabase/client';

// Get all posts
export async function getPosts(page = 1, limit = 12) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) throw error;
  return data;
}

// Get post by slug
export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
}

// Get posts by category
export async function getPostsByCategory(category: string, page = 1, limit = 12) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('category', category)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) throw error;
  return data;
}

// Search posts
export async function searchPosts(query: string, page = 1, limit = 12) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) throw error;
  return data;
}
```

### 3. React Components

**File: src/components/Articles/ArticleList.tsx**

```typescript
import { useEffect, useState } from 'react';
import { getPosts } from '@/api/posts';
import ArticleCard from './ArticleCard';

export default function ArticleList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const data = await getPosts(page);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadPosts();
  }, [page]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

---

## SECTION 5: WHAT TO TELL GPT CODEX

**Tell him:**

> "Great progress! Here's what to do next:
>
> **Question 1: Start Phase 1 migration script?**
> ✅ YES, START IMMEDIATELY
> - Build migration script (posts.json → public.posts)
> - Create API endpoints (GET /api/posts, etc.)
> - Create React components (ArticleList, ArticleDetail, etc.)
> - Test with the 84 posts you have
> - Don't wait for products.json
>
> **Question 2: What about products.json?**
> ⏳ I'm working on exporting it
> - WooCommerce export is separate from WordPress
> - I'll have it ready in 1-2 days
> - Phase 2 can start once it's ready
>
> **Next Steps:**
> 1. Build Phase 1 scaffolding:
>    - Migration script (posts.json → public.posts)
>    - API endpoints (/api/posts, /api/posts/:id, /api/posts/search)
>    - React components (ArticleList, ArticleDetail, ArticleSearch)
> 2. Test with real data (84 posts)
> 3. Deploy to Vercel
> 4. I'll export products.json in parallel
> 5. Once ready, we'll start Phase 2
>
> **Priority:**
> - Phase 1 (Articles): HIGH - START NOW
> - Phase 2 (Products): MEDIUM - AFTER products.json
> - Phase 3 (eBooks): LOW - AFTER ebooks.json
>
> Let's keep moving! 🚀"

---

## SECTION 6: CISCO'S WOOCOMMERCE EXPORT CHECKLIST

**You need to:**

- [ ] Go to WordPress Admin: https://periospot.com/wp-admin/
- [ ] Navigate to: WooCommerce → Products
- [ ] Click: Export (or use REST API method)
- [ ] If CSV: Download products_export.csv
- [ ] If REST API: Get Consumer Key & Secret from WooCommerce → Settings → Advanced → REST API
- [ ] Run curl command to export products.json
- [ ] Validate: products.json should have 20+ products
- [ ] Upload to: legacy-wordpress/content/products.json
- [ ] Commit to GitHub
- [ ] Notify GPT Codex that products.json is ready

---

## SECTION 7: QUICK REFERENCE - WOOCOMMERCE EXPORT METHODS

| Method | Difficulty | Speed | Best For |
|--------|-----------|-------|----------|
| Built-in Export | Easy | Fast | Most users |
| REST API | Medium | Medium | Developers |
| Database | Hard | Slow | Last resort |
| CSV → JSON | Easy | Fast | If you have CSV |

**Recommendation:** Try Built-in Export first, then REST API if that doesn't work.

---

**Everything is ready! GPT Codex can start Phase 1 scaffolding now while you export products.json!** 🚀
