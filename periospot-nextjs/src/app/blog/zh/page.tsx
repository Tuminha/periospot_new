import { Metadata } from "next"
import Link from "next/link"

import { getAllPosts, getAllCategories } from "@/lib/content"
import { Button } from "@/components/ui/button"
import BlogPostCard from "@/components/analytics/BlogPostCard"

export const metadata: Metadata = {
  title: "中文博客 - 牙科教育文章",
  description:
    "关于种植学、牙周病学和美容牙科的专家文章。了解最新的牙科教育内容。",
  openGraph: {
    title: "中文博客 - 牙科教育文章 | Periospot",
    description:
      "关于种植学、牙周病学和美容牙科的专家文章。",
    type: "website",
  },
  alternates: {
    canonical: "https://periospot.com/blog/zh",
    languages: {
      "en": "https://periospot.com/blog",
      "es": "https://periospot.com/blog/es",
      "pt": "https://periospot.com/blog/pt",
      "zh": "https://periospot.com/blog/zh",
    },
  },
}

export const revalidate = 86400

export default async function BlogZhPage() {
  const posts = await getAllPosts()
  const categories = await getAllCategories()

  const publishedPosts = posts.filter(
    (post) => post.status === "publish" && post.language === "zh"
  )

  return (
    <div className="container py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold mb-4">中文博客</h1>
        <p className="text-xl text-muted-foreground">
          关于种植学、牙周病学和美容牙科的专家文章。向该领域的领先专业人士学习。
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog">English</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog/es">Español</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog/pt">Português</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/blog/zh">中文</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {publishedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">未找到中文文章。</p>
        </div>
      )}
    </div>
  )
}
