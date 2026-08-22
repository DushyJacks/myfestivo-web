"use client"

import { useRef } from "react"
import { Bold, List, Quote } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  required?: boolean
}

/**
 * A textarea with a simple visual formatting toolbar.
 * Inserts markdown syntax at the cursor position so users can bold text,
 * add bullet points, or add blockquotes without knowing markdown syntax.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  rows = 4,
  className = "",
  required,
}: RichTextEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insert = (before: string, after = "", linePrefix?: string) => {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)

    let newText: string
    let cursorStart: number
    let cursorEnd: number

    if (linePrefix) {
      // Insert a line prefix (e.g. bullet point)
      const lineStart = value.lastIndexOf("\n", start - 1) + 1
      const prefix = linePrefix
      // If line already starts with this prefix, remove it (toggle)
      if (value.slice(lineStart, lineStart + prefix.length) === prefix) {
        newText = value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
        cursorStart = cursorEnd = start - prefix.length
      } else {
        newText = value.slice(0, lineStart) + prefix + value.slice(lineStart)
        cursorStart = cursorEnd = start + prefix.length
      }
    } else {
      newText = value.slice(0, start) + before + selected + after + value.slice(end)
      cursorStart = start + before.length
      cursorEnd = cursorStart + selected.length
    }

    onChange(newText)
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.focus()
        ref.current.setSelectionRange(cursorStart, cursorEnd)
      }
    })
  }

  const toolbarBtn = "p-1.5 rounded text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors"

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden focus-within:border-[var(--color-border-focus)] transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--color-border-muted)] bg-[var(--color-surface-3)]">
        <button
          type="button"
          title="Bold (wraps selected text in **bold**)"
          onClick={() => insert("**", "**")}
          className={toolbarBtn}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Bullet point (adds • at start of line)"
          onClick={() => insert("", "", "- ")}
          className={toolbarBtn}
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Quote / highlight line"
          onClick={() => insert("", "", "> ")}
          className={toolbarBtn}
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <span className="ml-auto text-[9px] font-mono text-[var(--color-text-faint)] tracking-widest pr-1 select-none">
          Markdown supported · Enter for new line
        </span>
      </div>
      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] px-3 py-3 text-sm resize-none outline-none ${className}`}
      />
    </div>
  )
}
