"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownRendererProps {
  content: string
  className?: string
  compact?: boolean
}

export function MarkdownRenderer({ content, className = "", compact = false }: MarkdownRendererProps) {
  // Pre-process content to ensure markdown renders correctly
  const processedContent = content
    ?.replace(/\\n/g, '\n')  // Handle escaped newlines
    ?.replace(/\\#/g, '#')   // Handle escaped hashes
    ?.replace(/\\\*/g, '*')  // Handle escaped asterisks
    ?.trim() || ''

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${compact ? 'prose-compact' : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-3 mb-2 first:mt-0 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-1 first:mt-0 text-foreground">{children}</h3>
          ),
          // Custom paragraph styling
          p: ({ children }) => (
            <p className="my-2 text-sm leading-relaxed">{children}</p>
          ),
          // Custom list styling
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm">{children}</li>
          ),
          // Custom strong/bold
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          // Custom emphasis/italic
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // Custom code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className={`block bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto ${className}`} {...props}>
                {children}
              </code>
            )
          },
          // Custom pre block
          pre: ({ children }) => (
            <pre className="my-2 bg-muted rounded-lg overflow-hidden">{children}</pre>
          ),
          // Custom blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 my-2 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          // Custom horizontal rule
          hr: () => (
            <hr className="my-4 border-border" />
          ),
          // Custom link
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          // Custom table styles
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold bg-muted">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-border">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

// Compact version for chat bubbles
export function ChatMarkdownRenderer({ content, className = "" }: { content: string, className?: string }) {
  // Pre-process content to ensure markdown renders correctly
  const processedContent = content
    ?.replace(/\\n/g, '\n')
    ?.replace(/\\#/g, '#')
    ?.replace(/\\\*/g, '*')
    ?.trim() || ''

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-bold my-2 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold my-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold my-1 text-foreground">{children}</h3>,
          ul: ({ children }) => <ul className="my-1 ml-3 list-disc space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 ml-3 list-decimal space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-black/10 dark:bg-white/10 p-2 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            )
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
              {children}
            </a>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
