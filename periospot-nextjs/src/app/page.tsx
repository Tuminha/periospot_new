import Header from "@/components/Header"
import Hero from "@/components/Hero"
import FeaturedPosts from "@/components/FeaturedPosts"
import Newsletter from "@/components/Newsletter"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedPosts />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
