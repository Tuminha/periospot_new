import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null
function getGemini() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
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

    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are an AI analytics assistant for Periospot, a dental education platform.
Analyze this dashboard data and provide a concise, actionable weekly report.

Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Generate a brief report (150-200 words) covering:
1. Key metrics highlights
2. Notable trends (positive and concerning)
3. Top performing content
4. Geographic insights
5. 2-3 actionable recommendations

Use emojis sparingly for visual appeal. Be direct and insightful.
Format with markdown for readability.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const report = response.text()

    return NextResponse.json({ report })
  } catch (error) {
    console.error("AI Report error:", error)
    return NextResponse.json({
      report: "Unable to generate AI report. Please check your Gemini API configuration."
    }, { status: 500 })
  }
}
