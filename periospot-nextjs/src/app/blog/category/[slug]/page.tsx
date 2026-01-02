import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Clock } from "lucide-react"
import { getAllPosts, getAllCategories, type Post } from "@/lib/content"

// Helper to get author name from post
function getAuthorName(author: Post['author']): string {
  if (typeof author === 'string') return author || 'Periospot'
  return author?.name || 'Periospot'
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({
    slug: category.nicename,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await getAllCategories()
  const category = categories.find((c) => c.nicename === slug)

  if (!category) {
    return { title: "Category Not Found" }
  }

  return {
    title: `${category.name} Articles | Periospot`,
    description: `Browse all ${category.name} articles on Periospot. Educational content on dental topics.`,
    openGraph: {
      title: `${category.name} Articles | Periospot`,
      description: `Browse all ${category.name} articles on Periospot.`,
      url: `https://periospot.com/blog/category/${slug}`,
      type: "website",
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const [categories, allPosts] = await Promise.all([
    getAllCategories(),
    getAllPosts(),
  ])

  const category = categories.find((c) => c.nicename === slug)

  if (!category) {
    notFound()
  }

  // Filter posts by category
  const posts = allPosts.filter((post: Post) =>
    post.categories?.some((cat: string) =>
      cat.toLowerCase() === category.name.toLowerCase() ||
      cat.toLowerCase().includes(category.name.toLowerCase())
    )
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Articles
            </Link>
          </Button>
        </div>

        <div className="mb-12">
          <Badge className="mb-4" variant="secondary">
            Category
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {posts.length} {posts.length === 1 ? "article" : "articles"} in this category
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/blog">All</Link>
          </Button>
          {categories
            .filter((c) => c.nicename !== "uncategorized")
            .slice(0, 8)
            .map((cat) => (
              <Button
                key={cat.id}
                variant={cat.nicename === slug ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/blog/category/${cat.nicename}`}>{cat.name}</Link>
              </Button>
            ))}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <p className="text-muted-foreground">No articles found in this category.</p>
              <Button className="mt-4" asChild>
                <Link href="/blog">Browse All Articles</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: Post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-video bg-muted">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground/30">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.categories?.slice(0, 2).map((cat: string) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt?.replace(/<[^>]*>/g, "") || ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {getAuthorName(post.author)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
