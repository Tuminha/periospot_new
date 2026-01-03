#!/usr/bin/env tsx
/**
 * Filter Media Files from Dropbox Deleted Files
 * 
 * This script helps selectively restore only media files from a folder
 * containing both media files and build artifacts (from Dropbox deleted files).
 * 
 * Usage:
 *   npx tsx scripts/filter-media-from-deleted.ts <source-directory>
 * 
 * Example:
 *   npx tsx scripts/filter-media-from-deleted.ts ~/Downloads/dropbox-deleted
 */

import fs from "fs/promises"
import path from "path"

const MEDIA_DIR = path.join(process.cwd(), "legacy-wordpress", "media")

// Media file extensions
const MEDIA_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]

// Paths/patterns to IGNORE (build artifacts)
const IGNORE_PATTERNS = [
  /.next/,
  /\.cache/,
  /cache/,
  /\.tmp/,
  /__tmp__/,
  /webpack/,
  /hot-update/,
  /\.nft\.json$/,
  /logs/,
  /node_modules/,
]

// Paths/patterns to INCLUDE (media files)
const INCLUDE_PATTERNS = [
  /media/,
  /uploads/,
  /wp-content/,
  /images/,
  /legacy-wordpress/,
]

interface FilterResult {
  total: number
  mediaFiles: number
  skipped: number
  copied: number
  errors: Array<{ file: string; error: string }>
}

/**
 * Check if a file should be included (is a media file)
 */
function isMediaFile(filePath: string, fileName: string): boolean {
  // Check extension
  const ext = path.extname(fileName).toLowerCase()
  if (!MEDIA_EXTENSIONS.includes(ext)) {
    return false
  }

  // Check if it matches ignore patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(filePath)) {
      return false
    }
  }

  // If it has a media extension and doesn't match ignore patterns, include it
  // (even if it doesn't match include patterns - might be in root or other locations)
  return true
}

/**
 * Extract WordPress upload path from file path
 * Looks for patterns like: .../2015/07/image.jpg
 */
function extractWordPressPath(filePath: string): string | null {
  // Pattern: YYYY/MM/filename.ext (4-digit year, 2-digit month)
  const wpPattern = /(\d{4})\/(\d{2})\/(.+)$/
  const match = filePath.match(wpPattern)
  
  if (match) {
    const year = match[1]
    const month = match[2]
    const filename = match[3]
    return `${year}/${month}/${filename}`
  }

  // Alternative: look for uploads/media in path
  const uploadsMatch = filePath.match(/(?:uploads|media)\/(.+)$/i)
  if (uploadsMatch) {
    return uploadsMatch[1]
  }

  return null
}

async function filterMediaFiles(sourceDir: string): Promise<FilterResult> {
  const result: FilterResult = {
    total: 0,
    mediaFiles: 0,
    skipped: 0,
    copied: 0,
    errors: [],
  }

  console.log("🔍 Scanning for media files...\n")
  console.log(`Source: ${sourceDir}`)
  console.log(`Target: ${MEDIA_DIR}\n`)

  // Ensure target directory exists
  await fs.mkdir(MEDIA_DIR, { recursive: true })

  async function scanDirectory(dir: string, relativePath: string = ""): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relPath = path.join(relativePath, entry.name)

        result.total++

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath, relPath)
        } else if (entry.isFile()) {
          if (isMediaFile(relPath, entry.name)) {
            result.mediaFiles++

            // Try to extract WordPress path structure
            const wpPath = extractWordPressPath(relPath)
            const targetPath = wpPath
              ? path.join(MEDIA_DIR, wpPath)
              : path.join(MEDIA_DIR, entry.name) // Fallback: just filename

            try {
              // Ensure target directory exists
              await fs.mkdir(path.dirname(targetPath), { recursive: true })

              // Copy file
              await fs.copyFile(fullPath, targetPath)
              result.copied++

              if (result.copied % 50 === 0) {
                console.log(`  ✅ Copied ${result.copied} files...`)
              }
            } catch (error) {
              result.errors.push({
                file: relPath,
                error: error instanceof Error ? error.message : String(error),
              })
            }
          } else {
            result.skipped++
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error)
    }
  }

  await scanDirectory(sourceDir)

  return result
}

async function main() {
  const sourceDir = process.argv[2]

  if (!sourceDir) {
    console.error("❌ Error: Source directory required")
    console.error("\nUsage:")
    console.error("  npx tsx scripts/filter-media-from-deleted.ts <source-directory>")
    console.error("\nExample:")
    console.error("  npx tsx scripts/filter-media-from-deleted.ts ~/Downloads/dropbox-deleted")
    process.exit(1)
  }

  // Check if source directory exists
  try {
    await fs.access(sourceDir)
  } catch {
    console.error(`❌ Error: Source directory not found: ${sourceDir}`)
    process.exit(1)
  }

  console.log("🚀 Filter Media Files from Dropbox Deleted Files\n")
  console.log("=".repeat(60) + "\n")

  const result = await filterMediaFiles(sourceDir)

  console.log("\n" + "=".repeat(60))
  console.log("📊 Filter Results")
  console.log("=".repeat(60))
  console.log(`Total files scanned: ${result.total}`)
  console.log(`Media files found: ${result.mediaFiles}`)
  console.log(`Files copied: ${result.copied}`)
  console.log(`Files skipped: ${result.skipped}`)
  console.log(`Errors: ${result.errors.length}`)

  if (result.errors.length > 0) {
    console.log("\n⚠️  Errors:")
    result.errors.slice(0, 10).forEach((err) => {
      console.log(`  - ${err.file}: ${err.error}`)
    })
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`)
    }
  }

  if (result.copied > 0) {
    console.log(`\n✅ Successfully copied ${result.copied} media files to:`)
    console.log(`   ${MEDIA_DIR}`)
    console.log("\nNext step: Run the migration script:")
    console.log("  npx tsx scripts/migrate-images-to-supabase.ts")
  } else {
    console.log("\n⚠️  No media files were copied.")
    console.log("   Make sure the source directory contains image files.")
  }
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
