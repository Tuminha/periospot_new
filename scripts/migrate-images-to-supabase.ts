#!/usr/bin/env tsx
/**
 * Image Migration Script
 * Migrates images from WordPress to Supabase Storage
 * 
 * Usage:
 *   npx tsx scripts/migrate-images-to-supabase.ts
 * 
 * This script:
 * 1. Reads image URLs from posts and products JSON files
 * 2. Downloads images from WordPress
 * 3. Uploads to Supabase Storage
 * 4. Updates JSON files with new Supabase URLs
 */

import fs from "fs/promises"
import path from "path"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env files
async function loadEnvFile(envPath: string): Promise<void> {
  try {
    const raw = await fs.readFile(envPath, "utf8")
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith("#")) {
        return
      }
      const [key, ...rest] = line.split("=")
      if (!key) {
        return
      }
      // Don't override existing env vars
      if (process.env[key]) {
        return
      }
      process.env[key] = rest.join("=").trim()
    })
  } catch {
    // Ignore missing .env file
  }
}

// Configuration
const STORAGE_BUCKET = "images"
const CONTENT_DIR = path.join(process.cwd(), "legacy-wordpress", "content")
const MEDIA_DIR = path.join(process.cwd(), "legacy-wordpress", "media")

interface ImageMigrationResult {
  total: number
  successful: number
  failed: number
  skipped: number
  errors: Array<{ url: string; error: string }>
  mappings: Record<string, string> // WordPress URL -> Supabase URL
}

/**
 * Convert WordPress URL to local file path
 * Example: https://periospot.com/wp-content/uploads/2024/01/image.jpg
 * To: legacy-wordpress/media/2024/01/image.jpg
 */
function urlToLocalPath(url: string): string | null {
  const patterns = [
    /\/uploads\/(.+)$/, // Matches /uploads/2024/01/image.jpg
    /wp-content\/uploads\/(.+)$/, // Matches wp-content/uploads/2024/01/image.jpg
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return path.join(MEDIA_DIR, match[1])
    }
  }

  return null
}

/**
 * Read image from local file system
 * Falls back to downloading from URL if local file doesn't exist
 */
async function getImageBuffer(url: string): Promise<Buffer | null> {
  // First, try to read from local file system
  const localPath = urlToLocalPath(url)
  if (localPath) {
    try {
      await fs.access(localPath)
      console.log(`  Reading from local: ${path.relative(process.cwd(), localPath)}`)
      const buffer = await fs.readFile(localPath)
      return buffer
    } catch (error) {
      // File doesn't exist locally, fall back to download
      console.log(`  Local file not found, attempting download: ${url.substring(0, 60)}...`)
    }
  } else {
    console.log(`  No local path mapping, attempting download: ${url.substring(0, 60)}...`)
  }

  // Fallback to downloading from URL
  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://periospot.com', // Try to bypass hotlinking protection
        'User-Agent': 'Mozilla/5.0 (compatible; Periospot-Migration/1.0)',
      },
    })

    if (!response.ok) {
      // Try without headers if first attempt fails
      const retryResponse = await fetch(url)
      if (!retryResponse.ok) {
        throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`)
      }
      const arrayBuffer = await retryResponse.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    throw new Error(`Download failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function uploadToSupabase(
  supabaseClient: any,
  buffer: Buffer,
  filename: string,
  folder: string = "migrated"
): Promise<string> {
  // Generate unique path
  const timestamp = Date.now()
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = `${folder}/${timestamp}-${safeFilename}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseClient.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: getContentType(filename),
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
  return urlData.publicUrl
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop()
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  }
  return types[ext || ""] || "image/jpeg"
}

function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split("/").pop() || "image.jpg"
    return filename
  } catch {
    // Fallback if URL parsing fails
    const parts = url.split("/")
    return parts[parts.length - 1] || "image.jpg"
  }
}

async function migrateImages(): Promise<ImageMigrationResult> {
  // Load environment variables
  await loadEnvFile(path.resolve(process.cwd(), ".env"))
  await loadEnvFile(path.resolve(process.cwd(), ".env.local"))
  await loadEnvFile(path.resolve(process.cwd(), "periospot-nextjs", ".env.local"))

  const SUPABASE_URL = 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    process.env.SUPABASE_URL || 
    ""
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  const result: ImageMigrationResult = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    mappings: {},
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Error: Supabase credentials not found")
    console.error("   Please set one of these environment variables:")
    console.error("   - NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL or SUPABASE_URL)")
    console.error("   - SUPABASE_SERVICE_ROLE_KEY")
    console.error("   These can be set in .env or .env.local files")
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Check if media directory exists
  try {
    await fs.access(MEDIA_DIR)
    console.log(`✅ Media directory found: ${MEDIA_DIR}\n`)
  } catch {
    console.log(`⚠️  Media directory not found: ${MEDIA_DIR}`)
    console.log(`   The script will attempt to download images from WordPress URLs.\n`)
    console.log(`   To use local files, download media via FTP to: ${MEDIA_DIR}\n`)
  }

  console.log("🔄 Starting image migration to Supabase Storage...\n")

  // Collect all image URLs
  const imageUrls = new Set<string>()

  // Load posts
  try {
    const postsPath = path.join(CONTENT_DIR, "posts.json")
    const postsData = await fs.readFile(postsPath, "utf-8")
    const posts = JSON.parse(postsData)

    for (const post of posts) {
      // Featured images
      const featuredUrl = post.featured_image_url || post.featured_image || post.featuredImage
      if (featuredUrl && featuredUrl.startsWith("http")) {
        imageUrls.add(featuredUrl)
      }

      // Images in content
      if (post.content) {
        const imgMatches = post.content.matchAll(/src=["']([^"']+)["']/gi)
        for (const match of imgMatches) {
          const imgUrl = match[1]
          if (imgUrl.startsWith("http") && imgUrl.includes("periospot.com")) {
            imageUrls.add(imgUrl)
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading posts:", error)
  }

  // Load products
  try {
    const productsPath = path.join(CONTENT_DIR, "products.json")
    const productsData = await fs.readFile(productsPath, "utf-8")
    const products = JSON.parse(productsData)

    for (const product of products) {
      const featuredUrl = product.featured_image_url || product.featured_image
      if (featuredUrl && featuredUrl.startsWith("http")) {
        imageUrls.add(featuredUrl)
      }

      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        for (const galleryUrl of product.gallery_images) {
          if (galleryUrl && galleryUrl.startsWith("http")) {
            imageUrls.add(galleryUrl)
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading products:", error)
  }

  result.total = imageUrls.size
  console.log(`📊 Found ${result.total} unique image URLs to migrate\n`)

  // Migrate each image
  let processed = 0
  for (const url of imageUrls) {
    processed++
    console.log(`[${processed}/${result.total}] Processing: ${url.substring(0, 70)}...`)

    try {
      // Get image buffer (from local file or download)
      const buffer = await getImageBuffer(url)
      if (!buffer) {
        result.failed++
        result.errors.push({ url, error: "Image buffer is null" })
        continue
      }

      // Upload to Supabase
      const filename = extractFilename(url)
      const supabaseUrl = await uploadToSupabase(supabase, buffer, filename, "migrated")

      // Store mapping
      result.mappings[url] = supabaseUrl
      result.successful++
      console.log(`  ✅ Migrated to: ${supabaseUrl}\n`)
    } catch (error) {
      result.failed++
      const errorMsg = error instanceof Error ? error.message : String(error)
      result.errors.push({ url, error: errorMsg })
      console.log(`  ❌ Failed: ${errorMsg}\n`)
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Save mappings
  const mappingsPath = path.join(process.cwd(), "image-migration-mappings.json")
  await fs.writeFile(mappingsPath, JSON.stringify(result.mappings, null, 2))
  console.log(`\n📄 Migration mappings saved to: ${mappingsPath}`)

  return result
}

async function main() {
  console.log("🚀 Image Migration to Supabase Storage\n")
  console.log("=" .repeat(60))

  const result = await migrateImages()

  console.log("\n" + "=" .repeat(60))
  console.log("📊 Migration Summary:")
  console.log("=" .repeat(60))
  console.log(`Total images: ${result.total}`)
  console.log(`✅ Successful: ${result.successful}`)
  console.log(`❌ Failed: ${result.failed}`)
  console.log(`⏭️  Skipped: ${result.skipped}`)

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (first 10):`)
    result.errors.slice(0, 10).forEach((error) => {
      console.log(`  - ${error.url.substring(0, 60)}...`)
      console.log(`    Error: ${error.error}`)
    })
  }

  console.log("\n✅ Migration complete!")
  console.log("\nNext steps:")
  console.log("1. Review image-migration-mappings.json")
  console.log("2. Use the mappings to update posts.json and products.json")
  console.log("3. Or run the update script to automatically update JSON files")

  process.exit(result.failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
