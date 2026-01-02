import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export type LegacyPageSection = {
  title: string;
  body: string;
};

export type LegacyPageContent = {
  title: string;
  description: string;
  badge?: string;
  sections?: LegacyPageSection[];
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
};

const LegacyPage = ({
  title,
  description,
  badge,
  sections = [],
  primaryCta,
  secondaryCta,
}: LegacyPageContent) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {badge && (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-5">
                {badge}
              </span>
            )}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>

            {(primaryCta || secondaryCta) && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                {primaryCta && (
                  <Link to={primaryCta.to}>
                    <Button className="rounded-full px-6">{primaryCta.label}</Button>
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    to={secondaryCta.to}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {sections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="bg-card border border-border rounded-2xl p-6 shadow-soft"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground">
              This page is part of the WordPress migration and will be populated with full content soon.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegacyPage;
