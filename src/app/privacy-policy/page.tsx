import type { Metadata } from "next"
import Link from "next/link"

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MyFestivo" width={120} height={40} className="h-10 w-auto" loading="lazy" decoding="async" />
        </Link>
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">Legal</p>
        <h1 className="text-4xl font-extralight tracking-tight text-white mb-4">Privacy Policy</h1>
        <p className="text-white/40 text-sm font-mono">Effective Date: July 5, 2026 · Last Updated: July 5, 2026</p>
      </header>

      {/* Content */}
      <div className="prose prose-invert max-w-none space-y-10 text-white/70 text-sm leading-relaxed">

        <Section title="1. Introduction">
          <p>
            MyFestivo (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Platform&quot;) is committed to protecting your privacy and ensuring you
            have a positive experience on our Platform. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit{" "}
            <a href="https://myfestivo.live" className="text-[#B388FF] hover:underline">https://myfestivo.live</a>{" "}
            and use our services.
          </p>
          <p>Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Platform.</p>
        </Section>

        <Section title="2. Information We Collect">
          <Subsection title="2.1 Information You Provide Directly">
            <p className="font-semibold text-white/90 mb-1">Registration &amp; Account Information</p>
            <p className="mb-2">When you create an account on MyFestivo, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Full Name</strong></li>
              <li><strong className="text-white/90">College Email Address</strong> (required for verification)</li>
              <li><strong className="text-white/90">College/University Name</strong></li>
              <li><strong className="text-white/90">Phone Number</strong> (optional)</li>
              <li><strong className="text-white/90">Password</strong> (securely hashed)</li>
              <li><strong className="text-white/90">Profile Information</strong> (bio, profile picture, etc.)</li>
            </ul>

            <p className="font-semibold text-white/90 mt-4 mb-1">Event-Related Information</p>
            <p className="mb-2">When you create or register for an event, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Event Title, Description, and Details</li>
              <li>Event Date, Time, and Location</li>
              <li>Participant Registration Data (names, emails, phone numbers of registrants)</li>
              <li>Event Categories and Tags</li>
              <li>Organizer Information (for event creation)</li>
            </ul>

            <p className="font-semibold text-white/90 mt-4 mb-1">Check-in &amp; Verification Data</p>
            <p className="mb-2">When you check in to an event, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>QR Code Scan Data</li>
              <li>Check-in Timestamp</li>
              <li>Device Information (for QR scanning)</li>
            </ul>

            <p className="font-semibold text-white/90 mt-4 mb-1">Communication Data</p>
            <p className="mb-2">If you contact us via email or through the Platform, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your Message Content</li>
              <li>Contact Information</li>
              <li>Communication History</li>
            </ul>

            <p className="font-semibold text-white/90 mt-4 mb-1">Technical Data</p>
            <p className="mb-2">We automatically collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP Address</li>
              <li>Browser Type and Version</li>
              <li>Operating System</li>
              <li>Device Type</li>
              <li>Cookies and Tracking Data</li>
              <li>Pages Visited and Time Spent</li>
              <li>Referral Source</li>
              <li>User Activity Logs</li>
            </ul>
          </Subsection>

          <Subsection title="2.2 Information from Third Parties">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">College Email Verification:</strong> We receive confirmation of your email domain from your college&apos;s email provider.</li>
              <li><strong className="text-white/90">Firebase &amp; Google Services:</strong> Authentication data, crash reports, and analytics.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>MyFestivo uses collected information for the following purposes:</p>

          <Subsection title="3.1 Platform Operations">
            <ul className="list-disc pl-5 space-y-1">
              <li>Creating and managing your account.</li>
              <li>Processing event registrations and check-ins.</li>
              <li>Facilitating communication between Organizers and Participants.</li>
              <li>Sending transactional emails (registration confirmations, event reminders, QR codes).</li>
              <li>Verifying your college affiliation and eligibility.</li>
            </ul>
          </Subsection>

          <Subsection title="3.2 Service Improvement">
            <ul className="list-disc pl-5 space-y-1">
              <li>Analyzing user behavior and Platform usage patterns.</li>
              <li>Identifying technical issues and bugs.</li>
              <li>Enhancing features and user experience.</li>
              <li>Conducting internal research and analytics.</li>
            </ul>
          </Subsection>

          <Subsection title="3.3 Marketing &amp; Analytics">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Generating Content:</strong> Using aggregated, anonymized event data and descriptions to create comparative blog posts, articles, and marketing materials.</li>
              <li><strong className="text-white/90">Competitive Analysis:</strong> Analyzing event trends, popular topics, and competitor positioning to inform our SEO strategy and content planning.</li>
              <li><strong className="text-white/90">Promotional Communications:</strong> Sending you updates about new features, events, and news (you can opt out at any time).</li>
              <li><strong className="text-white/90">Analytics:</strong> Tracking aggregate usage statistics to understand Platform reach and effectiveness.</li>
            </ul>
          </Subsection>

          <Subsection title="3.4 Legal &amp; Safety">
            <ul className="list-disc pl-5 space-y-1">
              <li>Enforcing these Terms and Conditions.</li>
              <li>Detecting, investigating, and preventing fraudulent activity, abuse, or security violations.</li>
              <li>Complying with legal obligations and requests from law enforcement.</li>
              <li>Protecting the rights, privacy, and safety of MyFestivo, its users, and the public.</li>
            </ul>
          </Subsection>

          <Subsection title="3.5 Aggregate &amp; Anonymized Data">
            <p>We may create <strong className="text-white/90">anonymized, aggregated reports</strong> (e.g., &quot;events by category,&quot; &quot;average registration rates,&quot; &quot;trending event types&quot;) that cannot identify individuals. These reports may be used for marketing, internal insights, and public analysis.</p>
          </Subsection>
        </Section>

        <Section title="4. Data Sharing &amp; Disclosure">
          <Subsection title="4.1 Information Shared Between Users">
            <p className="font-semibold text-white/90 mb-1">Organizer to Participant</p>
            <p className="mb-2">Organizers have access to:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Participant names and registered email addresses (for communication and check-in).</li>
              <li>Event registration status.</li>
            </ul>
            <p className="font-semibold text-white/90 mb-1">Participant to Organizer</p>
            <p className="mb-2">Participants may see:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Organizer name and contact information.</li>
              <li>Event details and descriptions.</li>
            </ul>
          </Subsection>

          <Subsection title="4.2 Sharing with Service Providers">
            <p className="mb-2">We share limited data with trusted third-party service providers who assist us:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Firebase (Google Cloud):</strong> For authentication, database hosting, and crash reporting.</li>
              <li><strong className="text-white/90">Email Service Providers:</strong> For sending transactional and promotional emails.</li>
              <li><strong className="text-white/90">Analytics Tools:</strong> For understanding Platform usage (anonymized data only).</li>
              <li><strong className="text-white/90">Cloud Hosting Providers:</strong> For Platform infrastructure and security.</li>
            </ul>
            <p className="mt-2">These service providers are bound by confidentiality agreements and are prohibited from using your data for purposes other than providing services to MyFestivo.</p>
          </Subsection>

          <Subsection title="4.3 Legal Disclosure">
            <p className="mb-2">We may disclose your information if required by law or if we believe in good faith that disclosure is necessary to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Comply with legal obligations, court orders, or government requests.</li>
              <li>Enforce our Terms and Conditions.</li>
              <li>Protect the safety, rights, or property of MyFestivo, its users, or the public.</li>
              <li>Prevent or investigate fraudulent activity or security violations.</li>
            </ul>
          </Subsection>

          <Subsection title="4.4 Mergers &amp; Acquisitions">
            <p>If MyFestivo is acquired, merged, or undergoes a change of control, your information may be transferred as part of that transaction. We will provide notice of any such change.</p>
          </Subsection>
        </Section>

        <Section title="5. Data Retention">
          <Subsection title="5.1 Indefinite Retention for Analytics">
            <p className="mb-2">MyFestivo retains user data <strong className="text-white/90">indefinitely</strong> for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Analytics and understanding user behavior trends.</li>
              <li>Fraud detection and prevention.</li>
              <li>Legal compliance and record-keeping.</li>
              <li>Historical analysis and insights.</li>
            </ul>
          </Subsection>

          <Subsection title="5.2 Organizer-Managed Data">
            <p>If you are an Organizer, participant data collected through your event registration (names, emails, phone numbers) is <strong className="text-white/90">retained indefinitely</strong> for historical records and analytics, even after the event concludes.</p>
          </Subsection>

          <Subsection title="5.3 Account Deletion">
            <p className="mb-2">If you request account deletion, we will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Remove your account login credentials and personal identifiable information.</li>
              <li><strong className="text-white/90">Retain anonymized and aggregated data</strong> for analytics purposes.</li>
              <li><strong className="text-white/90">Retain event registration records</strong> for historical accuracy (without personally identifying you).</li>
            </ul>
          </Subsection>

          <Subsection title="5.4 No Automatic Deletion">
            <p>MyFestivo does not automatically delete data after a specific period unless legally required to do so.</p>
          </Subsection>
        </Section>

        <Section title="6. Data Security">
          <Subsection title="6.1 Security Measures">
            <p className="mb-2">We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Encryption:</strong> Sensitive data (passwords, authentication tokens) are encrypted using modern encryption standards.</li>
              <li><strong className="text-white/90">Secure Servers:</strong> Data is stored on secure, password-protected servers managed by Firebase/Google Cloud.</li>
              <li><strong className="text-white/90">Access Controls:</strong> Only authorized personnel have access to personal information.</li>
              <li><strong className="text-white/90">SSL/TLS:</strong> Our website uses HTTPS to encrypt data in transit.</li>
            </ul>
          </Subsection>

          <Subsection title="6.2 Limitations of Security">
            <p><strong className="text-white/90">No system is 100% secure.</strong> While we take reasonable precautions, MyFestivo cannot guarantee absolute protection against hacking, data breaches, or unauthorized access. You use the Platform at your own risk.</p>
          </Subsection>

          <Subsection title="6.3 Password Security">
            <p className="mb-2">You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the confidentiality of your password.</li>
              <li>Notifying us immediately of any unauthorized access.</li>
              <li>Logging out of your account on shared or public devices.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="7. User Rights &amp; Data Access">
          <Subsection title="7.1 Right to Access Your Data">
            <p>You have the right to request access to the personal information we hold about you. To request your data, email us at <a href="mailto:myfestivo@gmail.com" className="text-[#B388FF] hover:underline">myfestivo@gmail.com</a>.</p>
          </Subsection>

          <Subsection title="7.2 Right to Correction">
            <p>If your information is inaccurate or incomplete, you can update it through your account settings or by contacting us.</p>
          </Subsection>

          <Subsection title="7.3 Right to Deletion">
            <p className="mb-2">You can request deletion of your account and associated personal information. However, please note:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>We will retain anonymized and aggregated data for analytics.</li>
              <li>We will retain event participation records (without identifying information) for historical accuracy.</li>
              <li>Some data may be retained for legal or operational reasons.</li>
            </ul>
          </Subsection>

          <Subsection title="7.4 Right to Opt Out">
            <p className="mb-2">You can opt out of:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Promotional emails:</strong> Click &quot;Unsubscribe&quot; in any email or update preferences in your account.</li>
              <li><strong className="text-white/90">Analytics tracking:</strong> Some analytics data may be unavoidable for Platform operations, but you can limit third-party cookies through your browser settings.</li>
            </ul>
          </Subsection>

          <Subsection title="7.5 Data Portability">
            <p>Upon request, we can provide your information in a structured, commonly-used format to facilitate transfer to another service.</p>
          </Subsection>
        </Section>

        <Section title="8. Cookies &amp; Tracking Technologies">
          <Subsection title="8.1 What Are Cookies?">
            <p>Cookies are small text files stored on your device that help us recognize you and enhance your experience.</p>
          </Subsection>

          <Subsection title="8.2 Types of Cookies We Use">
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border border-white/[0.08] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/[0.04] text-white/60">
                    <th className="text-left p-3 font-medium border-b border-white/[0.06]">Cookie Type</th>
                    <th className="text-left p-3 font-medium border-b border-white/[0.06]">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.04]">
                    <td className="p-3 font-medium text-white/80">Essential / Functional</td>
                    <td className="p-3 text-white/50">Authentication, session management, security</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="p-3 font-medium text-white/80">Analytics</td>
                    <td className="p-3 text-white/50">Understanding user behavior, Platform improvement</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="p-3 font-medium text-white/80">Preference</td>
                    <td className="p-3 text-white/50">Remembering your settings and preferences</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-white/80">Marketing</td>
                    <td className="p-3 text-white/50">Tracking ad effectiveness and content personalization</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Subsection>

          <Subsection title="8.3 Cookie Management">
            <p className="mb-2">You can:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Disable cookies</strong> through your browser settings.</li>
              <li><strong className="text-white/90">Clear cookies</strong> regularly.</li>
              <li><strong className="text-white/90">Use incognito/private browsing</strong> to avoid persistent cookies.</li>
            </ul>
            <p className="mt-2 text-white/50 text-xs"><strong className="text-white/70">Note:</strong> Disabling cookies may limit Platform functionality.</p>
          </Subsection>

          <Subsection title="8.4 Third-Party Analytics">
            <p>We use analytics tools (Google Analytics, Firebase Analytics) that may place cookies on your device. These tools have their own privacy policies.</p>
          </Subsection>
        </Section>

        <Section title="9. Third-Party Links &amp; Services">
          <p>MyFestivo may contain links to external websites or services (college websites, event ticketing systems, etc.). We are <strong className="text-white/90">not responsible</strong> for:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>The privacy practices of third-party websites.</li>
            <li>The content or security of external services.</li>
            <li>Data collected by third parties.</li>
          </ul>
          <p className="mt-3">Please review the privacy policies of any third-party services before sharing information with them.</p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>MyFestivo is <strong className="text-white/90">not intended for children under 13 years of age</strong>. We do not knowingly collect information from children. If we become aware that a child under 13 has provided information, we will delete such data immediately.</p>
          <p className="mt-2">For users between 13–18 years, parental consent may be required under applicable law. We recommend discussing online safety and privacy with your parents or guardians.</p>
        </Section>

        <Section title="11. International Data Transfers">
          <p className="mb-2">MyFestivo is based in India. If you access the Platform from outside India, you acknowledge that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your data may be transferred to, stored in, and processed in India.</li>
            <li>Indian data protection laws apply.</li>
            <li>You consent to such transfers.</li>
          </ul>
        </Section>

        <Section title="12. Your Rights Under Indian Law">
          <Subsection title="12.1 Data Protection Act Compliance">
            <p>MyFestivo is committed to complying with the Information Technology Act, 2000 and other applicable Indian data protection regulations.</p>
          </Subsection>
          <Subsection title="12.2 Rights of Data Subjects">
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Know what information we collect and how it&apos;s used.</li>
              <li>Access, correct, or delete your information (subject to legal retention requirements).</li>
              <li>Withdraw consent for data processing.</li>
              <li>Lodge complaints with relevant regulatory authorities.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="13. Policy Changes">
          <p>MyFestivo reserves the right to modify this Privacy Policy at any time. Changes become effective immediately upon posting. We will provide <strong className="text-white/90">30 days&apos; notice</strong> via email or Platform notification for material changes.</p>
          <p className="mt-2">Your continued use of the Platform constitutes acceptance of the updated Privacy Policy.</p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:
          </p>
          <p className="mt-3 text-white/60">
            <strong className="text-white/90">MyFestivo Privacy Team</strong><br />
            Email:{" "}
            <a href="mailto:myfestivo@gmail.com" className="text-[#B388FF] hover:underline">myfestivo@gmail.com</a><br />
            Website:{" "}
            <a href="https://myfestivo.live" className="text-[#B388FF] hover:underline">https://myfestivo.live</a>
          </p>
        </Section>

        <Section title="15. Complaint Resolution">
          <p className="mb-3">If you believe MyFestivo has violated your privacy rights, you can:</p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li><strong className="text-white/90">Contact us directly</strong> at the email above.</li>
            <li><strong className="text-white/90">File a complaint</strong> with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (Ministry of Electronics and Information Technology).</li>
            <li><strong className="text-white/90">Escalate to authorities</strong> such as the Data Protection Board (once established under future legislation).</li>
          </ol>
        </Section>

        <p className="text-white/40 text-xs border-t border-white/[0.06] pt-6 mt-6">
          By using MyFestivo, you acknowledge that you have read, understood, and agree to this Privacy Policy.
        </p>
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
