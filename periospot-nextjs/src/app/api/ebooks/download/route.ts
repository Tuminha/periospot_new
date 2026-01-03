import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

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
