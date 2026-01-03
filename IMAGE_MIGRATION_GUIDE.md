# Image Migration Guide

## Current Status

✅ Script is ready and working  
⚠️ Media files need to be placed in the correct location

## Expected Directory Structure

The script expects media files to be organized like this:

```
legacy-wordpress/media/
├── 2015/
│   └── 07/
│       ├── image1.jpg
│       ├── image2.png
│       └── ...
├── 2016/
│   └── 01/
│       └── ...
└── ...
```

**Important:** The structure should match WordPress URLs:
- URL: `https://periospot.com/wp-content/uploads/2015/07/image.jpg`
- Local path: `legacy-wordpress/media/2015/07/image.jpg`

## How to Download Media Files

### Option 1: Via FTP (Recommended)

1. Use FileZilla or another FTP client
2. Connect to `periospot.com` (credentials in `docs/Complete Guide: How to Download Your WordPress Site via FTP.md`)
3. Navigate to `/wp-content/uploads/`
4. Download the entire `uploads` folder
5. Extract/place the contents so that files are in `legacy-wordpress/media/YEAR/MONTH/filename.ext`

### Option 2: WordPress Admin

1. Log into WordPress admin
2. Go to Media Library
3. Download files individually or use a plugin to export

### Option 3: If You Already Downloaded Files

If you downloaded files but they're in a different structure:

1. **Check if files are in a `wp-content/uploads/` folder somewhere:**
   ```bash
   find . -type d -name "uploads" -o -name "wp-content"
   ```

2. **If found, copy/move them to the expected location:**
   ```bash
   # Example: if files are in ./backup/wp-content/uploads/
   cp -r ./backup/wp-content/uploads/* legacy-wordpress/media/
   ```

## Running the Migration

Once files are in place:

```bash
npx tsx scripts/migrate-images-to-supabase.ts
```

The script will:
1. ✅ Check for local files first (fast, no download needed)
2. ✅ Fall back to downloading if local files not found
3. ✅ Upload to Supabase Storage
4. ✅ Generate a mapping file (`image-migration-mappings.json`)

## Verification

After migration, check:
- `image-migration-mappings.json` - Contains old URL → new Supabase URL mappings
- Console output - Shows success/failure counts
- Supabase Storage - Verify files are in the `images` bucket
