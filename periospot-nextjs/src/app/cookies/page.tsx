import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata: Metadata = {
  title: "Cookie Policy | Periospot",
  description: "Learn about how Periospot uses cookies and similar technologies.",
  robots: "noindex, follow",
}

const cookieTypes = [
  {
    name: "Essential Cookies",
    purpose: "Required for the website to function properly",
    examples: "Session management, authentication, security",
    duration: "Session / 1 year",
    required: true,
  },
  {
    name: "Functional Cookies",
    purpose: "Remember your preferences and settings",
    examples: "Language preference, theme selection",
    duration: "1 year",
    required: false,
  },
  {
    name: "Analytics Cookies",
    purpose: "Help us understand how visitors use our site",
    examples: "Page views, time on site, navigation paths",
    duration: "2 years",
    required: false,
  },
  {
    name: "Marketing Cookies",
    purpose: "Track effectiveness of our marketing campaigns",
    examples: "Ad performance, conversion tracking",
    duration: "90 days",
    required: false,
  },
]

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Badge className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold">Cookie Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: January 2, 2026
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website.
              They help websites remember your preferences, understand how you use the site, and
              provide a better experience.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              Periospot uses cookies and similar technologies to:
            </p>
            <ul>
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences (language, theme)</li>
              <li>Understand how you use our website</li>
              <li>Improve our content and services</li>
              <li>Measure the effectiveness of our marketing</li>
            </ul>

            <h2>Types of Cookies We Use</h2>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cookieTypes.map((cookie) => (
                  <TableRow key={cookie.name}>
                    <TableCell className="font-medium">{cookie.name}</TableCell>
                    <TableCell>
                      <p>{cookie.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cookie.examples}</p>
                    </TableCell>
                    <TableCell>{cookie.duration}</TableCell>
                    <TableCell>
                      {cookie.required ? (
                        <Badge>Required</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <h2>Specific Cookies We Use</h2>

            <h3>Essential Cookies</h3>
            <ul>
              <li><strong>sb-access-token</strong> - Supabase authentication token</li>
              <li><strong>sb-refresh-token</strong> - Supabase session refresh</li>
              <li><strong>__vercel_live_token</strong> - Vercel deployment verification</li>
            </ul>

            <h3>Functional Cookies</h3>
            <ul>
              <li><strong>theme</strong> - Your preferred color scheme (light/dark)</li>
              <li><strong>locale</strong> - Your preferred language</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <ul>
              <li><strong>_ga, _gid</strong> - Google Analytics (if enabled)</li>
              <li><strong>_vercel_insights</strong> - Vercel Web Analytics</li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>Some cookies are placed by third-party services that appear on our pages:</p>
            <ul>
              <li><strong>Typeform</strong> - For assessments and surveys</li>
              <li><strong>Stripe</strong> - For payment processing</li>
              <li><strong>YouTube</strong> - For embedded videos (if any)</li>
            </ul>

            <h2>Managing Cookies</h2>
            <h3>Browser Settings</h3>
            <p>
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are stored</li>
              <li>Delete specific or all cookies</li>
              <li>Block cookies from certain sites</li>
              <li>Block all cookies</li>
              <li>Get notified when a cookie is set</li>
            </ul>

            <p>
              <strong>Note:</strong> Blocking essential cookies may prevent you from using certain
              features of our website, such as logging in or making purchases.
            </p>

            <h3>Browser-Specific Instructions</h3>
            <ul>
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <h2>Cookie Consent</h2>
            <p>
              When you first visit our website, you will be asked to accept or customize your
              cookie preferences. You can change your preferences at any time by clicking the
              &quot;Cookie Settings&quot; link in the footer.
            </p>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our
              practices or for other operational, legal, or regulatory reasons.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:privacy@periospot.com">privacy@periospot.com</a></li>
              <li>Website: <Link href="/team" className="text-primary hover:underline">Contact Form</Link></li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  )
}
