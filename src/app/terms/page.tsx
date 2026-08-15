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
            Welcome to <strong className="text-white/90">MyFestivo</strong> (&quot;Platform,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Company&quot;). MyFestivo is an online event
            operating system designed for college communities to create, manage, and participate in campus events.
          </p>
          <p>
            By accessing, browsing, or using the MyFestivo Platform (including our website at{" "}
            <a href="https://myfestivo.live" className="text-[#B388FF] hover:underline">https://myfestivo.live</a>{" "}
            and any related services), you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms in their entirety, you may not use the Platform.
          </p>
          <p>These Terms apply to all users of MyFestivo, including event organizers (&quot;Organizers&quot;) and event participants (&quot;Participants&quot;).</p>
        </Section>

        <Section title="2. User Eligibility">
          <Subsection title="2.1 Age Requirement">
            <p>To use MyFestivo, you must be a <strong className="text-white/90">college student or affiliated with a recognized educational institution in India</strong>. While there is no strict minimum age requirement, we expect Participants to be approximately <strong className="text-white/90">17 years or older</strong>.</p>
          </Subsection>
          <Subsection title="2.2 College Email Verification">
            <p>MyFestivo requires <strong className="text-white/90">verification through a valid college email address</strong> to register as a Participant or Organizer. Users who fail email verification or who are not affiliated with a recognized educational institution will not be permitted to create accounts or register for events.</p>
          </Subsection>
          <Subsection title="2.3 Account Eligibility">
            <p className="mb-2">You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are a student at an accredited college or university in India.</li>
              <li>All information you provide during registration is accurate, complete, and truthful.</li>
              <li>You are not previously banned or suspended from the MyFestivo Platform.</li>
              <li>You will not create multiple accounts or use the Platform on behalf of others.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="3. Organizer Responsibilities">
          <Subsection title="3.1 Full Responsibility for Events">
            <p className="mb-2">Event Organizers are solely responsible for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white/90">Event Planning &amp; Execution:</strong> Planning, organizing, coordinating, and conducting all aspects of the event.</li>
              <li><strong className="text-white/90">Compliance with Laws:</strong> Ensuring the event complies with all applicable Indian laws, local regulations, and college policies.</li>
              <li><strong className="text-white/90">Safety &amp; Security:</strong> Ensuring the safety, security, and well-being of all Participants.</li>
              <li><strong className="text-white/90">Liability &amp; Insurance:</strong> Assuming full legal and financial liability for any accidents, injuries, damages, or claims arising from the event.</li>
              <li><strong className="text-white/90">Attendance Verification:</strong> Verifying that Participants meet the eligibility criteria for the event.</li>
              <li><strong className="text-white/90">Cancellations &amp; Changes:</strong> Notifying Participants promptly of any cancellations, postponements, reschedulings, or significant changes to the event.</li>
              <li><strong className="text-white/90">Collection of Participant Data:</strong> Responsibly managing and protecting any personal information collected from Participants (names, emails, phone numbers, etc.).</li>
            </ul>
          </Subsection>
          <Subsection title="3.2 Indemnification">
            <p className="mb-2">Organizers agree to <strong className="text-white/90">indemnify, defend, and hold harmless</strong> MyFestivo, its founders, employees, and agents from any and all claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Organizer&apos;s event, decisions, or actions.</li>
              <li>Breach of these Terms by the Organizer.</li>
              <li>Violation of applicable laws or college policies.</li>
              <li>Any injury, damage, or loss to Participants or third parties.</li>
            </ul>
          </Subsection>
          <Subsection title="3.3 Event Content &amp; Descriptions">
            <p>Organizers must provide <strong className="text-white/90">accurate, truthful, and non-misleading</strong> event descriptions. Misleading event information may result in account suspension or permanent ban.</p>
          </Subsection>
        </Section>

        <Section title="4. Participant Rights &amp; Responsibilities">
          <Subsection title="4.1 Participant Responsibilities">
            <p className="mb-2">As a Participant, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white/90">Follow Event Guidelines:</strong> Comply with all rules, instructions, and guidelines set by the Organizer.</li>
              <li><strong className="text-white/90">Respectful Conduct:</strong> Treat all attendees, organizers, and volunteers with respect. Harassment, hate speech, discrimination, or abusive behavior is strictly prohibited.</li>
              <li><strong className="text-white/90">Accurate Information:</strong> Provide accurate and truthful information during registration.</li>
              <li><strong className="text-white/90">Legal Compliance:</strong> Engage in activities that comply with all applicable laws and college policies.</li>
              <li><strong className="text-white/90">No Reselling:</strong> You may not resell, transfer, or distribute your event registration to another person.</li>
            </ul>
          </Subsection>
          <Subsection title="4.2 Participant Acknowledgment">
            <p className="mb-2">By registering for an event, Participants acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>They have read and understood the event details provided by the Organizer.</li>
              <li>They assume all risks associated with attending the event (including health, safety, and personal property risks).</li>
              <li>They release the Organizer and MyFestivo from any claims of injury or loss during the event.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="5. Prohibited Activities">
          <p>Users are strictly prohibited from:</p>
          <Subsection title="5.1 Event-Related Violations">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Creating or promoting <strong className="text-white/90">commercial or non-educational events</strong> (events focused on profit generation rather than learning or community building).</li>
              <li>Organizing events that <strong className="text-white/90">violate Indian laws</strong>, local regulations, or institutional policies.</li>
              <li>Reselling or transferring event registrations.</li>
              <li>Organizing events that promote <strong className="text-white/90">violence, illegal activities, harassment, hate speech, discrimination, or harm</strong> to any person or group.</li>
            </ul>
          </Subsection>
          <Subsection title="5.2 Platform Conduct Violations">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Engaging in <strong className="text-white/90">harassment, hate speech, discrimination, bullying, or abusive behavior</strong> towards other users.</li>
              <li>Sharing <strong className="text-white/90">sexually explicit, obscene, or illegal content</strong>.</li>
              <li>Creating <strong className="text-white/90">fake, misleading, or fraudulent accounts</strong>.</li>
              <li>Attempting to <strong className="text-white/90">hack, breach, disrupt, or damage</strong> the Platform or its systems.</li>
              <li>Spam, automated bots, or malicious activity.</li>
              <li>Attempting to <strong className="text-white/90">circumvent security measures</strong> or access unauthorized portions of the Platform.</li>
            </ul>
          </Subsection>
          <Subsection title="5.3 Consequences">
            <p className="mb-2">Users who violate these prohibitions will be subject to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Immediate account suspension</strong> (temporary or permanent).</li>
              <li><strong className="text-white/90">Removal from all events</strong> they have registered for or organized.</li>
              <li><strong className="text-white/90">Referral to relevant authorities</strong> if the violation involves illegal activity.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="6. Intellectual Property Rights">
          <Subsection title="6.1 MyFestivo's IP">
            <p className="mb-2">MyFestivo retains full ownership of:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Platform&apos;s design, code, features, and functionality.</li>
              <li>Logos, trademarks, and branding materials.</li>
              <li>All documentation, databases, and systems.</li>
            </ul>
          </Subsection>
          <Subsection title="6.2 User-Generated Content">
            <p className="mb-2">You retain ownership of event descriptions, images, and other content you create (&quot;User Content&quot;). However, you grant MyFestivo a <strong className="text-white/90">perpetual, worldwide, royalty-free, non-exclusive license</strong> to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use, reproduce, modify, and display your event information for Platform operations.</li>
              <li><strong className="text-white/90">Use event data and descriptions for marketing, analytics, and competitive research</strong> (including SEO content generation and blog posts comparing MyFestivo to competitors).</li>
              <li>Aggregate anonymized data for insights and analytics.</li>
            </ul>
          </Subsection>
          <Subsection title="6.3 Organizer Obligations">
            <p>Organizers warrant that any event content they upload does not infringe on third-party intellectual property rights and does not violate any laws.</p>
          </Subsection>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <p>MyFestivo is provided on an <strong className="text-white/90">&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, express or implied.</p>
          <Subsection title="7.1 Specific Disclaimers">
            <p className="mb-2">We make <strong className="text-white/90">no representations or warranties</strong> regarding:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white/90">Accuracy or Completeness:</strong> Event information, descriptions, or details provided by Organizers.</li>
              <li><strong className="text-white/90">Reliability or Uninterrupted Access:</strong> The Platform may be subject to downtime, errors, or interruptions without liability.</li>
              <li><strong className="text-white/90">Security:</strong> While we implement reasonable security measures, we cannot guarantee absolute protection against breaches or unauthorized access.</li>
              <li><strong className="text-white/90">Third-Party Services:</strong> Firebase, email providers, college authentication systems, or other integrations may fail without our liability.</li>
              <li><strong className="text-white/90">Fitness for Purpose:</strong> The Platform may not meet all your specific requirements.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="8. Limitation of Liability">
          <Subsection title="8.1 Liability Cap">
            <p><strong className="text-white/90">MyFestivo&apos;s total liability to any user is limited to zero rupees (₹0).</strong> MyFestivo shall not be liable for any damages, losses, or claims, regardless of the cause.</p>
          </Subsection>
          <Subsection title="8.2 Exclusions of Liability">
            <p className="mb-2">MyFestivo is <strong className="text-white/90">NOT liable</strong> for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white/90">Direct or Indirect Damages:</strong> Including lost profits, revenue, data, business opportunities, or reputational harm.</li>
              <li><strong className="text-white/90">Consequential, Incidental, or Special Damages:</strong> Even if MyFestivo has been advised of the possibility of such damages.</li>
              <li><strong className="text-white/90">Third-Party Actions:</strong> Failures, breaches, or misconduct of third-party services (email providers, authentication systems, college servers, etc.).</li>
              <li><strong className="text-white/90">Event-Related Losses:</strong> Any injury, damage, illness, or loss occurring during or related to events organized through the Platform.</li>
              <li><strong className="text-white/90">Data Loss or Unauthorized Access:</strong> We are not liable if your data is compromised, lost, or accessed without authorization, except in cases of our gross negligence or willful misconduct.</li>
            </ul>
          </Subsection>
          <Subsection title="8.3 Sole Remedy">
            <p>If you are dissatisfied with the Platform, your sole remedy is to stop using it.</p>
          </Subsection>
        </Section>

        <Section title="9. Account Suspension &amp; Termination">
          <Subsection title="9.1 Grounds for Suspension">
            <p className="mb-2">MyFestivo may suspend or terminate your account immediately, without notice, if you:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violate these Terms or any applicable laws.</li>
              <li>Engage in harassment, hate speech, discrimination, or abusive conduct.</li>
              <li>Create misleading or fraudulent event information.</li>
              <li>Attempt to breach Platform security or disrupt services.</li>
              <li>Are deemed to pose a risk to other users or the Platform.</li>
              <li>Fail to maintain valid college email verification.</li>
            </ul>
          </Subsection>
          <Subsection title="9.2 Effect of Termination">
            <p className="mb-2">Upon suspension or termination:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You lose access to your account and all associated event data.</li>
              <li>You will be removed from all events (as Organizer or Participant).</li>
              <li>You forfeit any future access to the Platform.</li>
              <li>Organizers lose ability to check in participants or manage events.</li>
            </ul>
          </Subsection>
          <Subsection title="9.3 Data Retention">
            <p>MyFestivo may retain your data indefinitely for analytics, legal compliance, and fraud prevention purposes, even after account termination.</p>
          </Subsection>
        </Section>

        <Section title="10. Dispute Resolution">
          <Subsection title="10.1 No MyFestivo Involvement">
            <p className="mb-2">MyFestivo takes no role in disputes between Organizers and Participants. This includes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Registration disagreements or check-in conflicts.</li>
              <li>Event cancellations or reschedulings.</li>
              <li>Complaints about event quality, content, or conduct.</li>
              <li>Personal disputes between users.</li>
            </ul>
          </Subsection>
          <Subsection title="10.2 Direct Resolution">
            <p className="mb-2">Disputes must be resolved directly between the Organizer and Participant. If resolution is not possible, users may:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Report violations of these Terms to MyFestivo for investigation.</li>
              <li>Pursue legal action through the appropriate courts.</li>
            </ul>
          </Subsection>
          <Subsection title="10.3 Arbitration &amp; Jurisdiction">
            <p>You agree to resolve any disputes through the courts of the jurisdiction in which the Organizer&apos;s college is located (in India). You waive any right to jury trial or class action.</p>
          </Subsection>
        </Section>

        <Section title="11. Privacy &amp; Data Collection">
          <p>MyFestivo collects, uses, and stores user data as described in the <strong className="text-white/90">separate Privacy Policy</strong> available on the Platform. Your use of the Platform constitutes acceptance of our{" "}
            <Link href="/privacy-policy" className="text-[#B388FF] hover:underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="12. Amendment of Terms">
          <p>MyFestivo reserves the right to modify these Terms at any time. Changes become effective immediately upon posting to the Platform. Continued use of the Platform after changes constitutes acceptance of the new Terms.</p>
          <p className="mt-2">We will provide <strong className="text-white/90">30 days&apos; notice</strong> via email or Platform notification of material changes.</p>
        </Section>

        <Section title="13. Severability">
          <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable, that provision shall be severed, and the remaining Terms shall continue in full force and effect.</p>
        </Section>

        <Section title="14. Governing Law &amp; Jurisdiction">
          <Subsection title="14.1 Governing Law">
            <p>These Terms are governed by and construed in accordance with the <strong className="text-white/90">laws of India</strong>, without regard to its conflict of law principles.</p>
          </Subsection>
          <Subsection title="14.2 Jurisdiction">
            <p className="mb-2">You irrevocably submit to the exclusive jurisdiction of:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The <strong className="text-white/90">courts of New Delhi, India</strong> for any legal disputes.</li>
              <li>You waive any objection to venue or inconvenient forum.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="15. Contact Information">
          <p>If you have questions about these Terms and Conditions, please contact us at:</p>
          <p className="mt-3 text-white/60">
            <strong className="text-white/90">MyFestivo Support</strong><br />
            Email:{" "}
            <a href="mailto:myfestivo@gmail.com" className="text-[#B388FF] hover:underline">myfestivo@gmail.com</a><br />
            Website:{" "}
            <a href="https://myfestivo.live" className="text-[#B388FF] hover:underline">https://myfestivo.live</a>
          </p>
        </Section>

        <Section title="16. Entire Agreement">
          <p>These Terms, along with the Privacy Policy, constitute the entire agreement between you and MyFestivo regarding your use of the Platform and supersede all prior agreements, understandings, and negotiations.</p>
        </Section>

        <p className="text-white/40 text-xs border-t border-white/[0.06] pt-6 mt-6">
          By using MyFestivo, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
        </p>
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
