import { cache } from 'react'
import path from 'path'
import fs from 'fs/promises'

// Types
export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  modified: string
  seo?: PostSeo
  author: string | {
    id: string
    name: string
    email: string
  }
  categories: string[]
  featuredImage: string
  featured_image?: string // Alias
  status: string
}

export interface PostSeo {
  title?: string
  description?: string
  focus_keyword?: string
  focus_keywords?: Array<{ keyword: string; score?: string }> | string
  keyword_synonyms?: string[] | string
  content_score?: string
  linkdex?: string
  estimated_reading_time_minutes?: string
  og_title?: string
  og_description?: string
  og_image?: string
  og_image_id?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  twitter_image_id?: string
  canonical?: string
  redirect?: string
  meta_robots?: string
  meta_robots_noindex?: string
  meta_robots_nofollow?: string
  meta_robots_adv?: string
}

export interface Product {
  id: string
  woocommerce_id: number
  title: string
  slug: string
  description: string
  price: number
  sale_price: number | null
  currency: string
  product_type: string
  brand: string
  featured_image_url: string
  gallery_images: string[]
  stock_status: string
  link: string
  seo?: PostSeo
}

export interface Author {
  id: string
  login: string
  email: string
  display_name: string
  first_name: string
  last_name: string
}

export interface Category {
  id: string
  name: string
  nicename: string
  description: string
}

export interface PageRecord {
  id: string
  slug: string
  title: string
  content: string
  excerpt?: string
  seo?: PostSeo
}

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), '..', 'legacy-wordpress', 'content')

type RawPost = {
  id?: string | number
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  date?: string
  modified?: string
  seo?: PostSeo
  author?: string | { id?: string; name?: string; email?: string }
  categories?: string[]
  featuredImage?: string
  featured_image?: string
  featured_image_url?: string
  status?: string
}

type RawProduct = {
  id?: string
  woocommerce_id?: number
  title?: string
  slug?: string
  description?: string
  price?: number
  sale_price?: number | null
  currency?: string
  product_type?: string
  brand?: string
  featured_image_url?: string
  gallery_images?: string[]
  stock_status?: string
  link?: string
  seo?: PostSeo
}

type RawPage = {
  id?: string | number
  title?: string
  post_name?: string
  content?: string
  excerpt?: string
  seo?: PostSeo
  meta?: Record<string, string>
}

const mapYoastMeta = (meta: Record<string, string> = {}): PostSeo => ({
  title: meta["_yoast_wpseo_title"],
  description: meta["_yoast_wpseo_metadesc"],
  focus_keyword: meta["_yoast_wpseo_focuskw"],
  canonical: meta["_yoast_wpseo_canonical"],
  og_title: meta["_yoast_wpseo_opengraph-title"],
  og_description: meta["_yoast_wpseo_opengraph-description"],
  og_image: meta["_yoast_wpseo_opengraph-image"],
  twitter_title: meta["_yoast_wpseo_twitter-title"],
  twitter_description: meta["_yoast_wpseo_twitter-description"],
  twitter_image: meta["_yoast_wpseo_twitter-image"],
  meta_robots: meta["_yoast_wpseo_meta-robots"],
  meta_robots_noindex: meta["_yoast_wpseo_meta-robots-noindex"],
  meta_robots_nofollow: meta["_yoast_wpseo_meta-robots-nofollow"],
  meta_robots_adv: meta["_yoast_wpseo_meta-robots-adv"],
})

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ")

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const buildExcerpt = (value: string, maxLength: number = 180) => {
  const clean = stripHtml(value).replace(/\s+/g, " ").trim()
  if (!clean) return ""
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trim()}...` : clean
}

const normalizePost = (raw: RawPost): Post => {
  const title = raw.title?.trim() || "Untitled"
  const slug = raw.slug?.trim() || slugify(title) || `post-${raw.id ?? ""}`
  const authorName =
    typeof raw.author === "string" ? raw.author : raw.author?.name || "Periospot"

  const featuredImg = raw.featuredImage || raw.featured_image || raw.featured_image_url || ""
  return {
    id: String(raw.id ?? slug),
    title,
    slug,
    excerpt: raw.excerpt?.trim() || buildExcerpt(raw.content || ""),
    content: raw.content || "",
    date: raw.date || "",
    modified: raw.modified || raw.date || "",
    seo: raw.seo,
    author: authorName,
    categories: raw.categories || [],
    featuredImage: featuredImg,
    featured_image: featuredImg, // Alias for backward compatibility
    status: raw.status || "publish",
  }
}

const normalizeProduct = (raw: RawProduct): Product => {
  const title = raw.title?.trim() || "Untitled"
  const slug = raw.slug?.trim() || slugify(title) || `product-${raw.id ?? ""}`
  return {
    id: String(raw.id ?? slug),
    woocommerce_id: raw.woocommerce_id ?? 0,
    title,
    slug,
    description: raw.description || "",
    price: Number(raw.price ?? 0),
    sale_price: raw.sale_price ?? null,
    currency: raw.currency || "EUR",
    product_type: raw.product_type || "simple",
    brand: raw.brand || "",
    featured_image_url: raw.featured_image_url || "",
    gallery_images: raw.gallery_images || [],
    stock_status: raw.stock_status || "",
    link: raw.link || "",
    seo: raw.seo,
  }
}

// Cached data loaders
export const getAllPosts = cache(async (): Promise<Post[]> => {
  try {
    const filePath = path.join(CONTENT_DIR, 'posts.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const posts = (JSON.parse(data) as RawPost[]).map(normalizePost)

    // Sort by date descending
    return posts.sort((a: Post, b: Post) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch (error) {
    console.error('Error loading posts:', error)
    return []
  }
})

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const posts = await getAllPosts()
  return posts.find(post => post.slug === slug) || null
})

export const getPostsByCategory = cache(async (category: string): Promise<Post[]> => {
  const posts = await getAllPosts()
  return posts.filter(post =>
    post.categories.some(cat =>
      cat.toLowerCase() === category.toLowerCase() ||
      cat.toLowerCase().includes(category.toLowerCase())
    )
  )
})

export const getAllProducts = cache(async (): Promise<Product[]> => {
  try {
    const filePath = path.join(CONTENT_DIR, 'products.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const rawProducts = JSON.parse(data) as RawProduct[]
    return rawProducts.map(normalizeProduct)
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
})

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const products = await getAllProducts()
  return products.find(product => product.slug === slug) || null
})

export const getAllAuthors = cache(async (): Promise<Author[]> => {
  try {
    const filePath = path.join(CONTENT_DIR, 'authors.json')
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading authors:', error)
    return []
  }
})

export const getAllCategories = cache(async (): Promise<Category[]> => {
  try {
    const filePath = path.join(CONTENT_DIR, 'categories.json')
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading categories:', error)
    return []
  }
})

export const getPageSeoBySlug = cache(async (slug: string): Promise<PostSeo | null> => {
  try {
    const filePath = path.join(CONTENT_DIR, 'pages.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    const pages = JSON.parse(raw) as RawPage[]
    const page = pages.find((entry) => entry.post_name === slug)
    if (!page) return null
    const fallbackSeo = mapYoastMeta(page.meta || {})
    const seo = page.seo || fallbackSeo
    return seo && Object.values(seo).some((value) => value) ? seo : null
  } catch (error) {
    console.error('Error loading pages:', error)
    return null
  }
})

// Helper to get featured posts
export const getFeaturedPosts = cache(async (limit: number = 6): Promise<Post[]> => {
  const posts = await getAllPosts()
  return posts.slice(0, limit)
})

// Helper to get products by category
export const getProductsByCategory = cache(async (category: string): Promise<Product[]> => {
  const products = await getAllProducts()
  return products.filter(product =>
    product.product_type.toLowerCase().includes(category.toLowerCase())
  )
})

// Helper to get adjacent posts (prev/next)
export const getAdjacentPosts = cache(async (slug: string): Promise<{ prev: Post | null; next: Post | null }> => {
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex(post => post.slug === slug)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  }
})

// Helper to get related posts (same category, excluding current)
export const getRelatedPosts = cache(async (slug: string, limit: number = 3): Promise<Post[]> => {
  const posts = await getAllPosts()
  const currentPost = posts.find(post => post.slug === slug)

  if (!currentPost) {
    return posts.slice(0, limit)
  }

  // Find posts with matching categories, excluding current post
  const relatedPosts = posts.filter(post =>
    post.slug !== slug &&
    post.categories.some(cat => currentPost.categories.includes(cat))
  )

  // If not enough related posts, add recent posts
  if (relatedPosts.length < limit) {
    const otherPosts = posts.filter(post =>
      post.slug !== slug &&
      !relatedPosts.some(rp => rp.slug === post.slug)
    )
    return [...relatedPosts, ...otherPosts].slice(0, limit)
  }

  return relatedPosts.slice(0, limit)
})

// Helper to extract table of contents from HTML content
export function extractTableOfContents(html: string): { id: string; title: string; level: number }[] {
  // Match h2-h4 headings with their full opening tag and content (including nested HTML)
  const headingRegex = /<h([2-4])([^>]*)>([\s\S]*?)<\/h[2-4]>/gi
  const idRegex = /id="([^"]*)"/i
  const toc: { id: string; title: string; level: number }[] = []

  let match
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const attrs = match[2]
    // Strip all HTML tags from the content to get plain text title
    const title = match[3].replace(/<[^>]*>/g, '').trim()

    if (title) {
      // Check if heading already has an ID
      const idMatch = attrs.match(idRegex)
      const id = idMatch?.[1] || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      toc.push({ id, title, level })
    }
  }

  return toc
}

// Helper to add IDs to headings in HTML content
export function addHeadingIds(html: string): string {
  return html.replace(
    /<h([2-4])([^>]*)>([\s\S]*?)<\/h([2-4])>/gi,
    (match, level, attrs, content, closeLevel) => {
      if (attrs.includes('id="')) {
        return match // Already has an ID
      }

      // Strip HTML tags to get plain text for ID generation
      const cleanTitle = content.replace(/<[^>]*>/g, '').trim()
      const id = cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      return `<h${level}${attrs} id="${id}">${content}</h${closeLevel}>`
    }
  )
}

// Aliases for backward compatibility
export const getCategories = getAllCategories
export const getAuthors = getAllAuthors
