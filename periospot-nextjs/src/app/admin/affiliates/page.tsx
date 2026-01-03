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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  ArrowLeft,
  Link2,
  DollarSign,
  TrendingUp,
  MousePointer,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen,
  Camera,
  Stethoscope,
  Coffee,
  Laptop
} from "lucide-react"
import { AdminNav } from "@/components/AdminNav"

// Admin email - only this user can access
const ADMIN_EMAIL = "cisco@periospot.com"

// Affiliate link data structure
interface AffiliateLink {
  id: string
  name: string
  geniusLink: string
  originalUrl: string
  category: string
  clicks: number
  conversions: number
  revenue: number
  status: "active" | "broken" | "expired"
  createdAt: string
  lastClicked?: string
}

// Affiliate program data
interface AffiliateProgram {
  name: string
  status: "active" | "pending" | "inactive"
  commission: string
  totalEarnings: number
  linksCount: number
  category: string
}

// Mock data for affiliate links
const mockAffiliateLinks: AffiliateLink[] = [
  {
    id: "1",
    name: "Lindhe's Clinical Periodontology 7th Ed",
    geniusLink: "https://geni.us/IRvdjC",
    originalUrl: "https://amazon.com/dp/1119438888",
    category: "books",
    clicks: 342,
    conversions: 28,
    revenue: 156.80,
    status: "active",
    createdAt: "2025-12-15",
    lastClicked: "2 hours ago"
  },
  {
    id: "2",
    name: "Plastic-Esthetic Periodontal Surgery (Zuhr)",
    geniusLink: "https://geni.us/xxx123",
    originalUrl: "https://amazon.com/dp/1850972265",
    category: "books",
    clicks: 256,
    conversions: 18,
    revenue: 198.50,
    status: "active",
    createdAt: "2026-01-03",
    lastClicked: "30 min ago"
  },
  {
    id: "3",
    name: "Canon EOS R5 Full Frame Mirrorless",
    geniusLink: "https://geni.us/yyy456",
    originalUrl: "https://amazon.com/dp/B08C63HQMX",
    category: "equipment",
    clicks: 189,
    conversions: 3,
    revenue: 234.00,
    status: "active",
    createdAt: "2025-11-20",
    lastClicked: "1 day ago"
  },
  {
    id: "4",
    name: "Dental Loupes 3.5x with LED Light",
    geniusLink: "https://geni.us/zzz789",
    originalUrl: "https://amazon.com/dp/B09NNGPRQ3",
    category: "equipment",
    clicks: 423,
    conversions: 42,
    revenue: 312.60,
    status: "active",
    createdAt: "2025-10-05",
    lastClicked: "4 hours ago"
  },
  {
    id: "5",
    name: "Misch Dental Implant Prosthetics",
    geniusLink: "https://geni.us/broken",
    originalUrl: "https://amazon.com/dp/0323078273",
    category: "books",
    clicks: 87,
    conversions: 0,
    revenue: 0,
    status: "broken",
    createdAt: "2025-09-12"
  }
]

// Mock affiliate programs
const mockPrograms: AffiliateProgram[] = [
  { name: "Amazon Associates", status: "active", commission: "4-8%", totalEarnings: 1245.80, linksCount: 56, category: "marketplace" },
  { name: "Geni.us", status: "active", commission: "Link Mgmt", totalEarnings: 0, linksCount: 48, category: "tools" },
  { name: "ShareASale", status: "active", commission: "5-15%", totalEarnings: 432.50, linksCount: 12, category: "network" },
  { name: "TradeDoubler", status: "active", commission: "3-10%", totalEarnings: 187.20, linksCount: 8, category: "network" },
  { name: "Straumann", status: "pending", commission: "Contact", totalEarnings: 0, linksCount: 0, category: "dental" },
  { name: "Geistlich", status: "pending", commission: "Contact", totalEarnings: 0, linksCount: 0, category: "dental" },
]

export default function AffiliatesDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
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
    }
    checkAdmin()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  // Filter links based on search and category
  const filteredLinks = mockAffiliateLinks.filter(link => {
    const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || link.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate totals
  const totalClicks = mockAffiliateLinks.reduce((sum, link) => sum + link.clicks, 0)
  const totalConversions = mockAffiliateLinks.reduce((sum, link) => sum + link.conversions, 0)
  const totalRevenue = mockAffiliateLinks.reduce((sum, link) => sum + link.revenue, 0)
  const brokenLinks = mockAffiliateLinks.filter(link => link.status === "broken").length
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0"

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "books": return <BookOpen className="h-4 w-4" />
      case "equipment": return <Camera className="h-4 w-4" />
      case "instruments": return <Stethoscope className="h-4 w-4" />
      case "tech": return <Laptop className="h-4 w-4" />
      default: return <Coffee className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "broken":
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="h-3 w-3 mr-1" />Broken</Badge>
      case "expired":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>
      case "pending":
        return <Badge className="bg-blue-500/10 text-blue-500"><Loader2 className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-secondary/20">
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
            <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500">
              <DollarSign className="mr-1 h-3 w-3" />
              Affiliates
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setRefreshing(true)} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Sync Data
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Affiliate Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your affiliate links, clicks, and revenue.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg p-2 bg-blue-500/10 text-blue-500">
                  <Link2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{mockAffiliateLinks.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Links</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg p-2 bg-purple-500/10 text-purple-500">
                  <MousePointer className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg p-2 bg-green-500/10 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Conversion Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg p-2 bg-green-500/20 text-green-500">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3 text-green-600">€{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
            </CardContent>
          </Card>

          <Card className={brokenLinks > 0 ? "border-red-500/20 bg-red-500/5" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${brokenLinks > 0 ? "bg-red-500/20 text-red-500" : "bg-gray-500/10 text-gray-500"}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-3 ${brokenLinks > 0 ? "text-red-600" : ""}`}>{brokenLinks}</p>
              <p className="text-xs text-muted-foreground mt-1">Broken Links</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="links">
              <Link2 className="mr-2 h-4 w-4" />
              Affiliate Links
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Sparkles className="mr-2 h-4 w-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              <TrendingUp className="mr-2 h-4 w-4" />
              Opportunities
            </TabsTrigger>
          </TabsList>

          {/* Affiliate Links Tab */}
          <TabsContent value="links">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Your Affiliate Links</CardTitle>
                    <CardDescription>Manage and track all your affiliate links</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search links..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-[200px]"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="books">Books</option>
                      <option value="equipment">Equipment</option>
                      <option value="instruments">Instruments</option>
                      <option value="tech">Tech</option>
                    </select>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{link.name}</span>
                            <a
                              href={link.geniusLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              {link.geniusLink}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(link.category)}
                            <span className="capitalize">{link.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{link.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{link.conversions}</TableCell>
                        <TableCell className="text-right text-green-600">€{link.revenue.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(link.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Programs</CardTitle>
                <CardDescription>Programs you&apos;re enrolled in and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockPrograms.map((program, i) => (
                    <Card key={i} className={program.status === "pending" ? "border-dashed" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{program.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{program.category}</p>
                          </div>
                          {getStatusBadge(program.status)}
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Commission</span>
                            <span className="font-medium">{program.commission}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Links</span>
                            <span className="font-medium">{program.linksCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Earnings</span>
                            <span className="font-medium text-green-600">€{program.totalEarnings.toFixed(2)}</span>
                          </div>
                        </div>
                        {program.status === "pending" && (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Apply Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle>Monetization Opportunities</CardTitle>
                <CardDescription>AI-detected opportunities to increase affiliate revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-600">High Priority: Apply to Straumann</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          67 articles mention implants. A Straumann partnership could generate €500-2000/month.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">Contact Straumann</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-blue-500/10">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-600">49 Posts Mention Books</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Only 12 have affiliate links. Add Amazon links to remaining posts for estimated €200-500/month lift.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">Auto-Inject Links</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-purple-500/10">
                        <Stethoscope className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-600">Apply to Geistlich Biomaterials</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bio-Oss and Bio-Gide mentioned 23 times across content. High-value partnership opportunity.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">Contact Geistlich</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-yellow-500/10">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-600">1 Broken Link Detected</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          &quot;Misch Dental Implant Prosthetics&quot; link is returning 404. Fix to recover lost conversions.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">Fix Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <Button variant="outline" className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Create Link</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-6 w-6" />
              <span>Lookup Link</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              <span>Check All Links</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <Download className="h-6 w-6" />
              <span>Export Report</span>
            </div>
          </Button>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Navigation</h3>
          <AdminNav />
        </div>
      </div>
    </main>
  )
}
