import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, BookOpen, Mail } from "lucide-react"
import { getAllPosts, getAllAuthors, type Post, type Author } from "@/lib/content"

interface AuthorPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const authors = await getAllAuthors()
  return authors.map((author) => ({
    slug: author.login.toLowerCase().replace(/\s+/g, "-"),
  }))
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params
  const authors = await getAllAuthors()
  const author = authors.find(
    (a) => a.login.toLowerCase().replace(/\s+/g, "-") === slug ||
           a.display_name.toLowerCase().replace(/\s+/g, "-") === slug
  )

  if (!author) {
    return { title: "Author Not Found" }
  }

  return {
    title: `${author.display_name} | Periospot Author`,
    description: `Read articles by ${author.display_name} on Periospot. Dental education content from expert contributors.`,
    openGraph: {
      title: `${author.display_name} | Periospot Author`,
      description: `Read articles by ${author.display_name} on Periospot.`,
      url: `https://periospot.com/author/${slug}`,
      type: "profile",
    },
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params
  const [authors, allPosts] = await Promise.all([
    getAllAuthors(),
    getAllPosts(),
  ])

  const author = authors.find(
    (a: Author) =>
      a.login.toLowerCase().replace(/\s+/g, "-") === slug ||
      a.display_name.toLowerCase().replace(/\s+/g, "-") === slug
  )

  if (!author) {
    notFound()
  }

  // Filter posts by author
  const posts = allPosts.filter((post: Post) => {
    const postAuthor = typeof post.author === 'string' ? post.author : post.author?.name || ''
    return postAuthor.toLowerCase() === author.display_name.toLowerCase() ||
           postAuthor.toLowerCase().includes(author.display_name.toLowerCase().split(" ")[0])
  })

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

  // Get author bio based on who they are
  const getAuthorBio = (author: Author): string => {
    const bios: Record<string, string> = {
      "Cisco": "Periospot founder. DDS since 2004. Specialized in Implant and Digital dentistry. Works for Straumann Group as Global Customer Success Manager DSO. International speaker with more than 50 published articles and 8 ebooks.",
      "Daniel Robles": "Doctor in Dental Science (D.D.S.) from UCM Madrid. Master's in Periodontics and Oral Implantology. Clinical Director and Professor at multiple Madrid institutions.",
      "Tomas Linkevicius": "World-renowned expert in implant dentistry and author of multiple scientific publications.",
      "Manthan Desai MDS": "Specialist in periodontics with expertise in regenerative procedures and implant dentistry.",
    }
    return bios[author.display_name] || `Contributing author at Periospot.`
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Articles
            </Link>
          </Button>
        </div>

        {/* Author Card */}
        <Card className="mb-12">
          <CardContent className="flex flex-col md:flex-row gap-6 pt-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {author.display_name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <Badge className="mb-2">Author</Badge>
              <h1 className="text-3xl font-bold">{author.display_name}</h1>
              <p className="mt-2 text-muted-foreground">
                {getAuthorBio(author)}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {posts.length} {posts.length === 1 ? "article" : "articles"}
                </div>
                {author.email && !author.email.includes("@periospot") && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Contact available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Articles by {author.display_name}</h2>
        </div>

        {posts.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <p className="text-muted-foreground">No articles found for this author.</p>
              <Button className="mt-4" asChild>
                <Link href="/blog">Browse All Articles</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.date)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Other Authors */}
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold">Other Contributors</h2>
          <div className="flex flex-wrap gap-2">
            {authors
              .filter((a: Author) => a.id !== author.id && a.display_name !== "manager-periospot")
              .slice(0, 10)
              .map((a: Author) => (
                <Button key={a.id} variant="outline" size="sm" asChild>
                  <Link href={`/author/${a.login.toLowerCase().replace(/\s+/g, "-")}`}>
                    {a.display_name}
                  </Link>
                </Button>
              ))}
          </div>
        </div>
      </div>
    </main>
  )
}
