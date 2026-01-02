import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Check, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const mockProduct = {
  id: 1,
  slug: "implant-placement-animation",
  title: "Implant Placement Animation - Complete Series",
  description: "High-quality 3D animations showing step-by-step implant placement procedures. Perfect for patient education and professional presentations.",
  longDescription: "This comprehensive animation series covers every aspect of dental implant placement, from initial assessment to final restoration. Each animation is rendered in stunning 4K quality with accurate anatomical detail.",
  price: 49.99,
  originalPrice: 79.99,
  category: "Animations",
  rating: 4.9,
  reviews: 124,
  images: [
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop",
  ],
  features: [
    { icon: "duration", label: "Duration", value: "45 minutes" },
    { icon: "format", label: "Format", value: "MP4, 4K" },
    { icon: "language", label: "Language", value: "English" },
    { icon: "credits", label: "CE Credits", value: "2 credits" },
  ],
  includes: [
    "10 individual animation clips",
    "Full procedure overview video",
    "Downloadable patient handouts",
    "Presenter notes and script",
    "Lifetime access",
    "Free updates",
  ],
  tags: ["Implantology", "Animation", "Patient Education"],
};

const relatedProducts = [
  {
    id: 2,
    slug: "sinus-lift-animation",
    title: "Sinus Lift Procedure Animation",
    price: 39.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    slug: "bone-grafting-masterclass",
    title: "Bone Grafting Masterclass",
    price: 199.99,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    slug: "gtr-membrane-animation",
    title: "GTR Membrane Animation",
    price: 29.99,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=300&fit=crop",
  },
];

const ProductDetail = () => {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity}x ${mockProduct.title} has been added to your cart.`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? `${mockProduct.title} has been removed from your wishlist.`
        : `${mockProduct.title} has been added to your wishlist.`,
    });
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % mockProduct.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + mockProduct.images.length) % mockProduct.images.length);
  };

  const discountPercentage = mockProduct.originalPrice 
    ? Math.round((1 - mockProduct.price / mockProduct.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
              <span>/</span>
              <Link to={`/shop?category=${mockProduct.category}`} className="hover:text-foreground transition-colors">
                {mockProduct.category}
              </Link>
              <span>/</span>
              <span className="text-foreground">{mockProduct.title}</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-card">
                <img
                  src={mockProduct.images[selectedImage]}
                  alt={mockProduct.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-destructive text-destructive-foreground text-sm font-medium rounded-full">
                      -{discountPercentage}%
                    </span>
                  </div>
                )}

                {/* Preview Button */}
                <button className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-background transition-colors">
                  <Play size={16} />
                  Preview First 30 Seconds
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {mockProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index 
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${mockProduct.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mockProduct.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {mockProduct.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(mockProduct.rating) ? "fill-accent text-accent" : "text-muted"}
                    />
                  ))}
                </div>
                <span className="text-foreground font-medium">{mockProduct.rating}</span>
                <span className="text-muted-foreground">({mockProduct.reviews} reviews)</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {mockProduct.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {mockProduct.features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                    <div className="text-sm">
                      <p className="text-muted-foreground">{feature.label}</p>
                      <p className="font-medium text-foreground">{feature.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  ${mockProduct.price}
                </span>
                {mockProduct.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${mockProduct.originalPrice}
                  </span>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-foreground hover:bg-secondary/50 rounded-l-full transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 text-foreground font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-foreground hover:bg-secondary/50 rounded-r-full transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-full border transition-colors ${
                    isWishlisted 
                      ? "bg-destructive/10 border-destructive text-destructive" 
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                </button>

                {/* Share */}
                <button
                  className="p-3 rounded-full border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* What's Included */}
              <div className="p-6 bg-card border border-border rounded-2xl">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {mockProduct.includes.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-muted-foreground">
                      <Check size={18} className="text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
              Related Products
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/shop/${product.slug}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-shadow"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-foreground">
                        ${product.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-accent text-accent" />
                        <span className="text-sm text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
