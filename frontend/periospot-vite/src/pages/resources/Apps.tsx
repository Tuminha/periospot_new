import { motion } from "framer-motion";
import { AppWindow, Video, Palette, MessageSquare, FileText, Cloud, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const appCategories = [
  {
    category: "Video & Editing",
    icon: Video,
    apps: [
      {
        name: "Final Cut Pro",
        description: "Professional video editing software for macOS with powerful tools for content creation.",
        link: "#",
      },
      {
        name: "DaVinci Resolve",
        description: "Free professional video editor with color correction and audio post-production.",
        link: "#",
      },
      {
        name: "ScreenFlow",
        description: "Screen recording and video editing for creating educational content.",
        link: "#",
      },
    ],
  },
  {
    category: "Design & Graphics",
    icon: Palette,
    apps: [
      {
        name: "Figma",
        description: "Collaborative design tool for UI/UX design and prototyping.",
        link: "#",
      },
      {
        name: "Canva",
        description: "Easy-to-use graphic design platform for social media and presentations.",
        link: "#",
      },
      {
        name: "Adobe Lightroom",
        description: "Photo editing software perfect for dental photography post-processing.",
        link: "#",
      },
    ],
  },
  {
    category: "Communication",
    icon: MessageSquare,
    apps: [
      {
        name: "Slack",
        description: "Team communication and collaboration platform.",
        link: "#",
      },
      {
        name: "Zoom",
        description: "Video conferencing for webinars and online meetings.",
        link: "#",
      },
      {
        name: "Discord",
        description: "Community platform for building engaged audiences.",
        link: "#",
      },
    ],
  },
  {
    category: "Productivity",
    icon: FileText,
    apps: [
      {
        name: "Notion",
        description: "All-in-one workspace for notes, docs, and project management.",
        link: "#",
      },
      {
        name: "Obsidian",
        description: "Knowledge base and note-taking with linked thinking.",
        link: "#",
      },
      {
        name: "Things 3",
        description: "Personal task manager for getting things done.",
        link: "#",
      },
    ],
  },
  {
    category: "Cloud & Storage",
    icon: Cloud,
    apps: [
      {
        name: "Dropbox",
        description: "Cloud storage and file synchronization service.",
        link: "#",
      },
      {
        name: "Google Drive",
        description: "Cloud storage with integration to Google Workspace.",
        link: "#",
      },
      {
        name: "iCloud",
        description: "Apple's cloud service for seamless device sync.",
        link: "#",
      },
    ],
  },
];

const Apps = () => {
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
              <AppWindow size={16} />
              Software & Tools
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Favorite Apps & Software
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              What apps do we use at Periospot? These resources may be extremely valuable 
              if you are working on marketing, social media, or remote teamwork.
            </p>
          </motion.div>

          {/* App Categories */}
          {appCategories.map((category, categoryIndex) => (
            <motion.section
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <category.icon className="text-primary" size={24} />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {category.category}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {category.apps.map((app, index) => (
                  <motion.div
                    key={app.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-elevated transition-all duration-300"
                  >
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {app.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {app.description}
                    </p>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <ExternalLink size={14} />
                      Learn More
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center mt-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Have a suggestion?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Know of an app or tool that should be on this list? Let us know!
            </p>
            <Button>Contact Us</Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Apps;
