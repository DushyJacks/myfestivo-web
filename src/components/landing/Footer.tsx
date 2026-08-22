"use client"

import Link from "next/link"
import { Mail, MessageSquare } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="glass-surface mt-24 safe-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="block mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" width={100} height={32} loading="lazy" decoding="async" />
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Built for college events that actually happen. One platform. All events.
            </p>
            <div className="flex gap-3">
              <a href="mailto:myfestivo@gmail.com" aria-label="Email us" className="p-2 rounded-md bg-[var(--color-surface-2)] hover:bg-[var(--color-accent-low)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="https://twitter.com" aria-label="Follow on Twitter" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-[var(--color-surface-2)] hover:bg-[var(--color-accent-low)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-[var(--color-text-faint)] mb-4 sr-only">Product</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/events" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Host Event
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-[var(--color-text-faint)] mb-4 sr-only">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-[var(--color-text-faint)] mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy-policy" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/sitemap-page" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-[var(--color-border)] pt-8 md:pt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-faint)]">
          <p>© {currentYear} MyFestivo. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link href="/privacy-policy" className="hover:text-[var(--color-text-muted)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-text-muted)] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
