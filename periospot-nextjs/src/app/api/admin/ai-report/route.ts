import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServiceRoleClient } from "@/lib/mcp/utils/supabase"
import fs from "fs"
import path from "path"

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null
function getGemini() {
  if (!genAI) {
    // Support multiple environment variable names
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.GOOGLE_GEMINI_API_KEY ||
                   process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey)
      console.log("Gemini AI initialized successfully")
    } else {
      console.error("Gemini API key not found. Checked: GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY, NEXT_PUBLIC_GEMINI_API_KEY")
    }
  }
  return genAI
}

// Load legacy WordPress data for context
function getLegacyDataContext() {
  try {
    // Legacy data is at the project root, one level up from periospot-nextjs
    const contentDir = path.join(process.cwd(), "..", "legacy-wordpress", "content")
    const summaryPath = path.join(contentDir, "export_summary.json")
    
    let context = ""
    
    // Load export summary if available
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"))
      context += `\n\n**Legacy WordPress Content Summary:**
- Total Posts: ${summary.total_posts}
- Total Products: ${summary.total_products}
- Total Authors: ${summary.total_authors}
- Total Categories: ${summary.total_categories}
- Posts by Category: ${JSON.stringify(summary.posts_by_category, null, 2)}`
    }
    
    return context
  } catch (error) {
    console.error("Error loading legacy data:", error)
    return ""
  }
}

export async function POST(request: NextRequest) {
  const gemini = getGemini()

  if (!gemini) {
    return NextResponse.json({
      report: `📊 **Weekly Insights Summary**

Your Periospot analytics dashboard is ready! To enable AI-powered insights, add your Gemini API key:

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to your environment variables:
   \`GEMINI_API_KEY=your_key_here\`

**Current Highlights (Mock Data):**
• 342 new users in the last 7 days (+12% vs last week)
• Top content: Socket Shield Technique articles
• Spain leads with 28% of total users
• Newsletter open rate: 42.3% (industry avg: 21%)

💡 **Quick Wins:**
- Your churn rate is healthy at 1.8%
- Consider creating more Spanish content
- The Socket Shield Kit is your top product`
    })
  }

  try {
    const { analyticsData } = await request.json()

    // Get legacy WordPress data context
    const legacyContext = getLegacyDataContext()
    
    // Get current database stats for comparison
    let dbContext = ""
    try {
      const supabase = createServiceRoleClient()
      
      // Get post counts
      const { count: postCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
      
      // Get product counts
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
      
      // Get subscriber counts
      const { count: subscriberCount } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
      
      dbContext = `\n\n**Current Database Stats:**
- Posts in database: ${postCount || 0}
- Products in database: ${productCount || 0}
- Newsletter subscribers: ${subscriberCount || 0}`
    } catch (dbError) {
      console.error("Error fetching database stats:", dbError)
    }

    const model = gemini.getGenerativeModel({ model: "gemini-3-flash-preview" })

    const prompt = `You are an AI analytics assistant for Periospot, a dental education platform focused on implantology and periodontics.
Analyze this dashboard data and provide a concise, actionable weekly report with deep insights.

**Current Analytics Data:**
${JSON.stringify(analyticsData, null, 2)}
${legacyContext}
${dbContext}

**About Periospot:**
- Platform: Dental education for professionals
- Content: 80+ blog posts (English, Spanish, Portuguese, Chinese)
- Products: 40+ products (animations, speaker packs, instruments, accessories)
- Focus Areas: Implantology, Periodontics, Socket Shield Technique
- Audience: Dental professionals worldwide (strong presence in Spain, US, Brazil)

**Generate a comprehensive report (200-250 words) covering:**
1. Key metrics highlights with context (compare to historical data if available)
2. Notable trends (positive and concerning) with actionable insights
3. Top performing content analysis (what's working and why)
4. Geographic insights (opportunities for localization)
5. Content gap analysis (what's missing based on legacy data)
6. 3-4 actionable recommendations for growth

**Style Guidelines:**
- Use emojis sparingly for visual appeal (1-2 per section)
- Be direct, insightful, and data-driven
- Reference specific numbers and percentages
- Format with markdown for readability (headings, bullet points, bold)
- Connect current metrics to historical context when relevant
- Suggest concrete next steps based on the data`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const report = response.text()

    return NextResponse.json({ report })
  } catch (error) {
    console.error("AI Report error:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({
      report: `Unable to generate AI report. Error: ${error instanceof Error ? error.message : "Unknown error"}. Please check your Gemini API configuration and logs.`
    }, { status: 500 })
  }
}
