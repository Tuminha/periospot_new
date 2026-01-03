"use client"

import { useState, useEffect } from "react"

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      // Find which section is currently in view
      for (let i = items.length - 1; i >= 0; i--) {
        const section = document.getElementById(items[i].id)
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(items[i].id)
          break
        }
      }
    }

    // Set initial active section
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [items])

  if (items.length === 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 100 // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
      setActiveSection(id)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-10">
      <h3 className="font-display text-base font-semibold text-foreground mb-3">
        Table of Contents
      </h3>
      <nav className="flex flex-wrap gap-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
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
    </div>
  )
}
