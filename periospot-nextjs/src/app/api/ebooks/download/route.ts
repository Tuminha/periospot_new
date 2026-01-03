import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Resend } from 'resend'

// Initialize Resend lazily
let resend: Resend | null = null
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Send email with download link
async function sendDownloadEmail(
  email: string,
  ebookTitle: string,
  downloadUrl: string,
  slug: string
) {
  const resendClient = getResend()
  if (!resendClient || !email) return

  try {
    await resendClient.emails.send({
      from: 'Periospot <ebooks@periospot.com>',
      to: email,
      subject: `Your eBook: ${ebookTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://periospot.com/images/logo.png" alt="Periospot" style="height: 40px;" />
          </div>

          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Your eBook is Ready!</h1>

          <p>Thank you for downloading <strong>${ebookTitle}</strong>.</p>

          <p>Click the button below to download your eBook:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Download eBook
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            <em>Note: This download link will expire in 24 hours. If you need a new link, visit
            <a href="https://periospot.com/library" style="color: #0066cc;">our library</a>.</em>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #666; font-size: 14px;">
            Explore more educational resources at <a href="https://periospot.com/library" style="color: #0066cc;">Periospot Library</a>.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center;">
            <p>Periospot - Dental Education & Resources</p>
            <p>
              <a href="https://periospot.com" style="color: #666;">Website</a> ·
              <a href="https://periospot.com/privacy" style="color: #666;">Privacy</a> ·
              <a href="https://periospot.com/terms" style="color: #666;">Terms</a>
            </p>
          </div>
        </body>
        </html>
      `,
    })
    console.log(`Download email sent to ${email} for ${slug}`)
  } catch (error) {
    console.error('Failed to send download email:', error)
    // Don't throw - email failure shouldn't block download
  }
}

// POST /api/ebooks/download - Request ebook download
// For logged-in users: immediate download
// For non-logged-in users: requires email for lead capture
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const headersList = await headers()

    const body = await request.json()
    const { slug, email, marketingConsent, source } = body

    if (!slug) {
      return NextResponse.json({ error: 'Missing ebook slug' }, { status: 400 })
    }

    // Get ebook info
    const { data: ebook, error: ebookError } = await supabase
      .from('ebooks')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (ebookError || !ebook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 })
    }

    // Check if ebook has a PDF
    if (!ebook.pdf_path) {
      // If no PDF but has external link, redirect there
      if (ebook.genius_link_url || ebook.apple_books_url) {
        return NextResponse.json({
          type: 'external',
          url: ebook.genius_link_url || ebook.apple_books_url
        })
      }
      return NextResponse.json({ error: 'Ebook file not available' }, { status: 404 })
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    // For free ebooks without login, require email
    if (!user && ebook.is_free) {
      if (!email) {
        return NextResponse.json({
          error: 'Email required for download',
          requiresEmail: true
        }, { status: 401 })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
    }

    // For paid ebooks, require login
    if (!ebook.is_free && !user) {
      return NextResponse.json({
        error: 'Login required for paid ebooks',
        requiresLogin: true
      }, { status: 401 })
    }

    // Record download
    const userAgent = headersList.get('user-agent') || ''
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0] || 'unknown'

    const { error: downloadError } = await supabase
      .from('ebook_downloads')
      .insert({
        ebook_id: ebook.id,
        user_id: user?.id || null,
        email: email || user?.email || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        marketing_consent: marketingConsent || false,
        source: source || 'library'
      })

    if (downloadError) {
      console.error('Error recording download:', downloadError)
      // Continue anyway - don't block download
    }

    // Generate signed URL for download
    // Use admin client for storage operations
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: signedUrlData, error: urlError } = await adminSupabase
      .storage
      .from('ebooks')
      .createSignedUrl(ebook.pdf_path, 60 * 5) // 5 minute expiry

    if (urlError || !signedUrlData) {
      console.error('Error generating signed URL:', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    // Generate a longer-lived URL for email (24 hours)
    const { data: emailUrlData } = await adminSupabase
      .storage
      .from('ebooks')
      .createSignedUrl(ebook.pdf_path, 60 * 60 * 24) // 24 hour expiry for email

    // Send download email (async, don't wait)
    const recipientEmail = email || user?.email
    if (recipientEmail && emailUrlData?.signedUrl) {
      sendDownloadEmail(
        recipientEmail,
        ebook.title,
        emailUrlData.signedUrl,
        ebook.slug
      )
    }

    return NextResponse.json({
      type: 'download',
      url: signedUrlData.signedUrl,
      filename: `${ebook.slug}.pdf`,
      title: ebook.title
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/ebooks/download?slug=xxx - Quick download for logged-in users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  // Forward to POST handler
  const response = await POST(
    new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ slug, source: 'direct' })
    })
  )

  return response
}
