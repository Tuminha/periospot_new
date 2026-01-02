import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react"

import {
  getAllPosts,
  getPostBySlug,
  getAdjacentPosts,
  getRelatedPosts,
  extractTableOfContents,
  addHeadingIds,
  type Post,
} from "@/lib/content"

// Helper to get author name from post
function getAuthorName(author: Post['author']): string {
  if (typeof author === 'string') return author || 'Periospot'
  return author?.name || 'Periospot'
}
import { Separator } from "@/components/ui/separator"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for each post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const excerpt = post.excerpt?.replace(/<[^>]*>/g, "").slice(0, 160) || ""

  return {
    title: post.title,
    description: excerpt,
    authors: [{ name: getAuthorName(post.author) }],
    openGraph: {
      title: post.title,
      description: excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [getAuthorName(post.author)],
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `https://periospot.com/blog/${post.slug}`,
    },
  }
}

// Revalidate every 24 hours
export const revalidate = 86400

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const [post, adjacentPosts, relatedPosts] = await Promise.all([
    getPostBySlug(slug),
    getAdjacentPosts(slug),
    getRelatedPosts(slug, 3),
  ])

  if (!post) {
    notFound()
  }

  // Calculate reading time (roughly 200 words per minute)
  const wordCount = post.content?.split(/\s+/).length || 0
  const readingTime = Math.ceil(wordCount / 200)

  // Extract table of contents and add IDs to headings
  const tableOfContents = extractTableOfContents(post.content || "")
  const contentWithIds = addHeadingIds(post.content || "")

  // Get author name and initials
  const authorName = getAuthorName(post.author)
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "PS"

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt?.replace(/<[^>]*>/g, "").slice(0, 160),
            image: post.featuredImage,
            author: {
              "@type": "Person",
              name: authorName,
            },
            publisher: {
              "@type": "Organization",
              name: "Periospot",
              logo: {
                "@type": "ImageObject",
                url: "https://periospot.com/logo.png",
              },
            },
            datePublished: post.date,
            dateModified: post.modified || post.date,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://periospot.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              {post.categories?.[0] && (
                <>
                  <span>/</span>
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.categories[0])}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {post.categories[0]}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <article>
              {/* Article Header */}
              <header className="mb-10">
                {/* Category */}
                {post.categories?.[0] && (
                  <span className="inline-block text-xs font-medium tracking-widest uppercase text-primary mb-4">
                    {post.categories[0]}
                  </span>
                )}

                {/* Title */}
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-6">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-foreground font-medium text-sm">
                        {authorInitials}
                      </span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {authorName}
                      </p>
                      <p className="text-xs">Periodontist</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {readingTime} min read
                    </span>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              {post.featuredImage && (
                <div className="mb-8">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      width={900}
                      height={506}
                      className="w-full h-full object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                    />
                  </div>
                </div>
              )}

              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5 mb-10">
                  <h3 className="font-display text-base font-semibold text-foreground mb-3">
                    Table of Contents
                  </h3>
                  <nav className="flex flex-wrap gap-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="text-sm py-1.5 px-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Article Content */}
              <div className="prose max-w-none mb-12">
                <div
                  dangerouslySetInnerHTML={{ __html: contentWithIds }}
                />
              </div>

              {/* Social Share */}
              <div className="border-t border-b border-border py-6 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm font-medium text-foreground">Share this article</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://periospot.com/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://periospot.com/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://periospot.com/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Author Box */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-foreground font-semibold text-lg">
                      {authorInitials}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {authorName}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Expert in periodontics and implantology with extensive clinical experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* Prev/Next Navigation */}
              <div className="grid grid-cols-2 gap-4 mb-16">
                {adjacentPosts.prev ? (
                  <Link
                    href={`/blog/${adjacentPosts.prev.slug}`}
                    className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-soft transition-shadow"
                  >
                    <ChevronLeft
                      size={20}
                      className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Previous</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {adjacentPosts.prev.title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {adjacentPosts.next ? (
                  <Link
                    href={`/blog/${adjacentPosts.next.slug}`}
                    className="group flex items-center justify-end gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-soft transition-shadow text-right"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Next</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {adjacentPosts.next.title}
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                    />
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mb-16">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                    Related Articles
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-shadow"
                      >
                        {relatedPost.featuredImage ? (
                          <div className="aspect-video overflow-hidden">
                            <Image
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              width={400}
                              height={225}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-secondary flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No image</span>
                          </div>
                        )}
                        <div className="p-4">
                          {relatedPost.categories?.[0] && (
                            <span className="text-xs text-primary font-medium">
                              {relatedPost.categories[0]}
                            </span>
                          )}
                          <h3 className="font-display text-sm font-semibold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {Math.ceil((relatedPost.content?.split(/\s+/).length || 0) / 200)} min read
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>
        </div>
      </main>
    </>
  )
}
