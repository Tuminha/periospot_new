import { Metadata } from "next"
import Link from "next/link"

import { getAllPosts, getAllCategories } from "@/lib/content"
import { Button } from "@/components/ui/button"
import BlogPostCard from "@/components/analytics/BlogPostCard"

export const metadata: Metadata = {
  title: "Blog em Português - Artigos de Educação Dental",
  description:
    "Artigos de especialistas sobre implantodontia, periodontia e odontologia estética. Fique atualizado com o conteúdo educacional odontológico mais recente.",
  openGraph: {
    title: "Blog em Português - Artigos de Educação Dental | Periospot",
    description:
      "Artigos de especialistas sobre implantodontia, periodontia e odontologia estética.",
    type: "website",
  },
  alternates: {
    canonical: "https://periospot.com/blog/pt",
    languages: {
      "en": "https://periospot.com/blog",
      "es": "https://periospot.com/blog/es",
      "pt": "https://periospot.com/blog/pt",
    },
  },
}

export const revalidate = 86400

export default async function BlogPtPage() {
  const posts = await getAllPosts()
  const categories = await getAllCategories()

  const publishedPosts = posts.filter(
    (post) => post.status === "publish" && post.language === "pt"
  )

  return (
    <div className="container py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog em Português</h1>
        <p className="text-xl text-muted-foreground">
          Artigos de especialistas sobre implantodontia, periodontia e odontologia estética.
          Aprenda com os principais profissionais do setor.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog">English</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog/es">Español</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/blog/pt">Português</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {publishedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum artigo encontrado em português.</p>
        </div>
      )}
    </div>
  )
}
