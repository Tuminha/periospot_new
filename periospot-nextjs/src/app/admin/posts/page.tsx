"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Bot,
  User as UserIcon,
  RefreshCw,
  Loader2,
  ExternalLink
} from "lucide-react"
import { AdminNav } from "@/components/AdminNav"

// Admin email
const ADMIN_EMAIL = "cisco@periospot.com"

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  status: string
  source: string | null
  categories: string[] | null
  language: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  view_count: number
  author_name: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  scheduled_for: string | null
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "Draft", color: "bg-gray-200 text-gray-800", icon: FileText },
  pending_review: { label: "Pending Review", color: "bg-yellow-200 text-yellow-800", icon: AlertCircle },
  published: { label: "Published", color: "bg-green-200 text-green-800", icon: CheckCircle },
  scheduled: { label: "Scheduled", color: "bg-blue-200 text-blue-800", icon: Calendar },
  archived: { label: "Archived", color: "bg-red-200 text-red-800", icon: Clock },
}

const sourceConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  admin: { label: "Admin", color: "text-blue-500", icon: UserIcon },
  mcp: { label: "Claude MCP", color: "text-purple-500", icon: Bot },
  import: { label: "Import", color: "text-gray-500", icon: FileText },
}

export default function AdminPostsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

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
      setLoading(false)
      fetchPosts()
    }
    checkAdmin()
  }, [router, supabase.auth])

  useEffect(() => {
    filterPosts()
  }, [posts, statusFilter, searchQuery])

  const fetchPosts = async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching posts:", error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(query))
      )
    }

    setFilteredPosts(filtered)
  }

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: posts.length,
      pending_review: 0,
      draft: 0,
      published: 0,
      scheduled: 0,
      archived: 0,
    }
    posts.forEach(post => {
      if (counts[post.status] !== undefined) {
        counts[post.status]++
      }
    })
    return counts
  }

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "published") {
        updateData.published_at = new Date().toISOString()
        updateData.reviewed_at = new Date().toISOString()
        updateData.reviewed_by = user?.id
      }

      const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", postId)

      if (error) {
        console.error("Error updating post status:", error)
        return
      }

      // Refresh posts
      fetchPosts()
    } catch (error) {
      console.error("Failed to update post status:", error)
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchPosts} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all blog posts and their publication status
          </p>
        </div>

        {/* Pending Review Alert */}
        {statusCounts.pending_review > 0 && statusFilter !== "pending_review" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You have <strong>{statusCounts.pending_review}</strong> post{statusCounts.pending_review !== 1 ? "s" : ""} pending review.{" "}
                  <button
                    onClick={() => setStatusFilter("pending_review")}
                    className="underline font-medium hover:text-yellow-900"
                  >
                    View pending
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by title, slug, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All Posts" },
            { key: "pending_review", label: "Pending Review" },
            { key: "draft", label: "Drafts" },
            { key: "published", label: "Published" },
            { key: "scheduled", label: "Scheduled" },
            { key: "archived", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {tab.label}
              {statusCounts[tab.key] > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  tab.key === "pending_review" && statusCounts.pending_review > 0
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-muted"
                }`}>
                  {statusCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        <Card>
          <CardContent className="p-0">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No posts found{statusFilter !== "all" ? ` with status "${statusFilter.replace("_", " ")}"` : ""}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPosts.map((post) => {
                      const status = statusConfig[post.status] || statusConfig.draft
                      const source = sourceConfig[post.source || "import"]
                      const StatusIcon = status.icon
                      const SourceIcon = source.icon

                      return (
                        <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/posts/${post.id}`}
                              className="hover:underline font-medium text-foreground"
                            >
                              {post.title}
                            </Link>
                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                              /blog/{post.slug}
                            </p>
                            {post.categories && post.categories.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {post.categories.slice(0, 2).map((cat, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                                {post.categories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.categories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </span>
                            {post.status === "scheduled" && post.scheduled_for && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(post.scheduled_for).toLocaleDateString()}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center text-sm ${source.color}`}>
                              <SourceIcon className="mr-1.5 h-4 w-4" />
                              {source.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-xs uppercase">
                              {post.language || "en"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {post.view_count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/blog/${post.slug}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/posts/${post.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              {post.status === "pending_review" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleStatusChange(post.id, "published")}
                                >
                                  Publish
                                </Button>
                              )}
                              {post.status === "published" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleStatusChange(post.id, "draft")}
                                >
                                  Unpublish
                                </Button>
                              )}
                              {(post.status === "draft" || post.status === "archived") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-300 text-green-600 hover:bg-green-50"
                                  onClick={() => handleStatusChange(post.id, "published")}
                                >
                                  Publish
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {Object.entries(statusConfig).map(([key, config]) => (
            <Card key={key} className={statusFilter === key ? "ring-2 ring-primary" : ""}>
              <CardContent className="pt-4 pb-3 text-center">
                <config.icon className={`h-5 w-5 mx-auto mb-1 ${
                  key === "pending_review" ? "text-yellow-500" :
                  key === "published" ? "text-green-500" :
                  key === "draft" ? "text-gray-500" :
                  key === "scheduled" ? "text-blue-500" :
                  "text-red-500"
                }`} />
                <p className="text-2xl font-bold">{statusCounts[key]}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Navigation</h3>
          <AdminNav />
        </div>
      </div>
    </main>
  )
}
