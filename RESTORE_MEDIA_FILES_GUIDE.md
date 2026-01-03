# Guide: Selectively Restore Media Files from Dropbox

## Problem

Your media files may have been accidentally deleted, but Dropbox's deleted files list contains many build artifacts (`.next`, cache files, etc.) that should NOT be restored.

## Strategy: Selective Restoration

We need to restore ONLY media files, not build artifacts.

## What to Look For in Dropbox Deleted Items

### ✅ RESTORE These (Media Files)
- Files with image extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Files in paths containing: `media`, `uploads`, `wp-content`, `images`, `legacy-wordpress/media`
- Files that match WordPress upload patterns: `YYYY/MM/filename.jpg`

### ❌ DO NOT RESTORE These (Build Artifacts)
- Anything in `.next/` directories
- Files with extensions: `.webpack`, `.hot-update`, `.json` (unless clearly media metadata)
- Cache files: `cache/`, `.cache/`
- Temporary files: `.__tmp__`, `.tmp`
- Build artifacts: `webpack.*`, `layout.*.hot-update.js`, `*.nft.json`
- Log files: `logs/`, `*.log`

## Manual Restoration Process

### Option 1: Dropbox Web Interface (Recommended)

1. **Open Dropbox Deleted Files**
   - Go to Dropbox web interface
   - Navigate to "Deleted files" section

2. **Use Search/Filter**
   - Search for file extensions: `.jpg`, `.png`, `.gif`, `.webp`
   - OR search for paths containing: `media`, `uploads`, `wp-content`

3. **Selectively Restore**
   - Select ONLY image files
   - Restore them to: `legacy-wordpress/media/`
   - Make sure the folder structure is preserved (YYYY/MM/filename.ext)

### Option 2: Download and Organize

If you can't restore selectively through Dropbox:

1. **Download ALL deleted files** (or a subset) to a temporary location
2. **Run the filter script below** to copy only media files to the correct location
3. **Delete the temporary folder** after filtering

## Automated Filter Script

If you download all deleted files to a temp folder, run this script to extract only media files:

```bash
# Run this from the project root
npx tsx scripts/filter-media-from-deleted.ts <path-to-downloaded-files>
```

This script will:
- Scan the downloaded files
- Identify media files (by extension and path)
- Copy them to `legacy-wordpress/media/` with correct structure
- Skip all build artifacts and cache files

## Expected Result

After restoration, you should have:

```
legacy-wordpress/media/
├── 2015/
│   ├── 01/
│   ├── 02/
│   └── ...
├── 2016/
├── 2017/
└── ... (years 2015-2025)
```

## Verification

After restoring files:

```bash
# Count restored images
find legacy-wordpress/media -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l

# Should see hundreds of files (expect 500-1000+ images)
```

Then run the migration script:

```bash
npx tsx scripts/migrate-images-to-supabase.ts
```
