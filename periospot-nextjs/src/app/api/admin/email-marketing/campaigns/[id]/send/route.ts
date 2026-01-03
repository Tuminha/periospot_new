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

interface Subscriber {
  id: string
  email: string
  first_name?: string
  last_name?: string
  unsubscribed?: boolean
}

// POST - Send campaign to all subscribers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()
    const { testEmail } = body // Optional: send test to specific email

    const supabase = getSupabase()
    const resendClient = getResend()

    if (!resendClient) {
      return NextResponse.json(
        { error: "Resend is not configured. Please add RESEND_API_KEY." },
        { status: 500 }
      )
    }

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      // Use mock campaign for testing
      const mockCampaign = {
        id: campaignId,
        subject: "Test Campaign from Periospot",
        content: "<h1>Hello {{firstName}}!</h1><p>This is a test email from Periospot.</p>",
        from_name: "Periospot",
        from_email: "hello@periospot.com",
      }

      if (testEmail) {
        // Send test email
        const result = await sendEmail(resendClient, {
          to: testEmail,
          subject: mockCampaign.subject,
          html: mockCampaign.content.replace("{{firstName}}", "Test User"),
          from: `${mockCampaign.from_name} <${mockCampaign.from_email}>`,
        })

        return NextResponse.json({
          success: true,
          message: "Test email sent successfully",
          result,
        })
      }

      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // If test email requested, send only to that address
    if (testEmail) {
      const result = await sendEmail(resendClient, {
        to: testEmail,
        subject: campaign.subject,
        html: personalizeContent(campaign.content, {
          firstName: "Test User",
          lastName: "",
          email: testEmail,
        }),
        from: `${campaign.from_name || "Periospot"} <${campaign.from_email || "hello@periospot.com"}>`,
      })

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        result,
      })
    }

    // Fetch all active subscribers
    let subscribers: Subscriber[] = []

    // Try Resend audience first
    if (process.env.RESEND_AUDIENCE_ID) {
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
          }>
          subscribers = contactsList
            .filter((c) => !c.unsubscribed)
            .map((c) => ({
              id: c.id,
              email: c.email,
              first_name: c.first_name,
              last_name: c.last_name,
            }))
        }
      } catch (resendError) {
        console.error("Resend error:", resendError)
      }
    }

    // Fallback to database
    if (subscribers.length === 0) {
      const { data: dbSubscribers } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("unsubscribed", false)

      if (dbSubscribers) {
        subscribers = dbSubscribers
      }
    }

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers found" },
        { status: 400 }
      )
    }

    // Update campaign status to sending
    await supabase
      .from("email_campaigns")
      .update({ status: "sending", sent_at: new Date().toISOString() })
      .eq("id", campaignId)

    // Send emails in batches
    const batchSize = 100
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      const sendPromises = batch.map(async (subscriber) => {
        try {
          await sendEmail(resendClient, {
            to: subscriber.email,
            subject: campaign.subject,
            html: personalizeContent(campaign.content, {
              firstName: subscriber.first_name || "",
              lastName: subscriber.last_name || "",
              email: subscriber.email,
            }),
            from: `${campaign.from_name || "Periospot"} <${campaign.from_email || "hello@periospot.com"}>`,
          })
          results.sent++
        } catch (error) {
          results.failed++
          results.errors.push(`${subscriber.email}: ${String(error)}`)
        }
      })

      await Promise.all(sendPromises)

      // Small delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Update campaign with results
    await supabase
      .from("email_campaigns")
      .update({
        status: "sent",
        recipients: results.sent,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaignId)

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${results.sent} subscribers`,
      results,
    })
  } catch (error) {
    console.error("Campaign send error:", error)
    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 }
    )
  }
}

// Helper function to send email
async function sendEmail(
  resendClient: Resend,
  options: {
    to: string
    subject: string
    html: string
    from: string
  }
) {
  return await resendClient.emails.send({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: wrapEmailTemplate(options.html),
  })
}

// Helper function to personalize content
function personalizeContent(
  content: string,
  data: { firstName: string; lastName: string; email: string }
) {
  return content
    .replace(/\{\{firstName\}\}/g, data.firstName || "there")
    .replace(/\{\{lastName\}\}/g, data.lastName || "")
    .replace(/\{\{email\}\}/g, data.email)
    .replace(/\{\{name\}\}/g, `${data.firstName} ${data.lastName}`.trim() || "there")
}

// Wrap content in email template
function wrapEmailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Periospot</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
    a {
      color: #10b981;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>◉ periospot</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Periospot. All rights reserved.</p>
        <p>
          <a href="https://periospot.com">Visit our website</a> •
          <a href="{{unsubscribe_url}}">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}
