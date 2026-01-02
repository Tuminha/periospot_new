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
  author: {
    id: string
    name: string
    email: string
  }
  categories: string[]
  featuredImage: string
  status: string
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

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), '..', 'legacy-wordpress', 'content')

// Cached data loaders
export const getAllPosts = cache(async (): Promise<Post[]> => {
  try {
    const filePath = path.join(CONTENT_DIR, 'posts.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const posts = JSON.parse(data)

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
    return JSON.parse(data)
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
