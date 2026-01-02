import { motion } from "framer-motion";
import { Crown, Lock, Presentation, Image, Video, Star, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const patronBenefits = [
  {
    icon: Presentation,
    title: "Exclusive Presentations",
    description: "Access to premium PowerPoint and Keynote presentations on implant dentistry topics.",
  },
  {
    icon: Image,
    title: "High-Resolution Photos",
    description: "Clinical photography ready for your presentations and educational materials.",
  },
  {
    icon: Video,
    title: "Premium Videos",
    description: "Extended surgical videos with detailed explanations and step-by-step guides.",
  },
  {
    icon: Star,
    title: "Early Access",
    description: "Get early access to new content, courses, and resources before anyone else.",
  },
];

const tiers = [
  {
    name: "Supporter",
    price: "$5",
    period: "/month",
    description: "Show your support and get access to exclusive content.",
    features: [
      "Access to patron-only posts",
      "Monthly newsletter",
      "Discord community access",
      "Name in credits",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$15",
    period: "/month",
    description: "Perfect for dental professionals who want premium resources.",
    features: [
      "Everything in Supporter",
      "Exclusive presentations",
      "High-res clinical photos",
      "Extended surgical videos",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$30",
    period: "/month",
    description: "For those who want the complete Periospot experience.",
    features: [
      "Everything in Professional",
      "1-on-1 monthly Q&A session",
      "Case review assistance",
      "Early access to courses",
      "Custom content requests",
    ],
    highlighted: false,
  },
];

const Patrons = () => {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full text-yellow-600 text-sm font-medium mb-6">
              <Crown size={16} />
              Become a Patron
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Periospot Patrons
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support Periospot and unlock exclusive content. Get access to premium presentations, 
              animations, and clinical photos ready for your use.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {patronBenefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Pricing Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Choose Your Tier
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl p-6 ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground border-2 border-primary scale-105"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl font-bold mb-2">
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display text-4xl font-bold">
                        {tier.price}
                      </span>
                      <span className={tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>
                        {tier.period}
                      </span>
                    </div>
                    <p className={`text-sm mt-2 ${tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {tier.description}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-center gap-2 text-sm ${
                          tier.highlighted ? "text-primary-foreground" : "text-foreground"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tier.highlighted ? "bg-primary-foreground" : "bg-primary"}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      tier.highlighted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : ""
                    }`}
                    variant={tier.highlighted ? "secondary" : "default"}
                  >
                    <Heart size={16} className="mr-2" />
                    Join Now
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Locked Content Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-secondary/50 border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-muted-foreground" size={24} />
              <h2 className="font-display text-xl font-bold text-foreground">
                Patron-Only Content Preview
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-background/50 border border-border rounded-xl p-4 relative overflow-hidden"
                >
                  <div className="aspect-video bg-secondary rounded-lg mb-3 flex items-center justify-center">
                    <Lock className="text-muted-foreground" size={32} />
                  </div>
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Patron Only
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Patrons;
