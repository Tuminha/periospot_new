import { motion } from "framer-motion";
import { Target, Users, Award, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const values = [
  {
    icon: Target,
    title: "Expert-Led Education",
    description: "All content is created and reviewed by leading specialists in periodontics and implantology.",
  },
  {
    icon: Users,
    title: "Global Community",
    description: "Join thousands of dental professionals worldwide who trust Periospot for their continuing education.",
  },
  {
    icon: Award,
    title: "CE Credits",
    description: "Earn continuing education credits through our accredited courses and assessments.",
  },
  {
    icon: BookOpen,
    title: "Practical Learning",
    description: "Our resources focus on real-world clinical applications you can implement immediately.",
  },
];

const stats = [
  { value: "15K+", label: "Subscribers" },
  { value: "80+", label: "Articles" },
  { value: "40+", label: "Products" },
  { value: "15", label: "Assessments" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              About Periospot
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              We're dedicated to advancing dental education through high-quality, 
              accessible resources for periodontics and implantology professionals worldwide.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center p-6 bg-card border border-border rounded-2xl">
                <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-20"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Periospot was founded with a simple mission: to make expert-level dental education 
                accessible to practitioners everywhere. We believe that continuous learning is the 
                foundation of excellent patient care.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Through our carefully curated content—from detailed animations and comprehensive 
                courses to evidence-based articles—we empower dental professionals to stay at the 
                forefront of their field.
              </p>
            </div>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
              <span className="text-8xl">🦷</span>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground text-center mb-12">
              Why Choose Periospot
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="p-6 bg-card border border-border rounded-2xl text-center"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center bg-card border border-border rounded-3xl p-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Ready to advance your practice?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join our community of dental professionals and get access to premium educational resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/shop"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                Explore Courses
              </a>
              <a
                href="/contact"
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-medium hover:bg-secondary/80 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
