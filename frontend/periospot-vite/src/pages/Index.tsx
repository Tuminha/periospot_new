import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedPosts from "@/components/FeaturedPosts";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
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
  );
};

export default Index;
