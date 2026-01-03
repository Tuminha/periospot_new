import { NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

// Initialize GA4 client with credentials
function getGA4Client() {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  if (!credentials) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON not configured")
  }

  const parsedCredentials = JSON.parse(credentials)

  return new BetaAnalyticsDataClient({
    credentials: parsedCredentials,
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "30daysAgo"

  const propertyId = process.env.GA4_PROPERTY_ID

  if (!propertyId) {
    return NextResponse.json(
      { error: "GA4_PROPERTY_ID not configured" },
      { status: 500 }
    )
  }

  try {
    const analyticsDataClient = getGA4Client()

    // Run multiple reports in parallel
    const [
      overviewReport,
      topPagesReport,
      countriesReport,
      trafficSourcesReport,
      devicesReport,
    ] = await Promise.all([
      // Overview metrics
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          { startDate: period, endDate: "today" },
          { startDate: "7daysAgo", endDate: "today" },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
          { name: "engagementRate" },
        ],
      }),

      // Top pages
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: period, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [
          { metric: { metricName: "screenPageViews" }, desc: true },
        ],
        limit: 10,
      }),

      // Top countries
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: period, endDate: "today" }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [
          { metric: { metricName: "activeUsers" }, desc: true },
        ],
        limit: 10,
      }),

      // Traffic sources
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: period, endDate: "today" }],
        dimensions: [
          { name: "sessionSource" },
          { name: "sessionMedium" },
        ],
        metrics: [{ name: "sessions" }, { name: "newUsers" }],
        orderBys: [
          { metric: { metricName: "sessions" }, desc: true },
        ],
        limit: 10,
      }),

      // Devices
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: period, endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [
          { metric: { metricName: "activeUsers" }, desc: true },
        ],
      }),
    ])

    // Parse overview metrics
    const currentMetrics = overviewReport[0].rows?.[0]?.metricValues || []
    const last7DaysMetrics = overviewReport[0].rows?.[1]?.metricValues || []

    const overview = {
      activeUsers: parseInt(currentMetrics[0]?.value || "0"),
      newUsers: parseInt(currentMetrics[1]?.value || "0"),
      sessions: parseInt(currentMetrics[2]?.value || "0"),
      pageViews: parseInt(currentMetrics[3]?.value || "0"),
      avgSessionDuration: parseFloat(currentMetrics[4]?.value || "0"),
      bounceRate: parseFloat(currentMetrics[5]?.value || "0") * 100,
      engagementRate: parseFloat(currentMetrics[6]?.value || "0") * 100,
      last7Days: {
        activeUsers: parseInt(last7DaysMetrics[0]?.value || "0"),
        newUsers: parseInt(last7DaysMetrics[1]?.value || "0"),
        sessions: parseInt(last7DaysMetrics[2]?.value || "0"),
        pageViews: parseInt(last7DaysMetrics[3]?.value || "0"),
      },
    }

    // Parse top pages
    const topPages = (topPagesReport[0].rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || "",
      views: parseInt(row.metricValues?.[0]?.value || "0"),
      avgDuration: parseFloat(row.metricValues?.[1]?.value || "0"),
    }))

    // Parse countries with flags
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
    }

    const topCountries = (countriesReport[0].rows || []).map((row) => {
      const country = row.dimensionValues?.[0]?.value || ""
      return {
        country,
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
        flag: countryFlags[country] || "🌍",
      }
    })

    // Parse traffic sources
    const trafficSources = (trafficSourcesReport[0].rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "(direct)",
      medium: row.dimensionValues?.[1]?.value || "(none)",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }))

    // Parse devices
    const devices = (devicesReport[0].rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }))

    const analyticsData = {
      overview,
      topPages,
      topCountries,
      trafficSources,
      devices,
      period,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("GA4 Analytics error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch GA4 analytics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
