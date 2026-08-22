import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Site Map — MyFestivo",
  description:
    "A complete site map of MyFestivo — the college event management platform. Find links to all key pages including event discovery, sign up, login, and more.",
  alternates: {
    canonical: "https://myfestivo.live/sitemap-page",
  },
  robots: { index: true, follow: true },
}

const sections = [
  {
    heading: "Main",
    links: [
      { href: "/", label: "Home — College Event Management Platform" },
      { href: "/events", label: "Browse Events — Discover College Fests & Competitions" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/signup", label: "Create Account — Join MyFestivo" },
      { href: "/login", label: "Sign In — Access Your Account" },
    ],
  },
  {
    heading: "Authenticated Pages",
    description:
      "These pages require you to be signed in. Create a free account to access them.",
    links: [
      { href: "/dashboard", label: "Dashboard — Your Event Hub" },
      { href: "/profile", label: "Profile — Manage Your Account & College Email" },
      { href: "/friends", label: "Friends — Connect with Fellow Students" },
      { href: "/events/create", label: "Create Event — Host a College Event" },
    ],
  },
]

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 md:px-16 py-24 max-w-3xl mx-auto" id="main-content">
      {/* Header */}
      <header className="mb-16">
        <Link href="/" className="inline-block mb-10" aria-label="Go to MyFestivo home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MyFestivo" width={120} height={40} className="h-10 w-auto" loading="lazy" decoding="async" />
        </Link>
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-text-faint)] mb-3">
          Navigation
        </p>
        <h1 className="text-4xl font-extralight tracking-tight text-[var(--color-text)] mb-4">Site Map</h1>
        <p className="text-[var(--color-text-muted)] text-sm max-w-md leading-relaxed">
          A complete listing of all pages on MyFestivo — the all-in-one college event management
          platform. Use this page to navigate directly to any section of the site.
        </p>
      </header>

      {/* Sitemap sections */}
      <nav aria-label="Full site navigation">
        {sections.map((section) => (
          <section key={section.heading} className="mb-12">
            <h2 className="text-[10px] font-mono tracking-[0.25em] uppercase text-[var(--color-text-faint)] mb-2 pb-2 border-b border-[var(--color-border)]">
              {section.heading}
            </h2>
            {section.description && (
              <p className="text-xs text-[var(--color-text-faint)] mt-2 mb-4 leading-relaxed">
                {section.description}
              </p>
            )}
            <ul className="mt-4 space-y-3" role="list">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-[var(--color-accent-low)] group-hover:bg-[var(--color-surface-3)] transition-colors shrink-0"
                      aria-hidden="true"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      {/* Footer note */}
      <footer className="mt-16 pt-8 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-faint)] font-mono">
          © {new Date().getFullYear()} MyFestivo. All rights reserved. •{" "}
          <Link href="mailto:myfestivo@gmail.com" className="hover:text-[var(--color-text-muted)] transition-colors">
            myfestivo@gmail.com
          </Link>
        </p>
      </footer>
    </main>
  )
}
