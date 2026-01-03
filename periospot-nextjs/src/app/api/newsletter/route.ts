import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

// Initialize Resend lazily to avoid build-time errors when API key is not set
let resend: Resend | null = null
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Initialize Supabase client
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Audience ID for newsletter subscribers (create this in Resend dashboard)
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "periospot-newsletter"

export async function POST(request: NextRequest) {
  const resendClient = getResend()

  if (!resendClient) {
    return NextResponse.json(
      { error: "Newsletter service is not configured" },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { email, firstName } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Add contact to Resend audience
    // Note: You need to create an audience in Resend dashboard first
    try {
      await resendClient.contacts.create({
        email,
        firstName: firstName || "",
        unsubscribed: false,
        audienceId: AUDIENCE_ID,
      })
    } catch (contactError: unknown) {
      // If contact already exists, that's okay
      const error = contactError as { message?: string }
      if (!error.message?.includes("already exists")) {
        console.error("Error adding contact:", contactError)
      }
    }

    // Also save to Supabase subscribers table
    try {
      const supabase = getSupabase()
      await supabase.from("subscribers").upsert({
        email: email.toLowerCase(),
        name: firstName || null,
        source: "website",
        status: "active",
        subscribed_at: new Date().toISOString(),
      }, { onConflict: "email" })
    } catch (dbError) {
      console.error("Error saving to database:", dbError)
      // Don't fail if database save fails
    }

    // Send welcome email
    const { error: emailError } = await resendClient.emails.send({
      from: "Periospot <newsletter@periospot.com>",
      to: email,
      subject: "Welcome to The Periospot Brew! 🦷",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0066cc; margin: 0; font-size: 28px;">◉ Periospot</h1>
              </div>

              <h2 style="color: #1f2937; margin-top: 0;">Welcome to The Periospot Brew! 🎉</h2>

              <p style="color: #4b5563; line-height: 1.6;">
                Thank you for subscribing to our newsletter! You've joined a community of dental professionals
                dedicated to continuous learning and excellence.
              </p>

              <p style="color: #4b5563; line-height: 1.6;">
                Every week, you'll receive:
              </p>

              <ul style="color: #4b5563; line-height: 1.8;">
                <li>📚 Latest articles on implant dentistry and periodontics</li>
                <li>🎓 Educational tips and clinical insights</li>
                <li>📖 Free resources and eBook updates</li>
                <li>🔬 Scientific literature highlights</li>
              </ul>

              <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="color: #0369a1; margin: 0; font-weight: 500;">
                  💡 Pro tip: Add newsletter@periospot.com to your contacts to ensure our emails
                  always reach your inbox!
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://periospot.com/blog"
                   style="display: inline-block; background-color: #0066cc; color: white; padding: 14px 28px;
                          text-decoration: none; border-radius: 50px; font-weight: 500;">
                  Start Reading
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;">

              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                You're receiving this email because you subscribed to The Periospot Brew.<br>
                <a href="https://periospot.com" style="color: #6b7280;">Periospot</a> •
                <a href="https://periospot.com/privacy" style="color: #6b7280;">Privacy Policy</a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Don't fail the subscription if just the welcome email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to the newsletter!"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
