import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Share2, ChevronLeft, ChevronRight, Twitter, Linkedin, Facebook, Link as LinkIcon, Mail } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatReadTime, getPostDetail, getPostsByLanguage } from "@/lib/legacyContent";

const getLanguageFromPath = (pathname: string) => {
  if (pathname.startsWith("/articles/spanish")) {
    return "es";
  }

  if (pathname.startsWith("/articles/portuguese")) {
    return "pt";
  }

  if (pathname.startsWith("/articles/chinese")) {
    return "zh";
  }

  return "en";
};


const BlogPost = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("");

  const language = useMemo(() => getLanguageFromPath(location.pathname), [location.pathname]);
  const post = useMemo(() => getPostDetail(slug, language), [language, slug]);
  const postsInLanguage = useMemo(() => getPostsByLanguage(language), [language]);
  const allPosts = useMemo(
    () => postsInLanguage.map((postItem) => ({ slug: postItem.slug, title: postItem.title })),
    [postsInLanguage]
  );
  const currentIndex = allPosts.findIndex((postItem) => postItem.slug === (slug || post?.slug));
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const relatedPosts = useMemo(
    () => postsInLanguage.filter((postItem) => postItem.slug !== post?.slug).slice(0, 3),
    [post?.slug, postsInLanguage]
  );
  const getDetailPath = (postSlug: string) => {
    if (language === "es") {
      return `/articles/spanish/${postSlug}`;
    }

    if (language === "pt") {
      return `/articles/portuguese/${postSlug}`;
    }

    if (language === "zh") {
      return `/articles/chinese/${postSlug}`;
    }

    return `/blog/${postSlug}`;
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Article not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This post is still being migrated. Please check back soon.
            </p>
            <Link to="/articles" className="text-primary font-medium hover:underline">
              Back to articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle scroll for TOC highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = post.tableOfContents.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(post.tableOfContents[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post.tableOfContents]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post.title;

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "The article link has been copied to your clipboard." });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span>/</span>
              <Link to={`/blog?category=${post.category}`} className="hover:text-foreground transition-colors">
                {post.category}
              </Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">{post.title}</span>
            </div>
          </motion.nav>

          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <article>
              {/* Article Header */}
              <motion.header
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-10"
              >
                <span className="inline-block text-xs font-medium tracking-widest uppercase text-primary mb-4">
                  {post.category}
                </span>
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-6">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-foreground font-medium text-sm">{post.authorAvatar}</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{post.author}</p>
                      <p className="text-xs">Periodontist</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(
                        post.date,
                        language === "es"
                          ? "es-ES"
                          : language === "pt"
                            ? "pt-PT"
                            : language === "zh"
                              ? "zh-CN"
                              : "en-US"
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatReadTime(post.readTimeMinutes, language)}
                    </span>
                  </div>
                </div>
              </motion.header>

              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mb-8"
              >
                <div className="aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Table of Contents - Below Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-card border border-border rounded-xl p-5 mb-10"
              >
                <h3 className="font-display text-base font-semibold text-foreground mb-3">
                  Table of Contents
                </h3>
                <nav className="flex flex-wrap gap-2">
                  {post.tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </motion.div>

              {/* Article Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="prose prose-lg max-w-none mb-12"
              >
                <div 
                  className="space-y-6 text-foreground/90 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_.lead]:text-xl [&_.lead]:text-muted-foreground [&_.lead]:leading-relaxed [&_.lead]:mb-8 [&_.lead]:font-light"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </motion.div>

              {/* Social Share */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="border-t border-b border-border py-6 mb-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm font-medium text-foreground">Share this article</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter size={18} />
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin size={18} />
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook size={18} />
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Copy link"
                    >
                      <LinkIcon size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Author Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card border border-border rounded-2xl p-6 mb-10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-foreground font-semibold text-lg">{post.authorAvatar}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {post.author}
                    </h3>
                    <p className="text-muted-foreground text-sm">{post.authorBio}</p>
                  </div>
                </div>
              </motion.div>

              {/* Prev/Next Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="grid grid-cols-2 gap-4 mb-16"
              >
                {prevPost ? (
                  <Link
                    to={getDetailPath(prevPost.slug)}
                    className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-soft transition-shadow"
                  >
                    <ChevronLeft size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Previous</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {prevPost.title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextPost ? (
                  <Link
                    to={getDetailPath(nextPost.slug)}
                    className="group flex items-center justify-end gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-soft transition-shadow text-right"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Next</p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {nextPost.title}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ) : (
                  <div />
                )}
              </motion.div>

              {/* Related Posts */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mb-16"
              >
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Related Articles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={getDetailPath(relatedPost.slug)}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-shadow"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-primary font-medium">{relatedPost.category}</span>
                        <h3 className="font-display text-sm font-semibold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatReadTime(relatedPost.readTimeMinutes, language)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>

              {/* Newsletter CTA */}
              <Newsletter />
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
