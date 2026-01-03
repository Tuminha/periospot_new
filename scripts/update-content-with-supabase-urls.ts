#!/usr/bin/env tsx
/**
 * Update Content Files with Supabase URLs
 * 
 * This script reads the image migration mappings and updates
 * posts.json and products.json files to replace WordPress URLs
 * with Supabase Storage URLs.
 * 
 * Usage:
 *   npx tsx scripts/update-content-with-supabase-urls.ts
 */

import fs from "fs/promises"
import path from "path"

const MAPPINGS_FILE = path.join(process.cwd(), "image-migration-mappings.json")
const CONTENT_DIR = path.join(process.cwd(), "legacy-wordpress", "content")
const POSTS_FILE = path.join(CONTENT_DIR, "posts.json")
const PRODUCTS_FILE = path.join(CONTENT_DIR, "products.json")

interface UpdateResult {
  postsUpdated: number
  productsUpdated: number
  totalReplacements: number
  errors: Array<{ file: string; error: string }>
}

/**
 * Normalize URL - handles www vs non-www and http vs https
 */
function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/, "https://")
    .replace(/^https:\/\/www\./, "https://")
}

/**
 * Replace URLs in a string using the mappings
 */
function replaceUrls(text: string, mappings: Record<string, string>): { text: string; count: number } {
  let count = 0
  let result = text

  // Create normalized mappings (handle www and non-www)
  const normalizedMappings: Record<string, string> = {}
  for (const [oldUrl, newUrl] of Object.entries(mappings)) {
    const normalized = normalizeUrl(oldUrl)
    normalizedMappings[normalized] = newUrl
    // Also add www version
    normalizedMappings[normalized.replace("https://", "https://www.")] = newUrl
    // Also add non-www version if it's www
    if (oldUrl.includes("www.")) {
      normalizedMappings[normalized.replace("https://www.", "https://")] = newUrl
    }
  }

  // Replace all occurrences
  for (const [oldUrl, newUrl] of Object.entries(normalizedMappings)) {
    // Escape special regex characters in URL
    const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(escaped, "gi")
    const matches = result.match(regex)
    if (matches) {
      count += matches.length
      result = result.replace(regex, newUrl)
    }
  }

  return { text: result, count }
}

async function updateContentFiles(): Promise<UpdateResult> {
  const result: UpdateResult = {
    postsUpdated: 0,
    productsUpdated: 0,
    totalReplacements: 0,
    errors: [],
  }

  // Load mappings
  console.log("📄 Loading migration mappings...")
  let mappings: Record<string, string>
  try {
    const mappingsData = await fs.readFile(MAPPINGS_FILE, "utf-8")
    mappings = JSON.parse(mappingsData)
    console.log(`✅ Loaded ${Object.keys(mappings).length} URL mappings\n`)
  } catch (error) {
    console.error(`❌ Error loading mappings file: ${MAPPINGS_FILE}`)
    console.error(error)
    process.exit(1)
  }

  // Update posts.json
  console.log("📝 Updating posts.json...")
  try {
    const postsData = await fs.readFile(POSTS_FILE, "utf-8")
    const posts = JSON.parse(postsData)

    let postUpdates = 0
    let totalReplaced = 0

    for (const post of posts) {
      let updated = false

      // Update featured image URL
      if (post.featured_image_url || post.featured_image || post.featuredImage) {
        const featuredUrl = post.featured_image_url || post.featured_image || post.featuredImage
        const normalized = normalizeUrl(featuredUrl)
        if (mappings[normalized] || mappings[featuredUrl]) {
          const newUrl = mappings[normalized] || mappings[featuredUrl]
          if (post.featured_image_url) post.featured_image_url = newUrl
          if (post.featured_image) post.featured_image = newUrl
          if (post.featuredImage) post.featuredImage = newUrl
          updated = true
          totalReplaced++
        }
      }

      // Update URLs in content
      if (post.content) {
        const { text: newContent, count } = replaceUrls(post.content, mappings)
        if (count > 0) {
          post.content = newContent
          updated = true
          totalReplaced += count
        }
      }

      if (updated) {
        postUpdates++
      }
    }

    // Write updated posts
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
    result.postsUpdated = postUpdates
    result.totalReplacements += totalReplaced
    console.log(`  ✅ Updated ${postUpdates} posts (${totalReplaced} URL replacements)`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    result.errors.push({ file: "posts.json", error: errorMsg })
    console.error(`  ❌ Error updating posts: ${errorMsg}`)
  }

  // Update products.json
  console.log("\n📦 Updating products.json...")
  try {
    const productsData = await fs.readFile(PRODUCTS_FILE, "utf-8")
    const products = JSON.parse(productsData)

    let productUpdates = 0
    let totalReplaced = 0

    for (const product of products) {
      let updated = false

      // Update featured image URL
      if (product.featured_image_url || product.featured_image) {
        const featuredUrl = product.featured_image_url || product.featured_image
        const normalized = normalizeUrl(featuredUrl)
        if (mappings[normalized] || mappings[featuredUrl]) {
          const newUrl = mappings[normalized] || mappings[featuredUrl]
          if (product.featured_image_url) product.featured_image_url = newUrl
          if (product.featured_image) product.featured_image = newUrl
          updated = true
          totalReplaced++
        }
      }

      // Update gallery images
      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        for (let i = 0; i < product.gallery_images.length; i++) {
          const galleryUrl = product.gallery_images[i]
          if (galleryUrl) {
            const normalized = normalizeUrl(galleryUrl)
            if (mappings[normalized] || mappings[galleryUrl]) {
              product.gallery_images[i] = mappings[normalized] || mappings[galleryUrl]
              updated = true
              totalReplaced++
            }
          }
        }
      }

      // Update URLs in description/content
      if (product.description) {
        const { text: newDescription, count } = replaceUrls(product.description, mappings)
        if (count > 0) {
          product.description = newDescription
          updated = true
          totalReplaced += count
        }
      }

      if (product.short_description) {
        const { text: newShortDesc, count } = replaceUrls(product.short_description, mappings)
        if (count > 0) {
          product.short_description = newShortDesc
          updated = true
          totalReplaced += count
        }
      }

      if (updated) {
        productUpdates++
      }
    }

    // Write updated products
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    result.productsUpdated = productUpdates
    result.totalReplacements += totalReplaced
    console.log(`  ✅ Updated ${productUpdates} products (${totalReplaced} URL replacements)`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    result.errors.push({ file: "products.json", error: errorMsg })
    console.error(`  ❌ Error updating products: ${errorMsg}`)
  }

  return result
}

async function main() {
  console.log("🔄 Update Content Files with Supabase URLs\n")
  console.log("=".repeat(60) + "\n")

  // Check if mappings file exists
  try {
    await fs.access(MAPPINGS_FILE)
  } catch {
    console.error(`❌ Mapping file not found: ${MAPPINGS_FILE}`)
    console.error("   Please run the image migration script first:")
    console.error("   npx tsx scripts/migrate-images-to-supabase.ts")
    process.exit(1)
  }

  const result = await updateContentFiles()

  console.log("\n" + "=".repeat(60))
  console.log("📊 Update Summary")
  console.log("=".repeat(60))
  console.log(`Posts updated: ${result.postsUpdated}`)
  console.log(`Products updated: ${result.productsUpdated}`)
  console.log(`Total URL replacements: ${result.totalReplacements}`)
  console.log(`Errors: ${result.errors.length}`)

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:")
    result.errors.forEach((err) => {
      console.log(`  - ${err.file}: ${err.error}`)
    })
  }

  if (result.totalReplacements > 0) {
    console.log("\n✅ Content files updated successfully!")
    console.log("\nNext steps:")
    console.log("1. Restart your Next.js dev server")
    console.log("2. Check that images are loading correctly")
    console.log("3. Verify no more 403 errors in logs")
  } else {
    console.log("\n⚠️  No URLs were replaced. Check if mappings match your content URLs.")
  }

  process.exit(result.errors.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
