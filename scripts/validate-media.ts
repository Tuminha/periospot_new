import fs from 'fs';
import path from 'path';

// Optional sharp import for image validation
let sharp: any;
try {
  sharp = require('sharp');
} catch (err) {
  console.warn('⚠️  Warning: sharp not available, skipping image integrity checks');
}

interface ValidationReport {
  totalFilesDownloaded: number;
  totalFilesReferenced: number;
  missingFiles: string[];
  orphanedFiles: string[];
  corruptedFiles: string[];
  fileSizeIssues: string[];
  skippedReferenceChecks: boolean;
  validationStatus: 'PASS' | 'FAIL' | 'WARNING';
  timestamp: string;
  summary: {
    completeness: number; // percentage
    integrity: number; // percentage
    coverage: number; // percentage
  };
}

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

async function validateMedia(): Promise<ValidationReport> {
  console.log('🔍 Starting Media Validation...\n');

  const report: ValidationReport = {
    totalFilesDownloaded: 0,
    totalFilesReferenced: 0,
    missingFiles: [],
    orphanedFiles: [],
    corruptedFiles: [],
    fileSizeIssues: [],
    skippedReferenceChecks: false,
    validationStatus: 'PASS',
    timestamp: new Date().toISOString(),
    summary: {
      completeness: 0,
      integrity: 0,
      coverage: 0,
    },
  };

  // Step 1: Get all downloaded files
  console.log('📁 Step 1: Scanning downloaded media files...');
  
  // Find project root (where legacy-wordpress directory should be)
  let projectRoot = process.cwd();
  if (projectRoot.endsWith('periospot')) {
    projectRoot = path.join(projectRoot, '..');
  }
  
  const mediaPath = resolveMediaPath(projectRoot);

  if (!mediaPath) {
    console.error('❌ Media directory not found. Looked for periospot-assets/ and legacy-wordpress/media/.');
    report.validationStatus = 'FAIL';
    return report;
  }

  console.log(`✅ Using media directory: ${mediaPath}\n`);

  let downloadedFiles: string[] = [];
  try {
    downloadedFiles = walkFiles(mediaPath);
  } catch (err) {
    console.warn(`⚠️  Warning: Error scanning files: ${err}`);
    downloadedFiles = [];
  }

  report.totalFilesDownloaded = downloadedFiles.length;
  console.log(`✅ Found ${downloadedFiles.length} downloaded files\n`);

  // Step 2: Extract all image URLs from JSON content
  console.log('📄 Step 2: Extracting image URLs from content...');
  const referencedUrls = new Set<string>();
  
  const contentPath = path.join(projectRoot, 'legacy-wordpress/content');
  
  // Extract from posts
  const postsPath = path.join(contentPath, 'posts.json');
  if (fs.existsSync(postsPath)) {
    try {
      const postsContent = fs.readFileSync(postsPath, 'utf-8');
      if (postsContent.trim()) {
        const posts = JSON.parse(postsContent);
        if (Array.isArray(posts)) {
          posts.forEach((post: any) => {
            if (post.content) {
              extractImageUrls(post.content, referencedUrls);
            }
            if (post.featured_image_url) {
              referencedUrls.add(post.featured_image_url);
            }
          });
        }
      }
    } catch (err) {
      console.warn(`⚠️  Warning: Could not parse posts.json: ${err}`);
    }
  }

  // Extract from pages
  const pagesPath = path.join(contentPath, 'pages.json');
  if (fs.existsSync(pagesPath)) {
    try {
      const pagesContent = fs.readFileSync(pagesPath, 'utf-8');
      if (pagesContent.trim()) {
        const pages = JSON.parse(pagesContent);
        if (Array.isArray(pages)) {
          pages.forEach((page: any) => {
            if (page.content) {
              extractImageUrls(page.content, referencedUrls);
            }
            if (page.featured_image_url) {
              referencedUrls.add(page.featured_image_url);
            }
          });
        }
      }
    } catch (err) {
      console.warn(`⚠️  Warning: Could not parse pages.json: ${err}`);
    }
  }

  // Extract from products
  const productsPath = path.join(contentPath, 'products.json');
  if (fs.existsSync(productsPath)) {
    try {
      const productsContent = fs.readFileSync(productsPath, 'utf-8');
      if (productsContent.trim()) {
        const products = JSON.parse(productsContent);
        if (Array.isArray(products)) {
          products.forEach((product: any) => {
            if (product.description) {
              extractImageUrls(product.description, referencedUrls);
            }
            if (product.featured_image_url) {
              referencedUrls.add(product.featured_image_url);
            }
            // Check for gallery images
            if (product.gallery_images && Array.isArray(product.gallery_images)) {
              product.gallery_images.forEach((img: string) => {
                referencedUrls.add(img);
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn(`⚠️  Warning: Could not parse products.json: ${err}`);
    }
  }

  report.totalFilesReferenced = referencedUrls.size;
  console.log(`✅ Found ${referencedUrls.size} referenced image URLs\n`);

  if (report.totalFilesReferenced === 0) {
    report.skippedReferenceChecks = true;
    console.log('⚠️  No referenced URLs found. Skipping missing/orphaned checks.\n');
  }

  // Step 3: Convert URLs to local file paths
  console.log('🔄 Step 3: Converting URLs to local paths...');
  const referencedPaths = new Set<string>();
  
  if (!report.skippedReferenceChecks) {
    referencedUrls.forEach((url) => {
      const localPath = urlToLocalPath(url);
      if (localPath) {
        referencedPaths.add(localPath);
      }
    });
  }

  // Step 4: Check for missing files
  console.log('🔎 Step 4: Checking for missing files...');
  const downloadedSet = new Set(
    downloadedFiles.map((f) => f.replace(/\\/g, '/'))
  );

  if (!report.skippedReferenceChecks) {
    referencedPaths.forEach((refPath) => {
      const fullPath = path.join(mediaPath, refPath).replace(/\\/g, '/');
      if (!downloadedSet.has(fullPath)) {
        report.missingFiles.push(refPath);
      }
    });
  }

  if (report.missingFiles.length > 0) {
    console.log(`⚠️  Found ${report.missingFiles.length} missing files`);
    report.validationStatus = 'FAIL';
  } else {
    console.log('✅ No missing files found\n');
  }

  // Step 5: Check for orphaned files
  console.log('🗑️  Step 5: Checking for orphaned files...');
  if (!report.skippedReferenceChecks) {
    downloadedFiles.forEach((file) => {
      const relPath = file.replace(mediaPath, '').replace(/^\//, '').replace(/\\/g, '/');
      const isReferenced = Array.from(referencedPaths).some((ref) => {
        const refFullPath = path.join(mediaPath, ref).replace(/\\/g, '/');
        return file === refFullPath || file.includes(ref);
      });
      
      if (!isReferenced) {
        report.orphanedFiles.push(relPath);
      }
    });
  }

  if (!report.skippedReferenceChecks && report.orphanedFiles.length > 0) {
    console.log(
      `⚠️  Found ${report.orphanedFiles.length} orphaned files (not referenced in content)`
    );
    if (report.validationStatus === 'PASS') {
      report.validationStatus = 'WARNING';
    }
  } else {
    console.log('✅ No orphaned files found\n');
  }

  // Step 6: Check file integrity
  console.log('🔐 Step 6: Checking file integrity...');
  const filesToCheck = downloadedFiles.length > 100 
    ? downloadedFiles.slice(0, 100) 
    : downloadedFiles;
  
  for (const file of filesToCheck) {
    try {
      const stats = fs.statSync(file);
      
      // Check if file is too small (likely corrupted)
      if (stats.size < 1024) {
        // Less than 1KB
        report.fileSizeIssues.push(`${file} (${stats.size} bytes)`);
      }

      // For images, try to validate with sharp (if available)
      const ext = path.extname(file).toLowerCase();
      if (sharp && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        try {
          await sharp(file).metadata();
        } catch (err) {
          report.corruptedFiles.push(file);
        }
      }
    } catch (err) {
      report.corruptedFiles.push(file);
    }
  }

  if (report.corruptedFiles.length > 0) {
    console.log(`❌ Found ${report.corruptedFiles.length} corrupted files`);
    report.validationStatus = 'FAIL';
  } else {
    console.log('✅ No corrupted files found\n');
  }

  // Step 7: Calculate summary metrics
  console.log('📊 Step 7: Calculating summary metrics...');
  if (report.skippedReferenceChecks) {
    report.summary.completeness = report.totalFilesDownloaded > 0 ? 100 : 0;
    report.summary.coverage = report.totalFilesDownloaded > 0 ? 100 : 0;
  } else if (report.totalFilesReferenced > 0) {
    report.summary.completeness =
      ((report.totalFilesDownloaded - report.missingFiles.length) /
        report.totalFilesReferenced) *
      100;
  } else {
    report.summary.completeness = report.totalFilesDownloaded > 0 ? 100 : 0;
  }
  
  if (report.totalFilesDownloaded > 0) {
    report.summary.integrity =
      ((report.totalFilesDownloaded - report.corruptedFiles.length) /
        report.totalFilesDownloaded) *
      100;
    if (!report.skippedReferenceChecks) {
      report.summary.coverage =
        ((report.totalFilesDownloaded - report.orphanedFiles.length) /
          report.totalFilesDownloaded) *
        100;
    }
  }

  // Generate report
  generateReport(report, projectRoot);

  return report;
}

function extractImageUrls(content: string, urlSet: Set<string>): void {
  if (!content) return;

  // Match image URLs in various formats
  const patterns = [
    /src=["']([^"']+)["']/g, // src="url"
    /url\(["']?([^"')]+)["']?\)/g, // url(...)
    /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi, // Direct URLs
    /<img[^>]+src=["']([^"']+)["']/gi, // <img src="url">
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        urlSet.add(match[1]);
      }
    }
  });
}

function urlToLocalPath(url: string): string | null {
  // Convert WordPress URL to local file path
  // Example: https://periospot.com/wp-content/uploads/2024/01/image.jpg
  // To: 2024/01/image.jpg
  // Also handle: /wp-content/uploads/2024/01/image.jpg

  const patterns = [
    /\/uploads\/(.+)$/, // Matches /uploads/2024/01/image.jpg
    /wp-content\/uploads\/(.+)$/, // Matches wp-content/uploads/2024/01/image.jpg
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

function generateReport(report: ValidationReport, projectRoot: string): void {
  console.log('\n' + '='.repeat(80));
  console.log('📋 MEDIA VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  const statusIcon = report.validationStatus === 'PASS' 
    ? '✅ PASS' 
    : report.validationStatus === 'WARNING' 
    ? '⚠️  WARNING' 
    : '❌ FAIL';
  console.log(`Status: ${statusIcon}\n`);

  console.log('📊 Summary:');
  console.log(`  Total Downloaded Files: ${report.totalFilesDownloaded}`);
  console.log(`  Total Referenced Files: ${report.totalFilesReferenced}`);
  console.log(`  Completeness: ${report.summary.completeness.toFixed(2)}%`);
  console.log(`  Integrity: ${report.summary.integrity.toFixed(2)}%`);
  console.log(`  Coverage: ${report.summary.coverage.toFixed(2)}%\n`);
  if (report.skippedReferenceChecks) {
    console.log('ℹ️  Reference checks skipped because no content JSON was available.\n');
  }

  if (report.missingFiles.length > 0) {
    console.log(`❌ Missing Files (${report.missingFiles.length}):`);
    report.missingFiles.slice(0, 10).forEach((f) => console.log(`   - ${f}`));
    if (report.missingFiles.length > 10) {
      console.log(`   ... and ${report.missingFiles.length - 10} more`);
    }
    console.log();
  }

  if (report.corruptedFiles.length > 0) {
    console.log(`❌ Corrupted Files (${report.corruptedFiles.length}):`);
    report.corruptedFiles.slice(0, 10).forEach((f) => console.log(`   - ${f}`));
    if (report.corruptedFiles.length > 10) {
      console.log(`   ... and ${report.corruptedFiles.length - 10} more`);
    }
    console.log();
  }

  if (report.orphanedFiles.length > 0) {
    console.log(`⚠️  Orphaned Files (${report.orphanedFiles.length}):`);
    report.orphanedFiles.slice(0, 10).forEach((f) => console.log(`   - ${f}`));
    if (report.orphanedFiles.length > 10) {
      console.log(`   ... and ${report.orphanedFiles.length - 10} more`);
    }
    console.log();
  }

  if (report.fileSizeIssues.length > 0) {
    console.log(`⚠️  Suspicious File Sizes (${report.fileSizeIssues.length}):`);
    report.fileSizeIssues.slice(0, 10).forEach((f) => console.log(`   - ${f}`));
    console.log();
  }

  // Save report to file
  const reportPath = path.join(projectRoot, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  console.log('='.repeat(80) + '\n');
}

// Run validation
validateMedia()
  .then((report) => {
    process.exit(report.validationStatus === 'PASS' ? 0 : 1);
  })
  .catch((err) => {
    console.error('❌ Validation error:', err);
    process.exit(1);
  });
