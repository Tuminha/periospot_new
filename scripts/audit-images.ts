#!/usr/bin/env tsx
/**
 * Image Audit Script
 * Checks for broken image URLs across posts, products, and pages
 */

import fs from "fs/promises"
import path from "path"

interface ImageAuditResult {
  total: number
  broken: number
  working: number
  errors: Array<{
    source: string
    url: string
    error: string
  }>
  warnings: Array<{
    source: string
    url: string
    message: string
  }>
}

async function checkImageUrl(url: string): Promise<{ status: number; ok: boolean }> {
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) })
    return { status: response.status, ok: response.ok }
  } catch (error) {
    return { status: 0, ok: false }
  }
}

async function auditImages(): Promise<ImageAuditResult> {
  const contentDir = path.join(process.cwd(), "legacy-wordpress", "content")
  const result: ImageAuditResult = {
    total: 0,
    broken: 0,
    working: 0,
    errors: [],
    warnings: [],
  }

  // Audit Posts
  try {
    const postsPath = path.join(contentDir, "posts.json")
    const postsData = await fs.readFile(postsPath, "utf-8")
    const posts = JSON.parse(postsData)

    for (const post of posts) {
      const imageUrl = post.featured_image_url || post.featured_image || post.featuredImage
      if (imageUrl) {
        result.total++
        const check = await checkImageUrl(imageUrl)
        if (!check.ok) {
          result.broken++
          result.errors.push({
            source: `post:${post.slug || post.id}`,
            url: imageUrl,
            error: check.status === 0 ? "Network error or timeout" : `HTTP ${check.status}`,
          })
        } else {
          result.working++
        }
      }

      // Check images in content
      if (post.content) {
        const imgMatches = post.content.matchAll(/src=["']([^"']+)["']/gi)
        for (const match of imgMatches) {
          const imgUrl = match[1]
          if (imgUrl.startsWith("http")) {
            result.total++
            const check = await checkImageUrl(imgUrl)
            if (!check.ok) {
              result.broken++
              result.errors.push({
                source: `post:${post.slug || post.id} (content)`,
                url: imgUrl,
                error: check.status === 0 ? "Network error or timeout" : `HTTP ${check.status}`,
              })
            } else {
              result.working++
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error auditing posts:", error)
  }

  // Audit Products
  try {
    const productsPath = path.join(contentDir, "products.json")
    const productsData = await fs.readFile(productsPath, "utf-8")
    const products = JSON.parse(productsData)

    for (const product of products) {
      const imageUrl = product.featured_image_url || product.featured_image
      if (imageUrl) {
        result.total++
        const check = await checkImageUrl(imageUrl)
        if (!check.ok) {
          result.broken++
          result.errors.push({
            source: `product:${product.slug || product.id}`,
            url: imageUrl,
            error: check.status === 0 ? "Network error or timeout" : `HTTP ${check.status}`,
          })
        } else {
          result.working++
        }
      }

      // Check gallery images
      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        for (const galleryUrl of product.gallery_images) {
          if (galleryUrl) {
            result.total++
            const check = await checkImageUrl(galleryUrl)
            if (!check.ok) {
              result.broken++
              result.errors.push({
                source: `product:${product.slug || product.id} (gallery)`,
                url: galleryUrl,
                error: check.status === 0 ? "Network error or timeout" : `HTTP ${check.status}`,
              })
            } else {
              result.working++
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error auditing products:", error)
  }

  return result
}

async function main() {
  console.log("🔍 Starting image audit...\n")
  const result = await auditImages()

  console.log("📊 Image Audit Results:")
  console.log("=" .repeat(50))
  console.log(`Total images checked: ${result.total}`)
  console.log(`✅ Working: ${result.working}`)
  console.log(`❌ Broken: ${result.broken}`)
  console.log(`⚠️  Warnings: ${result.warnings.length}`)

  if (result.errors.length > 0) {
    console.log("\n❌ Broken Images:")
    console.log("=" .repeat(50))
    result.errors.slice(0, 20).forEach((error) => {
      console.log(`\nSource: ${error.source}`)
      console.log(`URL: ${error.url}`)
      console.log(`Error: ${error.error}`)
    })
    if (result.errors.length > 20) {
      console.log(`\n... and ${result.errors.length - 20} more broken images`)
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:")
    console.log("=" .repeat(50))
    result.warnings.forEach((warning) => {
      console.log(`\nSource: ${warning.source}`)
      console.log(`URL: ${warning.url}`)
      console.log(`Message: ${warning.message}`)
    })
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), "image-audit-report.json")
  await fs.writeFile(reportPath, JSON.stringify(result, null, 2))
  console.log(`\n📄 Detailed report saved to: ${reportPath}`)

  process.exit(result.broken > 0 ? 1 : 0)
}

main().catch(console.error)
