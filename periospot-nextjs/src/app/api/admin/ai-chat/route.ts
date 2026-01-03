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

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  const gemini = getGemini()

  if (!gemini) {
    return NextResponse.json({
      response: "Gemini AI is not configured. Please add your GEMINI_API_KEY environment variable to enable AI chat."
    })
  }

  try {
    const { message, analyticsData, history } = await request.json()

    const model = gemini.getGenerativeModel({ model: "gemini-3-flash-preview" })

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

    // Build conversation history
    const conversationHistory = history?.map((msg: ChatMessage) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) || []

    const systemContext = `You are an AI analytics assistant for Periospot, a dental education platform run by Cisco.
You have access to the platform's analytics data, legacy WordPress content, and current database statistics.

**About Periospot:**
- Platform: Dental education for professionals
- Content: 80+ blog posts (English, Spanish, Portuguese, Chinese)
- Products: 40+ products (animations, speaker packs, instruments, accessories)
- Focus Areas: Implantology, Periodontics, Socket Shield Technique
- Audience: Dental professionals worldwide (strong presence in Spain, US, Brazil)

**Current Analytics Data:**
${JSON.stringify(analyticsData, null, 2)}
${legacyContext}
${dbContext}

**Guidelines:**
- Be concise but helpful (aim for 50-150 words unless asked for detail)
- Provide specific numbers when relevant
- Suggest actionable ideas when appropriate
- You can discuss marketing strategies, content ideas, user engagement, and growth tactics
- Reference legacy data and historical context when relevant
- Be friendly and professional
- Use emojis sparingly for visual appeal (1-2 per response max)

Answer the user's question based on this comprehensive data and context.`

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm your Periospot analytics assistant. I have access to your dashboard data and I'm ready to help you analyze metrics, identify trends, and brainstorm growth strategies. What would you like to know?" }],
        },
        ...conversationHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("AI Chat error:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({
      response: `Sorry, I encountered an error processing your request: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
    }, { status: 500 })
  }
}
