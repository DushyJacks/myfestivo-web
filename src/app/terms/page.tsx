import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms & Conditions — MyFestivo",
  description:
    "MyFestivo's Terms and Conditions. Read the rules, responsibilities, and agreements governing use of the college event management platform.",
  alternates: { canonical: "https://myfestivo.live/terms" },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 md:px-16 py-24 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-16">
        <Link href="/" className="inline-block mb-10" aria-label="Go to MyFestivo home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MyFestivo" width={120} height={40} className="h-10 w-auto" loading="lazy" decoding="async" />
        </Link>
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">Legal</p>
        <h1 className="text-4xl font-extralight tracking-tight text-white mb-4">Terms &amp; Conditions</h1>
        <p className="text-white/40 text-sm font-mono">Effective Date: July 5, 2026 · Last Updated: July 5, 2026</p>
      </header>

      {/* Content */}
      <div className="space-y-10 text-white/70 text-sm leading-relaxed">

        <Section title="1. Acceptance of Terms">
          <p>
            Welcome to <strong className="text-white/90">MyFestivo</strong> ("Platform," "we," "us," "our"). MyFestivo is an online event
            operating system designed for college communities to create, manage, and participate in campus events.
          </p>
          <p>
            By accessing, browsing, or using the MyFestivo Platform (including{" "}
            <a href="https://myfestivo.live" className="text-[#B388FF] hover:underline">https://myfestivo.live</a> and any related services),
            you ("User," "you," "your") agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform.
          </p>
        </Section>

        <Section title="2. User Eligibility">
          <Subsection title="2.1 Age Requirement">
            <p>To use MyFestivo, you must be a college student or affiliated with a recognized educational institution in India. We expect users to be approximately 17 years or older.</p>
          </Subsection>
          <Subsection title="2.2 College Email Verification">
            <p>MyFestivo requires verification through a valid college email address to register as a Participant or Organizer. Users who fail email verification will not be permitted to create accounts or register for events.</p>
          </Subsection>
          <Subsection title="2.3 Account Eligibility">
            <p>You represent and warrant that you are a student at an accredited institution, all information provided is accurate and truthful, you have not been previously banned from the Platform, and you will not create multiple accounts.</p>
          </Subsection>
        </Section>

        <Section title="3. Organizer Responsibilities">
          <p>Event Organizers are solely responsible for:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Planning, organizing, and conducting all aspects of the event</li>
            <li>Ensuring compliance with all applicable laws and college policies</li>
            <li>Ensuring the safety and well-being of all participants</li>
            <li>Assuming full legal and financial liability for their events</li>
            <li>Notifying participants of any cancellations or changes promptly</li>
            <li>Providing accurate, non-misleading event descriptions</li>
          </ul>
          <p className="mt-3">Organizers agree to <strong className="text-white/90">indemnify and hold harmless</strong> MyFestivo from any claims, damages, or expenses arising from their events or actions.</p>
        </Section>

        <Section title="4. Participant Rights & Responsibilities">
          <p>As a Participant, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Provide accurate information during registration</li>
            <li>Comply with all event rules set by the Organizer</li>
            <li>Treat other participants and organizers with respect</li>
            <li>Not misuse, forge, or share your QR check-in pass</li>
            <li>Accept that MyFestivo is not responsible for the conduct of Organizers or event outcomes</li>
          </ul>
        </Section>

        <Section title="5. Prohibited Conduct">
          <p>You agree <strong className="text-white/90">not</strong> to:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Use the Platform for any unlawful purpose</li>
            <li>Post false, misleading, or offensive content</li>
            <li>Attempt to hack, disrupt, or gain unauthorized access to the Platform</li>
            <li>Spam, harass, or impersonate other users</li>
            <li>Use bots or automated tools to scrape or misuse the Platform</li>
            <li>Create events intended to defraud participants</li>
          </ul>
          <p className="mt-3">Violations may result in immediate account suspension or permanent ban.</p>
        </Section>

        <Section title="6. Payments & Refunds">
          <p>
            Payment processing is handled by Razorpay. Event fees are collected by the Organizer, not by MyFestivo.
            MyFestivo is not responsible for refunds — all refund requests must be directed to the Event Organizer.
            MyFestivo does not take a platform fee on transactions.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All Platform content, branding, design, and code are the property of MyFestivo. You may not copy, reproduce, or
            distribute any part of the Platform without written permission. User-submitted content (event descriptions, chat
            messages, etc.) remains your property, but you grant MyFestivo a license to display it on the Platform.
          </p>
        </Section>

        <Section title="8. Disclaimers & Limitation of Liability">
          <p>
            The Platform is provided "as is" without warranties of any kind. MyFestivo is not liable for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Any event cancellations, changes, or failures by Organizers</li>
            <li>Personal injury, property damage, or financial loss at events</li>
            <li>Data loss caused by technical failures beyond our control</li>
            <li>Actions or conduct of other users on the Platform</li>
          </ul>
          <p className="mt-3">To the maximum extent permitted by law, MyFestivo's total liability shall not exceed the amount paid by you to the Platform in the 12 months preceding the claim.</p>
        </Section>

        <Section title="9. Termination">
          <p>
            We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent
            activity, or conduct that we deem harmful to other users or the Platform. You may delete your account at any time
            from the Profile page.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of MyFestivo
            shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu, India.
          </p>
        </Section>

        <Section title="11. Changes to Terms">
          <p>
            We may update these Terms from time to time. We will notify you of significant changes by posting the updated Terms
            on this page with a new effective date. Continued use of the Platform after changes constitutes your acceptance.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            For questions about these Terms, please contact:{" "}
            <a href="mailto:myfestivo@gmail.com" className="text-[#B388FF] hover:underline">myfestivo@gmail.com</a>
          </p>
          <p className="mt-1 text-white/40 text-xs">MyFestivo Team — SRM Institute of Science and Technology, Chennai, India</p>
        </Section>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs text-white/30 font-mono">
        <p>© {new Date().getFullYear()} MyFestivo. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
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
