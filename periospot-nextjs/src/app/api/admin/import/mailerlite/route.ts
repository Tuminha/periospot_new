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

interface MailerLiteSubscriber {
  id: string
  email: string
  status: string
  source: string
  sent: number
  opens_count: number
  clicks_count: number
  open_rate: number
  click_rate: number
  ip_address: string | null
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
  fields: {
    name?: string
    last_name?: string
    company?: string
    country?: string
    city?: string
    phone?: string
    state?: string
    z_i_p?: string
  }
  groups: Array<{
    id: string
    name: string
    active_count: number
    sent_count: number
    opens_count: number
    open_rate: { float: number; string: string }
    clicks_count: number
    click_rate: { float: number; string: string }
    unsubscribed_count: number
    unconfirmed_count: number
    bounced_count: number
    junk_count: number
  }>
}

interface MailerLiteResponse {
  data: MailerLiteSubscriber[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    path: string
    per_page: number
    next_cursor: string | null
    prev_cursor: string | null
  }
}

// GET - Preview subscribers from MailerLite
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor") || ""
    const limit = parseInt(searchParams.get("limit") || "100")

    const mailerLiteApiKey = process.env.MAILERLITE_API_KEY

    if (!mailerLiteApiKey) {
      return NextResponse.json(
        { error: "MailerLite API key not configured" },
        { status: 500 }
      )
    }

    // Fetch subscribers from MailerLite
    const url = new URL("https://connect.mailerlite.com/api/subscribers")
    url.searchParams.set("limit", limit.toString())
    if (cursor) {
      url.searchParams.set("cursor", cursor)
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${mailerLiteApiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("MailerLite API error:", error)
      return NextResponse.json(
        { error: "Failed to fetch from MailerLite" },
        { status: response.status }
      )
    }

    const data: MailerLiteResponse = await response.json()

    // Format subscribers for preview
    const subscribers = data.data.map((sub) => ({
      email: sub.email,
      firstName: sub.fields.name || "",
      lastName: sub.fields.last_name || "",
      status: sub.status,
      source: sub.source,
      country: sub.fields.country || "",
      subscribedAt: sub.subscribed_at,
      groups: sub.groups.map((g) => g.name),
      stats: {
        sent: sub.sent,
        opens: sub.opens_count,
        clicks: sub.clicks_count,
        openRate: sub.open_rate,
        clickRate: sub.click_rate,
      },
    }))

    return NextResponse.json({
      subscribers,
      nextCursor: data.meta.next_cursor,
      hasMore: !!data.meta.next_cursor,
    })
  } catch (error) {
    console.error("MailerLite fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    )
  }
}

// POST - Import subscribers from MailerLite to Resend/Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cursor = "",
      batchSize = 100,
      importToResend = true,
      importToSupabase = true,
      skipUnsubscribed = true,
    } = body

    const mailerLiteApiKey = process.env.MAILERLITE_API_KEY
    const supabase = getSupabase()
    const resendClient = getResend()

    if (!mailerLiteApiKey) {
      return NextResponse.json(
        { error: "MailerLite API key not configured" },
        { status: 500 }
      )
    }

    // Fetch batch from MailerLite
    const url = new URL("https://connect.mailerlite.com/api/subscribers")
    url.searchParams.set("limit", batchSize.toString())
    if (cursor) {
      url.searchParams.set("cursor", cursor)
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${mailerLiteApiKey}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from MailerLite" },
        { status: response.status }
      )
    }

    const data: MailerLiteResponse = await response.json()

    const results = {
      total: data.data.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const subscriber of data.data) {
      try {
        // Skip unsubscribed if requested
        if (skipUnsubscribed && subscriber.status === "unsubscribed") {
          results.skipped++
          continue
        }

        const subscriberData = {
          email: subscriber.email,
          first_name: subscriber.fields.name || "",
          last_name: subscriber.fields.last_name || "",
          source: `MailerLite Import (${subscriber.source})`,
          country: subscriber.fields.country || "",
          tags: subscriber.groups.map((g) => g.name),
          unsubscribed: subscriber.status === "unsubscribed",
          mailerlite_id: subscriber.id,
          imported_at: new Date().toISOString(),
          original_subscribed_at: subscriber.subscribed_at,
          stats: {
            sent: subscriber.sent,
            opens: subscriber.opens_count,
            clicks: subscriber.clicks_count,
          },
        }

        // Import to Supabase
        if (importToSupabase) {
          const { error: dbError } = await supabase
            .from("newsletter_subscribers")
            .upsert(subscriberData, { onConflict: "email" })

          if (dbError) {
            console.error("Supabase error:", dbError)
          }
        }

        // Import to Resend
        if (importToResend && resendClient && process.env.RESEND_AUDIENCE_ID) {
          try {
            await resendClient.contacts.create({
              email: subscriber.email,
              firstName: subscriber.fields.name || "",
              lastName: subscriber.fields.last_name || "",
              unsubscribed: subscriber.status === "unsubscribed",
              audienceId: process.env.RESEND_AUDIENCE_ID,
            })
          } catch (resendError) {
            // Resend might throw if contact already exists
            console.error("Resend error:", resendError)
          }
        }

        results.imported++
      } catch (error) {
        results.failed++
        results.errors.push(`${subscriber.email}: ${String(error)}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      nextCursor: data.meta.next_cursor,
      hasMore: !!data.meta.next_cursor,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Failed to import subscribers" },
      { status: 500 }
    )
  }
}
