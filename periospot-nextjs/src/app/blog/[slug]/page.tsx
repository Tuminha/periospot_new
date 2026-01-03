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
import TableOfContents from "@/components/TableOfContents"
import AuthorCard from "@/components/AuthorCard"
import CommentsSection from "@/components/CommentsSection"
import ArticleScrollTracker from "@/components/analytics/ArticleScrollTracker"
import SocialShare from "@/components/analytics/SocialShare"
import RelatedPostCard from "@/components/analytics/RelatedPostCard"

// Helper to get author name from post
function getAuthorName(author: Post['author']): string {
  if (typeof author === 'string') return author || 'Periospot'
  return author?.name || 'Periospot'
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const resolveYoastTemplate = (template: string, post: Post, excerptText: string) => {
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""
  const replacements: Record<string, string> = {
    "%%title%%": post.title,
    "%%sitename%%": "Periospot",
    "%%excerpt%%": excerptText,
    "%%category%%": post.categories?.[0] || "",
    "%%primary_category%%": post.categories?.[0] || "",
    "%%date%%": formattedDate,
    "%%currentyear%%": String(new Date().getFullYear()),
    "%%sep%%": "-",
    "%%page%%": "",
  }

  return template
    .replace(/%%[^%]+%%/g, (token) => replacements[token] ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

const resolveUrl = (value?: string) => {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("/")) return `https://periospot.com${value}`
  return value
}

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

  const excerptText = stripHtml(post.excerpt || post.content || "")
  const fallbackDescription = excerptText.slice(0, 160)
  const seoTitleRaw = post.seo?.title || ""
  const seoDescriptionRaw = post.seo?.description || ""
  const seoTitle = seoTitleRaw ? resolveYoastTemplate(seoTitleRaw, post, fallbackDescription) : post.title
  const seoDescription = seoDescriptionRaw
    ? resolveYoastTemplate(seoDescriptionRaw, post, fallbackDescription)
    : fallbackDescription
  const ogTitleRaw = post.seo?.og_title || ""
  const ogDescriptionRaw = post.seo?.og_description || ""
  const ogTitle = ogTitleRaw ? resolveYoastTemplate(ogTitleRaw, post, fallbackDescription) : seoTitle
  const ogDescription = ogDescriptionRaw
    ? resolveYoastTemplate(ogDescriptionRaw, post, fallbackDescription)
    : seoDescription
  const twitterTitleRaw = post.seo?.twitter_title || ""
  const twitterDescriptionRaw = post.seo?.twitter_description || ""
  const twitterTitle = twitterTitleRaw
    ? resolveYoastTemplate(twitterTitleRaw, post, fallbackDescription)
    : ogTitle
  const twitterDescription = twitterDescriptionRaw
    ? resolveYoastTemplate(twitterDescriptionRaw, post, fallbackDescription)
    : ogDescription
  const ogImage = resolveUrl(post.seo?.og_image || post.featuredImage)
  const twitterImage = resolveUrl(post.seo?.twitter_image || ogImage)
  const canonicalUrl = resolveUrl(post.seo?.canonical || `https://periospot.com/blog/${post.slug}`)
  const robotsValue = [
    post.seo?.meta_robots,
    post.seo?.meta_robots_noindex,
    post.seo?.meta_robots_nofollow,
    post.seo?.meta_robots_adv,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  const noindex =
    robotsValue.includes("noindex") ||
    post.seo?.meta_robots_noindex === "1" ||
    post.seo?.meta_robots_noindex === "true"
  const nofollow =
    robotsValue.includes("nofollow") ||
    post.seo?.meta_robots_nofollow === "1" ||
    post.seo?.meta_robots_nofollow === "true"

  return {
    title: seoTitle,
    description: seoDescription,
    authors: [{ name: getAuthorName(post.author) }],
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [getAuthorName(post.author)],
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : [],
    },
    alternates: {
      canonical: canonicalUrl,
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
  const wordpressPostId = Number.isFinite(Number(post.id)) ? Number(post.id) : null

  // Get author name and initials
  const authorName = getAuthorName(post.author)
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "PS"
  const primaryCategory = post.categories?.[0] || "implantology"

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
            description: stripHtml(post.seo?.description || post.excerpt || post.content || "").slice(0, 160),
            image: post.seo?.og_image || post.featuredImage,
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
        <ArticleScrollTracker slug={post.slug} category={primaryCategory.toLowerCase()} />
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

              {/* Table of Contents - Interactive with scroll tracking */}
              <TableOfContents items={tableOfContents} />

              {/* Article Content */}
              <div className="prose max-w-none mb-12">
                <div
                  dangerouslySetInnerHTML={{ __html: contentWithIds }}
                />
              </div>

              <SocialShare slug={`/blog/${post.slug}`} title={post.title} />

              {/* Author Card with profile pic and social links */}
              <AuthorCard authorName={authorName} />

              {/* Comments */}
              <CommentsSection postSlug={post.slug} wordpressPostId={wordpressPostId} />

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
                      <RelatedPostCard key={relatedPost.id} post={relatedPost} />
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
