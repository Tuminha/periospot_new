import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getAllProducts } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Tienda | Periospot - Dental Education Resources",
  description:
    "Explore our collection of dental education resources including speaker packs, animations, slide decks, and professional instruments for implantology and periodontics.",
  keywords: [
    "dental education",
    "speaker packs",
    "dental animations",
    "implantology resources",
    "periodontics education",
    "dental slide decks",
  ],
  openGraph: {
    title: "Tienda | Periospot - Dental Education Resources",
    description:
      "Explore our collection of dental education resources including speaker packs, animations, slide decks, and professional instruments.",
    url: "https://periospot.com/tienda",
    type: "website",
  },
}

// Revalidate every 24 hours
export const revalidate = 86400

export default async function TiendaPage() {
  const products = await getAllProducts()

  // Get unique product types for filtering
  const productTypes = [...new Set(products.map((p) => p.product_type))].filter(
    Boolean
  )

  // Group products by type
  const productsByType = productTypes.reduce(
    (acc, type) => {
      acc[type] = products.filter((p) => p.product_type === type)
      return acc
    },
    {} as Record<string, typeof products>
  )

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tienda
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Professional dental education resources for speakers, educators, and
            clinicians. High-quality animations, slide decks, and instruments.
          </p>

          {/* Category Pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {productTypes.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
              >
                {type} ({productsByType[type].length})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader className="p-0">
                  <Link href={`/tienda/${product.slug}`}>
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      {product.sale_price &&
                        product.sale_price < product.price && (
                          <Badge className="absolute right-2 top-2 bg-destructive">
                            Sale
                          </Badge>
                        )}
                    </div>
                  </Link>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col p-4">
                  {product.product_type && (
                    <Badge variant="outline" className="mb-2 w-fit text-xs">
                      {product.product_type}
                    </Badge>
                  )}
                  <Link href={`/tienda/${product.slug}`}>
                    <h2 className="line-clamp-2 font-semibold transition-colors hover:text-primary">
                      {product.title}
                    </h2>
                  </Link>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t p-4">
                  <div className="flex items-baseline gap-2">
                    {product.sale_price &&
                    product.sale_price < product.price ? (
                      <>
                        <span className="text-lg font-bold text-primary">
                          {product.sale_price.toFixed(0)}
                          {product.currency}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.price.toFixed(0)}
                          {product.currency}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {product.price.toFixed(0)}
                        {product.currency}
                      </span>
                    )}
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/tienda/${product.slug}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products by Category */}
      {productTypes.map((type) => (
        <section key={type} className="border-t py-12">
          <div className="container">
            <h2 className="mb-6 text-2xl font-bold">{type}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsByType[type].slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group flex flex-col overflow-hidden"
                >
                  <Link href={`/tienda/${product.slug}`}>
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/tienda/${product.slug}`}>
                      <h3 className="line-clamp-2 font-medium hover:text-primary">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="mt-1 font-semibold text-primary">
                      {(product.sale_price || product.price).toFixed(0)}
                      {product.currency}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {productsByType[type].length > 4 && (
              <div className="mt-6 text-center">
                <Button variant="outline">
                  View all {productsByType[type].length} {type} products
                </Button>
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  )
}
