import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Terms of Service | Periospot",
  description: "Terms and conditions for using Periospot dental education platform.",
  robots: "noindex, follow",
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Badge className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: January 2, 2026
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Periospot (periospot.com), you accept and agree to be bound
              by the terms and provisions of this agreement. If you do not agree to these terms,
              please do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Periospot provides dental education content including articles, eBooks, assessments,
              and digital products. Our services are designed for dental professionals and students
              seeking continuing education in implantology, periodontics, and related fields.
            </p>

            <h2>3. User Accounts</h2>
            <h3>Registration</h3>
            <p>
              To access certain features, you may need to create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3>Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms
              or engage in fraudulent activity.
            </p>

            <h2>4. Intellectual Property</h2>
            <h3>Our Content</h3>
            <p>
              All content on Periospot, including text, graphics, logos, images, videos,
              animations, and software, is the property of Periospot or its content creators
              and is protected by copyright laws.
            </p>

            <h3>Your Rights</h3>
            <p>You may:</p>
            <ul>
              <li>Access content for personal, educational use</li>
              <li>Share links to our content</li>
              <li>Download free resources for personal use</li>
            </ul>

            <h3>Restrictions</h3>
            <p>You may NOT:</p>
            <ul>
              <li>Reproduce, distribute, or sell our content without permission</li>
              <li>Remove copyright notices from any materials</li>
              <li>Use content for commercial purposes without a license</li>
              <li>Create derivative works from our materials</li>
            </ul>

            <h2>5. Purchases and Payments</h2>
            <h3>Pricing</h3>
            <p>
              All prices are displayed in EUR unless otherwise specified. We reserve the
              right to change prices at any time.
            </p>

            <h3>Payment Processing</h3>
            <p>
              Payments are processed securely through Stripe. By making a purchase, you
              agree to Stripe&apos;s terms of service.
            </p>

            <h3>Refunds</h3>
            <p>
              Digital products are non-refundable once downloaded. For physical products,
              please contact us within 14 days of receipt for return requests.
            </p>

            <h2>6. Educational Disclaimer</h2>
            <p>
              <strong>Important:</strong> The content provided on Periospot is for educational
              purposes only and should not be considered as medical or dental advice. Always
              consult with qualified professionals and follow established clinical protocols.
            </p>
            <p>
              We do not guarantee specific outcomes from applying techniques or information
              presented in our content. Clinical decisions should be made based on individual
              patient assessment and professional judgment.
            </p>

            <h2>7. User Conduct</h2>
            <p>When using our services, you agree not to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or interfere with our systems</li>
              <li>Impersonate others or provide false information</li>
              <li>Engage in spam, harassment, or abusive behavior</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>

            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or services. We are not
              responsible for their content, privacy practices, or terms of service.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Periospot shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from
              your use of our services.
            </p>
            <p>
              Our total liability for any claims arising from these terms shall not exceed
              the amount paid by you for the services in question.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Periospot, its officers, directors,
              employees, and agents from any claims, damages, or expenses arising from your
              violation of these terms or use of our services.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting. Your continued use of our services constitutes acceptance
              of the modified terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of
              the European Union. Any disputes shall be resolved in the courts of Spain.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:legal@periospot.com">legal@periospot.com</a></li>
              <li>Website: <Link href="/team" className="text-primary hover:underline">Contact Form</Link></li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
            Cookie Policy
          </Link>
        </div>
      </div>
    </main>
  )
}
