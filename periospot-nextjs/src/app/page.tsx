import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, GraduationCap, ShoppingBag, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFeaturedPosts, getAllProducts } from "@/lib/content"

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts(6)
  const products = await getAllProducts()
  const featuredProducts = products.slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Dental Education Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Where Learning{" "}
              <span className="text-primary">Dentistry</span> is Easy
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Advance your dental career with expert content on implantology,
              periodontics, and aesthetic dentistry. Join thousands of professionals
              learning with Periospot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/assessments">
                  Take Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog">Explore Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Learn Your Way</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to advance your dental knowledge and skills
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={BookOpen}
              title="Expert Articles"
              description="In-depth articles on implantology, periodontics, and aesthetic dentistry"
              href="/blog"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Assessments"
              description="Test your knowledge with interactive quizzes and get certified"
              href="/assessments"
            />
            <FeatureCard
              icon={ShoppingBag}
              title="Educational Shop"
              description="Animations, presentations, and educational packages"
              href="/tienda"
            />
            <FeatureCard
              icon={Award}
              title="Free Resources"
              description="eBooks, guides, and downloadable resources"
              href="/library"
            />
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Articles</h2>
              <p className="text-muted-foreground">
                Stay updated with the latest in dental education
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Educational Products</h2>
              <p className="text-muted-foreground">
                High-quality animations and presentations for your lectures
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/tienda">
                Shop All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Take our free implant dentistry assessment and see where you stand
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/assessments">
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center"
        >
          Learn More <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.featuredImage && (
        <div className="aspect-video relative bg-muted">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex gap-2 mb-2">
          {post.categories?.slice(0, 2).map((cat: string) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
        <CardTitle className="line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{post.author?.name || "Periospot"}</span>
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {product.featured_image_url && (
        <div className="aspect-square relative bg-muted">
          <Image
            src={product.featured_image_url}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      )}
      <CardHeader>
        <Badge variant="outline" className="w-fit text-xs mb-2">
          {product.product_type}
        </Badge>
        <CardTitle className="text-base line-clamp-2">
          <Link href={`/tienda/${product.slug}`} className="hover:text-primary">
            {product.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {product.sale_price && product.sale_price < product.price ? (
            <>
              <span className="font-bold text-primary">
                €{product.sale_price}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                €{product.price}
              </span>
            </>
          ) : (
            <span className="font-bold">€{product.price}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
