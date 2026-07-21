import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Privacy Policy — MyFestivo",
  description:
    "MyFestivo's Privacy Policy. Learn how we collect, use, and protect your personal information on the college event management platform.",
  alternates: { canonical: "https://myfestivo.live/privacy-policy" },
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black px-6 md:px-16 py-24 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-16">
        <Link href="/" className="inline-block mb-10" aria-label="Go to MyFestivo home">
          <Image src="/logo.png" alt="MyFestivo" width={120} height={40} className="h-10 w-auto" />
        </Link>
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">Legal</p>
        <h1 className="text-4xl font-extralight tracking-tight text-white mb-4">Privacy Policy</h1>
        <p className="text-white/40 text-sm font-mono">Effective Date: July 5, 2026 · Last Updated: July 5, 2026</p>
      </header>

      {/* Content */}
      <div className="prose prose-invert max-w-none space-y-10 text-white/70 text-sm leading-relaxed">

        <Section title="1. Introduction">
          <p>
            MyFestivo ("Company," "we," "us," "our," or "Platform") is committed to protecting your privacy and ensuring you
            have a positive experience on our Platform. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit{" "}
            <a href="https://myfestivo.live" className="text-[#B388FF] hover:underline">https://myfestivo.live</a>{" "}
            and use our services.
          </p>
          <p>Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Platform.</p>
        </Section>

        <Section title="2. Information We Collect">
          <Subsection title="2.1 Information You Provide Directly">
            <p><strong className="text-white/90">Registration &amp; Account Information</strong> — when you create an account we collect: Full Name, College Email Address, College/University Name, Phone Number (optional), Password (securely hashed), and profile details.</p>
            <p><strong className="text-white/90">Event-Related Information</strong> — when you create or register for an event we collect event title, description, date, venue, and participant registration data.</p>
            <p><strong className="text-white/90">Check-in Data</strong> — QR code scan data, check-in timestamps, and device information.</p>
            <p><strong className="text-white/90">Communication Data</strong> — messages you send us via email or through the Platform.</p>
          </Subsection>
          <Subsection title="2.2 Automatically Collected Data">
            <p>IP address, browser type, operating system, pages visited, time spent, referral source, and user activity logs.</p>
          </Subsection>
          <Subsection title="2.3 Information from Third Parties">
            <p>If you sign in with Google, we receive your name, email address, and profile picture from Google. We use this information to create your MyFestivo account.</p>
          </Subsection>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To create and manage your account</li>
            <li>To facilitate event creation and registration</li>
            <li>To provide QR-based check-in services</li>
            <li>To send event reminders and notifications</li>
            <li>To verify your college email address</li>
            <li>To improve and personalize the Platform</li>
            <li>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Sharing of Information">
          <p>We do <strong className="text-white/90">not</strong> sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong className="text-white/90">Event Organizers</strong> — participant data is shared with the organizer of the event you register for.</li>
            <li><strong className="text-white/90">Service Providers</strong> — Firebase (Google) for authentication and data storage; Razorpay for payment processing.</li>
            <li><strong className="text-white/90">Legal Requirements</strong> — if required by law or to protect rights and safety.</li>
          </ul>
        </Section>

        <Section title="5. Data Storage & Security">
          <p>
            Your data is stored on Google Firebase infrastructure with industry-standard encryption. We implement appropriate
            technical and organizational measures to protect your data. However, no internet transmission is 100% secure.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage. You can
            control cookie settings through your browser, but disabling cookies may affect Platform functionality.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-white/90">Access</strong> — request a copy of your personal data</li>
            <li><strong className="text-white/90">Correction</strong> — update inaccurate or incomplete information via your Profile page</li>
            <li><strong className="text-white/90">Deletion</strong> — delete your account and associated data from the Profile page</li>
            <li><strong className="text-white/90">Withdrawal of Consent</strong> — opt out of non-essential communications</li>
          </ul>
          <p className="mt-3">To exercise your rights, contact us at <a href="mailto:myfestivo@gmail.com" className="text-[#B388FF] hover:underline">myfestivo@gmail.com</a>.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>MyFestivo is intended for college students (typically 17+). We do not knowingly collect data from children under 13. If you believe a minor has provided data, please contact us immediately.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use after changes constitutes acceptance.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have questions about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:myfestivo@gmail.com" className="text-[#B388FF] hover:underline">myfestivo@gmail.com</a>
          </p>
          <p className="mt-1 text-white/40 text-xs">MyFestivo Team — SRM Institute of Science and Technology, Chennai, India</p>
        </Section>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs text-white/30 font-mono">
        <p>© {new Date().getFullYear()} MyFestivo. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms &amp; Conditions</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
        </div>
      </footer>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-medium text-white mb-3 pb-2 border-b border-white/[0.06]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-medium text-white/80 mb-2">{title}</h3>
      <div className="space-y-2 text-white/60">{children}</div>
    </div>
  )
}
