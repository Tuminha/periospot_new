import { motion } from "framer-motion";
import { Laptop, Monitor, Camera, Mic, Lightbulb, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const workstationItems = [
  {
    category: "Computer",
    items: [
      {
        name: 'MacBook Pro 16"',
        description: "M3 Max chip, 64GB RAM, 1TB SSD - Perfect for video editing and heavy workflows",
        link: "#",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
      },
      {
        name: "LG UltraFine 5K Display",
        description: "27-inch 5K Retina display with Thunderbolt 3 connectivity",
        link: "#",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
      },
    ],
    icon: Monitor,
  },
  {
    category: "Camera",
    items: [
      {
        name: "Sony A7 IV",
        description: "Full-frame mirrorless camera for professional dental photography",
        link: "#",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
      },
      {
        name: "Sony 90mm f/2.8 Macro",
        description: "The perfect lens for detailed intraoral photography",
        link: "#",
        image: "https://images.unsplash.com/photo-1606986628253-e3e3f45e0f5d?w=400&h=300&fit=crop",
      },
    ],
    icon: Camera,
  },
  {
    category: "Audio",
    items: [
      {
        name: "Rode NT-USB",
        description: "USB condenser microphone for podcasting and webinars",
        link: "#",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop",
      },
      {
        name: "Sony WH-1000XM5",
        description: "Noise-canceling headphones for focused work",
        link: "#",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      },
    ],
    icon: Mic,
  },
  {
    category: "Lighting",
    items: [
      {
        name: "Elgato Key Light",
        description: "Professional LED panel for video calls and content creation",
        link: "#",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      },
      {
        name: "Ring Light 18 inch",
        description: "Even lighting for dental photography and video",
        link: "#",
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=300&fit=crop",
      },
    ],
    icon: Lightbulb,
  },
];

const Workstation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Laptop size={16} />
              Cisco's Setup
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Cisco's Workstation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the equipment and gadgets used at Periospot. From cameras to computers, 
              here's everything that powers our content creation.
            </p>
          </motion.div>

          {/* Categories */}
          {workstationItems.map((category, categoryIndex) => (
            <motion.section
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <category.icon className="text-primary" size={24} />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {category.category}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.description}
                      </p>
                      <Button variant="outline" className="gap-2">
                        <ExternalLink size={16} />
                        View Product
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-secondary/50 border border-border rounded-2xl p-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              <strong>Disclosure:</strong> Some links on this page are affiliate links. 
              This means we may earn a small commission if you make a purchase through these links, 
              at no additional cost to you. This helps support Periospot and allows us to continue 
              creating free educational content.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workstation;
