import FeaturedPostsClient from "@/components/FeaturedPostsClient"
import { getAllPosts } from "@/lib/content"

type FeaturedPost = {
  id: string
  category: string
  title: string
  excerpt: string
  readTime: string
  image?: string
  slug: string
  featured?: boolean
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ")

const buildExcerpt = (value: string, maxLength: number = 160) => {
  const clean = stripHtml(value).replace(/\s+/g, " ").trim()
  if (!clean) return ""
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trim()}...` : clean
}

const estimateReadTime = (content: string) => {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length
  const minutes = Math.max(3, Math.round(words / 200))
  return `${minutes} min read`
}

const mapPosts = (posts: Awaited<ReturnType<typeof getAllPosts>>): FeaturedPost[] =>
  posts.map((post) => ({
    id: String(post.id),
    category: post.categories?.[0] || "Articles",
    title: post.title,
    excerpt: post.excerpt || buildExcerpt(post.content),
    readTime: estimateReadTime(post.content),
    image: post.featuredImage || undefined,
    slug: post.slug,
  }))

const FeaturedPosts = async () => {
  const posts = await getAllPosts()
  const published = posts.filter((post) => post.status === "publish" && post.slug)
  const withImages = published.filter((post) => post.featuredImage)
  const source = withImages.length >= 6 ? withImages : published
  const mapped = mapPosts(source).slice(0, 6)

  if (mapped.length === 0) {
    return null
  }

  const [first, ...rest] = mapped
  const hydrated: FeaturedPost[] = [
    { ...first, featured: true },
    ...rest,
  ]

  return <FeaturedPostsClient posts={hydrated} />
}

export default FeaturedPosts
