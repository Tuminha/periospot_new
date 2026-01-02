import Header from "@/components/Header"
import Hero from "@/components/Hero"
import FeaturedPosts from "@/components/FeaturedPosts"
import Newsletter from "@/components/Newsletter"
import Footer from "@/components/Footer"
import FeaturesSection from "@/components/FeaturesSection"
import ProductsSection from "@/components/ProductsSection"
import CTASection from "@/components/CTASection"
import { getFeaturedPosts, getAllProducts } from "@/lib/content"

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts(6)
  const products = await getAllProducts()
  const featuredProducts = products.slice(0, 4)

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
        <FeaturedPosts />
        <ProductsSection products={featuredProducts} />
        <Newsletter />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
