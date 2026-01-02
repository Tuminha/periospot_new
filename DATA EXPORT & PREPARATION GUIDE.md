# DATA EXPORT & PREPARATION GUIDE
## How to Get posts.json, products.json, and Other Required Files

**Status:** Critical - Required before Phase III implementation
**Priority:** HIGH
**Audience:** GPT Codex & Cisco

---

## OVERVIEW

The migration requires several JSON files from the old PerioSpot WordPress site. Currently, the files are 0 bytes, which means they haven't been exported yet. This guide explains how to export them.

---

## SECTION 1: EXPORTING POSTS (Blog Articles)

### Option 1: WordPress REST API Export (Recommended)

**Step 1: Access WordPress REST API**

The WordPress REST API is already enabled on periospot.com. You can access it directly:

```
https://periospot.com/wp-json/wp/v2/posts
```

**Step 2: Export All Posts**

Use this command to export all posts as JSON:

```bash
# Export all posts (paginated, 100 per page)
curl -s "https://periospot.com/wp-json/wp/v2/posts?per_page=100&page=1" > posts_page1.json
curl -s "https://periospot.com/wp-json/wp/v2/posts?per_page=100&page=2" > posts_page2.json
# Continue for all pages...

# Or use a script to get all pages automatically
for page in {1..10}; do
  curl -s "https://periospot.com/wp-json/wp/v2/posts?per_page=100&page=$page" >> posts_all.json
done
```

**Step 3: Get Additional Post Metadata**

Posts alone don't include all metadata. You also need:

```bash
# Get categories
curl -s "https://periospot.com/wp-json/wp/v2/categories" > categories.json

# Get authors
curl -s "https://periospot.com/wp-json/wp/v2/users" > authors.json

# Get featured images
curl -s "https://periospot.com/wp-json/wp/v2/media" > media.json

# Get tags
curl -s "https://periospot.com/wp-json/wp/v2/tags" > tags.json
```

**Step 4: Extract Yoast SEO Data**

Yoast SEO data is stored in post meta. You need to query it separately:

```bash
# This requires admin access - use WP-CLI instead
wp post list --format=json --fields=ID,post_title,post_content,post_excerpt,post_date,post_author,post_status > posts_full.json

# Then extract Yoast data for each post
wp post meta list <post_id> --format=json | grep yoast
```

---

### Option 2: WordPress Export Plugin (Easiest)

**Step 1: Use "All Export" Plugin**

The easiest way is to use the WordPress "All Export" plugin:

1. Go to WordPress Admin: https://periospot.com/wp-admin/
2. Navigate to: **Tools → Export**
3. Select: **Posts**
4. Choose format: **JSON** (or CSV, then convert to JSON)
5. Click: **Download Export File**

This will download a file with all posts.

**Step 2: Convert to Proper JSON Format**

The exported file may need formatting. Use this Python script to clean it:

```python
import json
import xml.etree.ElementTree as ET

# If XML export
tree = ET.parse('export.xml')
root = tree.getroot()

posts = []
for item in root.findall('.//item'):
    post = {
        'id': item.find('wp:post_id', {'wp': 'http://wordpress.org/export/1.2/'}).text,
        'title': item.find('title').text,
        'content': item.find('content:encoded', {'content': 'http://purl.org/rss/1.0/modules/content/'}).text,
        'excerpt': item.find('excerpt:encoded', {'excerpt': 'http://purl.org/rss/1.0/modules/excerpt/'}).text,
        'date': item.find('pubDate').text,
        'author': item.find('dc:creator', {'dc': 'http://purl.org/dc/elements/1.1/'}).text,
        'status': item.find('wp:status', {'wp': 'http://wordpress.org/export/1.2/'}).text,
    }
    posts.append(post)

with open('posts.json', 'w') as f:
    json.dump(posts, f, indent=2)
```

---

### Option 3: Direct Database Export (Most Complete)

**Step 1: Access WordPress Database**

If you have database access:

```sql
-- Export all posts with metadata
SELECT 
  p.ID as id,
  p.post_title as title,
  p.post_content as content,
  p.post_excerpt as excerpt,
  p.post_date as published_at,
  p.post_modified as updated_at,
  p.post_author as author_id,
  p.post_status as status,
  p.post_name as slug,
  p.guid as url,
  GROUP_CONCAT(DISTINCT pm.meta_value) as featured_image_id
FROM wp_posts p
LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
WHERE p.post_type = 'post' AND p.post_status IN ('publish', 'draft')
GROUP BY p.ID
ORDER BY p.post_date DESC;
```

**Step 2: Export to JSON**

```bash
# Using MySQL
mysql -u username -p database_name -e "SELECT ... FROM wp_posts" | \
  python3 -c "import sys, json; print(json.dumps([dict(zip(headers, row)) for row in csv.reader(sys.stdin)]))" > posts.json
```

---

## SECTION 2: EXPORTING PRODUCTS (WooCommerce)

### Step 1: Export Products via REST API

```bash
# Get all products
curl -s "https://periospot.com/wp-json/wc/v3/products?per_page=100" > products.json

# Note: WooCommerce REST API requires authentication
# If you get 401 Unauthorized, use consumer key/secret:
curl -s "https://periospot.com/wp-json/wc/v3/products?consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET" > products.json
```

### Step 2: Get WooCommerce Consumer Keys

1. Go to WordPress Admin: https://periospot.com/wp-admin/
2. Navigate to: **WooCommerce → Settings → Advanced → REST API**
3. Click: **Create an API key**
4. Fill in:
   - Description: "Migration Export"
   - Permissions: "Read"
5. Click: **Generate API key**
6. Copy the **Consumer Key** and **Consumer Secret**

### Step 3: Export with Authentication

```bash
CONSUMER_KEY="ck_..."
CONSUMER_SECRET="cs_..."

curl -s -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  "https://periospot.com/wp-json/wc/v3/products?per_page=100" > products.json
```

### Step 4: Export Product Categories

```bash
curl -s -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  "https://periospot.com/wp-json/wc/v3/products/categories" > product_categories.json
```

---

## SECTION 3: EXPORTING EBOOK METADATA

### Step 1: Identify eBook Posts

eBooks are likely stored as posts with a custom post type. Export them:

```bash
# Export posts with 'ebook' post type
curl -s "https://periospot.com/wp-json/wp/v2/ebook?per_page=100" > ebooks.json

# Or if stored as regular posts with a category:
curl -s "https://periospot.com/wp-json/wp/v2/posts?categories=<EBOOK_CATEGORY_ID>&per_page=100" > ebooks.json
```

### Step 2: Get eBook Download Links

eBook files are likely stored in:
- WordPress Media Library
- External storage (Dropbox, Google Drive, etc.)
- Plugin-specific storage

**Check these locations:**

```bash
# Get all media files
curl -s "https://periospot.com/wp-json/wp/v2/media?per_page=100" > media.json

# Look for PDF/EPUB files in the response
# Extract download URLs from the media objects
```

### Step 3: Create eBooks JSON Manually

If eBooks are stored separately, create a JSON file:

```json
[
  {
    "id": "ebook-1",
    "title": "The 17 Immutable Laws In Implant Dentistry",
    "description": "Update of the scientific literature about implant dentistry...",
    "file_url": "https://periospot.com/downloads/ebook-1.pdf",
    "file_type": "pdf",
    "price": 0,
    "category": "Implant Dentistry",
    "language": "en"
  },
  {
    "id": "ebook-2",
    "title": "Guided Bone Regeneration In Implant Dentistry",
    "description": "...",
    "file_url": "https://periospot.com/downloads/ebook-2.pdf",
    "file_type": "pdf",
    "price": 0,
    "category": "Implant Dentistry",
    "language": "en"
  }
]
```

---

## SECTION 4: EXPORTING COMMENTS

### Step 1: Export Comments via REST API

```bash
# Get all comments
curl -s "https://periospot.com/wp-json/wp/v2/comments?per_page=100" > comments.json
```

### Step 2: Get Comments by Post

```bash
# Get comments for a specific post
curl -s "https://periospot.com/wp-json/wp/v2/comments?post=<POST_ID>" > post_comments.json
```

---

## SECTION 5: EXPORTING NEWSLETTER SUBSCRIBERS

### Step 1: Check Newsletter Plugin

The newsletter plugin (likely Mailchimp, ConvertKit, or similar) stores subscribers. Export from:

1. **Mailchimp:** https://mailchimp.com/
   - Audience → All contacts → Export
   
2. **ConvertKit:** https://convertkit.com/
   - Subscribers → Export

3. **WordPress Plugin:** 
   - Check Tools → Export or plugin settings

### Step 2: Create Subscribers JSON

```json
[
  {
    "email": "subscriber@example.com",
    "name": "John Doe",
    "subscribed_at": "2024-01-01T00:00:00Z",
    "language": "en",
    "source": "homepage"
  }
]
```

---

## SECTION 6: TYPEFORM ASSESSMENTS

### Step 1: Get Typeform Form IDs

The assessments are embedded Typeform forms. Get the form IDs:

1. Go to Typeform: https://typeform.com/
2. Find each form:
   - Periodontics Assessment
   - Implant Dentistry Assessment
   - Aesthetics Dentistry Assessment
   - Marketing Online Assessment
3. Copy the form ID from the URL: `https://form.typeform.com/to/<FORM_ID>`

### Step 2: Create Assessments JSON

```json
[
  {
    "id": "assessment-1",
    "title": "Periodontics Assessment",
    "slug": "periodontics-assessment",
    "typeform_id": "ycAW7N",
    "category": "Periodontics",
    "language": "en"
  },
  {
    "id": "assessment-2",
    "title": "Implant Dentistry Assessment",
    "slug": "implant-dentistry-assessment",
    "typeform_id": "...",
    "category": "Implant Dentistry",
    "language": "en"
  }
]
```

---

## SECTION 7: COMPLETE JSON STRUCTURE

### posts.json Structure

```json
[
  {
    "id": 1,
    "title": "Article Title",
    "slug": "article-title",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Short excerpt...",
    "featured_image_url": "https://...",
    "author": "Cisco",
    "author_id": 1,
    "category": "Implant Dentistry",
    "category_id": 2,
    "language": "en",
    "status": "published",
    "published_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "meta_keywords": "keyword1, keyword2",
    "focus_keyword": "keyword1",
    "tags": ["tag1", "tag2"],
    "yoast_score": "90",
    "canonical_url": "https://periospot.com/article-title/"
  }
]
```

### products.json Structure

```json
[
  {
    "id": 1,
    "title": "Product Title",
    "slug": "product-title",
    "description": "Product description...",
    "price": 10.00,
    "sale_price": 8.00,
    "sku": "PROD-001",
    "category": "Accessories",
    "category_id": 1,
    "image_url": "https://...",
    "gallery_images": ["https://...", "https://..."],
    "stock_quantity": 100,
    "status": "published",
    "rating": 4.5,
    "review_count": 10
  }
]
```

### ebooks.json Structure

```json
[
  {
    "id": "ebook-1",
    "title": "eBook Title",
    "slug": "ebook-title",
    "description": "eBook description...",
    "cover_image_url": "https://...",
    "file_url": "https://...",
    "file_type": "pdf",
    "file_size_mb": 5.2,
    "category": "Implant Dentistry",
    "price": 0,
    "download_count": 1000,
    "email_capture_required": true
  }
]
```

---

## SECTION 8: STEP-BY-STEP EXPORT PROCESS

### For Cisco (Website Owner)

**Step 1: Export Posts**

1. Go to: https://periospot.com/wp-admin/
2. Navigate to: **Tools → Export**
3. Select: **Posts**
4. Click: **Download Export File**
5. Save as: `posts_export.xml`

**Step 2: Export Products**

1. Go to: https://periospot.com/wp-admin/
2. Navigate to: **WooCommerce → Products**
3. Select all products
4. Bulk action: **Export**
5. Save as: `products_export.csv`

**Step 3: Export Comments**

1. Go to: https://periospot.com/wp-admin/
2. Navigate to: **Comments**
3. Select all comments
4. Bulk action: **Export**
5. Save as: `comments_export.csv`

**Step 4: Export Media**

1. Go to: https://periospot.com/wp-admin/
2. Navigate to: **Media**
3. Select all media
4. Bulk action: **Export** (if available)
5. Or manually note URLs

**Step 5: Get Typeform IDs**

1. Go to: https://typeform.com/
2. Find each assessment form
3. Copy form ID from URL
4. Document in a text file

**Step 6: Get WooCommerce API Keys**

1. Go to: https://periospot.com/wp-admin/
2. Navigate to: **WooCommerce → Settings → Advanced → REST API**
3. Create API key with "Read" permissions
4. Copy Consumer Key and Consumer Secret

---

## SECTION 9: CONVERT EXPORTS TO JSON

### Python Script to Convert CSV to JSON

```python
import csv
import json

def csv_to_json(csv_file, json_file):
    data = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Convert products
csv_to_json('products_export.csv', 'products.json')

# Convert comments
csv_to_json('comments_export.csv', 'comments.json')
```

### Python Script to Convert XML to JSON

```python
import xml.etree.ElementTree as ET
import json

def xml_to_json(xml_file, json_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    posts = []
    for item in root.findall('.//item'):
        post = {}
        for child in item:
            # Remove namespace
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            post[tag] = child.text
        posts.append(post)
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

# Convert posts
xml_to_json('posts_export.xml', 'posts.json')
```

---

## SECTION 10: UPLOAD TO REPOSITORY

### Step 1: Place Files in Correct Location

```
periospot_new/
├── legacy-wordpress/
│   └── content/
│       ├── posts.json
│       ├── products.json
│       ├── ebooks.json
│       ├── comments.json
│       ├── categories.json
│       ├── authors.json
│       ├── tags.json
│       └── media.json
```

### Step 2: Commit to Git

```bash
cd /path/to/periospot_new
git add legacy-wordpress/content/*.json
git commit -m "Add WordPress export data for Phase III migration"
git push origin main
```

---

## SECTION 11: VALIDATION CHECKLIST

Before starting Phase III, verify:

- [ ] posts.json has content (not 0 bytes)
- [ ] posts.json contains 40+ articles
- [ ] Each post has: id, title, content, author, date, category
- [ ] Featured images are included or URLs provided
- [ ] Yoast SEO data is included (meta_title, meta_description, etc.)

- [ ] products.json has content (not 0 bytes)
- [ ] products.json contains 20+ products
- [ ] Each product has: id, title, price, category, images

- [ ] ebooks.json created with 10+ eBooks
- [ ] Each eBook has: id, title, file_url, category, price

- [ ] comments.json created with all comments
- [ ] categories.json created with all categories
- [ ] authors.json created with all authors

- [ ] Typeform form IDs documented (4 assessments)
- [ ] Newsletter subscribers list exported (if available)
- [ ] Media URLs collected (featured images, product images)

---

## SECTION 12: QUESTIONS FOR CISCO

Before GPT Codex starts Phase III, please answer:

1. **Posts Export:**
   - Do you have access to WordPress admin?
   - Can you export posts via Tools → Export?
   - Do you have the posts.xml file?

2. **Products Export:**
   - Do you have WooCommerce API keys?
   - Can you export products via WooCommerce → Products?
   - Do you have the products.csv file?

3. **eBooks:**
   - Where are eBook files stored (local, Dropbox, Google Drive)?
   - Can you provide direct download links?
   - Do you want them uploaded to Supabase Storage?

4. **Typeform:**
   - Do you have Typeform account access?
   - Can you provide the 4 form IDs?
   - Should responses be migrated?

5. **Newsletter:**
   - Which newsletter service (Mailchimp, ConvertKit, etc.)?
   - Can you export subscriber list?
   - How many subscribers?

6. **Media:**
   - Are featured images in WordPress Media Library?
   - Can you export media URLs?
   - Should images be re-hosted on Supabase?

---

## NEXT STEPS

1. **Cisco:** Follow Section 8 to export all data
2. **Cisco:** Convert exports to JSON using Section 9 scripts
3. **Cisco:** Upload JSON files to `legacy-wordpress/content/`
4. **Cisco:** Answer questions in Section 12
5. **GPT Codex:** Start Phase III once files are ready
6. **GPT Codex:** Use migration scripts to import data into Supabase

---

**This guide covers everything needed to export and prepare data for migration. Follow the steps and you'll have all the JSON files ready!**
