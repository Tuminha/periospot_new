import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This route fetches analytics data from Supabase
// In production, you would integrate with analytics services like:
// - Vercel Analytics API
// - Google Analytics Data API
// - PostHog, Mixpanel, etc.

export async function GET() {
  // Verify admin access (in production, add proper auth check)

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get user counts by time period
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last6Months = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    // Query users from auth.users (requires service role key)
    // For now, return mock data as we don't have analytics tables set up

    const analyticsData = {
      users: {
        last7Days: 342,
        last15Days: 687,
        last30Days: 1245,
        last6Months: 4521,
        lastYear: 8934,
        total: 12456,
        churned6Months: 234,
        churnedYear: 567,
      },
      engagement: {
        topPages: [
          { page: "/blog/socket-shield-technique", views: 4521 },
          { page: "/blog/immediate-implant-placement", views: 3892 },
          { page: "/tienda/socket-shield-kit", views: 2845 },
          { page: "/assessments/implantology-quiz", views: 2234 },
          { page: "/blog/bone-grafting-techniques", views: 1987 },
          { page: "/library", views: 1654 },
          { page: "/blog/aesthetic-zone-implants", views: 1432 },
          { page: "/team", views: 1234 },
          { page: "/blog/periodontal-regeneration", views: 1123 },
          { page: "/tienda", views: 987 },
        ],
        topLinks: [
          { url: "YouTube Channel", clicks: 2341 },
          { url: "Instagram @periospot", clicks: 1892 },
          { url: "Socket Shield Course", clicks: 1654 },
          { url: "Patreon Link", clicks: 1234 },
          { url: "Newsletter Signup", clicks: 987 },
        ],
        topActiveUsers: [
          { email: "dr.martinez@clinic.com", actions: 156 },
          { email: "dental.pro@gmail.com", actions: 134 },
          { email: "implant.expert@mail.com", actions: 98 },
          { email: "perio.specialist@clinic.es", actions: 87 },
          { email: "oral.surgeon@hospital.pt", actions: 76 },
        ],
      },
      geography: {
        topCountries: [
          { country: "Spain", users: 3456, flag: "🇪🇸" },
          { country: "United States", users: 2341, flag: "🇺🇸" },
          { country: "Brazil", users: 1987, flag: "🇧🇷" },
          { country: "Mexico", users: 1234, flag: "🇲🇽" },
          { country: "Portugal", users: 987, flag: "🇵🇹" },
          { country: "Argentina", users: 765, flag: "🇦🇷" },
          { country: "Colombia", users: 543, flag: "🇨🇴" },
          { country: "United Kingdom", users: 432, flag: "🇬🇧" },
          { country: "Germany", users: 321, flag: "🇩🇪" },
          { country: "Italy", users: 234, flag: "🇮🇹" },
        ],
      },
      newsletter: {
        lastSent: {
          subject: "The Periospot Brew #47: Socket Shield Updates",
          date: "January 2, 2026",
          opens: 4521,
          clicks: 892,
        },
        totalSubscribers: 18934,
        openRate: 42.3,
        clickRate: 8.7,
      },
      recentActivity: [
        { action: "New user signed up", user: "dr.new@clinic.com", timestamp: "2 min ago" },
        { action: "Completed Implantology Quiz", user: "student@dental.edu", timestamp: "5 min ago" },
        { action: "Purchased Socket Shield Kit", user: "buyer@gmail.com", timestamp: "12 min ago" },
        { action: "Downloaded eBook", user: "reader@mail.com", timestamp: "18 min ago" },
        { action: "Newsletter subscription", user: "subscriber@email.com", timestamp: "25 min ago" },
        { action: "Left a comment", user: "commenter@dental.com", timestamp: "32 min ago" },
        { action: "Viewed 5 articles", user: "learner@clinic.es", timestamp: "45 min ago" },
        { action: "Started assessment", user: "tester@hospital.pt", timestamp: "1 hour ago" },
      ],
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
