"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { Check, FileText, Shield, X } from "lucide-react"

// ─── Full document content (verbatim from MD files) ───────────────────────────

const TERMS_CONTENT = `# Terms and Conditions for MyFestivo

Effective Date: July 5, 2026
Last Updated: July 5, 2026

## 1. Acceptance of Terms

Welcome to MyFestivo ("Platform," "we," "us," "our," or "Company"). MyFestivo is an online event operating system designed for college communities to create, manage, and participate in campus events.

By accessing, browsing, or using the MyFestivo Platform (including our website at https://myfestivo.live/ and any related services), you ("User," "you," or "your") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms in their entirety, you may not use the Platform.

These Terms apply to all users of MyFestivo, including event organizers ("Organizers") and event participants ("Participants").

---

## 2. User Eligibility

### 2.1 Age Requirement
To use MyFestivo, you must be a college student or affiliated with a recognized educational institution in India. While there is no strict minimum age requirement, we expect Participants to be approximately 17 years or older.

### 2.2 College Email Verification
MyFestivo requires verification through a valid college email address to register as a Participant or Organizer. Users who fail email verification or who are not affiliated with a recognized educational institution will not be permitted to create accounts or register for events.

### 2.3 Account Eligibility
You represent and warrant that:
- You are a student at an accredited college or university in India.
- All information you provide during registration is accurate, complete, and truthful.
- You are not previously banned or suspended from the MyFestivo Platform.
- You will not create multiple accounts or use the Platform on behalf of others.

---

## 3. Organizer Responsibilities

### 3.1 Full Responsibility for Events
Event Organizers are solely responsible for:
- Event Planning & Execution: Planning, organizing, coordinating, and conducting all aspects of the event.
- Compliance with Laws: Ensuring the event complies with all applicable Indian laws, local regulations, and college policies.
- Safety & Security: Ensuring the safety, security, and well-being of all Participants.
- Liability & Insurance: Assuming full legal and financial liability for any accidents, injuries, damages, or claims arising from the event.
- Attendance Verification: Verifying that Participants meet the eligibility criteria for the event.
- Cancellations & Changes: Notifying Participants promptly of any cancellations, postponements, reschedulings, or significant changes to the event.
- Collection of Participant Data: Responsibly managing and protecting any personal information collected from Participants (names, emails, phone numbers, etc.).

### 3.2 Indemnification
Organizers agree to indemnify, defend, and hold harmless MyFestivo, its founders, employees, and agents from any and all claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
- The Organizer's event, decisions, or actions.
- Breach of these Terms by the Organizer.
- Violation of applicable laws or college policies.
- Any injury, damage, or loss to Participants or third parties.

### 3.3 Event Content & Descriptions
Organizers must provide accurate, truthful, and non-misleading event descriptions. Misleading event information may result in account suspension or permanent ban.

---

## 4. Participant Rights & Responsibilities

### 4.1 Participant Responsibilities
As a Participant, you agree to:
- Follow Event Guidelines: Comply with all rules, instructions, and guidelines set by the Organizer.
- Respectful Conduct: Treat all attendees, organizers, and volunteers with respect. Harassment, hate speech, discrimination, or abusive behavior is strictly prohibited.
- Accurate Information: Provide accurate and truthful information during registration.
- Legal Compliance: Engage in activities that comply with all applicable laws and college policies.
- No Reselling: You may not resell, transfer, or distribute your event registration to another person.

### 4.2 Participant Acknowledgment
By registering for an event, Participants acknowledge that:
- They have read and understood the event details provided by the Organizer.
- They assume all risks associated with attending the event (including health, safety, and personal property risks).
- They release the Organizer and MyFestivo from any claims of injury or loss during the event.

---

## 5. Prohibited Activities

Users are strictly prohibited from:

### 5.1 Event-Related Violations
- Creating or promoting commercial or non-educational events (events focused on profit generation rather than learning or community building).
- Organizing events that violate Indian laws, local regulations, or institutional policies.
- Reselling or transferring event registrations.
- Organizing events that promote violence, illegal activities, harassment, hate speech, discrimination, or harm to any person or group.

### 5.2 Platform Conduct Violations
- Engaging in harassment, hate speech, discrimination, bullying, or abusive behavior towards other users.
- Sharing sexually explicit, obscene, or illegal content.
- Creating fake, misleading, or fraudulent accounts.
- Attempting to hack, breach, disrupt, or damage the Platform or its systems.
- Spam, automated bots, or malicious activity.
- Attempting to circumvent security measures or access unauthorized portions of the Platform.

### 5.3 Consequences
Users who violate these prohibitions will be subject to:
- Immediate account suspension (temporary or permanent).
- Removal from all events they have registered for or organized.
- Referral to relevant authorities if the violation involves illegal activity.

---

## 6. Intellectual Property Rights

### 6.1 MyFestivo's IP
MyFestivo retains full ownership of:
- The Platform's design, code, features, and functionality.
- Logos, trademarks, and branding materials.
- All documentation, databases, and systems.

### 6.2 User-Generated Content
You retain ownership of event descriptions, images, and other content you create ("User Content"). However, you grant MyFestivo a perpetual, worldwide, royalty-free, non-exclusive license to:
- Use, reproduce, modify, and display your event information for Platform operations.
- Use event data and descriptions for marketing, analytics, and competitive research (including SEO content generation and blog posts comparing MyFestivo to competitors).
- Aggregate anonymized data for insights and analytics.

### 6.3 Organizer Obligations
Organizers warrant that any event content they upload does not infringe on third-party intellectual property rights and does not violate any laws.

---

## 7. Disclaimer of Warranties

MyFestivo is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, express or implied.

### 7.1 Specific Disclaimers
We make no representations or warranties regarding:
- Accuracy or Completeness: Event information, descriptions, or details provided by Organizers.
- Reliability or Uninterrupted Access: The Platform may be subject to downtime, errors, or interruptions without liability.
- Security: While we implement reasonable security measures, we cannot guarantee absolute protection against breaches or unauthorized access.
- Third-Party Services: Firebase, email providers, college authentication systems, or other integrations may fail without our liability.
- Fitness for Purpose: The Platform may not meet all your specific requirements.

---

## 8. Limitation of Liability

### 8.1 Liability Cap
MyFestivo's total liability to any user is limited to zero rupees (₹0). MyFestivo shall not be liable for any damages, losses, or claims, regardless of the cause.

### 8.2 Exclusions of Liability
MyFestivo is NOT liable for:
- Direct or Indirect Damages: Including lost profits, revenue, data, business opportunities, or reputational harm.
- Consequential, Incidental, or Special Damages: Even if MyFestivo has been advised of the possibility of such damages.
- Third-Party Actions: Failures, breaches, or misconduct of third-party services (email providers, authentication systems, college servers, etc.).
- Event-Related Losses: Any injury, damage, illness, or loss occurring during or related to events organized through the Platform.
- Data Loss or Unauthorized Access: We are not liable if your data is compromised, lost, or accessed without authorization, except in cases of our gross negligence or willful misconduct.

### 8.3 Sole Remedy
If you are dissatisfied with the Platform, your sole remedy is to stop using it.

---

## 9. Account Suspension & Termination

### 9.1 Grounds for Suspension
MyFestivo may suspend or terminate your account immediately, without notice, if you:
- Violate these Terms or any applicable laws.
- Engage in harassment, hate speech, discrimination, or abusive conduct.
- Create misleading or fraudulent event information.
- Attempt to breach Platform security or disrupt services.
- Are deemed to pose a risk to other users or the Platform.
- Fail to maintain valid college email verification.

### 9.2 Effect of Termination
Upon suspension or termination:
- You lose access to your account and all associated event data.
- You will be removed from all events (as Organizer or Participant).
- You forfeit any future access to the Platform.
- Organizers lose ability to check in participants or manage events.

### 9.3 Data Retention
MyFestivo may retain your data indefinitely for analytics, legal compliance, and fraud prevention purposes, even after account termination.

---

## 10. Dispute Resolution

### 10.1 No MyFestivo Involvement
MyFestivo takes no role in disputes between Organizers and Participants. This includes:
- Registration disagreements or check-in conflicts.
- Event cancellations or reschedulings.
- Complaints about event quality, content, or conduct.
- Personal disputes between users.

### 10.2 Direct Resolution
Disputes must be resolved directly between the Organizer and Participant. If resolution is not possible, users may:
- Report violations of these Terms to MyFestivo for investigation.
- Pursue legal action through the appropriate courts.

### 10.3 Arbitration & Jurisdiction
You agree to resolve any disputes through the courts of the jurisdiction in which the Organizer's college is located (in India). You waive any right to jury trial or class action.

---

## 11. Privacy & Data Collection

MyFestivo collects, uses, and stores user data as described in the separate Privacy Policy available on the Platform. Your use of the Platform constitutes acceptance of our Privacy Policy.

---

## 12. Amendment of Terms

MyFestivo reserves the right to modify these Terms at any time. Changes become effective immediately upon posting to the Platform. Continued use of the Platform after changes constitutes acceptance of the new Terms.

We will provide 30 days' notice via email or Platform notification of material changes.

---

## 13. Severability

If any provision of these Terms is found to be invalid, illegal, or unenforceable, that provision shall be severed, and the remaining Terms shall continue in full force and effect.

---

## 14. Governing Law & Jurisdiction

### 14.1 Governing Law
These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.

### 14.2 Jurisdiction
You irrevocably submit to the exclusive jurisdiction of:
- The courts of New Delhi, India for any legal disputes.
- You waive any objection to venue or inconvenient forum.

---

## 15. Contact Information

If you have questions about these Terms and Conditions, please contact us at:

MyFestivo Support
Email: myfestivo@gmail.com
Website: https://myfestivo.live/

---

## 16. Entire Agreement

These Terms, along with the Privacy Policy, constitute the entire agreement between you and MyFestivo regarding your use of the Platform and supersede all prior agreements, understandings, and negotiations.

---

By using MyFestivo, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.

Last updated: July 5, 2026`

const PRIVACY_CONTENT = `# Privacy Policy for MyFestivo

Effective Date: July 5, 2026
Last Updated: July 5, 2026

## 1. Introduction

MyFestivo ("Company," "we," "us," "our," or "Platform") is committed to protecting your privacy and ensuring you have a positive experience on our Platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at https://myfestivo.live/ and use our services.

Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Platform.

---

## 2. Information We Collect

### 2.1 Information You Provide Directly

#### Registration & Account Information
When you create an account on MyFestivo, we collect:
- Full Name
- College Email Address (required for verification)
- College/University Name
- Phone Number (optional)
- Password (securely hashed)
- Profile Information (bio, profile picture, etc.)

#### Event-Related Information
When you create or register for an event, we collect:
- Event Title, Description, and Details
- Event Date, Time, and Location
- Participant Registration Data (names, emails, phone numbers of registrants)
- Event Categories and Tags
- Organizer Information (for event creation)

#### Check-in & Verification Data
When you check in to an event, we collect:
- QR Code Scan Data
- Check-in Timestamp
- Device Information (for QR scanning)

#### Communication Data
If you contact us via email or through the Platform, we collect:
- Your Message Content
- Contact Information
- Communication History

#### Technical Data
We automatically collect:
- IP Address
- Browser Type and Version
- Operating System
- Device Type
- Cookies and Tracking Data
- Pages Visited and Time Spent
- Referral Source
- User Activity Logs

### 2.2 Information from Third Parties

- College Email Verification: We receive confirmation of your email domain from your college's email provider.
- Firebase & Google Services: Authentication data, crash reports, and analytics.

---

## 3. How We Use Your Information

MyFestivo uses collected information for the following purposes:

### 3.1 Platform Operations
- Creating and managing your account.
- Processing event registrations and check-ins.
- Facilitating communication between Organizers and Participants.
- Sending transactional emails (registration confirmations, event reminders, QR codes).
- Verifying your college affiliation and eligibility.

### 3.2 Service Improvement
- Analyzing user behavior and Platform usage patterns.
- Identifying technical issues and bugs.
- Enhancing features and user experience.
- Conducting internal research and analytics.

### 3.3 Marketing & Analytics
- Generating Content: Using aggregated, anonymized event data and descriptions to create comparative blog posts, articles, and marketing materials.
- Competitive Analysis: Analyzing event trends, popular topics, and competitor positioning to inform our SEO strategy and content planning.
- Promotional Communications: Sending you updates about new features, events, and news (you can opt out at any time).
- Analytics: Tracking aggregate usage statistics to understand Platform reach and effectiveness.

### 3.4 Legal & Safety
- Enforcing these Terms and Conditions.
- Detecting, investigating, and preventing fraudulent activity, abuse, or security violations.
- Complying with legal obligations and requests from law enforcement.
- Protecting the rights, privacy, and safety of MyFestivo, its users, and the public.

### 3.5 Aggregate & Anonymized Data
We may create anonymized, aggregated reports (e.g., "events by category," "average registration rates," "trending event types") that cannot identify individuals. These reports may be used for marketing, internal insights, and public analysis.

---

## 4. Data Sharing & Disclosure

### 4.1 What We Do NOT Share
MyFestivo does not sell, rent, or lease your personal information to third parties for their marketing purposes.

### 4.2 Information Shared Between Users

#### Organizer to Participant
Organizers have access to:
- Participant names and registered email addresses (for communication and check-in).
- Event registration status.

#### Participant to Organizer
Participants may see:
- Organizer name and contact information.
- Event details and descriptions.

### 4.3 Sharing with Service Providers
We share limited data with trusted third-party service providers who assist us:

- Firebase (Google Cloud): For authentication, database hosting, and crash reporting.
- Email Service Providers: For sending transactional and promotional emails.
- Analytics Tools: For understanding Platform usage (anonymized data only).
- Cloud Hosting Providers: For Platform infrastructure and security.

These service providers are bound by confidentiality agreements and are prohibited from using your data for purposes other than providing services to MyFestivo.

### 4.4 Legal Disclosure
We may disclose your information if required by law or if we believe in good faith that disclosure is necessary to:
- Comply with legal obligations, court orders, or government requests.
- Enforce our Terms and Conditions.
- Protect the safety, rights, or property of MyFestivo, its users, or the public.
- Prevent or investigate fraudulent activity or security violations.

### 4.5 Mergers & Acquisitions
If MyFestivo is acquired, merged, or undergoes a change of control, your information may be transferred as part of that transaction. We will provide notice of any such change.

---

## 5. Data Retention

### 5.1 Indefinite Retention for Analytics
MyFestivo retains user data indefinitely for the following purposes:
- Analytics and understanding user behavior trends.
- Fraud detection and prevention.
- Legal compliance and record-keeping.
- Historical analysis and insights.

### 5.2 Organizer-Managed Data
If you are an Organizer, participant data collected through your event registration (names, emails, phone numbers) is retained indefinitely for historical records and analytics, even after the event concludes.

### 5.3 Account Deletion
If you request account deletion, we will:
- Remove your account login credentials and personal identifiable information.
- Retain anonymized and aggregated data for analytics purposes.
- Retain event registration records (without personally identifying you) for historical accuracy.

### 5.4 No Automatic Deletion
MyFestivo does not automatically delete data after a specific period unless legally required to do so.

---

## 6. Data Security

### 6.1 Security Measures
We implement industry-standard security measures to protect your information:
- Encryption: Sensitive data (passwords, authentication tokens) are encrypted using modern encryption standards.
- Secure Servers: Data is stored on secure, password-protected servers managed by Firebase/Google Cloud.
- Access Controls: Only authorized personnel have access to personal information.
- SSL/TLS: Our website uses HTTPS to encrypt data in transit.

### 6.2 Limitations of Security
No system is 100% secure. While we take reasonable precautions, MyFestivo cannot guarantee absolute protection against hacking, data breaches, or unauthorized access. You use the Platform at your own risk.

### 6.3 Password Security
You are responsible for:
- Maintaining the confidentiality of your password.
- Notifying us immediately of any unauthorized access.
- Logging out of your account on shared or public devices.

---

## 7. User Rights & Data Access

### 7.1 Right to Access Your Data
You have the right to request access to the personal information we hold about you. To request your data, email us at myfestivo@gmail.com.

### 7.2 Right to Correction
If your information is inaccurate or incomplete, you can update it through your account settings or by contacting us.

### 7.3 Right to Deletion
You can request deletion of your account and associated personal information. However, please note:
- We will retain anonymized and aggregated data for analytics.
- We will retain event participation records (without identifying information) for historical accuracy.
- Some data may be retained for legal or operational reasons.

### 7.4 Right to Opt Out
You can opt out of:
- Promotional emails: Click "Unsubscribe" in any email or update preferences in your account.
- Analytics tracking: Some analytics data may be unavoidable for Platform operations, but you can limit third-party cookies through your browser settings.

### 7.5 Data Portability
Upon request, we can provide your information in a structured, commonly-used format to facilitate transfer to another service.

---

## 8. Cookies & Tracking Technologies

### 8.1 What Are Cookies?
Cookies are small text files stored on your device that help us recognize you and enhance your experience.

### 8.2 Types of Cookies We Use

Essential/Functional: Authentication, session management, security
Analytics: Understanding user behavior, Platform improvement
Preference: Remembering your settings and preferences
Marketing: Tracking ad effectiveness and content personalization

### 8.3 Cookie Management
You can:
- Disable cookies through your browser settings.
- Clear cookies regularly.
- Use incognito/private browsing to avoid persistent cookies.

Note: Disabling cookies may limit Platform functionality.

### 8.4 Third-Party Analytics
We use analytics tools (Google Analytics, Firebase Analytics) that may place cookies on your device. These tools have their own privacy policies.

---

## 9. Third-Party Links & Services

MyFestivo may contain links to external websites or services (college websites, event ticketing systems, etc.). We are not responsible for:
- The privacy practices of third-party websites.
- The content or security of external services.
- Data collected by third parties.

Please review the privacy policies of any third-party services before sharing information with them.

---

## 10. Children's Privacy

MyFestivo is not intended for children under 13 years of age. We do not knowingly collect information from children. If we become aware that a child under 13 has provided information, we will delete such data immediately.

For users between 13-18 years, parental consent may be required under applicable law. We recommend discussing online safety and privacy with your parents or guardians.

---

## 11. International Data Transfers

MyFestivo is based in India. If you access the Platform from outside India, you acknowledge that:
- Your data may be transferred to, stored in, and processed in India.
- Indian data protection laws apply.
- You consent to such transfers.

---

## 12. Your Rights Under Indian Law

### 12.1 Data Protection Act Compliance
MyFestivo is committed to complying with the Information Technology Act, 2000 and other applicable Indian data protection regulations.

### 12.2 Rights of Data Subjects
You have the right to:
- Know what information we collect and how it's used.
- Access, correct, or delete your information (subject to legal retention requirements).
- Withdraw consent for data processing.
- Lodge complaints with relevant regulatory authorities.

---

## 13. Policy Changes

MyFestivo reserves the right to modify this Privacy Policy at any time. Changes become effective immediately upon posting. We will provide 30 days' notice via email or Platform notification for material changes.

Your continued use of the Platform constitutes acceptance of the updated Privacy Policy.

---

## 14. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:

MyFestivo Privacy Team
Email: myfestivo@gmail.com
Website: https://myfestivo.live/

---

## 15. Complaint Resolution

If you believe MyFestivo has violated your privacy rights, you can:

1. Contact us directly at the email above.
2. File a complaint with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (Ministry of Electronics and Information Technology).
3. Escalate to authorities such as the Data Protection Board (once established under future legislation).

---

By using MyFestivo, you acknowledge that you have read, understood, and agree to this Privacy Policy.

Last updated: July 5, 2026`

// ─── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h2 class="text-base font-bold text-white mb-3 mt-2">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-semibold text-[#B388FF] mt-5 mb-2">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-xs font-semibold text-white/80 mt-4 mb-1.5">$1</h4>')
    .replace(/^#### (.+)$/gm, '<h5 class="text-xs font-medium text-white/70 mt-3 mb-1">$1</h5>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90 font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-white/60 text-[13px] leading-relaxed list-disc my-0.5">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-white/60 text-[13px] leading-relaxed list-decimal my-0.5">$1</li>')
    .replace(/^---$/gm, '<hr class="border-white/[0.06] my-4" />')
    .replace(/\n{2,}/g, '</p><p class="text-white/55 text-[13px] leading-relaxed mt-2">')
    .replace(/^(?!<)(.+)/gm, '<span>$1</span>')
}

// ─── DocumentModal — full-screen viewer for a single legal document ────────────

interface DocumentModalProps {
  title: string
  icon: React.ReactNode
  content: string
  onClose: () => void
}

function DocumentModal({ title, icon, content, onClose }: DocumentModalProps) {
  return (
    <motion.div
      key="doc-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center px-4 py-8 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        key="doc-modal"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-3xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="p-0 overflow-hidden border border-[rgba(179,136,255,0.2)] flex flex-col max-h-[90dvh]">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-gradient-to-r from-[rgba(179,136,255,0.08)] to-transparent shrink-0">
            <span className="text-[#B388FF]">{icon}</span>
            <span className="text-sm font-semibold text-white flex-1">{title}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth">
            <div
              className="prose prose-invert max-w-none text-white/60 text-[13px] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: `<p class="text-white/55 text-[13px] leading-relaxed">${renderMarkdown(content.trim())}</p>`
              }}
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] bg-black/20 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-[#B388FF] text-black hover:bg-[#c9a9ff] font-semibold h-9 px-6"
            >
              Close
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

// ─── InlineLegalCheckboxes ──────────────────────────────────────────────────────
// Used on the manual sign-up page and the ProfileCompleteModal.
// Clicking the highlighted document name opens a DocumentModal to view the full text.

interface InlineLegalCheckboxesProps {
  termsChecked: boolean
  privacyChecked: boolean
  onTermsChange: (v: boolean) => void
  onPrivacyChange: (v: boolean) => void
}

export function InlineLegalCheckboxes({
  termsChecked,
  privacyChecked,
  onTermsChange,
  onPrivacyChange,
}: InlineLegalCheckboxesProps) {
  const [openDoc, setOpenDoc] = useState<"terms" | "privacy" | null>(null)

  const Checkbox = ({
    id, checked, onChange, children,
  }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) => (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          checked
            ? 'bg-[#B388FF] border-[#B388FF]'
            : 'border-white/20 bg-white/[0.03] group-hover:border-white/40'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
      </button>
      <span className="text-[12px] text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
        {children}
      </span>
    </label>
  )

  return (
    <>
      <div className="space-y-3 pt-1">
        <Checkbox id="signup-terms-check" checked={termsChecked} onChange={onTermsChange}>
          I have read and agree to the{' '}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDoc("terms") }}
            className="text-[#B388FF] hover:text-[#c9a9ff] underline underline-offset-2 transition-colors font-medium cursor-pointer"
          >
            Terms &amp; Conditions
          </button>
        </Checkbox>
        <Checkbox id="signup-privacy-check" checked={privacyChecked} onChange={onPrivacyChange}>
          I have read and agree to the{' '}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDoc("privacy") }}
            className="text-[#B388FF] hover:text-[#c9a9ff] underline underline-offset-2 transition-colors font-medium cursor-pointer"
          >
            Privacy Policy
          </button>
        </Checkbox>
      </div>

      <AnimatePresence>
        {openDoc === "terms" && (
          <DocumentModal
            title="Terms & Conditions"
            icon={<FileText className="w-4 h-4" />}
            content={TERMS_CONTENT}
            onClose={() => setOpenDoc(null)}
          />
        )}
        {openDoc === "privacy" && (
          <DocumentModal
            title="Privacy Policy"
            icon={<Shield className="w-4 h-4" />}
            content={PRIVACY_CONTENT}
            onClose={() => setOpenDoc(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
