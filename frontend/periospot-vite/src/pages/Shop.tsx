import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, X, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Animations", "eBooks", "Courses", "Bundles", "Merchandise"];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rated", label: "Highest Rated" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-50", label: "Under $50" },
  { value: "50-100", label: "$50 - $100" },
  { value: "100-300", label: "$100 - $300" },
  { value: "300+", label: "Over $300" },
];

const mockProducts = [
  {
    id: 1,
    slug: "implant-surgery-animation-pack",
    title: "Complete Implant Surgery Animation Pack",
    price: 299,
    originalPrice: 399,
    category: "Animations",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    sales: 450,
    createdAt: "2025-12-01",
  },
  {
    id: 2,
    slug: "periodontal-disease-guide",
    title: "Periodontal Disease Management Guide",
    price: 79,
    category: "eBooks",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
    sales: 320,
    createdAt: "2025-11-15",
  },
  {
    id: 3,
    slug: "advanced-implantology-masterclass",
    title: "Advanced Implantology Masterclass",
    price: 499,
    originalPrice: 699,
    category: "Courses",
    rating: 5.0,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    sales: 890,
    createdAt: "2025-10-20",
  },
  {
    id: 4,
    slug: "bone-grafting-bundle",
    title: "Bone Grafting Techniques Bundle",
    price: 599,
    originalPrice: 899,
    category: "Bundles",
    rating: 4.7,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    sales: 210,
    createdAt: "2025-12-10",
  },
  {
    id: 5,
    slug: "soft-tissue-animations",
    title: "Soft Tissue Management Animations",
    price: 199,
    category: "Animations",
    rating: 4.9,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80",
    sales: 380,
    createdAt: "2025-11-28",
  },
  {
    id: 6,
    slug: "clinical-photography-course",
    title: "Clinical Photography for Dentists",
    price: 149,
    category: "Courses",
    rating: 4.6,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80",
    sales: 156,
    createdAt: "2025-09-05",
  },
  {
    id: 7,
    slug: "implant-planning-ebook",
    title: "Complete Guide to Implant Planning",
    price: 59,
    category: "eBooks",
    rating: 4.5,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80",
    sales: 245,
    createdAt: "2025-08-15",
  },
  {
    id: 8,
    slug: "periospot-lab-coat",
    title: "Periospot Premium Lab Coat",
    price: 89,
    category: "Merchandise",
    rating: 4.8,
    reviews: 34,
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80",
    sales: 120,
    createdAt: "2025-12-05",
  },
  {
    id: 9,
    slug: "sinus-lift-animation",
    title: "Sinus Lift Procedure Animation",
    price: 249,
    category: "Animations",
    rating: 4.7,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
    sales: 290,
    createdAt: "2025-10-01",
  },
  {
    id: 10,
    slug: "perio-surgery-masterclass",
    title: "Periodontal Surgery Masterclass",
    price: 449,
    originalPrice: 599,
    category: "Courses",
    rating: 4.9,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80",
    sales: 670,
    createdAt: "2025-11-01",
  },
  {
    id: 11,
    slug: "complete-perio-bundle",
    title: "Complete Periodontics Bundle",
    price: 799,
    originalPrice: 1199,
    category: "Bundles",
    rating: 5.0,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",
    sales: 340,
    createdAt: "2025-12-15",
  },
  {
    id: 12,
    slug: "patient-education-kit",
    title: "Patient Education Animation Kit",
    price: 179,
    category: "Animations",
    rating: 4.6,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80",
    sales: 198,
    createdAt: "2025-07-20",
  },
];

const PRODUCTS_PER_PAGE = 12;

const Shop = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter((product) =>
        product.title.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      products = products.filter((product) => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== "all") {
      products = products.filter((product) => {
        switch (priceRange) {
          case "0-50":
            return product.price < 50;
          case "50-100":
            return product.price >= 50 && product.price < 100;
          case "100-300":
            return product.price >= 100 && product.price < 300;
          case "300+":
            return product.price >= 300;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        products.sort((a, b) => b.sales - a.sales);
        break;
      case "rated":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return products;
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleAddToCart = (e: React.MouseEvent, product: typeof mockProducts[0]) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("newest");
    setPriceRange("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All" || priceRange !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Shop
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Premium educational resources for dental professionals. Animations, courses, and eBooks.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4 mb-10"
          >
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3">
                <Search size={20} className="text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                  className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-colors ${
                  showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Price Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => {
                            setPriceRange(range.value);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            priceRange === range.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Sort By
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Filters & Results Count */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>

          {/* Products Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * index }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-shadow"
                >
                  <Link to={`/shop/${product.slug}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.originalPrice && (
                        <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                        {product.category}
                      </span>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h2>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-accent text-accent" />
                          <span className="text-sm font-medium text-foreground">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-primary text-primary-foreground py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}

          {/* Pagination */}
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
                Previous
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
                Next
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
