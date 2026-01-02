"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, FileText, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/content"

interface ProductsSectionProps {
  products: Product[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const getProductIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "animation":
    case "animations":
      return Play
    case "presentation":
    case "presentations":
      return FileText
    default:
      return Package
  }
}

const ProductsSection = ({ products }: ProductsSectionProps) => {
  if (!products || products.length === 0) return null

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
            >
              Shop
            </motion.span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Educational Products
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              High-quality animations and presentations for your lectures
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full font-medium hover:shadow-elevated transition-all group"
            >
              Shop All
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => {
            const Icon = getProductIcon(product.product_type)
            const hasDiscount =
              product.sale_price && product.sale_price < product.price

            return (
              <motion.article
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <Link href={`/tienda/${product.slug}`} className="block">
                  <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-500">
                    <div className="aspect-square relative bg-secondary/50">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium text-primary mb-2 block uppercase tracking-wide">
                        {product.product_type || "Product"}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="font-bold text-primary text-lg">
                              {product.sale_price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-lg">
                            {product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default ProductsSection
