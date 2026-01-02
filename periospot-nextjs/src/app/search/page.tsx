"use client"

import { useState, useEffect, useCallback, Suspense } from "react"

// Prevent static prerendering since this page uses searchParams
export const dynamic = 'force-dynamic'
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Loader2,
  BookOpen,
  ShoppingBag,
  Calendar,
  User,
  ArrowRight
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt?: string
  type: "post" | "product"
  date?: string
  author?: string
  price?: number
  categories?: string[]
  featured_image?: string
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchLoading() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Search Periospot</h1>
          <p className="mt-2 text-muted-foreground">
            Find articles, products, and resources
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    </main>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      // Fetch posts and products
      const [postsRes, productsRes] = await Promise.all([
        fetch("/api/search?type=posts&q=" + encodeURIComponent(searchQuery)),
        fetch("/api/search?type=products&q=" + encodeURIComponent(searchQuery)),
      ])

      const posts = postsRes.ok ? await postsRes.json() : []
      const products = productsRes.ok ? await productsRes.json() : []

      // Combine and sort results
      const combined: SearchResult[] = [
        ...posts.map((p: SearchResult) => ({ ...p, type: "post" as const })),
        ...products.map((p: SearchResult) => ({ ...p, type: "product" as const })),
      ]

      setResults(combined)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  const posts = results.filter((r) => r.type === "post")
  const products = results.filter((r) => r.type === "product")

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
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
      <div className="container max-w-4xl">
        {/* Search Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Search Periospot</h1>
          <p className="mt-2 text-muted-foreground">
            Find articles, products, and resources
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for articles, products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : searched ? (
          results.length === 0 ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">No results found</h2>
                <p className="mt-2 text-muted-foreground">
                  Try different keywords or browse our content
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button asChild>
                    <Link href="/blog">Browse Articles</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/tienda">Browse Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Found {results.length} results for &ldquo;{initialQuery}&rdquo;
                </p>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    All ({results.length})
                  </TabsTrigger>
                  <TabsTrigger value="posts">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Articles ({posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Products ({products.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {results.map((result) => (
                    <SearchResultCard key={`${result.type}-${result.id}`} result={result} formatDate={formatDate} />
                  ))}
                </TabsContent>

                <TabsContent value="posts" className="space-y-4">
                  {posts.map((result) => (
                    <SearchResultCard key={result.id} result={result} formatDate={formatDate} />
                  ))}
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  {products.map((result) => (
                    <SearchResultCard key={result.id} result={result} formatDate={formatDate} />
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              Enter a search term to find content
            </p>

            {/* Popular Searches */}
            <div className="mt-8">
              <p className="text-sm font-medium mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["implant", "socket shield", "bone graft", "periodontics", "aesthetics"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(term)
                      router.push(`/search?q=${encodeURIComponent(term)}`)
                      performSearch(term)
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function SearchResultCard({
  result,
  formatDate,
}: {
  result: SearchResult
  formatDate: (date?: string) => string
}) {
  const href = result.type === "post" ? `/blog/${result.slug}` : `/tienda/${result.slug}`

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {result.featured_image && (
          <div className="relative hidden w-32 flex-shrink-0 sm:block">
            <Image
              src={result.featured_image}
              alt={result.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant={result.type === "post" ? "default" : "secondary"}>
                {result.type === "post" ? "Article" : "Product"}
              </Badge>
              {result.categories?.slice(0, 1).map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
            <CardTitle className="line-clamp-1">
              <Link href={href} className="hover:text-primary transition-colors">
                {result.title}
              </Link>
            </CardTitle>
            {result.excerpt && (
              <CardDescription className="line-clamp-2">
                {result.excerpt.replace(/<[^>]*>/g, "")}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {result.type === "post" && result.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {result.author}
                  </div>
                )}
                {result.type === "post" && result.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(result.date)}
                  </div>
                )}
                {result.type === "product" && result.price && (
                  <span className="font-semibold text-primary">
                    €{result.price.toFixed(2)}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={href}>
                  View
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
