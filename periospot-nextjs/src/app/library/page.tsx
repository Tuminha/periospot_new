import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video, Download, Lock, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { EbookDownloadButton } from "@/components/EbookDownloadButton"

export const metadata: Metadata = {
  title: "Library | Periospot - Dental Education Resources",
  description:
    "Access our comprehensive library of dental education resources including eBooks, PDFs, video tutorials, and scientific publications on implantology and periodontics.",
  keywords: [
    "dental ebooks",
    "periodontics resources",
    "implantology guides",
    "dental education PDFs",
    "scientific publications",
    "dental tutorials",
  ],
  openGraph: {
    title: "Library | Periospot - Dental Education Resources",
    description:
      "Comprehensive dental education resources including eBooks, PDFs, and video tutorials.",
    url: "https://periospot.com/library",
    type: "website",
  },
}

// Fetch ebooks from database
async function getEbooks() {
  const supabase = await createClient()

  const { data: ebooks, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ebooks:', error)
    return []
  }

  return ebooks || []
}

// Get total download count
async function getDownloadStats() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('ebook_downloads')
    .select('*', { count: 'exact', head: true })

  return count || 0
}

// Mock video data (to be replaced with real data later)
const videos = [
  {
    id: "1",
    title: "Immediate Implant Placement in Aesthetic Zone",
    description: "Live surgery demonstration with step-by-step commentary.",
    duration: "45 min",
    instructor: "Dr. Francisco Teixeira Barbosa",
    thumbnail: "/images/videos/immediate-implant.jpg",
    isPremium: true,
    category: "Surgery",
  },
  {
    id: "2",
    title: "Soft Tissue Management Around Implants",
    description:
      "Techniques for achieving optimal soft tissue aesthetics around dental implants.",
    duration: "32 min",
    instructor: "Periospot Academy",
    thumbnail: "/images/videos/soft-tissue.jpg",
    isPremium: true,
    category: "Aesthetics",
  },
  {
    id: "3",
    title: "Understanding Bone Grafting Materials",
    description:
      "Comparative analysis of different bone grafting materials and their indications.",
    duration: "28 min",
    instructor: "Dr. Expert",
    thumbnail: "/images/videos/bone-graft.jpg",
    isPremium: false,
    category: "Materials",
  },
]

const publications = [
  {
    id: "1",
    title:
      "Long-term outcomes of immediate implant placement: A 10-year retrospective study",
    journal: "Clinical Oral Implants Research",
    year: 2023,
    authors: "Teixeira Barbosa F, et al.",
    doi: "10.1111/clr.12345",
    isPremium: false,
  },
  {
    id: "2",
    title:
      "Socket Shield Technique: Histological and Clinical Evidence Review",
    journal: "Journal of Periodontology",
    year: 2022,
    authors: "Fonseca D, et al.",
    doi: "10.1002/JPER.12345",
    isPremium: false,
  },
  {
    id: "3",
    title: "Digital Workflow in Immediate Implant Cases: A Systematic Review",
    journal: "International Journal of Oral & Maxillofacial Implants",
    year: 2024,
    authors: "Periospot Research Team",
    doi: "10.11607/jomi.12345",
    isPremium: false,
  },
]

// Map language code to flag emoji
function getLanguageFlag(lang: string) {
  const flags: Record<string, string> = {
    en: "🇬🇧",
    es: "🇪🇸",
    pt: "🇵🇹",
    zh: "🇨🇳",
  }
  return flags[lang] || "🌐"
}

// Map category to color
function getCategoryColor(category: string | null) {
  const colors: Record<string, string> = {
    implantology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    periodontics: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    aesthetics: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }
  return colors[category || ""] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
}

function getAnalyticsTopic(category: string | null) {
  const normalized = (category || "").toLowerCase()
  if (normalized.includes("implant")) return "implant_dentistry"
  if (normalized.includes("perio")) return "periodontics"
  if (normalized.includes("aesthetic")) return "aesthetics"
  return "marketing"
}

function normalizeLanguage(lang?: string | null) {
  if (!lang) return undefined
  if (lang === "en" || lang === "es" || lang === "pt" || lang === "zh") {
    return lang
  }
  return undefined
}

export default async function LibraryPage() {
  const ebooks = await getEbooks()
  const totalDownloads = await getDownloadStats()

  // Group ebooks by language for display
  const englishEbooks = ebooks.filter(e => e.language === 'en')
  const otherEbooks = ebooks.filter(e => e.language !== 'en')

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              Educational Resources
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Periospot Library
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Access our comprehensive collection of dental education resources.
              From in-depth eBooks to video tutorials and scientific
              publications.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <BookOpen className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">{ebooks.length}</p>
              <p className="text-sm text-muted-foreground">eBooks</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <Video className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">{videos.length}+</p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <FileText className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">{publications.length}+</p>
              <p className="text-sm text-muted-foreground">Publications</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <Download className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">{totalDownloads > 0 ? totalDownloads : '500'}+</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Library Content */}
      <section className="py-12">
        <div className="container">
          <Tabs defaultValue="ebooks" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="ebooks" className="gap-2">
                <BookOpen className="h-4 w-4" />
                eBooks
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="publications" className="gap-2">
                <FileText className="h-4 w-4" />
                Publications
              </TabsTrigger>
            </TabsList>

            {/* eBooks Tab */}
            <TabsContent value="ebooks">
              {ebooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Our ebook collection is being prepared. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ebooks.map((ebook) => (
                    <Card key={ebook.id} className="overflow-hidden group">
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5">
                        {ebook.cover_image ? (
                          <Image
                            src={ebook.cover_image}
                            alt={ebook.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-16 w-16 text-primary/30" />
                          </div>
                        )}

                        {/* Language badge */}
                        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 dark:bg-black/70 px-2 py-1 text-xs">
                          <span>{getLanguageFlag(ebook.language)}</span>
                          <span className="uppercase">{ebook.language}</span>
                        </div>

                        {/* Premium/Free badge */}
                        {!ebook.is_free ? (
                          <Badge className="absolute right-2 top-2 gap-1">
                            <Lock className="h-3 w-3" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="absolute right-2 top-2">
                            Free
                          </Badge>
                        )}

                        {/* Download count */}
                        {ebook.download_count > 0 && (
                          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                            {ebook.download_count} downloads
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        {ebook.category && (
                          <Badge variant="outline" className={`mb-2 w-fit ${getCategoryColor(ebook.category)}`}>
                            {ebook.category}
                          </Badge>
                        )}
                        <CardTitle className="line-clamp-2 text-lg">
                          {ebook.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {ebook.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <EbookDownloadButton
                          slug={ebook.slug}
                          title={ebook.title}
                          isFree={ebook.is_free}
                          hasExternalLink={!!(ebook.genius_link_url || ebook.apple_books_url)}
                          topic={getAnalyticsTopic(ebook.category)}
                          language={normalizeLanguage(ebook.language)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Other languages section */}
              {otherEbooks.length > 0 && englishEbooks.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Also Available in Other Languages
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {otherEbooks.map((ebook) => (
                      <Card key={ebook.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getLanguageFlag(ebook.language)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{ebook.title}</h4>
                            <EbookDownloadButton
                              slug={ebook.slug}
                              title={ebook.title}
                              isFree={ebook.is_free}
                              hasExternalLink={!!(ebook.genius_link_url || ebook.apple_books_url)}
                              topic={getAnalyticsTopic(ebook.category)}
                              language={normalizeLanguage(ebook.language)}
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-8 text-xs"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <div className="flex h-full items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                        {video.duration}
                      </div>
                      {video.isPremium && (
                        <Badge className="absolute left-2 top-2 gap-1">
                          <Lock className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <Badge variant="outline" className="mb-2 w-fit">
                        {video.category}
                      </Badge>
                      <CardTitle className="line-clamp-2 text-lg">
                        {video.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {video.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Instructor: {video.instructor}
                      </p>
                      <Button
                        className="w-full"
                        variant={video.isPremium ? "outline" : "default"}
                      >
                        {video.isPremium ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Unlock
                          </>
                        ) : (
                          "Watch Now"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Publications Tab */}
            <TabsContent value="publications">
              <div className="space-y-4">
                {publications.map((pub) => (
                  <Card key={pub.id}>
                    <CardContent className="flex items-start gap-4 pt-6">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{pub.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {pub.authors}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pub.journal} ({pub.year})
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          DOI: {pub.doi}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Get Full Access</h2>
            <p className="mt-3 text-muted-foreground">
              Unlock all premium content including exclusive eBooks, video
              tutorials, and downloadable resources with a Periospot membership.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tienda">View Premium Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
