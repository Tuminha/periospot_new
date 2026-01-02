import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, TrendingUp, Clock, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatReadTime, getPostsByLanguage } from "@/lib/legacyContent";

const sortOptions = [
  { value: "latest", label: "Recentes", icon: Clock },
  { value: "popular", label: "Populares", icon: Flame },
  { value: "trending", label: "Tendência", icon: TrendingUp },
];

const ALL_CATEGORY = "all";

const categoryLabels: Record<string, string> = {
  Implantology: "Implantologia",
  Periodontics: "Periodontia",
  Aesthetics: "Estetica",
  "Periospot for Patients": "Periospot para pacientes",
  Uncategorized: "Geral",
  General: "Geral",
};

const getCategoryLabel = (category: string) => categoryLabels[category] || category;

const POSTS_PER_PAGE = 12;

const ArticlesPortuguese = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const posts = useMemo(() => getPostsByLanguage("pt"), []);
  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(new Set(posts.map((post) => post.category)));
    return [
      { value: ALL_CATEGORY, label: "Todos" },
      ...uniqueCategories.map((category) => ({
        value: category,
        label: getCategoryLabel(category),
      })),
    ];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== ALL_CATEGORY) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "trending":
        filtered.sort((a, b) => b.views - a.views).slice(0, 6);
        break;
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

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
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl">🇵🇹🇧🇷</span>
              <span className="text-sm font-medium text-primary">Artigos em Português</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conhecimentos especializados, casos clínicos e as últimas pesquisas em periodontia e implantologia.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-4 mb-10"
          >
            <div className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Pesquisar artigos..."
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {categoryOptions.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowUpDown size={14} />
                  Ordenar:
                </span>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        sortBy === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Icon size={14} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-sm text-muted-foreground mb-6"
          >
            Mostrando {paginatedPosts.length} de {filteredPosts.length} artigos
          </motion.p>

          {paginatedPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * index }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-shadow"
                >
                  <Link to={`/articles/portuguese/${post.slug}`} className="block">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                        {getCategoryLabel(post.category)}
                      </span>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                            {post.authorAvatar}
                          </div>
                          <span className="text-sm text-muted-foreground">{post.author}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatReadTime(post.readTimeMinutes, "pt")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">Nenhum artigo encontrado com os critérios selecionados.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(ALL_CATEGORY);
                }}
                className="mt-4 text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </motion.div>
          )}

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center gap-2 mt-12"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticlesPortuguese;
