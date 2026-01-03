"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface GaDebugProps {
  gaId?: string | null
}

const isEnabled = (value?: string | null) => value === "true" || value === "1"

export default function GaDebug({ gaId }: GaDebugProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!gaId) return

    const debugParam = searchParams?.get("debug_mode")
    const envEnabled = process.env.NEXT_PUBLIC_ENABLE_GA_DEBUG === "true"
    const shouldEnable = envEnabled || isEnabled(debugParam)

    if (!shouldEnable) return

    let attempts = 0
    const enableDebug = () => {
      if (typeof window === "undefined") return
      attempts += 1

      if (window.gtag) {
        window.gtag("config", gaId, { debug_mode: true })
        return
      }

      if (attempts < 10) {
        window.setTimeout(enableDebug, 300)
      }
    }

    enableDebug()
  }, [gaId, searchParams])

  return null
}
