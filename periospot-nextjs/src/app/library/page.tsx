import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video, Download, Lock } from "lucide-react"

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

// Mock library data (in production, this would come from a database)
const ebooks = [
  {
    id: "1",
    title: "Complete Guide to Immediate Implant Placement",
    description:
      "A comprehensive guide covering all aspects of immediate implant placement, from case selection to prosthetic protocols.",
    author: "Dr. Francisco Teixeira Barbosa",
    pages: 156,
    format: "PDF",
    coverImage: "/images/ebooks/immediate-implants.jpg",
    isPremium: true,
    category: "Implantology",
  },
  {
    id: "2",
    title: "Socket Shield Technique: Step-by-Step",
    description:
      "Detailed protocol for the Socket Shield technique with clinical cases and troubleshooting tips.",
    author: "Dr. Darcio Fonseca",
    pages: 98,
    format: "PDF",
    coverImage: "/images/ebooks/socket-shield.jpg",
    isPremium: true,
    category: "Implantology",
  },
  {
    id: "3",
    title: "Periodontal Regeneration Fundamentals",
    description:
      "Evidence-based approaches to periodontal regeneration including GTR and growth factors.",
    author: "Periospot Team",
    pages: 124,
    format: "PDF",
    coverImage: "/images/ebooks/perio-regen.jpg",
    isPremium: false,
    category: "Periodontics",
  },
]

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

export default function LibraryPage() {
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
              <p className="mt-2 text-2xl font-bold">{ebooks.length}+</p>
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
              <p className="mt-2 text-2xl font-bold">500+</p>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ebooks.map((ebook) => (
                  <Card key={ebook.id} className="overflow-hidden">
                    <div className="relative aspect-[3/4] bg-muted">
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                      {ebook.isPremium && (
                        <Badge className="absolute right-2 top-2 gap-1">
                          <Lock className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <Badge variant="outline" className="mb-2 w-fit">
                        {ebook.category}
                      </Badge>
                      <CardTitle className="line-clamp-2 text-lg">
                        {ebook.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {ebook.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 text-sm text-muted-foreground">
                        <p>By {ebook.author}</p>
                        <p>
                          {ebook.pages} pages | {ebook.format}
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        variant={ebook.isPremium ? "outline" : "default"}
                      >
                        {ebook.isPremium ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
