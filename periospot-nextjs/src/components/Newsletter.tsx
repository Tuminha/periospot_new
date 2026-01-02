"use client"

import { motion } from "framer-motion"
import { Send, Loader2, CheckCircle } from "lucide-react"
import { useState } from "react"

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Welcome to The Periospot Brew! Check your inbox.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Connection error. Please try again.")
    }
  }

  return (
    <section className="py-24 px-6 bg-secondary/50">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
          >
            Newsletter
          </motion.span>

          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Stay in the loop
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Get the latest stories delivered to your inbox every week. No spam,
            just thoughtful content.
          </p>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-green-600 font-medium">{message}</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 bg-background border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                  required
                  disabled={status === "loading"}
                />
              </div>
              <motion.button
                whileHover={{ scale: status === "loading" ? 1 : 1.03 }}
                whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
                type="submit"
                disabled={status === "loading"}
                className="gradient-warm text-primary-foreground px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 shadow-soft hover:shadow-elevated transition-shadow disabled:opacity-70"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send size={18} />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {status === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-4"
            >
              {message}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-muted-foreground text-sm mt-6"
          >
            Join 10,000+ readers. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default Newsletter
