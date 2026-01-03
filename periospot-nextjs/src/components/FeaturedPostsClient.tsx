"use client"

import { motion } from "framer-motion"
import { ArrowRight, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Post = {
  id: string
  category: string
  title: string
  excerpt: string
  readTime: string
  image?: string
  featured?: boolean
  slug: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const FeaturedPosts = ({ posts }: { posts: Post[] }) => {
  const featuredPost = posts.find((p) => p.featured)
  const regularPosts = posts.filter((p) => !p.featured)

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Featured Stories
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Handpicked articles to spark your curiosity
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Featured Post - Large with image background */}
          {featuredPost && (
            <motion.article
              variants={itemVariants}
              className="group lg:row-span-2 relative overflow-hidden rounded-2xl shadow-soft hover:shadow-elevated transition-shadow duration-500"
            >
              <Link href={`/blog/${featuredPost.slug}`} className="block h-full">
                <div className="absolute inset-0">
                  {featuredPost.image ? (
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                </div>
                <div className="relative h-full min-h-[500px] lg:min-h-full flex flex-col justify-end p-8">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium mb-4 w-fit">
                    {featuredPost.category}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-background mb-3 leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-background/80 mb-4 line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-background/70 text-sm">
                      <Clock size={14} />
                      {featuredPost.readTime}
                    </span>
                    <motion.span
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-background font-medium text-sm cursor-pointer"
                    >
                      Read More <ArrowRight size={16} />
                    </motion.span>
                  </div>
                </div>
              </Link>
            </motion.article>
          )}

          {/* Regular Posts */}
          <div className="grid gap-6">
            {regularPosts.slice(0, 2).map((post) => (
              <motion.article
                key={post.id}
                variants={itemVariants}
                className="group flex gap-5 bg-card rounded-xl p-4 shadow-soft hover:shadow-elevated transition-all duration-500"
              >
                <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg relative">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="128px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-primary text-xs font-medium mb-2">
                    {post.category}
                  </span>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {regularPosts.slice(2).map((post) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500"
            >
              <div className="h-48 overflow-hidden relative">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted" />
                )}
              </div>
              <div className="p-5">
                <span className="text-primary text-xs font-medium">
                  {post.category}
                </span>
                <h3 className="font-display text-xl font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock size={12} />
                  {post.readTime}
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedPosts
