"use client"

import Image from "next/image"
import Link from "next/link"

import type { Post } from "@/lib/content"
import { PerioAnalytics } from "@/lib/analytics"

const getPrimaryCategory = (post: Post) => post.categories?.[0] ?? "general"

export default function RelatedPostCard({ post }: { post: Post }) {
  const href = `/blog/${post.slug}`
  const category = getPrimaryCategory(post)
  const readTime = Math.ceil((post.content?.split(/\s+/).length || 0) / 200)

  const handleClick = () => {
    PerioAnalytics.trackArticleClick({
      articleSlug: post.slug,
      category,
      location: "related_articles",
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-shadow"
    >
      {post.featuredImage ? (
        <div className="aspect-video overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
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
        {post.categories?.[0] && (
          <span className="text-xs text-primary font-medium">
            {post.categories[0]}
          </span>
        )}
        <h3 className="font-display text-sm font-semibold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <span className="text-xs text-muted-foreground">
          {readTime} min read
        </span>
      </div>
    </Link>
  )
}
