import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

// Initialize GA4 client with credentials
function getGA4Client() {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  if (!credentials) {
    return null
  }

  try {
    const parsedCredentials = JSON.parse(credentials)
    return new BetaAnalyticsDataClient({
      credentials: parsedCredentials,
    })
  } catch {
    console.error("Failed to parse GA4 credentials")
    return null
  }
}

async function fetchGA4Data(propertyId: string) {
  const client = getGA4Client()
  if (!client) return null

  try {
    const [
      overviewReport,
      topPagesReport,
      countriesReport,
    ] = await Promise.all([
      // Overview metrics for different time periods
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          { startDate: "7daysAgo", endDate: "today" },
          { startDate: "30daysAgo", endDate: "today" },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      }),

      // Top pages
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),

      // Top countries
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
    ])

    // Parse overview metrics
    const last7DaysMetrics = overviewReport[0].rows?.[0]?.metricValues || []
    const last30DaysMetrics = overviewReport[0].rows?.[1]?.metricValues || []

    // Parse top pages
    const topPages = (topPagesReport[0].rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || "",
      views: parseInt(row.metricValues?.[0]?.value || "0"),
    }))

    // Country flags mapping
    const countryFlags: Record<string, string> = {
      "United States": "🇺🇸",
      "Spain": "🇪🇸",
      "Brazil": "🇧🇷",
      "Mexico": "🇲🇽",
      "Portugal": "🇵🇹",
      "Argentina": "🇦🇷",
      "Colombia": "🇨🇴",
      "United Kingdom": "🇬🇧",
      "Germany": "🇩🇪",
      "France": "🇫🇷",
      "Italy": "🇮🇹",
      "Canada": "🇨🇦",
      "India": "🇮🇳",
      "Australia": "🇦🇺",
      "Japan": "🇯🇵",
      "China": "🇨🇳",
      "Netherlands": "🇳🇱",
      "Belgium": "🇧🇪",
      "Switzerland": "🇨🇭",
      "Chile": "🇨🇱",
      "Peru": "🇵🇪",
      "Venezuela": "🇻🇪",
      "Ecuador": "🇪🇨",
      "(not set)": "🌍",
    }

    // Parse countries
    const topCountries = (countriesReport[0].rows || []).map((row) => {
      const country = row.dimensionValues?.[0]?.value || ""
      return {
        country,
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        flag: countryFlags[country] || "🌍",
      }
    })

    return {
      users: {
        last7Days: parseInt(last7DaysMetrics[0]?.value || "0"),
        last15Days: Math.round(
          (parseInt(last7DaysMetrics[0]?.value || "0") +
            parseInt(last30DaysMetrics[0]?.value || "0")) /
            2
        ),
        last30Days: parseInt(last30DaysMetrics[0]?.value || "0"),
        pageViews7Days: parseInt(last7DaysMetrics[3]?.value || "0"),
        pageViews30Days: parseInt(last30DaysMetrics[3]?.value || "0"),
        newUsers7Days: parseInt(last7DaysMetrics[1]?.value || "0"),
        newUsers30Days: parseInt(last30DaysMetrics[1]?.value || "0"),
      },
      topPages,
      topCountries,
    }
  } catch (error) {
    console.error("GA4 API error:", error)
    return null
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch real subscriber count from Supabase
    const { count: subscriberCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })

    // Fetch GA4 data if configured
    const propertyId = process.env.GA4_PROPERTY_ID
    const ga4Data = propertyId ? await fetchGA4Data(propertyId) : null

    // Build analytics data with real GA4 data where available
    const analyticsData = {
      users: {
        last7Days: ga4Data?.users.last7Days ?? 0,
        last15Days: ga4Data?.users.last15Days ?? 0,
        last30Days: ga4Data?.users.last30Days ?? 0,
        last6Months: 0, // Would need separate query
        lastYear: 0, // Would need separate query
        total: ga4Data?.users.last30Days ?? 0, // Using 30-day as approximation
        churned6Months: 0, // Requires user tracking
        churnedYear: 0, // Requires user tracking
      },
      engagement: {
        topPages: ga4Data?.topPages || [],
        topLinks: [
          // Links would need event tracking - placeholder for now
          { url: "YouTube Channel", clicks: 0 },
          { url: "Instagram @periospot", clicks: 0 },
        ],
        topActiveUsers: [
          // Would need user-level tracking
        ],
      },
      geography: {
        topCountries: ga4Data?.topCountries || [],
      },
      newsletter: {
        lastSent: null, // Would need email service integration
        totalSubscribers: subscriberCount || 0,
        openRate: 0, // Would need email service integration
        clickRate: 0, // Would need email service integration
      },
      recentActivity: [
        // Would need activity logging
      ],
      // Include raw GA4 metrics for display
      ga4: ga4Data
        ? {
            available: true,
            pageViews7Days: ga4Data.users.pageViews7Days,
            pageViews30Days: ga4Data.users.pageViews30Days,
            newUsers7Days: ga4Data.users.newUsers7Days,
            newUsers30Days: ga4Data.users.newUsers30Days,
          }
        : { available: false },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
