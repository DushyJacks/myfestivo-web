"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface RichTextDisplayProps {
  content: string
  className?: string
}

/**
 * Renders markdown-formatted text using react-markdown.
 * Supports newlines, bullet lists, bold, and quotes.
 */
export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  if (!content) return null

  return (
    <div className={`rich-text-display ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs — preserve spacing
          p: ({ children }) => (
            <p className="text-[var(--color-text-muted)] leading-relaxed text-[15px] mb-3 last:mb-0">{children}</p>
          ),
          // Unordered list
          ul: ({ children }) => (
            <ul className="space-y-1.5 mb-3 last:mb-0 pl-1">{children}</ul>
          ),
          // Ordered list
          ol: ({ children }) => (
            <ol className="space-y-1.5 mb-3 last:mb-0 pl-1 list-decimal list-inside">{children}</ol>
          ),
          // List items — custom bullet style to match the app aesthetic
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-[var(--color-text-muted)] text-[15px] leading-relaxed">
              <span className="mt-2 w-1 h-1 rounded-full bg-[var(--color-surface-3)] shrink-0" />
              <span>{children}</span>
            </li>
          ),
          // Bold
          strong: ({ children }) => (
            <strong className="text-[var(--color-text)] font-semibold">{children}</strong>
          ),
          // Italic
          em: ({ children }) => (
            <em className="text-[var(--color-text)] italic">{children}</em>
          ),
          // Blockquote (used for highlighted info)
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--color-border)] pl-4 text-[var(--color-text-muted)] italic mb-3 last:mb-0">
              {children}
            </blockquote>
          ),
          // Inline code
          code: ({ children }) => (
            <code className="bg-[var(--color-surface-3)] px-1.5 py-0.5 rounded text-[13px] font-mono text-[var(--color-text-muted)]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
