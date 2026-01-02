import { motion } from "framer-motion";
import { Video, Camera, Mic, Lightbulb, Monitor, Settings, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const toolkitSections = [
  {
    title: "Camera Recommendations",
    icon: Camera,
    description: "The best cameras for webinars and online classes, from budget-friendly to professional.",
    items: [
      {
        name: "Logitech C920",
        price: "$79",
        description: "The gold standard for webcams. Full HD 1080p with great autofocus.",
        tier: "Budget",
      },
      {
        name: "Logitech StreamCam",
        price: "$149",
        description: "Premium webcam with 60fps and smart exposure.",
        tier: "Mid-Range",
      },
      {
        name: "Sony ZV-E10 + Capture Card",
        price: "$698+",
        description: "Professional quality with interchangeable lenses.",
        tier: "Professional",
      },
    ],
  },
  {
    title: "Lighting Setup",
    icon: Lightbulb,
    description: "Proper lighting makes a huge difference in video quality.",
    items: [
      {
        name: "Ring Light 18 inch",
        price: "$45",
        description: "Even, flattering light perfect for close-up presentations.",
        tier: "Budget",
      },
      {
        name: "Elgato Key Light Mini",
        price: "$99",
        description: "Compact LED panel with app control.",
        tier: "Mid-Range",
      },
      {
        name: "Elgato Key Light",
        price: "$199",
        description: "Professional LED panel with 2800 lumens.",
        tier: "Professional",
      },
    ],
  },
  {
    title: "Audio Equipment",
    icon: Mic,
    description: "Good audio is more important than video. Don't skip this.",
    items: [
      {
        name: "Blue Snowball",
        price: "$49",
        description: "Entry-level USB microphone with good sound quality.",
        tier: "Budget",
      },
      {
        name: "Blue Yeti",
        price: "$129",
        description: "Popular USB microphone with multiple pickup patterns.",
        tier: "Mid-Range",
      },
      {
        name: "Shure SM7B + Interface",
        price: "$400+",
        description: "Broadcast-quality microphone for the best sound.",
        tier: "Professional",
      },
    ],
  },
  {
    title: "Software Tools",
    icon: Monitor,
    description: "The software that powers professional webinars and online classes.",
    items: [
      {
        name: "Zoom",
        price: "$0-$20/mo",
        description: "The most popular video conferencing platform.",
        tier: "Essential",
      },
      {
        name: "OBS Studio",
        price: "Free",
        description: "Free software for streaming and recording with advanced features.",
        tier: "Essential",
      },
      {
        name: "StreamYard",
        price: "$25/mo",
        description: "Browser-based streaming with professional overlays.",
        tier: "Professional",
      },
    ],
  },
];

const bestPractices = [
  "Position your camera at eye level for natural engagement",
  "Ensure your face is well-lit from the front, not behind",
  "Use a clean, uncluttered background or virtual backdrop",
  "Test your audio before every session",
  "Have a backup internet connection ready",
  "Practice your presentation flow beforehand",
  "Keep slides simple with minimal text",
  "Engage with your audience through Q&A",
];

const WebinarsToolkit = () => {
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
              <Video size={16} />
              Complete Guide
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Webinars & Online Classes Toolkit
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to perform great videos, webinars, and online classes from home. 
              Recommendations for every budget.
            </p>
          </motion.div>

          {/* Toolkit Sections */}
          {toolkitSections.map((section, sectionIndex) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * sectionIndex }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <section.icon className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {section.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-elevated transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-secondary-foreground">
                        {item.tier}
                      </span>
                      <span className="font-display text-lg font-bold text-primary">
                        {item.price}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary p-0">
                      <ExternalLink size={14} />
                      View Product
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Best Practices */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Settings className="text-primary" size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Best Practices
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {bestPractices.map((practice, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-background/50 rounded-xl p-4"
                >
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground">{practice}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WebinarsToolkit;
