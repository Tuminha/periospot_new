// Quick Media Validation Script
// Simpler alternative for fast file count verification

import fs from 'fs';
import path from 'path';

function walkFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  });
  return files;
}

function resolveMediaPath(projectRoot: string): string | null {
  const envPath = process.env.MEDIA_DIR;
  if (envPath) {
    const absolute = path.isAbsolute(envPath) ? envPath : path.join(projectRoot, envPath);
    if (fs.existsSync(absolute)) {
      return absolute;
    }
  }

  const assetPath = path.join(projectRoot, 'periospot-assets');
  if (fs.existsSync(assetPath)) {
    return assetPath;
  }

  const legacyPath = path.join(projectRoot, 'legacy-wordpress', 'media');
  if (fs.existsSync(legacyPath)) {
    return legacyPath;
  }

  return null;
}

async function quickValidate() {
  console.log('\n📊 Quick Media Validation\n');

  // Find project root (where legacy-wordpress directory should be)
  let projectRoot = process.cwd();
  if (projectRoot.endsWith('periospot')) {
    projectRoot = path.join(projectRoot, '..');
  }
  
  const mediaPath = resolveMediaPath(projectRoot);
  
  if (!mediaPath) {
    console.error('❌ Media directory not found. Looked for periospot-assets/ and legacy-wordpress/media/.');
    process.exit(1);
  }

  console.log(`Using media directory: ${mediaPath}\n`);

  let files: string[] = [];
  try {
    files = walkFiles(mediaPath);
  } catch (err) {
    console.warn(`⚠️  Warning: Error scanning files: ${err}`);
    files = [];
  }

  console.log(`Total files downloaded: ${files.length}`);
  console.log(`Expected files: ~614`);
  console.log(`Status: ${files.length >= 600 ? '✅ PASS' : '❌ FAIL'}\n`);

  // Count by year
  const byYear: Record<string, number> = {};
  files.forEach((file) => {
    const yearMatch = file.match(/\/(\d{4})\//);
    if (yearMatch) {
      const year = yearMatch[1];
      byYear[year] = (byYear[year] || 0) + 1;
    }
  });

  if (Object.keys(byYear).length > 0) {
    console.log('Files by year:');
    Object.entries(byYear)
      .sort()
      .forEach(([year, count]) => {
        console.log(`  ${year}: ${count} files`);
      });
  } else {
    console.log('⚠️  No files found in year-based directories');
  }

  // Count by file type
  const byType: Record<string, number> = {};
  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase().replace('.', '') || 'no-extension';
    byType[ext] = (byType[ext] || 0) + 1;
  });

  if (Object.keys(byType).length > 0) {
    console.log('\nFiles by type:');
    Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  .${type}: ${count} files`);
      });
  }

  console.log();
}

quickValidate().catch((err) => {
  console.error('❌ Validation error:', err);
  process.exit(1);
});
