import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET - Fetch all templates
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data: templates, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ templates: getDefaultTemplates() })
    }

    return NextResponse.json({
      templates: templates.length > 0 ? templates : getDefaultTemplates(),
    })
  } catch (error) {
    console.error("Failed to fetch templates:", error)
    return NextResponse.json({ templates: getDefaultTemplates() })
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, content, category } = body

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("email_templates")
      .insert({
        name,
        subject: subject || "",
        content,
        category: category || "general",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, template: data })
  } catch (error) {
    console.error("Failed to create template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}

// PUT - Update template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, subject, content, category } = body

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("email_templates")
      .update({
        name,
        subject,
        content,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to update template" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, template: data })
  } catch (error) {
    console.error("Failed to update template:", error)
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    )
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to delete template" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete template:", error)
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    )
  }
}

function getDefaultTemplates() {
  return [
    {
      id: "template-1",
      name: "Welcome Email",
      subject: "Welcome to Periospot!",
      category: "onboarding",
      content: `<h2>Welcome to Periospot, {{firstName}}!</h2>
<p>We're thrilled to have you join our community of dental professionals.</p>
<p>Here's what you can expect:</p>
<ul>
  <li>Weekly articles on the latest in implantology and periodontics</li>
  <li>Exclusive access to our resource library</li>
  <li>Early bird discounts on courses and products</li>
</ul>
<p>Have questions? Just reply to this email!</p>
<p>Best regards,<br>The Periospot Team</p>`,
      createdAt: "2025-01-01",
    },
    {
      id: "template-2",
      name: "New Article Notification",
      subject: "New Article: {{articleTitle}}",
      category: "content",
      content: `<h2>New Article Published</h2>
<p>Hi {{firstName}},</p>
<p>We just published a new article that we think you'll love:</p>
<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="margin: 0 0 10px 0;">{{articleTitle}}</h3>
  <p style="margin: 0; color: #6b7280;">{{articleExcerpt}}</p>
</div>
<p><a href="{{articleUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Read Article</a></p>`,
      createdAt: "2025-01-02",
    },
    {
      id: "template-3",
      name: "Monthly Newsletter",
      subject: "Periospot Monthly: {{month}} Highlights",
      category: "newsletter",
      content: `<h2>Monthly Highlights</h2>
<p>Hi {{firstName}},</p>
<p>Here's what happened this month at Periospot:</p>

<h3>📚 Top Articles</h3>
<ul>
  <li><a href="#">Socket Shield Technique: A Complete Guide</a></li>
  <li><a href="#">Managing Peri-implantitis: Latest Research</a></li>
  <li><a href="#">Digital Workflow in Implantology</a></li>
</ul>

<h3>🛒 Featured Products</h3>
<p>Check out our latest additions to the shop!</p>

<h3>📅 Upcoming Events</h3>
<p>Don't miss our upcoming webinars and courses.</p>

<p>Thanks for being part of our community!</p>`,
      createdAt: "2025-01-03",
    },
    {
      id: "template-4",
      name: "eBook Delivery",
      subject: "Your eBook is Ready: {{ebookTitle}}",
      category: "lead-magnet",
      content: `<h2>Your eBook is Ready!</h2>
<p>Hi {{firstName}},</p>
<p>Thank you for downloading <strong>{{ebookTitle}}</strong>.</p>
<p>Click the button below to access your eBook:</p>
<p><a href="{{downloadUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Download eBook</a></p>
<p>We hope you find it valuable!</p>
<p><em>P.S. This download link expires in 7 days.</em></p>`,
      createdAt: "2025-01-04",
    },
    {
      id: "template-5",
      name: "Course Enrollment",
      subject: "Welcome to {{courseName}}!",
      category: "courses",
      content: `<h2>You're Enrolled!</h2>
<p>Hi {{firstName}},</p>
<p>Congratulations on enrolling in <strong>{{courseName}}</strong>!</p>
<p>Here's how to get started:</p>
<ol>
  <li>Log in to your dashboard</li>
  <li>Navigate to "My Courses"</li>
  <li>Start with Module 1</li>
</ol>
<p><a href="{{courseUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Access Course</a></p>
<p>Good luck with your learning!</p>`,
      createdAt: "2025-01-05",
    },
  ]
}
