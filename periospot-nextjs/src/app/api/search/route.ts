import { NextRequest, NextResponse } from "next/server"
import { getAllPosts, getAllProducts } from "@/lib/content"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")?.toLowerCase() || ""
  const type = searchParams.get("type") || "all"

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const results: unknown[] = []

    if (type === "posts" || type === "all") {
      const posts = await getAllPosts()
      const matchingPosts = posts.filter((post) => {
        const searchText = `${post.title} ${post.excerpt} ${post.content} ${post.categories?.join(" ")}`.toLowerCase()
        return searchText.includes(query)
      }).slice(0, 20).map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        type: "post",
        date: post.date,
        author: typeof post.author === 'string' ? post.author : post.author?.name,
        categories: post.categories,
        featured_image: post.featuredImage || post.featured_image,
      }))

      results.push(...matchingPosts)
    }

    if (type === "products" || type === "all") {
      const products = await getAllProducts()
      const matchingProducts = products.filter((product) => {
        const searchText = `${product.title} ${product.description} ${product.product_type}`.toLowerCase()
        return searchText.includes(query)
      }).slice(0, 20).map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        excerpt: product.description,
        type: "product",
        price: product.sale_price || product.price,
        categories: [product.product_type],
        featured_image: product.featured_image_url,
      }))

      results.push(...matchingProducts)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
