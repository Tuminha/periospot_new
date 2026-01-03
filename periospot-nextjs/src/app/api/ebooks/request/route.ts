import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

// Initialize Resend
let resend: Resend | null = null
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Initialize Supabase admin client
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ebookId,
      ebookSlug,
      ebookTitle,
      email,
      firstName,
      lastName,
      acceptsMarketing,
      trigger,
    } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const resendClient = getResend()

    // Get ebook details from database if we have a slug
    let title = ebookTitle || "Periospot eBook"
    if (ebookSlug && !ebookTitle) {
      const { data: ebook } = await supabase
        .from("ebooks")
        .select("title")
        .eq("slug", ebookSlug)
        .single()

      if (ebook) {
        title = ebook.title
      }
    }

    // Build download URL (using slug-based download)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://periospot.com"
    const downloadUrl = ebookSlug
      ? `${baseUrl}/api/ebooks/download?slug=${ebookSlug}`
      : `${baseUrl}/library`

    // Add to newsletter subscribers if they opted in
    if (acceptsMarketing) {
      try {
        // Add to Resend audience
        if (resendClient && process.env.RESEND_AUDIENCE_ID) {
          await resendClient.contacts.create({
            email,
            firstName: firstName || "",
            lastName: lastName || "",
            unsubscribed: false,
            audienceId: process.env.RESEND_AUDIENCE_ID,
          })
        }

        // Add to database
        await supabase.from("newsletter_subscribers").upsert({
          email,
          first_name: firstName || "",
          last_name: lastName || "",
          source: `eBook: ${title}`,
          tags: ["ebook-download", ebookSlug || ebookId || "unknown"],
          unsubscribed: false,
        })
      } catch (subError) {
        console.error("Subscriber error:", subError)
      }
    }

    // Send email with download link
    if (resendClient) {
      try {
        await resendClient.emails.send({
          from: "Periospot <hello@periospot.com>",
          to: email,
          subject: `Your eBook: ${title}`,
          html: generateEbookEmail({
            firstName: firstName || "there",
            ebookTitle: title,
            downloadUrl,
          }),
        })
      } catch (emailError) {
        console.error("Email send error:", emailError)
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "eBook sent to your email",
    })
  } catch (error) {
    console.error("eBook request error:", error)
    return NextResponse.json(
      { error: "Failed to process eBook request" },
      { status: 500 }
    )
  }
}

function generateEbookEmail({
  firstName,
  ebookTitle,
  downloadUrl,
}: {
  firstName: string
  ebookTitle: string
  downloadUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your eBook from Periospot</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">◉ periospot</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your eBook is Ready!</p>
      </div>

      <!-- Content -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}!</h2>

        <p style="color: #4b5563; margin: 0 0 20px 0;">
          Thank you for your interest in our educational resources. Your eBook is ready for download:
        </p>

        <!-- Book Card -->
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">📚 ${ebookTitle}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Click the button below to download your copy</p>
        </div>

        <!-- Download Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
            Download eBook
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0 0; text-align: center;">
          ⏳ This download link expires in 7 days
        </p>

        <!-- Divider -->
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

        <!-- More Resources -->
        <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 16px;">You might also enjoy:</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563;">
          <li style="margin: 8px 0;"><a href="https://periospot.com/blog" style="color: #10b981; text-decoration: none;">Latest articles on implantology</a></li>
          <li style="margin: 8px 0;"><a href="https://periospot.com/library" style="color: #10b981; text-decoration: none;">Free resource library</a></li>
          <li style="margin: 8px 0;"><a href="https://periospot.com/resources/workstation" style="color: #10b981; text-decoration: none;">Cisco's Workstation setup</a></li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="background: #f9fafb; padding: 24px 30px; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
          Happy learning!<br>
          <strong>The Periospot Team</strong>
        </p>
        <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
          © ${new Date().getFullYear()} Periospot. All rights reserved.<br>
          <a href="https://periospot.com/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a> •
          <a href="{{unsubscribe_url}}" style="color: #10b981; text-decoration: none;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}
