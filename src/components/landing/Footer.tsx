"use client"

import Link from "next/link"
import { Mail, MessageSquare, MapPin, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-white/[0.06] mt-24 safe-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="block mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" width={100} height={32} loading="lazy" decoding="async" />
            </Link>
            <p className="text-sm text-white/60 mb-4">
              Built for college events that actually happen. One platform. All events.
            </p>
            <div className="flex gap-3">
              <a href="mailto:myfestivo@gmail.com" aria-label="Email us" className="p-2 rounded-md bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-white/60 hover:text-white">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="https://twitter.com" aria-label="Follow on Twitter" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-white/60 hover:text-white">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-white/40 mb-4 sr-only">Product</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/events" className="text-sm text-white/60 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="text-sm text-white/60 hover:text-white transition-colors">
                  Host Event
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-white/40 mb-4 sr-only">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-white/40 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy-policy" className="text-sm text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/sitemap-page" className="text-sm text-white/60 hover:text-white transition-colors">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/[0.06] pt-8 md:pt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>© {currentYear} MyFestivo. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
