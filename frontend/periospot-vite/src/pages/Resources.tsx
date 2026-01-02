import { motion } from "framer-motion";
import { Laptop, AppWindow, Crown, Video, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const resourceCategories = [
  {
    id: "workstation",
    title: "Cisco's Workstation",
    description: "Discover the equipment and gadgets used at Periospot. Camera, computer, microphone, and more professional tools.",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&h=400&fit=crop",
    link: "/resources/workstation",
    items: [
      "MacBook Pro 16\"",
      "Sony A7 III Camera",
      "Rode NT-USB Microphone",
      "Elgato Key Light",
      "LG UltraFine 5K Display",
    ],
  },
  {
    id: "apps",
    title: "Favorite Apps & Software",
    description: "What apps do we use at Periospot? Discover tools for marketing, social media, content creation, and remote teamwork.",
    icon: AppWindow,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop",
    link: "/resources/apps",
    items: [
      "Notion for organization",
      "Figma for design",
      "Final Cut Pro for video",
      "Canva for graphics",
      "Slack for communication",
    ],
  },
  {
    id: "patrons",
    title: "Periospot Patrons Page",
    description: "Exclusive content for Periospot Patrons. Unlock presentations, animations, and pictures ready for your use.",
    icon: Crown,
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
    link: "/resources/patrons",
    items: [
      "Exclusive presentations",
      "Premium animations",
      "High-res clinical photos",
      "Early access to content",
      "Community access",
    ],
  },
  {
    id: "webinars",
    title: "Webinars & Online Classes Toolkit",
    description: "The complete kit we recommend to perform great videos, webinars and online classes from home.",
    icon: Video,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop",
    link: "/resources/webinars-toolkit",
    items: [
      "Camera recommendations",
      "Lighting setup guide",
      "Audio equipment",
      "Software tools",
      "Best practices",
    ],
  },
];

const Resources = () => {
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
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Resources Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Valuable assets to help you grow in your personal and professional career. 
              From equipment recommendations to exclusive content.
            </p>
          </motion.div>

          {/* Resource Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {resourceCategories.map((category, index) => (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <category.icon className="text-primary" size={24} />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {category.title}
                    </h2>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>

                  {/* Items Preview */}
                  <ul className="space-y-2 mb-6">
                    {category.items.slice(0, 3).map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {item}
                      </li>
                    ))}
                    {category.items.length > 3 && (
                      <li className="text-sm text-primary">
                        +{category.items.length - 3} more items
                      </li>
                    )}
                  </ul>

                  <Link to={category.link}>
                    <Button className="w-full gap-2">
                      View Resource
                      <ExternalLink size={16} />
                    </Button>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Get Weekly Resources
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Subscribe to our newsletter and receive free ebooks, articles, videos, 
              infographics and much more content directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button size="lg">Subscribe</Button>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
