"use client"

import { motion } from "framer-motion"
import { BookOpen, GraduationCap, ShoppingBag, Award } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: BookOpen,
    title: "Expert Articles",
    description:
      "In-depth articles on implantology, periodontics, and aesthetic dentistry",
    href: "/blog",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: GraduationCap,
    title: "Assessments",
    description:
      "Test your knowledge with interactive quizzes and get certified",
    href: "/assessments",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: ShoppingBag,
    title: "Educational Shop",
    description: "Animations, presentations, and educational packages",
    href: "/tienda",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Award,
    title: "Free Resources",
    description: "eBooks, guides, and downloadable resources",
    href: "/library",
    color: "bg-green-500/10 text-green-600",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
          >
            Learn Your Way
          </motion.span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Multiple ways to learn
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Advance your dental knowledge and skills with our comprehensive
            resources
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <Link href={feature.href} className="block h-full">
                <div className="bg-card rounded-2xl p-6 h-full shadow-soft hover:shadow-elevated transition-shadow duration-500">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection
