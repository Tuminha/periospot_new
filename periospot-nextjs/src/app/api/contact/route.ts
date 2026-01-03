import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend lazily
let resend: Resend | null = null
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function POST(request: NextRequest) {
  const resendClient = getResend()

  try {
    const body = await request.json()
    const { name, email, subject, message, type } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
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

    // Determine subject line
    const emailSubject = subject ||
      (type === "business" ? `[Business Inquiry] from ${name}` :
       type === "collaboration" ? `[Collaboration Request] from ${name}` :
       type === "support" ? `[Support Request] from ${name}` :
       `[Contact Form] Message from ${name}`)

    if (!resendClient) {
      // Log the message if Resend is not configured
      console.log("Contact form submission (Resend not configured):", {
        name,
        email,
        subject: emailSubject,
        type,
        message,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        message: "Message received. We'll get back to you soon!",
      })
    }

    // Send notification email to admin (both emails for notifications)
    await resendClient.emails.send({
      from: "Periospot Contact <contact@periospot.com>",
      to: ["cisco@periospot.com", "periospot@periospot.com"],
      replyTo: email,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            </div>

            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; width: 100px;">From:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #6c757d;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #6c757d;">Type:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                    <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                      ${type || 'General'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6c757d;">Subject:</td>
                  <td style="padding: 10px 0; font-weight: 600;">${subject || 'No subject'}</td>
                </tr>
              </table>

              <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e9ecef;">
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Message:</h3>
                <p style="margin: 0; line-height: 1.6; color: #555; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(emailSubject)}"
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600;">
                  Reply to ${name}
                </a>
              </div>
            </div>

            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              Sent from Periospot Contact Form • ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </body>
        </html>
      `,
    })

    // Send confirmation email to the sender
    await resendClient.emails.send({
      from: "Periospot <contact@periospot.com>",
      to: email,
      subject: "We received your message! 🦷",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Thank you, ${name}! 🙏</h1>
              </div>

              <div style="padding: 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  We've received your message and appreciate you reaching out to us.
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  Our team will review your inquiry and get back to you as soon as possible,
                  typically within 24-48 hours.
                </p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Your message:</h3>
                  <p style="margin: 0; color: #666; font-style: italic; line-height: 1.5;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  In the meantime, feel free to explore our latest articles and resources:
                </p>

                <div style="text-align: center; margin-top: 25px;">
                  <a href="https://periospot.com/blog"
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; border-radius: 25px; text-decoration: none; font-weight: 600; margin: 5px;">
                    Read Articles
                  </a>
                  <a href="https://periospot.com/library"
                     style="display: inline-block; background: white; color: #667eea; border: 2px solid #667eea; padding: 12px 35px; border-radius: 25px; text-decoration: none; font-weight: 600; margin: 5px;">
                    Browse Library
                  </a>
                </div>
              </div>

              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Warm regards,<br>
                  <strong>The Periospot Team</strong>
                </p>
              </div>
            </div>

            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} Periospot. All rights reserved.
            </p>
          </body>
        </html>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}
