import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  Globe,
  Award,
  Target,
  Heart,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export const metadata: Metadata = {
  title: "About Periospot | Dental Education Platform",
  description:
    "Periospot is a pioneer in providing free, high-quality online dental education content. Learn about our mission, values, and commitment to the dental community.",
  keywords: [
    "about periospot",
    "dental education",
    "free dental content",
    "implant dentistry education",
    "periodontics learning",
  ],
  openGraph: {
    title: "About Periospot | Dental Education Platform",
    description: "Pioneering free, high-quality dental education since 2015.",
    url: "https://periospot.com/about",
    type: "website",
  },
}

const milestones = [
  { year: "2015", event: "Periospot founded", description: "Started as a blog sharing dental knowledge" },
  { year: "2016", event: "First eBook published", description: "Released our first free educational eBook" },
  { year: "2018", event: "Multilingual expansion", description: "Added Spanish, Portuguese, and Chinese content" },
  { year: "2020", event: "Assessment platform", description: "Launched interactive dental assessments" },
  { year: "2022", event: "50+ articles milestone", description: "Reached 50+ published educational articles" },
  { year: "2024", event: "10,000+ learners", description: "Growing community of dental professionals" },
]

const values = [
  {
    icon: Heart,
    title: "Free Education",
    description: "We believe quality dental education should be accessible to everyone, regardless of location or budget.",
  },
  {
    icon: Lightbulb,
    title: "Evidence-Based",
    description: "All our content is grounded in scientific literature and clinical best practices.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "We serve dental professionals in 4 languages across 100+ countries.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "Dentistry evolves constantly. We stay updated so you can too.",
  },
]

const features = [
  "80+ in-depth educational articles",
  "10+ free downloadable eBooks",
  "Interactive skill assessments",
  "Content in 4 languages",
  "Expert contributors worldwide",
  "Weekly newsletter updates",
]

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              About Us
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              It&apos;s Time to Learn Dentistry
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Periospot is a pioneer in providing free, high-quality online content
              related to dentistry. We&apos;re on a mission to make dental education
              accessible to professionals worldwide.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/blog">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/team">Meet Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <Badge className="mb-4">Our Mission</Badge>
                <h2 className="text-3xl font-bold">
                  Democratizing Dental Education
                </h2>
                <p className="mt-4 text-muted-foreground">
                  We started Periospot with a simple belief: that every dental professional,
                  regardless of where they practice or their financial situation, deserves
                  access to high-quality, evidence-based educational content.
                </p>
                <p className="mt-4 text-muted-foreground">
                  From basic concepts to advanced techniques, we cover the full spectrum
                  of implant dentistry, periodontics, and aesthetic dentistry—all for free.
                </p>
                <ul className="mt-6 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 text-3xl font-bold">80+</p>
                    <p className="text-sm text-muted-foreground">Articles Published</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <Users className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 text-3xl font-bold">17+</p>
                    <p className="text-sm text-muted-foreground">Expert Contributors</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <Globe className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 text-3xl font-bold">4</p>
                    <p className="text-sm text-muted-foreground">Languages</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <Award className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 text-3xl font-bold">10+</p>
                    <p className="text-sm text-muted-foreground">Free eBooks</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">Our Values</Badge>
            <h2 className="text-3xl font-bold">What Drives Us</h2>
            <p className="mt-4 text-muted-foreground">
              These core principles guide everything we do at Periospot
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">Our Journey</Badge>
            <h2 className="text-3xl font-bold">How We Got Here</h2>
            <p className="mt-4 text-muted-foreground">
              From a simple idea to a global dental education platform
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 h-full w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative mb-8 flex items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 md:pr-8 md:text-right">
                    {index % 2 === 0 && (
                      <div className="ml-12 md:ml-0">
                        <Badge variant="outline" className="mb-2">{milestone.year}</Badge>
                        <h3 className="font-semibold">{milestone.event}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground md:static md:mx-4">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="flex-1 md:pl-8">
                    {index % 2 !== 0 && (
                      <div className="ml-12 md:ml-0">
                        <Badge variant="outline" className="mb-2">{milestone.year}</Badge>
                        <h3 className="font-semibold">{milestone.event}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Levels */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">For Everyone</Badge>
            <h2 className="text-3xl font-bold">Different Levels of Knowledge</h2>
            <p className="mt-4 text-muted-foreground">
              From beginner to advanced—we have content for every stage of your journey
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <span className="text-2xl font-bold text-green-500">1</span>
                </div>
                <h3 className="text-lg font-semibold">Basic Level</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fundamental implant biology and essential techniques for beginners
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                  <span className="text-2xl font-bold text-yellow-500">2</span>
                </div>
                <h3 className="text-lg font-semibold">Intermediate Level</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  New techniques based on scientific literature and clinical evidence
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <span className="text-2xl font-bold text-red-500">3</span>
                </div>
                <h3 className="text-lg font-semibold">Master Level</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Solving the most complex cases with step-by-step guidance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Ready to Start Learning?</h2>
            <p className="mt-3 text-muted-foreground">
              Join thousands of dental professionals who trust Periospot for their
              continuing education.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/assessments">
                  Take an Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/library">Browse Library</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
