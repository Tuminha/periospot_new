import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ContactForm from "@/components/ContactForm"
import { getPageSeoBySlug } from "@/lib/content"
import {
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Facebook,
  MapPin,
  Users,
  BookOpen,
  Award,
  Globe
} from "lucide-react"

const fallbackMeta = {
  title: "Team & Contact | Periospot",
  description:
    "Meet the Periospot team - dental education experts dedicated to providing high-quality content on implantology, periodontics, and aesthetic dentistry. Contact us for collaborations and inquiries.",
  url: "https://periospot.com/team",
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeoBySlug("team-contact")
  const title = seo?.title || fallbackMeta.title
  const description = seo?.description || fallbackMeta.description
  const ogTitle = seo?.og_title || title
  const ogDescription = seo?.og_description || description
  const ogImage = seo?.og_image || ""
  const canonical = seo?.canonical || fallbackMeta.url
  const robotsValue = [
    seo?.meta_robots,
    seo?.meta_robots_noindex,
    seo?.meta_robots_nofollow,
    seo?.meta_robots_adv,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  const noindex =
    robotsValue.includes("noindex") ||
    seo?.meta_robots_noindex === "1" ||
    seo?.meta_robots_noindex === "true"
  const nofollow =
    robotsValue.includes("nofollow") ||
    seo?.meta_robots_nofollow === "1" ||
    seo?.meta_robots_nofollow === "true"

  return {
    title,
    description,
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: "website",
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical,
    },
  }
}

const teamMembers = [
  {
    id: "cisco",
    name: "Francisco Teixeira Barbosa",
    nickname: "Cisco",
    role: "Founder & Editor in Chief",
    image: "/images/team/cisco.jpg",
    bio: "Periospot founder. Editor in chief for Periospot in English and sometimes in Spanish and Portuguese. DDS since 2004. Specialized in Implant and Digital dentistry. Works for Straumann Group as Global Customer Success Manager DSO. International speaker with more than 50 published articles and 8 ebooks about implant and regenerative dentistry.",
    quote: "Everything I say can be biased, but is up to you to consider my advice",
    specialties: ["Implant Dentistry", "Digital Dentistry", "Regenerative Dentistry"],
    social: {
      linkedin: "https://linkedin.com/in/franciscoteixeirabarbosa",
      twitter: "https://x.com/periospot",
      instagram: "https://instagram.com/periospot",
      youtube: "https://youtube.com/@tuminha21",
      github: "https://github.com/Tuminha",
      facebook: "https://facebook.com/periospot",
    },
  },
  {
    id: "daniel",
    name: "Daniel Robles Cantero",
    nickname: "Daniel",
    role: "Editor in Chief (Spanish Section)",
    image: "/images/team/daniel.jpg",
    bio: "Doctor in Dental Science (D.D.S.) from UCM Madrid with Master's in Periodontics and Oral Implantology. Clinical Director and Co-Director of multiple university Master's programs. Professor at multiple Madrid institutions. Board member of SCOI and editor for Journal of Diagnostic and Treatment of Oral and Maxillofacial Pathology.",
    quote: "Happiness is key for success, but success is not key for happiness",
    specialties: ["Periodontics", "Oral Implantology", "Academic Education"],
    social: {
      linkedin: "https://linkedin.com/in/danielroblescantero",
    },
  },
]

const contributors = [
  { name: "Vitor Brás", role: "Contributor", country: "Portugal" },
  { name: "Tomas Linkevicius", role: "Guest Author", country: "Lithuania" },
  { name: "Nicolas Henner", role: "Contributor", country: "France" },
  { name: "Jorge Alania", role: "Contributor", country: "Peru" },
  { name: "Manthan Desai MDS", role: "Guest Author", country: "India" },
  { name: "Emilio Rodriguez Fernandez", role: "Contributor", country: "Spain" },
  { name: "Primitivo Roig", role: "Guest Author", country: "Spain" },
  { name: "Ricardo López Lemus", role: "Contributor", country: "Mexico" },
  { name: "Erik Regidor", role: "Guest Author", country: "Spain" },
  { name: "Juanma Vadillo", role: "Contributor", country: "Spain" },
]

const stats = [
  { label: "Articles Published", value: "80+", icon: BookOpen },
  { label: "eBooks Created", value: "10+", icon: BookOpen },
  { label: "Contributors", value: "17+", icon: Users },
  { label: "Languages", value: "4", icon: Globe },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              Meet Our Team
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              The People Behind Periospot
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re a team of passionate dental professionals dedicated to providing
              free, high-quality educational content to the dental community worldwide.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-card p-4 text-center shadow-sm">
                <stat.icon className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Team */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-bold">Core Team</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 md:h-auto md:w-48 md:flex-shrink-0">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                      {member.nickname.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{member.name}</CardTitle>
                          <CardDescription className="mt-1">{member.role}</CardDescription>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {member.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-4">{member.bio}</p>
                      <blockquote className="mt-4 border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                        &ldquo;{member.quote}&rdquo;
                      </blockquote>
                      <div className="mt-4 flex gap-2">
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full p-2 hover:bg-secondary"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.twitter && (
                          <a
                            href={member.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full p-2 hover:bg-secondary"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.instagram && (
                          <a
                            href={member.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full p-2 hover:bg-secondary"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.youtube && (
                          <a
                            href={member.social.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full p-2 hover:bg-secondary"
                          >
                            <Youtube className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full p-2 hover:bg-secondary"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.facebook && (
                          <a
                            href={member.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full p-2 hover:bg-secondary"
                          >
                            <Facebook className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contributors */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <h2 className="mb-2 text-center text-2xl font-bold">Our Contributors</h2>
          <p className="mb-8 text-center text-muted-foreground">
            Dental professionals from around the world sharing their expertise
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {contributors.map((contributor) => (
              <Card key={contributor.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">
                      {contributor.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-medium">{contributor.name}</h3>
                  <p className="text-xs text-muted-foreground">{contributor.role}</p>
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {contributor.country}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="mt-2 text-muted-foreground">
                Have questions, suggestions, or want to collaborate? We&apos;d love to hear from you.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Award className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Want to Contribute?</h2>
            <p className="mt-3 text-muted-foreground">
              Are you a dental professional with expertise to share? We&apos;re always looking
              for guest authors and contributors to join our community.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/blog">Read Our Articles</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:periospot@periospot.com">Become a Contributor</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
