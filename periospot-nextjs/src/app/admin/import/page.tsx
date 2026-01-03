"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Upload,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Database,
  Mail,
} from "lucide-react"
import { AdminNav } from "@/components/AdminNav"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ADMIN_EMAIL = "cisco@periospot.com"

interface Subscriber {
  email: string
  firstName: string
  lastName: string
  status: string
  source: string
  country: string
  subscribedAt: string
  groups: string[]
  stats: {
    sent: number
    opens: number
    clicks: number
    openRate: number
    clickRate: number
  }
}

interface ImportResults {
  total: number
  imported: number
  skipped: number
  failed: number
  errors: string[]
}

export default function ImportPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Import state
  const [previewData, setPreviewData] = useState<Subscriber[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importPaused, setImportPaused] = useState(false)
  const [currentCursor, setCurrentCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // Import options
  const [importToResend, setImportToResend] = useState(true)
  const [importToSupabase, setImportToSupabase] = useState(true)
  const [skipUnsubscribed, setSkipUnsubscribed] = useState(true)
  const [batchSize, setBatchSize] = useState(100)

  // Progress tracking
  const [totalImported, setTotalImported] = useState(0)
  const [totalSkipped, setTotalSkipped] = useState(0)
  const [totalFailed, setTotalFailed] = useState(0)
  const [batchesProcessed, setBatchesProcessed] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true)
      } else {
        router.push("/login")
      }
      setLoading(false)
    }
    checkAuth()
  }, [supabase.auth, router])

  const fetchPreview = async () => {
    setPreviewLoading(true)
    try {
      const response = await fetch("/api/admin/import/mailerlite?limit=25")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setPreviewData(data.subscribers)
      setHasMore(data.hasMore)
      setCurrentCursor(data.nextCursor)
    } catch (error) {
      console.error("Preview error:", error)
      setErrors([String(error)])
    } finally {
      setPreviewLoading(false)
    }
  }

  const startImport = async () => {
    setImporting(true)
    setImportPaused(false)
    setCurrentCursor(null)
    setTotalImported(0)
    setTotalSkipped(0)
    setTotalFailed(0)
    setBatchesProcessed(0)
    setErrors([])

    await runImportBatch(null)
  }

  const runImportBatch = async (cursor: string | null) => {
    if (importPaused) return

    try {
      const response = await fetch("/api/admin/import/mailerlite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cursor,
          batchSize,
          importToResend,
          importToSupabase,
          skipUnsubscribed,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setTotalImported((prev) => prev + data.results.imported)
      setTotalSkipped((prev) => prev + data.results.skipped)
      setTotalFailed((prev) => prev + data.results.failed)
      setBatchesProcessed((prev) => prev + 1)

      if (data.results.errors.length > 0) {
        setErrors((prev) => [...prev, ...data.results.errors.slice(0, 5)])
      }

      setCurrentCursor(data.nextCursor)
      setHasMore(data.hasMore)

      // Continue with next batch if there's more
      if (data.hasMore && !importPaused) {
        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 500))
        await runImportBatch(data.nextCursor)
      } else {
        setImporting(false)
      }
    } catch (error) {
      console.error("Import batch error:", error)
      setErrors((prev) => [...prev, String(error)])
      setImporting(false)
    }
  }

  const pauseImport = () => {
    setImportPaused(true)
  }

  const resumeImport = () => {
    setImportPaused(false)
    if (hasMore && currentCursor) {
      setImporting(true)
      runImportBatch(currentCursor)
    }
  }

  const resetImport = () => {
    setImporting(false)
    setImportPaused(false)
    setCurrentCursor(null)
    setHasMore(false)
    setTotalImported(0)
    setTotalSkipped(0)
    setTotalFailed(0)
    setBatchesProcessed(0)
    setErrors([])
    setPreviewData([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Import Subscribers</h1>
                <p className="text-sm text-muted-foreground">
                  Migrate from MailerLite to Resend/Supabase
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Import Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Configuration
              </CardTitle>
              <CardDescription>
                Configure how subscribers will be imported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Import destinations */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={importToSupabase}
                      onChange={(e) => setImportToSupabase(e.target.checked)}
                      className="w-4 h-4"
                      disabled={importing}
                    />
                    <Database className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Supabase Database</p>
                      <p className="text-xs text-muted-foreground">
                        Store in newsletter_subscribers table
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={importToResend}
                      onChange={(e) => setImportToResend(e.target.checked)}
                      className="w-4 h-4"
                      disabled={importing}
                    />
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Resend Audience</p>
                      <p className="text-xs text-muted-foreground">
                        Sync with Resend for email campaigns
                      </p>
                    </div>
                  </label>
                </div>

                {/* Import options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={skipUnsubscribed}
                      onChange={(e) => setSkipUnsubscribed(e.target.checked)}
                      className="w-4 h-4"
                      disabled={importing}
                    />
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Skip Unsubscribed</p>
                      <p className="text-xs text-muted-foreground">
                        Don&apos;t import unsubscribed contacts
                      </p>
                    </div>
                  </label>

                  <div className="p-3 rounded-lg border border-border">
                    <label className="block text-sm font-medium mb-2">
                      Batch Size
                    </label>
                    <select
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      disabled={importing}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    >
                      <option value={50}>50 per batch</option>
                      <option value={100}>100 per batch</option>
                      <option value={200}>200 per batch</option>
                      <option value={500}>500 per batch</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Card */}
        {(importing || batchesProcessed > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {importPaused ? "Import Paused" : "Importing..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Import Complete
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {totalImported.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Imported</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {totalSkipped.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {totalFailed.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {batchesProcessed}
                    </p>
                    <p className="text-xs text-muted-foreground">Batches</p>
                  </div>
                </div>

                {/* Progress bar */}
                {importing && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-primary"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                    <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Errors ({errors.length})
                    </p>
                    <div className="text-xs text-red-500 max-h-24 overflow-auto">
                      {errors.slice(0, 5).map((error, i) => (
                        <p key={i}>{error}</p>
                      ))}
                      {errors.length > 5 && (
                        <p>... and {errors.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          {!importing ? (
            <>
              <Button
                onClick={fetchPreview}
                variant="outline"
                disabled={previewLoading}
                className="flex-1"
              >
                {previewLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Preview MailerLite Data
              </Button>
              <Button
                onClick={startImport}
                disabled={!importToResend && !importToSupabase}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Import
              </Button>
              {batchesProcessed > 0 && (
                <Button onClick={resetImport} variant="ghost">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </>
          ) : (
            <>
              {importPaused ? (
                <Button onClick={resumeImport} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={pauseImport}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
            </>
          )}
        </motion.div>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Preview ({previewData.length} subscribers)
                  </span>
                  {hasMore && (
                    <Badge variant="secondary">More available</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium">
                          Email
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Name
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Status
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Country
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Groups
                        </th>
                        <th className="text-right py-2 px-3 font-medium">
                          Opens
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((sub, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 hover:bg-secondary/30"
                        >
                          <td className="py-2 px-3">{sub.email}</td>
                          <td className="py-2 px-3">
                            {sub.firstName} {sub.lastName}
                          </td>
                          <td className="py-2 px-3">
                            <Badge
                              variant={
                                sub.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            {sub.country || "—"}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1">
                              {sub.groups.slice(0, 2).map((group, gi) => (
                                <Badge key={gi} variant="outline" className="text-xs">
                                  {group}
                                </Badge>
                              ))}
                              {sub.groups.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{sub.groups.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {sub.stats.opens}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>1. MailerLite API Key:</strong> Add{" "}
                <code className="px-1 py-0.5 bg-secondary rounded">
                  MAILERLITE_API_KEY
                </code>{" "}
                to your environment variables.
              </p>
              <p>
                <strong>2. Resend Audience ID:</strong> Add{" "}
                <code className="px-1 py-0.5 bg-secondary rounded">
                  RESEND_AUDIENCE_ID
                </code>{" "}
                if importing to Resend.
              </p>
              <p>
                <strong>3. Database:</strong> Ensure the{" "}
                <code className="px-1 py-0.5 bg-secondary rounded">
                  newsletter_subscribers
                </code>{" "}
                table exists in Supabase.
              </p>
              <p className="text-xs pt-2 border-t border-border mt-3">
                The import runs in batches to avoid timeouts. You can pause and
                resume at any time. Progress is tracked locally.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Navigation */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Navigation</h3>
          <AdminNav />
        </div>
      </main>
    </div>
  )
}
