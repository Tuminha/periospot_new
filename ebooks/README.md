# Periospot Ebooks

This folder contains all ebook PDFs for the Periospot library.

## Current Inventory

### Available PDFs (6 files)

| File | Language | Topic | Pages | Size |
|------|----------|-------|-------|------|
| `10-tips-aesthetic-implants-en.pdf` | English | 10 Tips Aesthetic Implantology | 18 | 5.0MB |
| `10-tips-aesthetic-implants-es.pdf` | Spanish | 10 Consejos Implantología Estética | 18 | 11MB |
| `10-tips-aesthetic-implants-pt.pdf` | Portuguese | 10 Dicas Implantologia Estética | 17 | 4.9MB |
| `guided-bone-regeneration-es.pdf` | Spanish | Regeneración Ósea Guiada | 100 | 22MB |
| `guided-bone-regeneration-pt.pdf` | Portuguese | Regeneração Óssea Guiada | 103 | 165MB |
| `17-immutable-laws-pt.pdf` | Portuguese | As 17 Leis Imutáveis | 70 | 23MB |

### Missing PDFs (need to export from iBooks Author)

| Expected File | Language | Status |
|---------------|----------|--------|
| `17-immutable-laws-en.pdf` | English | ❌ Empty - needs export |
| `guided-bone-regeneration-en.pdf` | English | ❌ Empty - needs export |
| `connective-tissue-grafts-en.pdf` | English | ❌ Empty - needs export |

## Folder Structure

```
ebooks/
├── pdfs/           # PDF files (organized by slug)
├── covers/         # Cover images (PNG/JPG)
├── metadata/       # Auto-generated metadata
└── README.md       # This file
```

## How to Upload to Supabase

1. **Run the migration first** (creates database tables):
   ```bash
   cd periospot-nextjs
   npx supabase db push
   ```

2. **Upload PDFs to Supabase Storage**:
   ```bash
   node scripts/upload-ebooks.js
   ```

3. **List current status**:
   ```bash
   node scripts/upload-ebooks.js --list
   ```

4. **Dry run** (preview without uploading):
   ```bash
   node scripts/upload-ebooks.js --dry-run
   ```

## Download Flow

### For Logged-in Users
Direct download from the library page.

### For Non-Logged-in Users (Lead Generation)
1. User clicks "Download" on library page
2. Email capture dialog appears
3. User enters email (optional marketing consent)
4. Download starts immediately
5. Lead is saved to `ebook_downloads` table

## Cover Images

Cover images should be placed in `/public/images/ebooks/`:
- `10-tips-aesthetic.png`
- `guided-bone-regeneration.png`
- `17-immutable-laws.png`
- `connective-tissue-grafts.png`

## Exporting Missing English PDFs

The English versions of these ebooks exist as iBooks Author files (.iba).
To create PDF versions:

1. Open the .iba file in iBooks Author (macOS only)
2. File → Export → PDF
3. Save to `ebooks/pdfs/` with the correct filename
4. Run `node scripts/upload-ebooks.js` to upload

### iBooks Author File Locations

- **17 Immutable Laws**: `/Dropbox/Ebook The 17 immutable laws In Implant Dentistry/`
- **GBR**: `/Dropbox/ebooks para o vitor/GBR iBook/`
- **CTG**: `/Dropbox/MDS ONLINE ACADEMY/Ebooks as a support material for the course/`

## Authors

All ebooks are authored by **Francisco Teixeira Barbosa** with various co-authors:
- Francisco Carroquino
- Victor Serrano
- Vitor Brás
- João Botto
