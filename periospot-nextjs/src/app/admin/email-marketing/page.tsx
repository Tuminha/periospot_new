"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Mail,
  Users,
  Send,
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Upload,
  Download,
  Sparkles,
  RefreshCw,
  TrendingUp,
  MousePointer,
  UserPlus,
  UserMinus
} from "lucide-react"

const ADMIN_EMAIL = "cisco@periospot.com"

interface Campaign {
  id: string
  name: string
  subject: string
  status: "draft" | "scheduled" | "sent" | "sending"
  sentAt?: string
  scheduledFor?: string
  recipients: number
  opens: number
  clicks: number
  unsubscribes: number
}

interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: "subscribed" | "unsubscribed" | "bounced"
  source: string
  createdAt: string
  lastActivity?: string
  tags: string[]
}

export default function EmailMarketingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [subscriberStats, setSubscriberStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    newThisMonth: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("campaigns")
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    preheader: "",
    content: "",
    audience: "all",
  })
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
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
      fetchData()
    }
    checkAdmin()
  }, [router, supabase.auth])

  const fetchData = async () => {
    setRefreshing(true)
    try {
      // Fetch campaigns
      const campaignsRes = await fetch("/api/admin/email-marketing/campaigns")
      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaigns(data.campaigns || getMockCampaigns())
      } else {
        setCampaigns(getMockCampaigns())
      }

      // Fetch subscribers
      const subscribersRes = await fetch("/api/admin/email-marketing/subscribers")
      if (subscribersRes.ok) {
        const data = await subscribersRes.json()
        setSubscribers(data.subscribers || getMockSubscribers())
        setSubscriberStats(data.stats || getMockStats())
      } else {
        setSubscribers(getMockSubscribers())
        setSubscriberStats(getMockStats())
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setCampaigns(getMockCampaigns())
      setSubscribers(getMockSubscribers())
      setSubscriberStats(getMockStats())
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreateCampaign = async () => {
    setSendingCampaign(true)
    try {
      const response = await fetch("/api/admin/email-marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      })

      if (response.ok) {
        setIsCreatingCampaign(false)
        setNewCampaign({ name: "", subject: "", preheader: "", content: "", audience: "all" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create campaign:", error)
    } finally {
      setSendingCampaign(false)
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/send`, {
        method: "POST",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Failed to send campaign:", error)
    }
  }

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={isCreatingCampaign} onOpenChange={setIsCreatingCampaign}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Create a new email campaign to send to your subscribers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., January Newsletter"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., The Periospot Brew #48: New Year Updates"
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preheader">Preheader Text</Label>
                    <Input
                      id="preheader"
                      placeholder="Brief preview text shown in inbox..."
                      value={newCampaign.preheader}
                      onChange={(e) => setNewCampaign({ ...newCampaign, preheader: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Audience</Label>
                    <Select
                      value={newCampaign.audience}
                      onValueChange={(value) => setNewCampaign({ ...newCampaign, audience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subscribers ({subscriberStats.active})</SelectItem>
                        <SelectItem value="engaged">Engaged (opened last 30 days)</SelectItem>
                        <SelectItem value="new">New Subscribers (last 30 days)</SelectItem>
                        <SelectItem value="spanish">Spanish Speakers</SelectItem>
                        <SelectItem value="english">English Speakers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Email Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your email content here... (Supports markdown)"
                      rows={10}
                      value={newCampaign.content}
                      onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Use markdown for formatting. Variables: {"{{firstName}}"}, {"{{email}}"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingCampaign(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button onClick={handleCreateCampaign} disabled={sendingCampaign}>
                    {sendingCampaign ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Save as Draft
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Email Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Manage campaigns, subscribers, and email analytics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <Badge variant="secondary" className="text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{subscriberStats.newThisMonth}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{subscriberStats.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg bg-green-500/10 p-2 w-fit">
                <UserPlus className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-3">{subscriberStats.active.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Active Subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg bg-yellow-500/10 p-2 w-fit">
                <Mail className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold mt-3">{campaigns.filter(c => c.status === "sent").length}</p>
              <p className="text-xs text-muted-foreground mt-1">Campaigns Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg bg-purple-500/10 p-2 w-fit">
                <MousePointer className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold mt-3">
                {campaigns.length > 0
                  ? `${Math.round(campaigns.reduce((acc, c) => acc + (c.opens / Math.max(c.recipients, 1)) * 100, 0) / Math.max(campaigns.filter(c => c.status === "sent").length, 1))}%`
                  : "0%"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Open Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="campaigns">
              <Mail className="mr-2 h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              <Users className="mr-2 h-4 w-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>Create and manage your email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Create your first email campaign to engage your subscribers.
                    </p>
                    <Button className="mt-4" onClick={() => setIsCreatingCampaign(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{campaign.name}</h4>
                            <Badge
                              variant={
                                campaign.status === "sent"
                                  ? "default"
                                  : campaign.status === "scheduled"
                                  ? "secondary"
                                  : campaign.status === "sending"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {campaign.sentAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Sent {campaign.sentAt}
                              </span>
                            )}
                            {campaign.scheduledFor && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Scheduled for {campaign.scheduledFor}
                              </span>
                            )}
                            <span>{campaign.recipients.toLocaleString()} recipients</span>
                          </div>
                        </div>
                        {campaign.status === "sent" && (
                          <div className="flex items-center gap-6 mr-4">
                            <div className="text-center">
                              <p className="text-lg font-bold">{campaign.opens.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Opens</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">{campaign.clicks.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Clicks</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">
                                {Math.round((campaign.opens / campaign.recipients) * 100)}%
                              </p>
                              <p className="text-xs text-muted-foreground">Open Rate</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {campaign.status === "draft" && (
                            <Button
                              size="sm"
                              onClick={() => handleSendCampaign(campaign.id)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscribers</CardTitle>
                    <CardDescription>Manage your email list</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search subscribers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredSubscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {subscriber.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {subscriber.firstName || subscriber.lastName
                                ? `${subscriber.firstName || ""} ${subscriber.lastName || ""}`.trim()
                                : subscriber.email}
                            </p>
                            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge
                              variant={
                                subscriber.status === "subscribed"
                                  ? "default"
                                  : subscriber.status === "unsubscribed"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {subscriber.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {subscriber.source}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emails Sent</span>
                      <span className="font-bold">12,456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Delivered</span>
                      <span className="font-bold">12,234 (98.2%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Opened</span>
                      <span className="font-bold">5,234 (42.8%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clicked</span>
                      <span className="font-bold">892 (7.3%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unsubscribed</span>
                      <span className="font-bold text-red-500">23 (0.2%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Growth</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-green-500" />
                        New Subscribers
                      </span>
                      <span className="font-bold text-green-600">+{subscriberStats.newThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <UserMinus className="h-4 w-4 text-red-500" />
                        Unsubscribed
                      </span>
                      <span className="font-bold text-red-500">-{subscriberStats.unsubscribed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Net Growth</span>
                      <span className="font-bold text-green-600">
                        +{subscriberStats.newThisMonth - subscriberStats.unsubscribed}
                      </span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current List Size</span>
                      <span className="text-lg font-bold">{subscriberStats.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Performing Campaigns</CardTitle>
                  <CardDescription>Based on open rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaigns
                      .filter((c) => c.status === "sent")
                      .sort((a, b) => (b.opens / b.recipients) - (a.opens / a.recipients))
                      .slice(0, 5)
                      .map((campaign, i) => (
                        <div key={campaign.id} className="flex items-center gap-4">
                          <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">{campaign.sentAt}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {Math.round((campaign.opens / campaign.recipients) * 100)}%
                            </p>
                            <p className="text-xs text-muted-foreground">open rate</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Reusable templates for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { name: "The Periospot Brew", type: "Newsletter", color: "blue" },
                    { name: "Product Announcement", type: "Marketing", color: "purple" },
                    { name: "Welcome Email", type: "Automation", color: "green" },
                    { name: "Course Update", type: "Educational", color: "yellow" },
                  ].map((template) => (
                    <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className={`h-24 rounded-lg bg-${template.color}-500/10 flex items-center justify-center mb-4`}>
                          <FileText className={`h-8 w-8 text-${template.color}-500`} />
                        </div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.type}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="mr-2 h-3 w-3" />
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1">
                            Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                      <div className="h-24 rounded-lg bg-secondary flex items-center justify-center w-full mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium">Create Template</h4>
                      <p className="text-sm text-muted-foreground">Start from scratch</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

// Mock data functions
function getMockCampaigns(): Campaign[] {
  return [
    {
      id: "1",
      name: "The Periospot Brew #47",
      subject: "Socket Shield Updates & New Research",
      status: "sent",
      sentAt: "Jan 2, 2026",
      recipients: 18934,
      opens: 8234,
      clicks: 1456,
      unsubscribes: 12,
    },
    {
      id: "2",
      name: "Happy New Year 2026",
      subject: "🎉 Happy New Year from Periospot!",
      status: "sent",
      sentAt: "Jan 1, 2026",
      recipients: 18890,
      opens: 9567,
      clicks: 2341,
      unsubscribes: 8,
    },
    {
      id: "3",
      name: "The Periospot Brew #48",
      subject: "Immediate Implant Placement: New Guidelines",
      status: "draft",
      recipients: 0,
      opens: 0,
      clicks: 0,
      unsubscribes: 0,
    },
    {
      id: "4",
      name: "Product Launch: Animation Pack",
      subject: "New 3D Animations Available!",
      status: "scheduled",
      scheduledFor: "Jan 10, 2026",
      recipients: 18950,
      opens: 0,
      clicks: 0,
      unsubscribes: 0,
    },
  ]
}

function getMockSubscribers(): Subscriber[] {
  return [
    { id: "1", email: "dr.martinez@clinic.com", firstName: "Carlos", lastName: "Martinez", status: "subscribed", source: "Website", createdAt: "2025-06-15", tags: ["spanish", "engaged"] },
    { id: "2", email: "dental.pro@gmail.com", firstName: "Sarah", lastName: "Johnson", status: "subscribed", source: "eBook Download", createdAt: "2025-08-22", tags: ["english", "new"] },
    { id: "3", email: "implant.expert@mail.com", firstName: "Michael", lastName: "Chen", status: "subscribed", source: "Course Signup", createdAt: "2025-03-10", tags: ["english", "engaged"] },
    { id: "4", email: "perio.specialist@clinic.es", firstName: "Ana", lastName: "García", status: "subscribed", source: "Website", createdAt: "2025-11-05", tags: ["spanish"] },
    { id: "5", email: "old.subscriber@mail.com", firstName: "", lastName: "", status: "unsubscribed", source: "Import", createdAt: "2024-01-15", tags: [] },
  ]
}

function getMockStats() {
  return {
    total: 18934,
    active: 18456,
    unsubscribed: 478,
    newThisMonth: 342,
  }
}
