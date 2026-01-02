# Media Validation & Verification Setup

**Date**: January 2, 2026  
**Status**: ✅ Complete and Ready

---

## Overview

Comprehensive media validation scripts have been created to verify that all WordPress media files are properly downloaded and migrated. These scripts ensure:

- ✅ All 614 images are downloaded
- ✅ No corrupted files
- ✅ No missing files from any year (2015-2025)
- ✅ File integrity and completeness
- ✅ All referenced images in JSON content have corresponding files
- ✅ No orphaned files (files not referenced in content)

---

## Scripts Created

### 1. Comprehensive Validation Script (`scripts/validate-media.ts`)

**Purpose**: Complete validation with detailed reporting

**Features**:
- Scans all downloaded media files
- Extracts image URLs from posts.json, pages.json, and products.json
- Cross-references referenced URLs with downloaded files
- Identifies missing files
- Identifies orphaned files (downloaded but not referenced)
- Validates file integrity (checks for corrupted files)
- Generates detailed JSON report

**Usage**:
```bash
cd periospot
npm run validate:media
```

**Output**:
- Console report with real-time status
- `validation-report.json` in project root with detailed results

### 2. Quick Validation Script (`scripts/quick-validate.ts`)

**Purpose**: Fast file count verification

**Features**:
- Quick count of downloaded files
- Breakdown by year (2015-2025)
- Breakdown by file type

**Usage**:
```bash
cd periospot
npm run validate:media:quick
```

---

## Dependencies

All required dependencies have been installed:

- `sharp` (optional - for image integrity checks)
- `glob` (for file scanning)
- `tsx` (for running TypeScript scripts)

**Note**: Sharp is optional. If not available, the script will skip image integrity checks but still perform all other validations.

---

## Expected Results

### ✅ PASS Status
```
Status: ✅ PASS

Summary:
  Total Downloaded Files: 614
  Total Referenced Files: 614
  Completeness: 100.00%
  Integrity: 100.00%
  Coverage: 100.00%

No missing files found
No corrupted files found
No orphaned files found
```

### ⚠️ WARNING Status
```
Status: ⚠️ WARNING

Issues:
- Orphaned Files (23): Files downloaded but not referenced in content
  (These are usually backup files or unused assets - safe to delete)
```

### ❌ FAIL Status
```
Status: ❌ FAIL

Issues:
- Missing Files (5): Referenced in content but not downloaded
- Corrupted Files (2): Downloaded but unreadable
```

---

## Current Status

**As of January 2, 2026**:
- ✅ Validation scripts created and tested
- ✅ Dependencies installed
- ✅ Scripts added to package.json
- ⏳ Waiting for media files to be downloaded via FTP

**Next Steps**:
1. Download all media files from WordPress via FTP to `legacy-wordpress/media/`
2. Run `npm run validate:media` to verify completeness
3. Fix any missing or corrupted files before proceeding with migration
4. **DO NOT proceed with migration until validation passes!**

---

## Troubleshooting

### If Validation Fails

1. **Missing Files**:
   - Re-download from FTP
   - Check file names match exactly
   - Verify FTP download completed

2. **Corrupted Files**:
   - Re-download from FTP
   - Check file integrity on server
   - Try different FTP client

3. **Orphaned Files**:
   - Usually safe to ignore
   - These are backup/unused files
   - Can be deleted to save space

---

## File Structure

```
periospot_new_page/
├── scripts/
│   ├── validate-media.ts      # Comprehensive validation
│   └── quick-validate.ts       # Quick count validation
├── legacy-wordpress/
│   ├── media/                  # Media files (to be downloaded)
│   │   ├── 2015/
│   │   ├── 2016/
│   │   └── ... (2015-2025)
│   └── content/
│       ├── posts.json
│       ├── pages.json
│       └── products.json
└── validation-report.json     # Generated report (after running)
```

---

## Integration with Migration Process

This validation is a **critical checkpoint** in the migration process:

1. **Before Migration**: Run validation to ensure all media is downloaded
2. **After Migration**: Re-run validation to verify files were uploaded correctly to Supabase Storage
3. **Post-Launch**: Use validation to verify no broken image links

---

## Notes

- The scripts automatically detect the project root, so they work whether run from `periospot/` or project root
- Sharp is optional - if not available, image integrity checks are skipped
- The validation report is saved as JSON for programmatic processing
- Exit code 0 = PASS, Exit code 1 = FAIL/WARNING

---

**Created by**: Claude Code Agent  
**Last Updated**: January 2, 2026
