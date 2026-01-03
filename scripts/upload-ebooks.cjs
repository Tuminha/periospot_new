#!/usr/bin/env node

/**
 * Upload Ebooks to Supabase Storage
 *
 * This script:
 * 1. Reads PDFs from the ebooks/pdfs folder
 * 2. Uploads them to Supabase Storage (ebooks bucket)
 * 3. Updates the ebooks table with the file paths
 *
 * Usage:
 *   node scripts/upload-ebooks.js
 *   node scripts/upload-ebooks.js --dry-run
 *   node scripts/upload-ebooks.js --list
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../periospot-nextjs/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials. Check .env.local file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EBOOKS_DIR = path.join(__dirname, '../ebooks/pdfs');
const BUCKET_NAME = 'ebooks';

// Mapping of filenames to ebook slugs
// Based on actual PDFs in ebooks/pdfs folder
const FILE_TO_SLUG = {
  // 10 Tips (3 languages)
  '10-tips-aesthetic-implants-en.pdf': '10-tips-aesthetic-implants-en',
  '10-tips-aesthetic-implants-es.pdf': '10-tips-aesthetic-implants-es',
  '10-tips-aesthetic-implants-pt.pdf': '10-tips-aesthetic-implants-pt',

  // 17 Immutable Laws (English and Portuguese)
  '17-immutable-laws-en.pdf': '17-immutable-laws-en',
  '17-immutable-laws-pt.pdf': '17-immutable-laws-pt',

  // Guided Bone Regeneration (3 languages)
  'guided-bone-regeneration-en.pdf': 'guided-bone-regeneration-en',
  'guided-bone-regeneration-es.pdf': 'guided-bone-regeneration-es',
  'guided-bone-regeneration-pt.pdf': 'guided-bone-regeneration-pt',

  // Connective Tissue Grafts (English)
  'connective-tissue-grafts-en.pdf': 'connective-tissue-grafts-en',
};

async function ensureBucketExists() {
  console.log('Checking if ebooks bucket exists...');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('Error listing buckets:', error.message);
    return false;
  }

  const ebooksBucket = buckets.find(b => b.name === BUCKET_NAME);

  if (!ebooksBucket) {
    console.log('Creating ebooks bucket...');
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false, // Private bucket - downloads go through API
      fileSizeLimit: 209715200, // 200MB max (for large Portuguese GBR at 165MB)
      allowedMimeTypes: ['application/pdf']
    });

    if (createError) {
      console.error('Error creating bucket:', createError.message);
      return false;
    }
    console.log('Bucket created successfully.');
  } else {
    console.log('Bucket already exists.');
  }

  return true;
}

async function uploadFile(filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);

  console.log(`Uploading ${fileName} (${fileSizeMB}MB)...`);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    return null;
  }

  console.log(`  Uploaded: ${storagePath}`);
  return data.path;
}

async function updateEbookRecord(slug, pdfPath) {
  const { error } = await supabase
    .from('ebooks')
    .update({ pdf_path: pdfPath, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) {
    console.error(`Error updating ebook ${slug}:`, error.message);
    return false;
  }

  console.log(`  Updated database: ${slug}`);
  return true;
}

async function listPendingUploads() {
  if (!fs.existsSync(EBOOKS_DIR)) {
    console.log('\nNo ebooks/pdfs folder found. Create it and add PDF files.');
    return [];
  }

  const files = fs.readdirSync(EBOOKS_DIR).filter(f => f.endsWith('.pdf'));

  if (files.length === 0) {
    console.log('\nNo PDF files found in ebooks/pdfs folder.');
    return [];
  }

  // Filter to only files with content (size > 0)
  const validFiles = files.filter(f => {
    const stats = fs.statSync(path.join(EBOOKS_DIR, f));
    return stats.size > 0;
  });

  return validFiles;
}

async function listEbooks() {
  console.log('\n=== EBOOK INVENTORY ===\n');

  // List local files
  console.log('LOCAL FILES (ebooks/pdfs):');
  const files = await listPendingUploads();
  if (files.length === 0) {
    console.log('  No PDF files found\n');
  } else {
    files.forEach(f => {
      const stats = fs.statSync(path.join(EBOOKS_DIR, f));
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
      const slug = FILE_TO_SLUG[f];
      console.log(`  ${f} (${sizeMB}MB) → ${slug || '(no slug mapping)'}`);
    });
    console.log();
  }

  // List database entries
  console.log('DATABASE ENTRIES:');
  const { data: ebooks, error } = await supabase
    .from('ebooks')
    .select('slug, title, language, is_published, pdf_path, download_count')
    .order('language', { ascending: true });

  if (error) {
    console.log(`  Error fetching: ${error.message}\n`);
  } else if (!ebooks || ebooks.length === 0) {
    console.log('  No ebooks in database\n');
  } else {
    ebooks.forEach(e => {
      const status = e.is_published ? '✅' : '❌';
      const hasFile = e.pdf_path ? '📄' : '⚠️';
      console.log(`  ${status} ${hasFile} [${e.language}] ${e.slug} (${e.download_count} downloads)`);
    });
    console.log();
  }

  // Summary
  console.log('SUMMARY:');
  console.log(`  Local PDFs: ${files.length}`);
  console.log(`  Published: ${ebooks?.filter(e => e.is_published).length || 0}`);
  console.log(`  With PDF path: ${ebooks?.filter(e => e.pdf_path).length || 0}`);
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isListOnly = process.argv.includes('--list');

  console.log('=== Periospot Ebook Uploader ===\n');

  if (isListOnly) {
    await listEbooks();
    return;
  }

  if (isDryRun) {
    console.log('DRY RUN MODE - No files will be uploaded\n');
  }

  // List available files
  const files = await listPendingUploads();

  if (files.length === 0) {
    console.log('\nExpected files:');
    Object.keys(FILE_TO_SLUG).forEach(f => console.log(`  - ${f}`));
    return;
  }

  console.log(`\nFound ${files.length} PDF file(s):\n`);

  for (const file of files) {
    const slug = FILE_TO_SLUG[file];
    const status = slug ? `→ ${slug}` : '→ (no matching slug, will skip)';
    const stats = fs.statSync(path.join(EBOOKS_DIR, file));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`  ${file} (${sizeMB}MB) ${status}`);
  }

  if (isDryRun) {
    console.log('\nDry run complete. Remove --dry-run to upload files.');
    return;
  }

  // Ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('Failed to ensure bucket exists. Aborting.');
    process.exit(1);
  }

  console.log('\n--- Starting Uploads ---\n');

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = FILE_TO_SLUG[file];

    if (!slug) {
      console.log(`Skipping ${file} (no matching slug in FILE_TO_SLUG mapping)`);
      skipped++;
      continue;
    }

    const filePath = path.join(EBOOKS_DIR, file);
    const storagePath = `pdfs/${slug}.pdf`;

    const uploadedPath = await uploadFile(filePath, storagePath);

    if (uploadedPath) {
      await updateEbookRecord(slug, uploadedPath);
      uploaded++;
    }
  }

  console.log('\n--- Upload Summary ---');
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${files.length}`);

  if (uploaded > 0) {
    console.log('\nNext steps:');
    console.log('1. Visit /library to see your ebooks');
    console.log('2. Check /admin for download analytics');
  }
}

main().catch(console.error);
