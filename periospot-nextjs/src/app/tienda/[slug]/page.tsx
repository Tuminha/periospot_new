import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllProducts, getProductBySlug } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ShoppingCart, Download, Package } from "lucide-react"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

// Generate metadata for each product
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found | Periospot",
    }
  }

  return {
    title: `${product.title} | Periospot Tienda`,
    description: product.description.slice(0, 160),
    keywords: [
      product.product_type,
      "dental education",
      "periodontics",
      "implantology",
      product.brand,
    ].filter(Boolean),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      url: `https://periospot.com/tienda/${product.slug}`,
      type: "website",
      images: product.featured_image_url
        ? [
            {
              url: product.featured_image_url,
              width: 1200,
              height: 630,
              alt: product.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.featured_image_url ? [product.featured_image_url] : [],
    },
  }
}

// Revalidate every 24 hours
export const revalidate = 86400

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Get related products (same type)
  const allProducts = await getAllProducts()
  const relatedProducts = allProducts
    .filter((p) => p.product_type === product.product_type && p.id !== product.id)
    .slice(0, 4)

  // JSON-LD Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featured_image_url,
    brand: {
      "@type": "Brand",
      name: product.brand || "Periospot",
    },
    offers: {
      "@type": "Offer",
      url: `https://periospot.com/tienda/${product.slug}`,
      priceCurrency: product.currency,
      price: product.sale_price || product.price,
      availability:
        product.stock_status === "in stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Periospot",
      },
    },
    category: product.product_type,
  }

  const isDigital =
    product.product_type === "Animations" ||
    product.product_type === "Speaker Packs"

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="min-h-screen py-8">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/tienda"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Tienda
            </Link>
          </nav>

          {/* Product Details */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {product.featured_image_url ? (
                  <Image
                    src={product.featured_image_url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                {product.sale_price && product.sale_price < product.price && (
                  <Badge className="absolute left-4 top-4 bg-destructive">
                    Sale
                  </Badge>
                )}
              </div>

              {/* Gallery Images */}
              {product.gallery_images && product.gallery_images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.gallery_images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-md bg-muted"
                    >
                      <Image
                        src={img}
                        alt={`${product.title} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.product_type && (
                  <Badge variant="outline" className="mb-3">
                    {product.product_type}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold tracking-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {product.sale_price && product.sale_price < product.price ? (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      {product.sale_price.toFixed(2)} {product.currency}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {product.price.toFixed(2)} {product.currency}
                    </span>
                    <Badge variant="destructive">
                      {Math.round(
                        ((product.price - product.sale_price) / product.price) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {product.price.toFixed(2)} {product.currency}
                  </span>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <Separator />

              {/* Product Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Product Details</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Brand:</dt>
                  <dd className="font-medium">{product.brand || "Periospot"}</dd>

                  <dt className="text-muted-foreground">Type:</dt>
                  <dd className="font-medium">{product.product_type}</dd>

                  <dt className="text-muted-foreground">Availability:</dt>
                  <dd className="font-medium">
                    <Badge
                      variant={
                        product.stock_status === "in stock"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {product.stock_status}
                    </Badge>
                  </dd>

                  <dt className="text-muted-foreground">Delivery:</dt>
                  <dd className="font-medium">
                    {isDigital ? "Instant Download" : "Physical Shipping"}
                  </dd>
                </dl>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                {product.link && (
                  <Button variant="outline" size="lg" asChild>
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {isDigital ? (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Buy Now
                        </>
                      ) : (
                        <>
                          <Package className="mr-2 h-5 w-5" />
                          View on Store
                        </>
                      )}
                    </a>
                  </Button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure Payment
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quality Guaranteed
                </span>
                {isDigital && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Instant Download
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="group overflow-hidden"
                  >
                    <Link href={`/tienda/${relatedProduct.slug}`}>
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {relatedProduct.featured_image_url ? (
                          <Image
                            src={relatedProduct.featured_image_url}
                            alt={relatedProduct.title}
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
                      <Link href={`/tienda/${relatedProduct.slug}`}>
                        <h3 className="line-clamp-2 font-medium hover:text-primary">
                          {relatedProduct.title}
                        </h3>
                      </Link>
                      <p className="mt-2 font-semibold text-primary">
                        {(
                          relatedProduct.sale_price || relatedProduct.price
                        ).toFixed(0)}{" "}
                        {relatedProduct.currency}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
