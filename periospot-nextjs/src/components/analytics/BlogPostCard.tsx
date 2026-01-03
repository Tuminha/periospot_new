"use client"

import Image from "next/image"
import Link from "next/link"

import type { Post } from "@/lib/content"
import { PerioAnalytics } from "@/lib/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const getPrimaryCategory = (post: Post) => post.categories?.[0] ?? "general"

export default function BlogPostCard({ post }: { post: Post }) {
  const href = `/blog/${post.slug}`
  const category = getPrimaryCategory(post)

  const handleClick = () => {
    PerioAnalytics.trackArticleClick({
      articleSlug: post.slug,
      category,
      location: "blog_listing",
    })
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {post.featuredImage && (
        <Link href={href} onClick={handleClick} className="block aspect-video relative bg-muted">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
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
          <Link href={href} onClick={handleClick} className="hover:text-primary">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.excerpt?.replace(/<[^>]*>/g, "") || ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {typeof post.author === "string" ? post.author : post.author?.name || "Periospot"}
          </span>
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
