"use client"

import { useEffect, useRef, useState } from "react"

import { PerioAnalytics } from "@/lib/analytics"

type ScrollMilestone = 25 | 50 | 75 | 90

interface ArticleScrollTrackerProps {
  slug: string
  category: string
}

export default function ArticleScrollTracker({ slug, category }: ArticleScrollTrackerProps) {
  const [tracked, setTracked] = useState<Record<ScrollMilestone, boolean>>({
    25: false,
    50: false,
    75: false,
    90: false,
  })
  const startTime = useRef(Date.now())

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return
      const scrollPercent = (window.scrollY / scrollHeight) * 100

      ;([25, 50, 75, 90] as const).forEach((milestone) => {
        if (scrollPercent >= milestone && !tracked[milestone]) {
          const readTime = Math.floor((Date.now() - startTime.current) / 1000)
          PerioAnalytics.trackArticleDepth({
            articleSlug: slug,
            depthPercentage: milestone,
            category,
            readingTimeSeconds: readTime,
          })
          setTracked((prev) => ({ ...prev, [milestone]: true }))
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [slug, category, tracked])

  return null
}
