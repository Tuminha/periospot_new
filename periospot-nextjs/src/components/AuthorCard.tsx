"use client"

import Image from "next/image"

// Author social links type
interface AuthorSocial {
  twitter?: string
  linkedin?: string
  instagram?: string
  facebook?: string
  youtube?: string
  website?: string
}

// Author data with extended info
interface AuthorData {
  id: string
  name: string
  email?: string
  bio?: string
  avatar?: string
  role?: string
  social?: AuthorSocial
}

// Extended author database with bios and social links
const authorDatabase: Record<string, Partial<AuthorData>> = {
  "cisco": {
    name: "Francisco Teixeira Barbosa",
    bio: "Implant & Digital Dentistry specialist. Periospot founder and managing editor. Executive Director at FOR. Global Customer Success Manager Clinical at Straumann Group.",
    role: "Founder & Editor",
    avatar: "/images/team/cisco.jpg",
    social: {
      twitter: "https://x.com/cisco_research",
      linkedin: "https://www.linkedin.com/in/francisco-teixeira-barbosa/",
      instagram: "https://www.instagram.com/tuminha_dds/",
      youtube: "https://www.youtube.com/@tuminha21",
      website: "https://periospot.com"
    }
  },
  "francisco": {
    name: "Francisco Teixeira Barbosa",
    bio: "Implant & Digital Dentistry specialist. Periospot founder and managing editor. Executive Director at FOR. Global Customer Success Manager Clinical at Straumann Group.",
    role: "Founder & Editor",
    avatar: "/images/team/cisco.jpg",
    social: {
      twitter: "https://x.com/cisco_research",
      linkedin: "https://www.linkedin.com/in/francisco-teixeira-barbosa/",
      instagram: "https://www.instagram.com/tuminha_dds/",
      youtube: "https://www.youtube.com/@tuminha21",
      website: "https://periospot.com"
    }
  },
  "francisco-teixeira-barbosa": {
    name: "Francisco Teixeira Barbosa",
    bio: "Implant & Digital Dentistry specialist. Periospot founder and managing editor. Executive Director at FOR. Global Customer Success Manager Clinical at Straumann Group.",
    role: "Founder & Editor",
    avatar: "/images/team/cisco.jpg",
    social: {
      twitter: "https://x.com/cisco_research",
      linkedin: "https://www.linkedin.com/in/francisco-teixeira-barbosa/",
      instagram: "https://www.instagram.com/tuminha_dds/",
      youtube: "https://www.youtube.com/@tuminha21",
      website: "https://periospot.com"
    }
  },
  "daniel-robles": {
    name: "Daniel Robles Cantero",
    bio: "Doctor in Dental Science from UCM Madrid. Master's in Periodontics and Oral Implantology. Clinical Director at UEMC University. National and International Speaker in Oral Surgery.",
    role: "Editor (Spanish)",
    avatar: "/images/team/daniel.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/daniel-robles-cantero-97196519/"
    }
  },
  "daniel-robles-cantero": {
    name: "Daniel Robles Cantero",
    bio: "Doctor in Dental Science from UCM Madrid. Master's in Periodontics and Oral Implantology. Clinical Director at UEMC University. National and International Speaker in Oral Surgery.",
    role: "Editor (Spanish)",
    avatar: "/images/team/daniel.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/daniel-robles-cantero-97196519/"
    }
  },
  "vitor-bras": {
    name: "Vitor Brás",
    bio: "Periodontist and implant specialist. Clinical researcher focused on regenerative procedures and soft tissue management.",
    role: "Contributing Author",
    social: {
      linkedin: "https://www.linkedin.com/in/vitorbras/"
    }
  },
  "emilio-rodriguez-fernandez": {
    name: "Emilio Rodriguez Fernandez",
    bio: "Specialist in periodontics with focus on minimally invasive techniques and patient-centered care.",
    role: "Contributing Author"
  },
  "default": {
    bio: "Expert in periodontics and implantology with extensive clinical experience.",
    role: "Contributing Author"
  }
}

// Social media icon components with Periospot blue stroke
const SocialIcons = {
  twitter: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  ),
  linkedin: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  instagram: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  facebook: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <path d="m10 15 5-3-5-3z"/>
    </svg>
  ),
  website: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  )
}

interface AuthorCardProps {
  authorName: string
  authorEmail?: string
}

// Generate Gravatar URL from email
function getGravatarUrl(email: string, size: number = 150): string {
  // Simple hash for demo - in production use MD5
  const hash = email.toLowerCase().trim()
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`
}

// Get author slug from name
function getAuthorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AuthorCard({ authorName, authorEmail }: AuthorCardProps) {
  const slug = getAuthorSlug(authorName)
  const authorData = authorDatabase[slug] || authorDatabase["default"]

  // Get author info with fallbacks
  const displayName = authorData.name || authorName
  const bio = authorData.bio || "Expert in periodontics and implantology with extensive clinical experience."
  const role = authorData.role || "Contributing Author"
  const social = authorData.social || {}

  // Get avatar URL
  const avatarUrl = authorData.avatar || (authorEmail ? getGravatarUrl(authorEmail) : null)

  // Get initials for fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "PS"

  const socialLinks = Object.entries(social).filter(([_, url]) => url)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-10">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-accent/20 hover:ring-accent/40 transition-all duration-300 hover:rotate-3">
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center ring-2 ring-accent/20">
              <span className="text-foreground font-semibold text-xl">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {displayName}
            </h3>
            {role && (
              <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
                {role}
              </span>
            )}
          </div>

          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {bio}
          </p>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {socialLinks.map(([platform, url]) => {
                const Icon = SocialIcons[platform as keyof typeof SocialIcons]
                if (!Icon || !url) return null

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"
                    aria-label={`Follow on ${platform}`}
                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
