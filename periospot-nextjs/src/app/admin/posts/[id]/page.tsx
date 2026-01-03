"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
  Bot,
  User as UserIcon,
  FileText,
  Calendar,
  Image as ImageIcon,
  RefreshCw
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
  meta_title: string | null
  meta_description: string | null
  focus_keyword: string | null
  canonical_url: string | null
  categories: string[] | null
  tags: string[] | null
  language: string | null
  status: string
  source: string | null
  published_at: string | null
  scheduled_for: string | null
  reading_time_minutes: number | null
  view_count: number
  created_at: string
  updated_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
}

interface SeoCheck {
  id: string
  label: string
  status: "pass" | "warning" | "fail"
  message: string
}

interface PostHistory {
  id: string
  action: string
  old_status: string | null
  new_status: string | null
  changed_by_source: string | null
  notes: string | null
  created_at: string
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [post, setPost] = useState<Post | null>(null)
  const [history, setHistory] = useState<PostHistory[]>([])
  const [seoChecks, setSeoChecks] = useState<SeoCheck[]>([])
  const [seoScore, setSeoScore] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
      setUser(user)
      fetchPost()
      fetchHistory()
    }
    checkAdmin()
  }, [postId, router, supabase.auth])

  useEffect(() => {
    if (post) {
      runSeoCheck(post)
    }
  }, [post?.title, post?.meta_title, post?.meta_description, post?.excerpt, post?.content, post?.featured_image_url, post?.focus_keyword])

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

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("post_history")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!error && data) {
        setHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    }
  }

  const runSeoCheck = (post: Post) => {
    const checks: SeoCheck[] = []
    let score = 0
    const maxScore = 100

    // Title check
    const title = post.meta_title || post.title
    if (!title) {
      checks.push({ id: "title", label: "Title", status: "fail", message: "Missing title" })
    } else if (title.length > 60) {
      checks.push({ id: "title", label: "Title", status: "warning", message: `Title too long (${title.length}/60 chars)` })
      score += 10
    } else if (title.length < 30) {
      checks.push({ id: "title", label: "Title", status: "warning", message: `Title too short (${title.length}/30 chars)` })
      score += 10
    } else {
      checks.push({ id: "title", label: "Title", status: "pass", message: `Title length is good (${title.length} chars)` })
      score += 15
    }

    // Meta description check
    if (!post.meta_description) {
      checks.push({ id: "meta_desc", label: "Meta Description", status: "fail", message: "Missing meta description" })
    } else if (post.meta_description.length > 160) {
      checks.push({ id: "meta_desc", label: "Meta Description", status: "warning", message: `Too long (${post.meta_description.length}/160 chars)` })
      score += 10
    } else if (post.meta_description.length < 120) {
      checks.push({ id: "meta_desc", label: "Meta Description", status: "warning", message: `Too short (${post.meta_description.length}/120 chars)` })
      score += 10
    } else {
      checks.push({ id: "meta_desc", label: "Meta Description", status: "pass", message: `Good length (${post.meta_description.length} chars)` })
      score += 15
    }

    // Featured image check
    if (!post.featured_image_url) {
      checks.push({ id: "image", label: "Featured Image", status: "fail", message: "No featured image set" })
    } else {
      checks.push({ id: "image", label: "Featured Image", status: "pass", message: "Featured image is set" })
      score += 15
    }

    // Content length check
    const contentLength = (post.content || "").length
    if (contentLength < 500) {
      checks.push({ id: "content", label: "Content Length", status: "fail", message: `Very short content (${contentLength} chars)` })
    } else if (contentLength < 1500) {
      checks.push({ id: "content", label: "Content Length", status: "warning", message: `Short content (${contentLength} chars)` })
      score += 10
    } else {
      checks.push({ id: "content", label: "Content Length", status: "pass", message: `Good content length (${contentLength} chars)` })
      score += 20
    }

    // Excerpt check
    if (!post.excerpt) {
      checks.push({ id: "excerpt", label: "Excerpt", status: "warning", message: "No excerpt set" })
      score += 5
    } else {
      checks.push({ id: "excerpt", label: "Excerpt", status: "pass", message: "Excerpt is set" })
      score += 10
    }

    // Focus keyword check
    if (!post.focus_keyword) {
      checks.push({ id: "keyword", label: "Focus Keyword", status: "warning", message: "No focus keyword" })
    } else {
      const keywordInTitle = title?.toLowerCase().includes(post.focus_keyword.toLowerCase())
      const keywordInDesc = post.meta_description?.toLowerCase().includes(post.focus_keyword.toLowerCase())

      if (keywordInTitle && keywordInDesc) {
        checks.push({ id: "keyword", label: "Focus Keyword", status: "pass", message: "Keyword in title & description" })
        score += 15
      } else if (keywordInTitle || keywordInDesc) {
        checks.push({ id: "keyword", label: "Focus Keyword", status: "warning", message: "Keyword only in title OR description" })
        score += 10
      } else {
        checks.push({ id: "keyword", label: "Focus Keyword", status: "warning", message: "Keyword not in title or description" })
        score += 5
      }
    }

    // Slug check
    if (post.slug.includes(" ") || post.slug !== post.slug.toLowerCase()) {
      checks.push({ id: "slug", label: "URL Slug", status: "warning", message: "Slug has spaces or uppercase" })
      score += 5
    } else {
      checks.push({ id: "slug", label: "URL Slug", status: "pass", message: "Slug is properly formatted" })
      score += 10
    }

    setSeoChecks(checks)
    setSeoScore(Math.min(score, maxScore))
  }

  const handleSave = async () => {
    if (!post) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featured_image_url: post.featured_image_url,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          focus_keyword: post.focus_keyword,
          categories: post.categories,
          tags: post.tags,
          language: post.language,
          review_notes: post.review_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id)

      if (error) {
        console.error("Error saving post:", error)
      } else {
        setHasChanges(false)
        fetchHistory()
      }
    } catch (error) {
      console.error("Failed to save post:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!post) return
    setSaving(true)

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "published") {
        updateData.published_at = post.published_at || new Date().toISOString()
        updateData.reviewed_at = new Date().toISOString()
        updateData.reviewed_by = user?.id
      }

      const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", post.id)

      if (error) {
        console.error("Error updating status:", error)
      } else {
        setPost({ ...post, status: newStatus })
        fetchHistory()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setSaving(false)
    }
  }

  const updatePost = (field: keyof Post, value: unknown) => {
    if (!post) return
    setPost({ ...post, [field]: value })
    setHasChanges(true)
  }

  const getStatusIcon = (status: "pass" | "warning" | "fail") => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getSeoScoreColor = () => {
    if (seoScore >= 80) return "text-green-500"
    if (seoScore >= 60) return "text-yellow-500"
    return "text-red-500"
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

  const sourceConfig = {
    admin: { label: "Admin", icon: UserIcon, color: "text-blue-500" },
    mcp: { label: "Claude MCP", icon: Bot, color: "text-purple-500" },
    import: { label: "Import", icon: FileText, color: "text-gray-500" },
  }
  const source = sourceConfig[post.source as keyof typeof sourceConfig] || sourceConfig.import

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* Source Badge */}
            <Badge variant="outline" className={source.color}>
              <source.icon className="mr-1 h-3 w-3" />
              {source.label}
            </Badge>

            {/* Status Badge */}
            <Badge variant={post.status === "published" ? "default" : "secondary"}>
              {post.status.replace("_", " ")}
            </Badge>

            {/* SEO Score */}
            <div className={`font-semibold ${getSeoScoreColor()}`}>
              SEO: {seoScore}/100
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Editor - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={post.title}
                    onChange={(e) => updatePost("title", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex items-center mt-1.5">
                    <span className="text-sm text-muted-foreground mr-2">/blog/</span>
                    <Input
                      id="slug"
                      value={post.slug}
                      onChange={(e) => updatePost("slug", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter image URL..."
                  value={post.featured_image_url || ""}
                  onChange={(e) => updatePost("featured_image_url", e.target.value)}
                />
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt="Featured"
                    className="max-h-48 rounded-lg object-cover"
                  />
                )}
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={post.excerpt || ""}
                  onChange={(e) => updatePost("excerpt", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Short description for post previews..."
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Content (Markdown)</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <ScrollArea className="h-[500px] border rounded-lg p-4">
                    <MarkdownRenderer content={post.content || ""} />
                  </ScrollArea>
                ) : (
                  <textarea
                    value={post.content || ""}
                    onChange={(e) => updatePost("content", e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
                  />
                )}
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">
                    Meta Title ({(post.meta_title || "").length}/60)
                  </Label>
                  <Input
                    id="meta_title"
                    value={post.meta_title || ""}
                    onChange={(e) => updatePost("meta_title", e.target.value)}
                    maxLength={60}
                    className="mt-1.5"
                    placeholder="SEO title (leave blank to use post title)"
                  />
                </div>
                <div>
                  <Label htmlFor="meta_desc">
                    Meta Description ({(post.meta_description || "").length}/160)
                  </Label>
                  <textarea
                    id="meta_desc"
                    value={post.meta_description || ""}
                    onChange={(e) => updatePost("meta_description", e.target.value)}
                    maxLength={160}
                    rows={3}
                    className="w-full mt-1.5 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Description for search results..."
                  />
                </div>
                <div>
                  <Label htmlFor="focus_keyword">Focus Keyword</Label>
                  <Input
                    id="focus_keyword"
                    value={post.focus_keyword || ""}
                    onChange={(e) => updatePost("focus_keyword", e.target.value)}
                    className="mt-1.5"
                    placeholder="Main keyword to optimize for"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Review Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Review Notes</CardTitle>
                <CardDescription>Internal notes (not visible to public)</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={post.review_notes || ""}
                  onChange={(e) => updatePost("review_notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Add notes about this post..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                </div>

                <div className="border-t pt-3 mt-3">
                  {post.status === "published" ? (
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange("draft")}
                      disabled={saving}
                    >
                      Unpublish
                    </Button>
                  ) : post.status === "pending_review" ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange("published")}
                        disabled={saving}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve & Publish
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleStatusChange("draft")}
                        disabled={saving}
                      >
                        Return to Draft
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange("published")}
                      disabled={saving}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publish Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>SEO Checklist</span>
                  <span className={`text-xl font-bold ${getSeoScoreColor()}`}>
                    {seoScore}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {seoChecks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      {getStatusIcon(check.status)}
                      <div>
                        <span className="font-medium">{check.label}</span>
                        <p className="text-muted-foreground text-xs">
                          {check.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Post Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Post Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{new Date(post.updated_at).toLocaleDateString()}</span>
                </div>
                {post.published_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>{post.view_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <Badge variant="secondary" className="text-xs uppercase">
                    {post.language || "en"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div key={item.id} className="text-sm border-b pb-2 last:border-0">
                          <p className="font-medium capitalize">
                            {item.action.replace("_", " ")}
                          </p>
                          {item.old_status && item.new_status && (
                            <p className="text-xs text-muted-foreground">
                              {item.old_status} → {item.new_status}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
