"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Loader2, CheckCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { User } from "@supabase/supabase-js"

interface Ebook {
  id?: string
  slug: string
  title: string
  description?: string
  cover_image_url?: string
  category?: string
}

interface EbookPopupProps {
  ebook: Ebook
  isOpen: boolean
  onClose: () => void
  trigger?: "button" | "exit-intent" | "scroll" | "timer"
}

export default function EbookPopup({
  ebook,
  isOpen,
  onClose,
  trigger = "button",
}: EbookPopupProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    acceptsMarketing: true,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user?.email) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
        }))
      }
    }
    getUser()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // First, try to download with email for lead capture
      const response = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: ebook.slug,
          email: formData.email,
          marketingConsent: formData.acceptsMarketing,
          source: trigger,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to request eBook")
      }

      if (data.type === "download" && data.url) {
        setDownloadUrl(data.url)
        setSuccess(true)
        // Auto-open download in new tab
        window.open(data.url, "_blank")
      } else if (data.type === "external" && data.url) {
        window.open(data.url, "_blank")
        setSuccess(true)
      }

      // Also send email notification
      await fetch("/api/ebooks/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookId: ebook.id || ebook.slug,
          ebookSlug: ebook.slug,
          ebookTitle: ebook.title,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          acceptsMarketing: formData.acceptsMarketing,
          trigger,
        }),
      }).catch(console.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDirectDownload = async () => {
    if (!user) return
    setLoading(true)

    try {
      const response = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: ebook.slug,
          source: trigger,
        }),
      })

      const data = await response.json()

      if (data.type === "download" && data.url) {
        window.open(data.url, "_blank")
        setSuccess(true)
      } else if (data.type === "external" && data.url) {
        window.open(data.url, "_blank")
        setSuccess(true)
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-background rounded-2xl shadow-elevated max-w-lg w-full overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {success ? (
            /* Success State */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Download Started!</h3>
              <p className="text-muted-foreground mb-4">
                Your download of <strong>&quot;{ebook.title}&quot;</strong> should begin automatically.
                {formData.email && (
                  <>
                    <br />
                    We&apos;ve also sent a copy to your email.
                  </>
                )}
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm block mb-4"
                >
                  Click here if download didn&apos;t start
                </a>
              )}
              <Button onClick={onClose} className="rounded-full">
                Close
              </Button>
            </div>
          ) : (
            /* Form State */
            <div className="flex flex-col md:flex-row">
              {/* Cover Image Side */}
              <div className="md:w-2/5 bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex items-center justify-center">
                {ebook.cover_image_url ? (
                  <img
                    src={ebook.cover_image_url}
                    alt={ebook.title}
                    className="w-32 h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-44 bg-primary/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                )}
              </div>

              {/* Form Side */}
              <div className="md:w-3/5 p-6">
                <h3 className="text-xl font-semibold mb-1">Free Download</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {ebook.title}
                </p>

                {user ? (
                  /* Logged in user - direct download */
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Logged in as <strong>{user.email}</strong>
                    </p>
                    <Button
                      onClick={handleDirectDownload}
                      disabled={loading}
                      className="w-full rounded-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Now
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      We&apos;ll also send a copy to your email
                    </p>
                  </div>
                ) : (
                  /* Guest user - lead capture form */
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address *"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />

                    <label className="flex items-start gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={formData.acceptsMarketing}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            acceptsMarketing: e.target.checked,
                          }))
                        }
                        className="mt-0.5"
                      />
                      <span>
                        Yes, I&apos;d like to receive updates about new content and
                        exclusive offers from Periospot
                      </span>
                    </label>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Get Free eBook
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By downloading, you agree to our{" "}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for exit-intent popup
export function useExitIntent(callback: () => void) {
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        callback()
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [callback])
}

// Hook for scroll-triggered popup
export function useScrollTrigger(threshold: number, callback: () => void) {
  useEffect(() => {
    let triggered = false

    const handleScroll = () => {
      if (triggered) return

      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100

      if (scrollPercent >= threshold) {
        triggered = true
        callback()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold, callback])
}

// Hook for timed popup
export function useTimedPopup(delayMs: number, callback: () => void) {
  useEffect(() => {
    const timer = setTimeout(callback, delayMs)
    return () => clearTimeout(timer)
  }, [delayMs, callback])
}
