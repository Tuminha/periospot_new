import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "periospot.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "ajueupqlrodkhfgkegnx.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 301 Redirects for old WordPress URLs
  async redirects() {
    return [
      // Product URL redirects (from /producto/ to /tienda/)
      {
        source: "/producto/:slug",
        destination: "/tienda/:slug",
        permanent: true,
      },
      // Category redirects
      {
        source: "/category/:slug",
        destination: "/blog/category/:slug",
        permanent: true,
      },
      // Author redirects
      {
        source: "/author/:slug",
        destination: "/team/:slug",
        permanent: true,
      },
      // Spanish shop redirect
      {
        source: "/shop",
        destination: "/tienda",
        permanent: true,
      },
      // Old assessment URLs
      {
        source: "/assessments/:slug",
        destination: "/assessments/:slug",
        permanent: false,
      },
    ]
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache static assets
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
}

export default nextConfig
