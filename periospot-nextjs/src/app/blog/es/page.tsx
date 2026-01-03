import { Metadata } from "next"
import Link from "next/link"

import { getAllPosts, getAllCategories } from "@/lib/content"
import { Button } from "@/components/ui/button"
import BlogPostCard from "@/components/analytics/BlogPostCard"

export const metadata: Metadata = {
  title: "Blog en Español - Artículos de Educación Dental",
  description:
    "Artículos de expertos sobre implantología, periodoncia y odontología estética. Mantente actualizado con el contenido educativo dental más reciente.",
  openGraph: {
    title: "Blog en Español - Artículos de Educación Dental | Periospot",
    description:
      "Artículos de expertos sobre implantología, periodoncia y odontología estética.",
    type: "website",
  },
  alternates: {
    canonical: "https://periospot.com/blog/es",
    languages: {
      "en": "https://periospot.com/blog",
      "es": "https://periospot.com/blog/es",
      "pt": "https://periospot.com/blog/pt",
    },
  },
}

export const revalidate = 86400

export default async function BlogEsPage() {
  const posts = await getAllPosts()
  const categories = await getAllCategories()

  const publishedPosts = posts.filter(
    (post) => post.status === "publish" && post.language === "es"
  )

  return (
    <div className="container py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog en Español</h1>
        <p className="text-xl text-muted-foreground">
          Artículos de expertos sobre implantología, periodoncia y odontología estética.
          Aprende de los principales profesionales del sector.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog">English</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/blog/es">Español</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
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
          <p className="text-muted-foreground">No se encontraron artículos en español.</p>
        </div>
      )}
    </div>
  )
}
