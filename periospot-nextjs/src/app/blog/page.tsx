import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

import { getAllPosts, getAllCategories } from "@/lib/content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

  // Filter to only show published posts
  const publishedPosts = posts.filter((post) => post.status === "publish")

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
          <PostCard key={post.id} post={post} />
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

function PostCard({ post }: { post: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {post.featuredImage && (
        <div className="aspect-video relative bg-muted">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader className="flex-1">
        <div className="flex flex-wrap gap-2 mb-2">
          {post.categories?.slice(0, 2).map((cat: string) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
        <CardTitle className="line-clamp-2 text-lg">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.excerpt?.replace(/<[^>]*>/g, "") || ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{post.author?.name || "Periospot"}</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
      </CardContent>
    </Card>
  )
}
