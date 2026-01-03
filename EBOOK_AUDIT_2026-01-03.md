# Ebook Audit & Implementation Plan - January 3, 2026

## Overview
This document audits the ebook system from the legacy WordPress site and plans the implementation for the new Next.js site.

---

## Ebooks Found in Legacy WordPress

From the `/library/` page content analysis, the following ebooks were identified:

### Free Ebooks (via SubscribePage.io / Mailer Lite)

1. **The 17 Immutable Laws In Implant Dentistry**
   - Link: `http://subscribepage.io/periospot-17-immutable-laws-in-implant-dentistry-ebook`
   - Description: Update of scientific literature, different topics and recommendations, full of illustrations and photos, links to best content
   - Languages: English, Spanish, Portuguese (assumed)

2. **Guided Bone Regeneration In Implant Dentistry**
   - Link: `http://subscribepage.io/guided-bone-regeneration-ebook`
   - Description: Simple guide with most common GBR procedures, explained with photos and illustrations

3. **Connective Tissue Grafts Harvesting Techniques Free Ebook**
   - Link: `http://subscribepage.io/connective-tissue-graft-implant-dentistry-ebook`
   - Description: Tips and fundamentals for connective tissue grafts in daily practice

4. **10 Tips About Aesthetic Implant Dentistry**
   - Link: `http://subscribepage.io/10-tips-about-implant-dentistry-ebook`
   - Description: Ideal ebook to start understanding basics of implant dentistry from biological and clinical point of view

### Paid iBooks (via Genius Links)

5. **Guided Bone Regeneration iBook**
   - Link: `https://geni.us/landingpageibook`
   - Platform: Apple iBooks
   - Paid product

6. **Immediate Implants With Immediate Provisional Restorations**
   - Link: `https://geni.us/ikooklandingimmimplant`
   - Platform: Apple iBooks
   - Paid product

7. **Immediate Loading and Immediate Restorations With CAD/CAM Prosthesis**
   - Link: `https://geni.us/iBooklandingpageiimmlo`
   - Platform: Apple iBooks
   - Paid product

---

## Current State Analysis

### Legacy WordPress Implementation
- **Email Capture**: Used SubscribePage.io (Mailer Lite integration)
- **Flow**: User clicks download → Redirects to SubscribePage.io → User enters email → Receives ebook download link
- **Storage**: Ebooks stored in Mailer Lite / SubscribePage.io (not on WordPress server)
- **Languages**: Multiple languages (English, Spanish, Portuguese mentioned)

### New Next.js Implementation Status
- **Library Page**: Exists at `/periospot-nextjs/src/app/library/page.tsx`
- **Current State**: Uses mock/placeholder data
- **Images**: Using Unsplash placeholder images (not real ebook covers)
- **Download Links**: Placeholder "#" links
- **Email Capture**: Not implemented
- **Authentication**: User login system exists

---

## Issues Found

### 1. Mock Content in Library Page
**Location**: `periospot-nextjs/src/app/library/page.tsx`

**Issues**:
- Using placeholder images from Unsplash
- Download links point to "#" (not functional)
- No email capture form
- No authentication check
- Ebook data is hardcoded mock data

**Example**:
```typescript
const ebooks = [
  {
    id: 1,
    title: "The 17 Immutable Laws In Implant Dentistry",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop", // ❌ Placeholder
    downloadLink: "#", // ❌ Not functional
    isFree: true,
  },
  // ...
]
```

### 2. Missing Ebook Files
**Status**: Need to verify if ebook PDF files are available
- Check if files exist in `periospot-assets/` or `legacy-wordpress/media/`
- Check Mailer Lite account for download links
- Need to locate actual PDF files

### 3. No Email Capture Integration
**Status**: Not implemented
- No Mailer Lite API integration
- No email capture form for non-logged-in users
- No download tracking

### 4. No Authentication-Based Download
**Status**: Not implemented
- No check for logged-in users
- No direct download for authenticated users
- No download history tracking

---

## Implementation Requirements

### Phase 1: Data Migration

1. **Locate Ebook Files**
   - [ ] Search for PDF files in `periospot-assets/`
   - [ ] Check Mailer Lite account for download links
   - [ ] Verify all language versions exist (EN, ES, PT)
   - [ ] Document file locations and names

2. **Extract Ebook Metadata**
   - [ ] Extract real ebook cover images from WordPress media
   - [ ] Document ebook descriptions from legacy page
   - [ ] Create JSON structure for ebook data

3. **Upload to Supabase Storage**
   - [ ] Create `ebooks` bucket in Supabase Storage
   - [ ] Upload all ebook PDF files
   - [ ] Generate public URLs for downloads
   - [ ] Organize by language (if multiple versions exist)

### Phase 2: Database Schema

Create Supabase tables:

```sql
-- Ebooks table
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  file_url TEXT NOT NULL,
  file_size_mb DECIMAL,
  language TEXT DEFAULT 'en', -- en, es, pt
  download_count INT DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ebook downloads tracking
CREATE TABLE ebook_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id), -- NULL for non-logged-in users
  email TEXT NOT NULL, -- Required for all downloads
  downloaded_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

### Phase 3: API Implementation

1. **Download Endpoint** (`/api/ebooks/[slug]/download`)
   - Check authentication status
   - If logged in: Direct download (use user email from profile)
   - If not logged in: Require email input, then download
   - Track download in database
   - Send download email via Resend (optional)

2. **Email Capture Endpoint** (`/api/ebooks/[slug]/capture-email`)
   - Accept email address
   - Validate email format
   - Optional: Subscribe to newsletter (Mailer Lite integration)
   - Return download URL/token

3. **Mailer Lite Integration** (Optional)
   - Integrate Mailer Lite API
   - Subscribe users to newsletter when downloading
   - Track subscription status

### Phase 4: Frontend Implementation

1. **Update Library Page**
   - Replace mock data with real ebook data
   - Use real cover images from Supabase
   - Implement download flow:
     - **Logged-in users**: Show "Download" button → Direct download
     - **Non-logged-in users**: Show email capture form → Download after email

2. **Email Capture Modal/Form**
   - Create modal component for email capture
   - Form fields: Email (required), Name (optional)
   - Submit → Download ebook + Subscribe to newsletter (optional)

3. **Download Tracking**
   - Track downloads in database
   - Show download count on library page
   - User download history (for logged-in users)

---

## Next Steps

1. **Immediate**: Audit for ebook files
   - Search `periospot-assets/` for PDF files
   - Check if ebook covers exist in media
   - Document findings

2. **Short-term**: Create database schema and migration
   - Create migration file for ebooks tables
   - Set up Supabase Storage bucket

3. **Medium-term**: Implement download flow
   - Create API endpoints
   - Update library page with real data
   - Implement email capture

4. **Long-term**: Mailer Lite integration (optional)
   - API integration for newsletter subscriptions
   - Sync with Mailer Lite subscriber list

---

## Ebook Cover Images Found ✅

**Located Cover Images**:
1. ✅ **17 Immutable Laws**: `periospot-assets/2020/07/The-17-Immutable-Laws-In-Implant-Dentistry-1.png`
2. ✅ **Guided Bone Regeneration**: `periospot-assets/2020/03/Guided-Bone-Regeneration.png`
3. ✅ **10 Tips About Aesthetic Implant Dentistry**: `periospot-assets/2020/03/10-tips-about-Aesthetic-Implant-Dentistry.png`
4. ⚠️ **Connective Tissue Grafts**: Need to locate (searching...)
5. ⚠️ **Paid iBooks** (4869, 4872, 4874): Need to locate

**Status**: 3 out of 4 free ebook covers found! ✅

---

## Questions to Resolve

1. **Ebook PDF Files Location**: Where are the actual PDF files stored?
   - ✅ Confirmed: Stored in Mailer Lite / SubscribePage.io
   - ⚠️ Need to download PDF files from Mailer Lite account
   - ⚠️ May need Mailer Lite API access or manual download

2. **Languages**: Do all ebooks exist in EN/ES/PT?
   - EN: All 4 free ebooks confirmed ✅
   - ES: 17 Immutable Laws, GBR ebook confirmed ✅
   - PT: Need to verify

3. **Mailer Lite Integration**: 
   - Do we have Mailer Lite API credentials?
   - Should we continue using Mailer Lite or use Resend + Supabase?
   - Recommendation: Use Resend + Supabase for better control

4. **Cover Images**: 
   - ✅ 3 out of 4 free ebook covers found in `periospot-assets/`
   - ⚠️ Need to locate Connective Tissue Grafts cover
   - ⚠️ Need to locate paid iBook covers (IDs: 4869, 4872, 4874)

---

## Files to Create/Modify

### New Files
- `supabase/migrations/YYYYMMDD_create_ebooks_tables.sql`
- `periospot-nextjs/src/app/api/ebooks/[slug]/download/route.ts`
- `periospot-nextjs/src/app/api/ebooks/[slug]/capture-email/route.ts`
- `periospot-nextjs/src/components/EbookDownloadModal.tsx`
- `legacy-wordpress/content/ebooks.json` (extracted ebook data)

### Files to Modify
- `periospot-nextjs/src/app/library/page.tsx` (replace mock data, add download logic)
- `periospot-nextjs/src/lib/content.ts` (add ebook loading functions)

---

*Audit created: January 3, 2026*
