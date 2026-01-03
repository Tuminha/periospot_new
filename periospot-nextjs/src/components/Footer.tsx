"use client"

import { motion } from "framer-motion"
import { Github, Instagram, Twitter, Youtube } from "lucide-react"
import Link from "next/link"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = {
    explore: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Library", href: "/library" },
      { label: "Assessments", href: "/assessments" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Shop", href: "/tienda" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  }

  const socials = [
    { icon: Twitter, href: "https://x.com/periospot" },
    { icon: Instagram, href: "https://instagram.com/periospot" },
    { icon: Youtube, href: "https://youtube.com/@tuminha21" },
    { icon: Github, href: "https://github.com/Tuminha" },
  ]

  return (
    <footer className="bg-foreground text-background py-16 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12"
        >
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display text-2xl font-semibold mb-4 block"
            >
              <span className="text-primary">◉</span> periospot
            </Link>
            <p className="text-background/70 max-w-sm mb-6 leading-relaxed">
              Thoughtful dental education and perspectives that inspire
              curiosity and meaningful clinical conversations.
            </p>
            <div className="flex gap-4">
              {socials.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">
              Explore
            </h4>
            <ul className="space-y-3">
              {links.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">
              Company
            </h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">
              Legal
            </h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-background/50 text-sm">
            © {currentYear} Periospot. All rights reserved.
          </p>
          <p className="text-background/50 text-sm">
            Made with care for curious minds.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
