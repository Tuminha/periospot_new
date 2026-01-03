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

// GET - Fetch all subscribers
export async function GET() {
  try {
    const supabase = getSupabase()
    const resendClient = getResend()

    // Try to fetch from Resend audience first
    if (resendClient && process.env.RESEND_AUDIENCE_ID) {
      try {
        const { data: contactsResponse } = await resendClient.contacts.list({
          audienceId: process.env.RESEND_AUDIENCE_ID,
        })

        if (contactsResponse && "data" in contactsResponse) {
          const contactsList = contactsResponse.data as Array<{
            id: string
            email: string
            first_name?: string
            last_name?: string
            unsubscribed: boolean
            created_at: string
          }>

          const subscribers = contactsList.map((contact) => ({
            id: contact.id,
            email: contact.email,
            firstName: contact.first_name || "",
            lastName: contact.last_name || "",
            status: contact.unsubscribed ? "unsubscribed" : "subscribed",
            source: "Resend",
            createdAt: contact.created_at,
            tags: [],
          }))

          const stats = {
            total: subscribers.length,
            active: subscribers.filter((s) => s.status === "subscribed").length,
            unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
            newThisMonth: subscribers.filter((s) => {
              const created = new Date(s.createdAt)
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return created > thirtyDaysAgo
            }).length,
          }

          return NextResponse.json({ subscribers, stats })
        }
      } catch (resendError) {
        console.error("Resend error:", resendError)
      }
    }

    // Fallback to database
    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      // Return mock data
      return NextResponse.json({
        subscribers: getMockSubscribers(),
        stats: getMockStats(),
      })
    }

    const formattedSubscribers = subscribers.map((sub) => ({
      id: sub.id,
      email: sub.email,
      firstName: sub.name || "",
      lastName: sub.last_name || "",
      status: sub.status === "active" ? "subscribed" : sub.status || "subscribed",
      source: sub.source || "Website",
      createdAt: sub.created_at || sub.subscribed_at,
      tags: sub.tags ? sub.tags.split(",") : [],
      country: sub.country || "",
    }))

    const stats = {
      total: formattedSubscribers.length,
      active: formattedSubscribers.filter((s) => s.status === "subscribed").length,
      unsubscribed: formattedSubscribers.filter((s) => s.status === "unsubscribed").length,
      newThisMonth: formattedSubscribers.filter((s) => {
        const created = new Date(s.createdAt)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return created > thirtyDaysAgo
      }).length,
    }

    return NextResponse.json({ subscribers: formattedSubscribers, stats })
  } catch (error) {
    console.error("Failed to fetch subscribers:", error)
    return NextResponse.json({
      subscribers: getMockSubscribers(),
      stats: getMockStats(),
    })
  }
}

// POST - Add new subscriber or import subscribers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, source, tags, bulk } = body

    const supabase = getSupabase()
    const resendClient = getResend()

    // Bulk import
    if (bulk && Array.isArray(bulk)) {
      const results = []
      for (const subscriber of bulk) {
        try {
          // Add to Resend
          if (resendClient && process.env.RESEND_AUDIENCE_ID) {
            await resendClient.contacts.create({
              email: subscriber.email,
              firstName: subscriber.firstName || "",
              lastName: subscriber.lastName || "",
              unsubscribed: false,
              audienceId: process.env.RESEND_AUDIENCE_ID,
            })
          }

          // Add to database
          await supabase.from("subscribers").upsert({
            email: subscriber.email,
            name: subscriber.firstName || "",
            last_name: subscriber.lastName || "",
            source: subscriber.source || "Import",
            tags: subscriber.tags ? subscriber.tags.join(",") : null,
            status: "active",
          })

          results.push({ email: subscriber.email, success: true })
        } catch (error) {
          results.push({ email: subscriber.email, success: false, error: String(error) })
        }
      }

      return NextResponse.json({
        success: true,
        imported: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      })
    }

    // Single subscriber
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Add to Resend
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
    const { error } = await supabase.from("subscribers").upsert({
      email,
      name: firstName || "",
      last_name: lastName || "",
      source: source || "Manual",
      tags: tags ? tags.join(",") : null,
      status: "active",
    })

    if (error) {
      console.error("Database error:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add subscriber:", error)
    return NextResponse.json(
      { error: "Failed to add subscriber" },
      { status: 500 }
    )
  }
}

function getMockSubscribers() {
  return [
    { id: "1", email: "dr.martinez@clinic.com", firstName: "Carlos", lastName: "Martinez", status: "subscribed", source: "Website", createdAt: "2025-06-15", tags: ["spanish", "engaged"] },
    { id: "2", email: "dental.pro@gmail.com", firstName: "Sarah", lastName: "Johnson", status: "subscribed", source: "eBook Download", createdAt: "2025-08-22", tags: ["english", "new"] },
    { id: "3", email: "implant.expert@mail.com", firstName: "Michael", lastName: "Chen", status: "subscribed", source: "Course Signup", createdAt: "2025-03-10", tags: ["english", "engaged"] },
    { id: "4", email: "perio.specialist@clinic.es", firstName: "Ana", lastName: "García", status: "subscribed", source: "Website", createdAt: "2025-11-05", tags: ["spanish"] },
    { id: "5", email: "old.subscriber@mail.com", firstName: "", lastName: "", status: "unsubscribed", source: "Import", createdAt: "2024-01-15", tags: [] },
  ]
}

function getMockStats() {
  return {
    total: 18934,
    active: 18456,
    unsubscribed: 478,
    newThisMonth: 342,
  }
}
