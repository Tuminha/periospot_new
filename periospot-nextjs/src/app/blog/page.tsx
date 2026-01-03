import { Metadata } from "next"
import Link from "next/link"

import { getAllPosts, getAllCategories } from "@/lib/content"
import { Button } from "@/components/ui/button"
import BlogPostCard from "@/components/analytics/BlogPostCard"

export const metadata: Metadata = {
  title: "Blog - Dental Education Articles",
  description:
    "Expert articles on implantology, periodontics, and aesthetic dentistry. Stay updated with the latest dental education content.",
  openGraph: {
    title: "Blog - Dental Education Articles | Periospot",
    description:
      "Expert articles on implantology, periodontics, and aesthetic dentistry.",
    type: "website",
  },
  alternates: {
    canonical: "https://periospot.com/blog",
  },
}

// Revalidate every 24 hours
export const revalidate = 86400

export default async function BlogPage() {
  const posts = await getAllPosts()
  const categories = await getAllCategories()

  // Filter to only show published posts in English (default language)
  const publishedPosts = posts.filter(
    (post) => post.status === "publish" && (post.language === "en" || !post.language)
  )

  return (
    <div className="container py-12">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Expert articles on implantology, periodontics, and aesthetic dentistry.
          Learn from leading professionals in the field.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/blog">All Posts</Link>
        </Button>
        {categories.slice(0, 8).map((category) => (
          <Button key={category.id} variant="outline" size="sm" asChild>
            <Link href={`/blog/category/${category.nicename}`}>
              {category.name}
            </Link>
          </Button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {publishedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      )}
    </div>
  )
}
