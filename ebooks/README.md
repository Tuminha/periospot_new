# Periospot Ebooks

This folder contains all ebook PDFs for the Periospot library.

## Current Inventory - All 7 Ebooks Uploaded ✅

| File | Language | Topic | Size | Status |
|------|----------|-------|------|--------|
| `10-tips-aesthetic-implants-en.pdf` | English | 10 Tips Aesthetic Implantology | 5.0MB | ✅ Uploaded |
| `17-immutable-laws-en.pdf` | English | 17 Immutable Laws in Implant Dentistry | 23MB | ✅ Uploaded |
| `17-immutable-laws-pt.pdf` | Portuguese | As 17 Leis Imutáveis | 23MB | ✅ Uploaded |
| `connective-tissue-grafts-en.pdf` | English | CTG Harvesting Techniques | 9.7MB | ✅ Uploaded |
| `guided-bone-regeneration-en.pdf` | English | GBR For Dummies | 9.8MB | ✅ Uploaded |
| `guided-bone-regeneration-es.pdf` | Spanish | Regeneración Ósea Guiada | 22MB | ✅ Uploaded |
| `guided-bone-regeneration-pt.pdf` | Portuguese | Regeneração Óssea Guiada | 9.9MB | ✅ Uploaded |

**Total: 7 ebooks in 3 languages (EN, ES, PT)**

## Download Flow

### For Logged-in Users
1. Click "Download" button
2. Success popup with download button appears
3. Email sent with backup download link (24h validity)

### For Non-Logged-in Users (Lead Generation)
1. Click "Download" on library page
2. Email capture dialog appears
3. User enters email (optional marketing consent)
4. Success popup with download button appears
5. Email sent with download link
6. Lead saved to `ebook_downloads` table

## Folder Structure

```
ebooks/
├── pdfs/           # PDF files (uploaded to Supabase)
├── covers/         # Cover images (optional)
├── metadata/       # Additional metadata (optional)
└── README.md       # This file
```

## Management Scripts

```bash
# List all ebooks and their status
node scripts/upload-ebooks.cjs --list

# Upload new PDFs to Supabase
node scripts/upload-ebooks.cjs

# Dry run (show what would be uploaded)
node scripts/upload-ebooks.cjs --dry-run
```

## Adding New Ebooks

1. Add PDF to `ebooks/pdfs/` folder with naming: `{topic}-{language}.pdf`
2. Add entry to database via Supabase or migration
3. Run `node scripts/upload-ebooks.cjs` to upload
4. Verify at `/library` page

## Naming Convention

Files should be named: `{topic}-{language}.pdf`

Examples:
- `10-tips-aesthetic-implants-en.pdf`
- `guided-bone-regeneration-es.pdf`
- `17-immutable-laws-pt.pdf`

## Authors

All ebooks are authored by **Francisco Teixeira Barbosa** with various co-authors:
- Francisco Carroquino
- Victor Serrano
- Vitor Brás
- João Botto
