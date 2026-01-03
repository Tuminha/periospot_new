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

    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Build conversation history
    const conversationHistory = history?.map((msg: ChatMessage) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) || []

    const systemContext = `You are an AI analytics assistant for Periospot, a dental education platform run by Cisco.
You have access to the platform's analytics data and can answer questions, provide insights, and brainstorm ideas.

Current Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Guidelines:
- Be concise but helpful (aim for 50-150 words unless asked for detail)
- Provide specific numbers when relevant
- Suggest actionable ideas when appropriate
- You can discuss marketing strategies, content ideas, user engagement, and growth tactics
- Be friendly and professional
- Use emojis sparingly for visual appeal

Answer the user's question based on this data and context.`

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
    return NextResponse.json({
      response: "Sorry, I encountered an error processing your request. Please try again."
    }, { status: 500 })
  }
}
