"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  fallbackClassName?: string
  fallbackText?: string
}

/**
 * SafeImage component that handles broken image URLs gracefully
 * Uses unoptimized mode with error handling since Next.js Image doesn't support onError
 * Falls back to a placeholder when the image fails to load
 */
export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  fallbackClassName = "",
  fallbackText = "Image not available",
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  // Pre-validate image URL
  useEffect(() => {
    if (!src) {
      setIsValid(false)
      return
    }

    // Quick validation - check if it's a valid URL format
    try {
      new URL(src)
      // For remote images, we'll let the browser handle the error
      // Next.js Image will handle broken images, but we can catch some cases
      setIsValid(true)
    } catch {
      setIsValid(false)
    }
  }, [src])

  // If error or invalid, show fallback
  if (hasError || isValid === false) {
    if (fill) {
      return (
        <div
          className={`flex items-center justify-center bg-muted ${fallbackClassName || className}`}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            {fallbackText && (
              <span className="text-xs text-center px-2">{fallbackText}</span>
            )}
          </div>
        </div>
      )
    }
    return (
      <div
        className={`flex items-center justify-center bg-muted ${fallbackClassName || className}`}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          {fallbackText && <span className="text-xs text-center px-2">{fallbackText}</span>}
        </div>
      </div>
    )
  }

  // Use regular img tag for better error handling, or Image with unoptimized
  // Since Next.js Image doesn't support onError, we'll use a wrapper approach
  if (fill) {
    return (
      <div className={`relative ${className}`} style={{ position: "relative" }}>
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setHasError(true)}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
      loading={priority ? "eager" : "lazy"}
    />
  )
}
