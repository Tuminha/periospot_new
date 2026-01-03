import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Privacy Policy | Periospot",
  description: "Learn how Periospot collects, uses, and protects your personal information.",
  robots: "noindex, follow",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Badge className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: January 2, 2026
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Periospot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting
              your personal information and your right to privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our
              website periospot.com.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Register for an account</li>
              <li>Subscribe to our newsletter</li>
              <li>Make a purchase</li>
              <li>Complete assessments or surveys</li>
              <li>Contact us through forms</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>Name and email address</li>
              <li>Professional information (specialty, practice location)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Assessment responses and results</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we automatically collect certain information including:
            </p>
            <ul>
              <li>IP address and browser type</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>Device information</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Send you educational content and newsletters</li>
              <li>Process your purchases and transactions</li>
              <li>Personalize your learning experience</li>
              <li>Improve our website and content</li>
              <li>Communicate with you about updates and offers</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information with:
            </p>
            <ul>
              <li>Service providers (hosting, email, payment processing)</li>
              <li>Analytics providers (to improve our services)</li>
              <li>Legal authorities (when required by law)</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal information. However, no electronic transmission or storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>

            <h2>6. Your Rights (GDPR)</h2>
            <p>If you are a resident of the European Economic Area, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{" "}
              <a href="mailto:periospot@periospot.com">periospot@periospot.com</a>.
            </p>

            <h2>7. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience.
              For more information, please see our{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>Our website may contain links to third-party websites. We are not responsible
              for the privacy practices of these external sites. We encourage you to read
              their privacy policies.</p>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Supabase</strong> - Authentication and database</li>
              <li><strong>Stripe</strong> - Payment processing</li>
              <li><strong>Typeform</strong> - Assessments and surveys</li>
              <li><strong>Resend</strong> - Email delivery</li>
              <li><strong>Vercel</strong> - Website hosting</li>
            </ul>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not
              knowingly collect personal information from children.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the &quot;Last updated&quot;
              date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:periospot@periospot.com">periospot@periospot.com</a></li>
              <li>Website: <Link href="/team" className="text-primary hover:underline">Contact Form</Link></li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
            Cookie Policy
          </Link>
        </div>
      </div>
    </main>
  )
}
