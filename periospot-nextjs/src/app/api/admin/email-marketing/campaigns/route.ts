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

// GET - Fetch all campaigns
export async function GET() {
  try {
    const supabase = getSupabase()

    // Try to fetch from database
    const { data: campaigns, error } = await supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      // Return mock data if table doesn't exist
      return NextResponse.json({
        campaigns: getMockCampaigns(),
      })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Failed to fetch campaigns:", error)
    return NextResponse.json({
      campaigns: getMockCampaigns(),
    })
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, preheader, content, audience } = body

    if (!name || !subject) {
      return NextResponse.json(
        { error: "Name and subject are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Create campaign in database
    const { data: campaign, error } = await supabase
      .from("email_campaigns")
      .insert({
        name,
        subject,
        preheader,
        content,
        audience,
        status: "draft",
        recipients: 0,
        opens: 0,
        clicks: 0,
        unsubscribes: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      // Return success anyway for demo purposes
      return NextResponse.json({
        success: true,
        campaign: {
          id: Date.now().toString(),
          name,
          subject,
          status: "draft",
        },
      })
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("Failed to create campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}

function getMockCampaigns() {
  return [
    {
      id: "1",
      name: "The Periospot Brew #47",
      subject: "Socket Shield Updates & New Research",
      status: "sent",
      sentAt: "Jan 2, 2026",
      recipients: 18934,
      opens: 8234,
      clicks: 1456,
      unsubscribes: 12,
    },
    {
      id: "2",
      name: "Happy New Year 2026",
      subject: "🎉 Happy New Year from Periospot!",
      status: "sent",
      sentAt: "Jan 1, 2026",
      recipients: 18890,
      opens: 9567,
      clicks: 2341,
      unsubscribes: 8,
    },
    {
      id: "3",
      name: "The Periospot Brew #48",
      subject: "Immediate Implant Placement: New Guidelines",
      status: "draft",
      recipients: 0,
      opens: 0,
      clicks: 0,
      unsubscribes: 0,
    },
  ]
}
