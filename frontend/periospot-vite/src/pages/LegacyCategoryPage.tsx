import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatReadTime,
  getPostPath,
  getPostsByCategory,
} from "@/lib/legacyContent";

type LegacyCategoryPageProps = {
  title: string;
  description: string;
  category: string;
};

const LegacyCategoryPage = ({ title, description, category }: LegacyCategoryPageProps) => {
  const posts = getPostsByCategory(category);

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
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-5">
              Category Page
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
            <div className="mt-6">
              <Link to="/articles">
                <Button className="rounded-full">Browse all articles</Button>
              </Link>
            </div>
          </motion.div>

          {posts.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No posts are tagged with this category yet. We will add them during migration.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all"
                >
                  <Link to={getPostPath(post)} className="block h-full">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-medium text-primary">{post.category}</span>
                      <h2 className="font-display text-xl font-semibold text-foreground mt-2 mb-3">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt || "Full summary coming soon."}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(post.date, "en-US")}</span>
                        <span>{formatReadTime(post.readTimeMinutes, "en")}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegacyCategoryPage;
