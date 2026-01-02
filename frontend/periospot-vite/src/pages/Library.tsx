import { motion } from "framer-motion";
import { Download, BookOpen, FileText, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const ebooks = [
  {
    id: 1,
    title: "The 17 Immutable Laws In Implant Dentistry",
    description: "Update of the scientific literature about implant dentistry. Different topics and recommendations. Full of illustrations and photos.",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop",
    downloadLink: "#",
    isFree: true,
  },
  {
    id: 2,
    title: "Guided Bone Regeneration In Implant Dentistry",
    description: "A simple guide with the most common guided bone regeneration procedures. Everything explained with photos and illustrations.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    downloadLink: "#",
    isFree: true,
  },
  {
    id: 3,
    title: "Connective Tissue Grafts Harvesting Techniques",
    description: "Tips and fundamentals to get started with connective tissue grafts in your daily practice. Learn from the masters.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    downloadLink: "#",
    isFree: true,
  },
  {
    id: 4,
    title: "10 Tips About Aesthetic Implant Dentistry",
    description: "The ideal ebook to start understanding the basics of implant dentistry from a biological and clinical point of view.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop",
    downloadLink: "#",
    isFree: true,
  },
  {
    id: 5,
    title: "Guided Bone Regeneration iBook",
    description: "The complete guide about guided bone regeneration in implant dentistry. Includes surgery videos, animations, and clinical cases.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
    downloadLink: "#",
    isFree: false,
    price: "€9.99",
  },
  {
    id: 6,
    title: "Immediate Implants iBook",
    description: "Everything you need to know about immediate implant placement. Step-by-step procedures with detailed illustrations.",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=400&fit=crop",
    downloadLink: "#",
    isFree: false,
    price: "€12.99",
  },
];

const Library = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <BookOpen size={16} />
              Free Resources
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Periospot Library
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The best ebooks and resources about Implant Dentistry, Periodontics, and Aesthetic Dentistry. 
              Download free guides and start learning today.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { label: "Free Ebooks", value: "10+" },
              { label: "Downloads", value: "50K+" },
              { label: "Languages", value: "4" },
              { label: "Topics Covered", value: "25+" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="font-display text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Free Ebooks Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <FileText className="text-primary" size={24} />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Free Ebooks
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ebooks
                .filter((ebook) => ebook.isFree)
                .map((ebook, index) => (
                  <motion.article
                    key={ebook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-secondary/20">
                      <img
                        src={ebook.image}
                        alt={ebook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium mb-3">
                        Free
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        {ebook.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {ebook.description}
                      </p>
                      <Button className="w-full gap-2">
                        <Download size={16} />
                        Download Free Ebook
                      </Button>
                    </div>
                  </motion.article>
                ))}
            </div>
          </motion.section>

          {/* Premium Ebooks Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="text-primary" size={24} />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Premium iBooks
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ebooks
                .filter((ebook) => !ebook.isFree)
                .map((ebook, index) => (
                  <motion.article
                    key={ebook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-secondary/20">
                      <img
                        src={ebook.image}
                        alt={ebook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">
                        {ebook.price}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        {ebook.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {ebook.description}
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        <ExternalLink size={16} />
                        Buy iBook
                      </Button>
                    </div>
                  </motion.article>
                ))}
            </div>
          </motion.section>

          {/* Language Options */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 bg-card border border-border rounded-2xl p-8 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Available in Multiple Languages
            </h2>
            <p className="text-muted-foreground mb-6">
              Our library is available in English, Spanish, Portuguese, and Chinese.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { flag: "🇬🇧🇺🇸", label: "English" },
                { flag: "🇪🇸", label: "Español" },
                { flag: "🇵🇹🇧🇷", label: "Português" },
                { flag: "🇨🇳", label: "中文" },
              ].map((lang) => (
                <Button key={lang.label} variant="outline" className="gap-2">
                  <span>{lang.flag}</span>
                  {lang.label}
                </Button>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Library;
