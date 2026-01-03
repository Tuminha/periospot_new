# Mock Content Audit - January 3, 2026

## Overview
This document identifies all mock/placeholder content in the Next.js site that needs to be replaced with real content from the legacy WordPress site.

---

## Ebook System Audit

### Current State: Library Page (`/library`)

**File**: `periospot-nextjs/src/app/library/page.tsx`

#### Issues Found:

1. **Mock Ebook Data**
   - Currently uses hardcoded mock ebooks (3 ebooks)
   - Titles don't match legacy ebooks
   - Uses placeholder images from Unsplash
   - Download links point to "#" (non-functional)

2. **Real Ebooks from Legacy Site** (4 free + 3 paid):
   - ✅ "The 17 Immutable Laws In Implant Dentistry" (EN, ES versions exist)
   - ✅ "Guided Bone Regeneration In Implant Dentistry" (EN, ES versions)
   - ✅ "Connective Tissue Grafts Harvesting Techniques" (EN)
   - ✅ "10 Tips About Aesthetic Implant Dentistry" (EN)
   - ✅ "Guided Bone Regeneration iBook" (paid, Apple iBooks)
   - ✅ "Immediate Implants With Immediate Provisional Restorations" (paid, Apple iBooks)
   - ✅ "Immediate Loading and Immediate Restorations With CAD/CAM Prosthesis" (paid, Apple iBooks)

3. **SubscribePage.io Links Found**:
   - `http://subscribepage.io/periospot-17-immutable-laws-in-implant-dentistry-ebook` (EN)
   - `http://subscribepage.io/17-leyes-inmutables-implantologia-oral` (ES)
   - `http://subscribepage.io/guided-bone-regeneration-ebook` (EN)
   - `http://subscribepage.io/regeneracion-osea-guiada-ebook` (ES)
   - `http://subscribepage.io/connective-tissue-graft-implant-dentistry-ebook` (EN)
   - `http://subscribepage.io/10-tips-about-implant-dentistry-ebook` (EN)

4. **Ebook Files Status**:
   - ❌ No PDF files found in `periospot-assets/`
   - ❌ Ebooks are stored in Mailer Lite / SubscribePage.io
   - ⚠️ Need to download PDFs from Mailer Lite or locate source files

5. **Cover Images**:
   - WordPress image IDs referenced: 3224, 3226, 3231, 3247, 4869, 4872, 4874
   - Need to locate these images in `periospot-assets/` or WordPress media

---

## Mock Content Found Across Site

### 1. Admin Dashboard (`/admin`)

**File**: `periospot-nextjs/src/app/admin/page.tsx`

**Mock Data**:
- Analytics data (users, engagement, geography)
- Top pages, links, active users
- All metrics are hardcoded mock values

**Status**: ⚠️ Should connect to real analytics (Supabase, Google Analytics, etc.)

---

### 2. Affiliates Dashboard (`/admin/affiliates`)

**File**: `periospot-nextjs/src/app/admin/affiliates/page.tsx`

**Mock Data**:
- Affiliate links (mockAffiliateLinks array)
- Affiliate programs (mockPrograms array)
- Click/conversion/revenue data

**Status**: ⚠️ Should connect to real affiliate data (Tana, Genius Link API, etc.)

**Note**: The system has real affiliate infrastructure, but dashboard shows mock data.

---

### 3. Analytics API (`/api/admin/analytics`)

**File**: `periospot-nextjs/src/app/api/admin/analytics/route.ts`

**Mock Data**:
- Returns mock analytics data
- Not connected to real analytics sources

**Status**: ⚠️ Needs real analytics integration

---

### 4. Shopping Cart (`/cart`)

**File**: `periospot-nextjs/src/app/cart/page.tsx`

**Status**: ✅ Likely uses real product data (needs verification)

---

### 5. Checkout (`/checkout`)

**File**: `periospot-nextjs/src/app/checkout/page.tsx`

**Status**: ✅ Uses WooCommerce integration (real)

---

### 6. Search Page (`/search`)

**File**: `periospot-nextjs/src/app/search/page.tsx`

**Status**: ⚠️ Needs verification - may use real content or mock

---

## Action Items

### Priority 1: Ebook System (Critical)

1. **Locate Ebook Files**
   - [ ] Check Mailer Lite account for PDF download links
   - [ ] Download all ebook PDFs (EN, ES, PT versions if available)
   - [ ] Store in Supabase Storage or local directory for migration

2. **Create Database Schema**
   - [ ] Create `ebooks` table in Supabase
   - [ ] Create `ebook_downloads` tracking table
   - [ ] Migration file: `supabase/migrations/YYYYMMDD_create_ebooks_tables.sql`

3. **Update Library Page**
   - [ ] Replace mock ebook data with real data from legacy WordPress
   - [ ] Use real cover images (find WordPress image IDs: 3224, 3226, 3231, 3247)
   - [ ] Implement download flow:
     - Logged-in users: Direct download
     - Non-logged-in users: Email capture → Download
   - [ ] Add language filtering (EN, ES, PT)

4. **Email Capture Integration**
   - [ ] Create email capture modal/form component
   - [ ] API endpoint: `/api/ebooks/[slug]/download`
   - [ ] Optional: Mailer Lite API integration for newsletter subscription

5. **Download Tracking**
   - [ ] Track all downloads in database
   - [ ] Show download counts on library page
   - [ ] User download history (for logged-in users)

### Priority 2: Mock Data Replacement

1. **Admin Dashboard**
   - [ ] Connect to real analytics (Supabase queries, Google Analytics API, etc.)
   - [ ] Replace mock analytics data

2. **Affiliates Dashboard**
   - [ ] Connect to real affiliate data sources
   - [ ] Replace mock affiliate links/programs

3. **Search Functionality**
   - [ ] Verify search uses real content
   - [ ] Replace any mock search results

---

## Files Requiring Updates

### High Priority

1. `periospot-nextjs/src/app/library/page.tsx`
   - Replace mock ebooks with real data
   - Add authentication check
   - Implement download flow
   - Add email capture

2. `periospot-nextjs/src/app/admin/page.tsx`
   - Connect to real analytics
   - Remove mock data

3. `periospot-nextjs/src/app/admin/affiliates/page.tsx`
   - Connect to real affiliate data
   - Remove mock data

### Medium Priority

4. `periospot-nextjs/src/app/api/admin/analytics/route.ts`
   - Implement real analytics queries

5. `periospot-nextjs/src/app/search/page.tsx`
   - Verify uses real content

### New Files to Create

1. `supabase/migrations/YYYYMMDD_create_ebooks_tables.sql`
2. `periospot-nextjs/src/app/api/ebooks/[slug]/download/route.ts`
3. `periospot-nextjs/src/components/EbookDownloadModal.tsx`
4. `legacy-wordpress/content/ebooks.json` (extracted ebook metadata)
5. `periospot-nextjs/src/lib/ebooks.ts` (ebook loading functions)

---

## Questions to Resolve

1. **Ebook PDF Files**:
   - Where are the actual PDF files stored?
   - Do we need to download them from Mailer Lite?
   - Are source files available elsewhere?

2. **Cover Images**:
   - Where are WordPress image IDs 3224, 3226, 3231, 3247 stored?
   - Need to find these in `periospot-assets/` or migrate from WordPress

3. **Mailer Lite Integration**:
   - Do we have Mailer Lite API credentials?
   - Should we continue using Mailer Lite or switch to Resend + Supabase?

4. **Languages**:
   - Which ebooks exist in multiple languages?
   - EN: All 4 free ebooks confirmed
   - ES: 17 Immutable Laws, GBR ebook confirmed
   - PT: Need to verify

---

## Next Steps

1. **Immediate** (Today):
   - ✅ Create audit documents (this file + EBOOK_AUDIT)
   - [ ] Search for ebook cover images in periospot-assets
   - [ ] Check Mailer Lite account access/credentials

2. **Short-term** (This Week):
   - [ ] Download/locate ebook PDF files
   - [ ] Create database schema for ebooks
   - [ ] Extract ebook metadata from legacy WordPress

3. **Medium-term** (Next 2 Weeks):
   - [ ] Implement ebook download system
   - [ ] Update library page with real data
   - [ ] Connect admin dashboard to real analytics

---

*Audit created: January 3, 2026*
