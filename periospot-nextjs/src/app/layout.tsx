import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://periospot.com"),
  title: {
    default: "Periospot - Where Learning Dentistry is Easy",
    template: "%s | Periospot",
  },
  description:
    "Educational platform for dental professionals. Learn implantology, periodontics, and aesthetic dentistry with expert content, assessments, and resources.",
  keywords: [
    "dental education",
    "implantology",
    "periodontics",
    "aesthetic dentistry",
    "dental courses",
    "implant dentistry",
    "dental training",
    "periodontal surgery",
    "dental animations",
    "dental ebooks",
  ],
  authors: [{ name: "Francisco Teixeira Barbosa", url: "https://periospot.com" }],
  creator: "Periospot",
  publisher: "Periospot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://periospot.com",
    siteName: "Periospot",
    title: "Periospot - Where Learning Dentistry is Easy",
    description:
      "Educational platform for dental professionals. Learn implantology, periodontics, and aesthetic dentistry.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Periospot - Dental Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@periospot",
    creator: "@periospot",
    title: "Periospot - Where Learning Dentistry is Easy",
    description:
      "Educational platform for dental professionals. Learn implantology, periodontics, and aesthetic dentistry.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://periospot.com",
    languages: {
      "en-US": "https://periospot.com",
      "es-ES": "https://periospot.com/es",
      "pt-BR": "https://periospot.com/pt",
    },
  },
  category: "education",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts - Poppins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Periospot",
              url: "https://periospot.com",
              logo: "https://periospot.com/logo.png",
              description:
                "Educational platform for dental professionals. Learn implantology, periodontics, and aesthetic dentistry.",
              sameAs: [
                "https://facebook.com/periospot",
                "https://twitter.com/periospot",
                "https://instagram.com/periospot",
                "https://linkedin.com/company/periospot",
                "https://youtube.com/user/tuminha21",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "periospot@periospot.com",
                contactType: "customer service",
              },
              founder: {
                "@type": "Person",
                name: "Francisco José Teixeira Barbosa",
                jobTitle: "Founder & Managing Editor",
              },
            }),
          }}
        />
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Periospot",
              url: "https://periospot.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://periospot.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
