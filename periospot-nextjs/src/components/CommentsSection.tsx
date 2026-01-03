"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type CommentRecord = {
  id: string
  author_name: string | null
  content: string
  created_at: string
  is_legacy: boolean
}

interface CommentsSectionProps {
  postSlug: string
  wordpressPostId?: number | null
}

export default function CommentsSection({ postSlug, wordpressPostId }: CommentsSectionProps) {
  const supabase = useMemo(() => createClient(), [])
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      const [{ data: userData }, { data: commentData, error: commentError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("comments")
          .select("id, author_name, content, created_at, is_legacy")
          .eq("post_slug", postSlug)
          .eq("status", "approved")
          .order("created_at", { ascending: true }),
      ])

      if (!active) return

      if (commentError) {
        setError(commentError.message)
      } else {
        setComments(commentData || [])
      }

      const user = userData?.user
      if (user) {
        setUserId(user.id)
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || ""
        setUserName(name)
        setUserEmail(user.email || "")
      } else {
        setUserId(null)
        setUserName("")
        setUserEmail("")
      }

      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [postSlug, supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatusMessage(null)

    if (!userId) {
      setError("Please log in to leave a comment.")
      return
    }

    const trimmed = content.trim()
    if (!trimmed) {
      setError("Comment cannot be empty.")
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from("comments").insert({
      post_slug: postSlug,
      wordpress_post_id: wordpressPostId ?? null,
      user_id: userId,
      author_name: userName || "Periospot Member",
      author_email: userEmail || null,
      content: trimmed,
      status: "pending",
      is_legacy: false,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setStatusMessage("Thanks! Your comment is pending approval.")
      setContent("")
    }

    setSubmitting(false)
  }

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">Comments</h2>
        <span className="text-sm text-muted-foreground">{comments.length} total</span>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground">
                  {comment.author_name || "Anonymous"}
                </p>
                <time className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">{comment.content}</p>
              {comment.is_legacy && (
                <p className="mt-2 text-xs text-muted-foreground">Imported from Periospot.com</p>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Join the conversation</h3>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share your thoughts..."
          className="min-h-[120px]"
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        {statusMessage && <p className="mt-3 text-sm text-primary">{statusMessage}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!userId || submitting}>
            {submitting ? "Submitting..." : "Post Comment"}
          </Button>
          {!userId && (
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Log in to comment
            </Link>
          )}
        </div>
      </form>
    </section>
  )
}
