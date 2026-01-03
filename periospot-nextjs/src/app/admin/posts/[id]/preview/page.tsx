"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  Calendar,
  Clock,
  Eye,
  User as UserIcon,
  Loader2,
  ExternalLink
} from "lucide-react"

// Admin email
const ADMIN_EMAIL = "cisco@periospot.com"

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  author_name: string | null
  categories: string[] | null
  tags: string[] | null
  language: string | null
  status: string
  published_at: string | null
  reading_time_minutes: number | null
  created_at: string
}

export default function PreviewPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<Post | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/dashboard")
        return
      }
      fetchPost()
    }
    checkAdmin()
  }, [postId, router, supabase.auth])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single()

      if (error) {
        console.error("Error fetching post:", error)
        router.push("/admin/posts")
        return
      }

      setPost(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch post:", error)
      router.push("/admin/posts")
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p>Post not found</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Admin Preview Bar */}
      <div className="sticky top-0 z-50 bg-yellow-100 dark:bg-yellow-900/50 border-b border-yellow-200 dark:border-yellow-800 py-2 px-4">
        <div className="container max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/posts/${post.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Editor
              </Link>
            </Button>
            <Badge variant="outline" className="bg-yellow-200/50 text-yellow-800 dark:text-yellow-200">
              <Eye className="mr-1 h-3 w-3" />
              Preview Mode
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={post.status === "published" ? "default" : "secondary"}>
              {post.status.replace("_", " ")}
            </Badge>
            <Button size="sm" asChild>
              <Link href={`/admin/posts/${post.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Article Preview */}
      <article className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video mb-8 rounded-xl overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.categories.map((cat, i) => (
                <Badge key={i} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            {post.author_name && (
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{post.author_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>
            {post.reading_time_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time_minutes} min read</span>
              </div>
            )}
            <Badge variant="outline" className="uppercase text-xs">
              {post.language || "en"}
            </Badge>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MarkdownRenderer content={post.content || ""} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
