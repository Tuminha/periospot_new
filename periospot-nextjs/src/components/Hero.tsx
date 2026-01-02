"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

// Local video in public folder
const HERO_VIDEO_URL = "/videos/hero-video.mp4"

// Mountain landscape poster image (fallback while video loads)
const HERO_POSTER_URL =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background z-10" />

        {/* Video element */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster={HERO_POSTER_URL}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Fallback gradient background when no video */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted -z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto text-center max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-background/80 backdrop-blur-sm text-foreground rounded-full text-sm font-medium mb-8 shadow-soft"
          >
            Welcome to Periospot
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-foreground leading-[1.1] mb-6"
        >
          Stories that
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="block text-foreground"
          >
            inspire<span className="text-primary">.</span>
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Discover thoughtful articles, in-depth analysis, and fresh perspectives.
          <br className="hidden sm:block" />
          So you can stay informed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/blog"
              className="bg-background text-foreground border border-border px-7 py-3.5 rounded-full text-base font-medium shadow-soft hover:shadow-elevated transition-all flex items-center gap-2 group"
            >
              Start Here
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/library"
              className="text-foreground/80 hover:text-foreground px-6 py-3.5 text-base font-medium transition-colors flex items-center gap-2"
            >
              <BookOpen size={18} />
              Check Knowledge Base
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - fixed at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground/60"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-medium">
            Scroll
          </span>
          <span className="text-lg">↓</span>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
