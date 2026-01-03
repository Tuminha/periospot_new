"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Lock, Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PerioAnalytics } from "@/lib/analytics"

interface EbookDownloadButtonProps {
  slug: string
  title: string
  isFree: boolean
  hasExternalLink?: boolean
  topic?: string
  language?: "en" | "es" | "pt" | "zh"
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function EbookDownloadButton({
  slug,
  title,
  isFree,
  hasExternalLink = false,
  topic = "implant_dentistry",
  language,
  variant = "default",
  size = "default",
  className = "",
}: EbookDownloadButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleDownload = async () => {
    PerioAnalytics.trackEbookLead({
      ebookTitle: slug,
      articleReferrer: window.location.pathname,
    })
    setIsLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // User is logged in, proceed with download
        await initiateDownload()
      } else if (isFree) {
        // Free ebook, show email capture dialog
        setIsDialogOpen(true)
        setIsLoading(false)
      } else {
        // Paid ebook, redirect to login
        window.location.href = `/login?redirect=/library&ebook=${slug}`
      }
    } catch (err) {
      console.error("Download error:", err)
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  const initiateDownload = async (capturedEmail?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email: capturedEmail,
          marketingConsent,
          source: "library",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresEmail) {
          setIsDialogOpen(true)
          setIsLoading(false)
          return
        }
        throw new Error(data.error || "Download failed")
      }

      if (data.type === "external") {
        PerioAnalytics.trackOutboundLink({
          url: data.url,
          linkType: "ibook",
          productName: title,
        })
        // Open external link in new tab
        window.open(data.url, "_blank")
      } else if (data.type === "download") {
        PerioAnalytics.trackFileDownload({
          fileName: data.filename || slug,
          category: "ebook",
          topic,
          language,
        })
        // Trigger download
        const link = document.createElement("a")
        link.href = data.url
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setIsSuccess(true)
      setIsDialogOpen(false)

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      console.error("Download error:", err)
      setError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    await initiateDownload(email)
  }

  // Button content based on state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing...
        </>
      )
    }

    if (isSuccess) {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Downloaded!
        </>
      )
    }

    if (!isFree) {
      return (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Unlock
        </>
      )
    }

    if (hasExternalLink) {
      return (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Get eBook
        </>
      )
    }

    return (
      <>
        <Download className="mr-2 h-4 w-4" />
        Download
      </>
    )
  }

  return (
    <>
      <Button
        className={`w-full ${className}`}
        variant={isSuccess ? "secondary" : isFree ? variant : "outline"}
        size={size}
        onClick={handleDownload}
        disabled={isLoading}
      >
        {getButtonContent()}
      </Button>

      {/* Email Capture Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Free eBook</DialogTitle>
            <DialogDescription>
              Enter your email to receive &quot;{title}&quot; directly in your inbox.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={marketingConsent}
                  onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="marketing" className="text-sm text-muted-foreground">
                  Send me updates about new educational content and resources
                </Label>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get eBook
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-2">
            By downloading, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
            . We respect your inbox.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
