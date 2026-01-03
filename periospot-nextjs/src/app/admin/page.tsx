"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Mail,
  MousePointer,
  Eye,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Send,
  Loader2,
  Bot,
  ArrowLeft,
  Calendar,
  Clock,
  Activity,
  UserCheck,
  UserMinus,
  Link2,
  FileText,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  RefreshCw
} from "lucide-react"

// Admin email - only this user can access
const ADMIN_EMAIL = "cisco@periospot.com"

interface AnalyticsData {
  users: {
    last7Days: number
    last15Days: number
    last30Days: number
    last6Months: number
    lastYear: number
    total: number
    churned6Months: number
    churnedYear: number
  }
  engagement: {
    topPages: { page: string; views: number }[]
    topLinks: { url: string; clicks: number }[]
    topActiveUsers: { email: string; actions: number }[]
  }
  geography: {
    topCountries: { country: string; users: number; flag: string }[]
  }
  newsletter: {
    lastSent: { subject: string; date: string; opens: number; clicks: number } | null
    totalSubscribers: number
    openRate: number
    clickRate: number
  }
  recentActivity: { action: string; user: string; timestamp: string }[]
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [aiReport, setAiReport] = useState<string>("")
  const [reportLoading, setReportLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/dashboard")
        return
      }
      setUser(user)
      setLoading(false)
      fetchAnalytics()
      generateAIReport()
    }
    checkAdmin()
  }, [router, supabase.auth])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const fetchAnalytics = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Use mock data for now
      setAnalyticsData(getMockData())
    } finally {
      setRefreshing(false)
    }
  }

  const generateAIReport = async () => {
    setReportLoading(true)
    try {
      const response = await fetch("/api/admin/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyticsData }),
      })
      if (response.ok) {
        const data = await response.json()
        setAiReport(data.report)
      }
    } catch (error) {
      console.error("Failed to generate AI report:", error)
      setAiReport("AI report generation is not configured. Add your Gemini API key to enable this feature.")
    } finally {
      setReportLoading(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setChatLoading(true)

    try {
      const response = await fetch("/api/admin/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          analyticsData,
          history: chatMessages,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setChatMessages(prev => [...prev, { role: "assistant", content: data.response }])
      }
    } catch (error) {
      console.error("Chat error:", error)
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I couldn't process your request. Please check if the Gemini API is configured."
      }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  const data = analyticsData || getMockData()

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="mr-1 h-3 w-3" />
              Admin
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Admin Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Cisco. Here&apos;s your Periospot overview.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Stats & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                title="Last 7 Days"
                value={data.users.last7Days}
                icon={Users}
                trend={12}
                color="blue"
              />
              <StatCard
                title="Last 15 Days"
                value={data.users.last15Days}
                icon={UserCheck}
                trend={8}
                color="green"
              />
              <StatCard
                title="Last 30 Days"
                value={data.users.last30Days}
                icon={Activity}
                trend={-3}
                color="yellow"
              />
              <StatCard
                title="Total Users"
                value={data.users.total}
                icon={Globe}
                color="purple"
              />
            </div>

            {/* Churn Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-orange-500/20 bg-orange-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-orange-500" />
                    Churned (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{data.users.churned6Months}</p>
                  <p className="text-xs text-muted-foreground">Users inactive for 6+ months</p>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-red-500" />
                    Churned (1 Year)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{data.users.churnedYear}</p>
                  <p className="text-xs text-muted-foreground">Users inactive for 1+ year</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for detailed stats */}
            <Tabs defaultValue="pages" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pages">
                  <Eye className="mr-2 h-4 w-4" />
                  Pages
                </TabsTrigger>
                <TabsTrigger value="links">
                  <Link2 className="mr-2 h-4 w-4" />
                  Links
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="mr-2 h-4 w-4" />
                  Active Users
                </TabsTrigger>
                <TabsTrigger value="countries">
                  <Globe className="mr-2 h-4 w-4" />
                  Countries
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pages">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Visited Pages</CardTitle>
                    <CardDescription>Top 10 pages by views</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.engagement.topPages.map((page, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[300px]">{page.page}</span>
                          </div>
                          <Badge variant="secondary">{page.views.toLocaleString()} views</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="links">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Clicked Links</CardTitle>
                    <CardDescription>Top external and internal links</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.engagement.topLinks.map((link, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[300px]">{link.url}</span>
                          </div>
                          <Badge variant="secondary">{link.clicks.toLocaleString()} clicks</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Active Users</CardTitle>
                    <CardDescription>Most engaged users this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.engagement.topActiveUsers.map((user, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <Badge variant="secondary">{user.actions} actions</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="countries">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top 10 Countries</CardTitle>
                    <CardDescription>Users by geographic location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.geography.topCountries.map((country, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                            <span className="text-xl">{country.flag}</span>
                            <span className="text-sm">{country.country}</span>
                          </div>
                          <Badge variant="secondary">{country.users.toLocaleString()} users</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Newsletter Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold">{data.newsletter.totalSubscribers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Subscribers</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold">{data.newsletter.openRate}%</p>
                    <p className="text-xs text-muted-foreground">Open Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold">{data.newsletter.clickRate}%</p>
                    <p className="text-xs text-muted-foreground">Click Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold">{data.newsletter.lastSent?.opens || 0}</p>
                    <p className="text-xs text-muted-foreground">Last Campaign Opens</p>
                  </div>
                </div>
                {data.newsletter.lastSent && (
                  <div className="mt-4 p-4 rounded-lg border">
                    <p className="text-sm font-medium">Last Newsletter Sent</p>
                    <p className="text-lg font-semibold mt-1">{data.newsletter.lastSent.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {data.newsletter.lastSent.date}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {data.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground truncate">{activity.user}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/email-marketing">
                  <div className="flex flex-col items-center gap-2">
                    <Mail className="h-6 w-6" />
                    <span>Email Marketing</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/content">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Content Manager</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/products">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingBag className="h-6 w-6" />
                    <span>Products</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 border-green-500/30 hover:bg-green-500/10" asChild>
                <Link href="/admin/affiliates">
                  <div className="flex flex-col items-center gap-2">
                    <Link2 className="h-6 w-6 text-green-500" />
                    <span>Affiliates</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - AI Assistant */}
          <div className="space-y-6">
            {/* AI Report Card */}
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Insights
                </CardTitle>
                <CardDescription>Powered by Gemini</CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiReport}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={generateAIReport}
                  disabled={reportLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${reportLoading ? "animate-spin" : ""}`} />
                  Regenerate Report
                </Button>
              </CardContent>
            </Card>

            {/* AI Chat */}
            <Card className="border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-purple-500" />
                  Chat with Gemini
                </CardTitle>
                <CardDescription>Ask questions about your data</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] px-4">
                  <div className="space-y-4 py-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Ask me anything about your analytics!
                        </p>
                        <div className="mt-4 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setChatInput("What are the key trends this week?")}
                          >
                            What are the key trends?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs ml-2"
                            onClick={() => setChatInput("How can I reduce churn?")}
                          >
                            How to reduce churn?
                          </Button>
                        </div>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary rounded-lg px-3 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={handleChatSubmit} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about your analytics..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={chatLoading || !chatInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  trend?: number
  color?: "blue" | "green" | "yellow" | "purple" | "orange" | "red"
}) {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10",
    green: "text-green-500 bg-green-500/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    red: "text-red-500 bg-red-500/10",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`rounded-lg p-2 ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-xs ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold mt-3">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}

// Mock data for development
function getMockData(): AnalyticsData {
  return {
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
}
