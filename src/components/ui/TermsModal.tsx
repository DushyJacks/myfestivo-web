"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, FileText, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const TERMS_CONTENT = `
**Effective Date:** July 5, 2026 | **Last Updated:** July 5, 2026

## 1. Acceptance of Terms

Welcome to **MyFestivo** — an online event operating system designed for college communities to create, manage, and participate in campus events.

By accessing or using MyFestivo (https://myfestivo.live/), you agree to be bound by these Terms. If you do not agree, you may not use the Platform.

## 2. User Eligibility

- You must be a college student or affiliated with a recognised educational institution in India.
- You must be approximately **17 years or older**.
- All information you provide must be accurate, complete, and truthful.
- You may not create multiple accounts or use the Platform on behalf of others.

## 3. Organizer Responsibilities

Organizers are solely responsible for event planning, compliance with laws, participant safety, and liability. Organizers indemnify MyFestivo from all claims arising from their events.

## 4. Participant Rights & Responsibilities

Participants agree to follow event guidelines, treat others respectfully, provide accurate registration information, and not resell registrations.

## 5. Prohibited Activities

Users must not: create fraudulent events; engage in harassment, hate speech, or abuse; share illegal content; attempt to breach platform security; or use automated bots. Violations result in immediate account suspension.

## 6. Intellectual Property

MyFestivo owns all platform design, code, and branding. You retain ownership of your event content but grant MyFestivo a licence to use it for platform operations.

## 7. Disclaimer of Warranties

MyFestivo is provided "AS IS" without warranties of any kind. We do not guarantee uninterrupted access, accuracy of event information, or security against breaches.

## 8. Limitation of Liability

**MyFestivo's total liability to any user is limited to ₹0.** We are not liable for any direct, indirect, consequential, or incidental damages.

## 9. Account Suspension & Termination

MyFestivo may suspend or terminate accounts for Terms violations, harassment, fraudulent activity, or any risk to other users, without prior notice.

## 10. Dispute Resolution

Disputes between Organizers and Participants must be resolved directly. Disputes with MyFestivo are governed by the courts of New Delhi, India.

## 11. Governing Law

These Terms are governed by the laws of India.

## 12. Contact

MyFestivo Support — myfestivo@gmail.com | https://myfestivo.live/

**By using MyFestivo, you acknowledge that you have read, understood, and agree to be bound by these Terms.**
`

const PRIVACY_CONTENT = `
**Effective Date:** July 5, 2026 | **Last Updated:** July 5, 2026

## 1. Introduction

MyFestivo is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use https://myfestivo.live/.

## 2. Information We Collect

**Account Information:** Name, email address, college name, phone number, and profile information you provide during registration.

**Event Information:** Event details, registration data, and payment information when you create or register for events.

**Usage Data:** IP address, browser type, pages visited, and interaction data collected automatically.

**Google Sign-In:** When you sign in with Google, we receive your name, email, and profile photo from Google.

## 3. How We Use Your Information

- To provide, maintain, and improve the Platform.
- To send transactional emails (registration confirmations, reminders, announcements).
- To verify your college email address.
- For analytics and improving user experience.
- For fraud prevention and security.

## 4. Information Sharing

We do **not** sell your personal information. We share data only with:
- **Firebase / Google:** For authentication and database services.
- **Event Organizers:** Who can see the registration details of their participants.
- **Law Enforcement:** When legally required.

## 5. Data Retention

We retain your data as long as your account is active or as needed for legal compliance. You may request deletion by contacting us.

## 6. Security

We implement reasonable security measures including Firebase security rules, HTTPS, and input sanitisation. However, no system is 100% secure.

## 7. Your Rights

You have the right to:
- Access and download your personal data.
- Correct inaccurate information via your profile.
- Request account deletion by contacting us.
- Opt out of marketing emails.

## 8. Cookies

We use session cookies for authentication. We do not use tracking cookies for advertising.

## 9. Children's Privacy

MyFestivo is not intended for users under 17. We do not knowingly collect data from children.

## 10. Changes to This Policy

We will notify you of material changes via email or platform notification with 30 days' notice.

## 11. Contact

MyFestivo Support — myfestivo@gmail.com | https://myfestivo.live/

**By using MyFestivo, you consent to the collection and use of information as described in this Privacy Policy.**
`

function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-semibold text-white mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-white/55 text-[13px] leading-relaxed list-disc">$1</li>')
    .replace(/\n{2,}/g, '</p><p class="text-white/55 text-[13px] leading-relaxed mt-2">')
    .replace(/^(?!<)(.+)/gm, '<span>$1</span>')
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  content: string
  checked: boolean
  onCheck: (v: boolean) => void
  checkLabel: string
  checkId: string
}

function LegalSection({ title, icon, content, checked, onCheck, checkLabel, checkId }: SectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true)
  }

  return (
    <div className="rounded-lg border border-white/[0.07] overflow-hidden bg-white/[0.015]">
      {/* Section header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-gradient-to-r from-[rgba(179,136,255,0.06)] to-transparent">
        <span className="text-[#B388FF]">{icon}</span>
        <span className="text-sm font-medium text-white">{title}</span>
        {checked && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            <Check className="w-2.5 h-2.5" /> Agreed
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto px-5 py-4 text-white/55 text-[13px] leading-relaxed space-y-1 scroll-smooth relative"
        style={{ maxHeight: '220px' }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<p class="text-white/55 text-[13px] leading-relaxed">${renderMarkdown(content.trim())}</p>`
          }}
        />
        {!scrolled && (
          <div className="sticky bottom-0 flex justify-center py-2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-white/20 animate-bounce" />
          </div>
        )}
      </div>

      {/* Checkbox */}
      <div className="px-5 py-3 border-t border-white/[0.06] bg-black/20">
        <label htmlFor={checkId} className="flex items-start gap-3 cursor-pointer group">
          <button
            id={checkId}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => onCheck(!checked)}
            className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
              checked
                ? 'bg-[#B388FF] border-[#B388FF]'
                : 'border-white/20 bg-white/[0.03] group-hover:border-white/40'
            }`}
          >
            {checked && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
          </button>
          <span className="text-[12px] text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
            {checkLabel}
          </span>
        </label>
      </div>
    </div>
  )
}

interface TermsModalProps {
  onAccept: () => void
}

export function TermsModal({ onAccept }: TermsModalProps) {
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const bothChecked = termsChecked && privacyChecked

  return (
    <motion.div
      key="terms-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-8 bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        key="terms-modal"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-0 overflow-hidden border border-[rgba(179,136,255,0.2)]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-[rgba(179,136,255,0.08)] to-transparent">
            <h2 className="text-lg font-semibold text-white mb-1">Before you continue</h2>
            <p className="text-sm text-white/40">
              Please read and accept both our Terms &amp; Conditions and Privacy Policy to use MyFestivo.
            </p>
          </div>

          {/* Both documents stacked */}
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <LegalSection
              title="Terms & Conditions"
              icon={<FileText className="w-3.5 h-3.5" />}
              content={TERMS_CONTENT}
              checked={termsChecked}
              onCheck={setTermsChecked}
              checkLabel="I have read and agree to the MyFestivo Terms & Conditions, including all organizer responsibilities, participant obligations, and limitations of liability."
              checkId="tc-checkbox"
            />
            <LegalSection
              title="Privacy Policy"
              icon={<Shield className="w-3.5 h-3.5" />}
              content={PRIVACY_CONTENT}
              checked={privacyChecked}
              onCheck={setPrivacyChecked}
              checkLabel="I have read and agree to the MyFestivo Privacy Policy, including how my data is collected, stored, and used."
              checkId="pp-checkbox"
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-white/[0.06] bg-black/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 text-[11px] font-mono ${termsChecked ? 'text-green-400' : 'text-white/25'}`}>
                <div className={`w-2 h-2 rounded-full ${termsChecked ? 'bg-green-400' : 'bg-white/15'}`} />
                T&amp;C
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-mono ${privacyChecked ? 'text-green-400' : 'text-white/25'}`}>
                <div className={`w-2 h-2 rounded-full ${privacyChecked ? 'bg-green-400' : 'bg-white/15'}`} />
                Privacy
              </div>
            </div>
            <Button
              onClick={onAccept}
              disabled={!bothChecked}
              className="bg-[#B388FF] text-black hover:bg-[#c9a9ff] font-semibold h-10 px-6 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {bothChecked ? 'Continue →' : 'Accept Both to Continue'}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

/**
 * GlobalTermsModal — mounts once at the app level (in providers.tsx).
 * Shows only when a logged-in user has not yet accepted the T&C + Privacy Policy.
 * On acceptance, writes termsAccepted: true to Firestore so it never shows again on any device.
 */
export function GlobalTermsModal() {
  const { user, acceptTerms } = useAuth()
  const [accepting, setAccepting] = useState(false)

  const shouldShow = !!(user && !user.termsAccepted)

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await acceptTerms()
    } catch {
      // non-critical — user stays logged in
    }
    setAccepting(false)
  }

  return (
    <AnimatePresence>
      {shouldShow && !accepting && <TermsModal onAccept={handleAccept} />}
    </AnimatePresence>
  )
}

/**
 * Inline legal checkboxes for the signup form.
 * Two separate checkboxes for T&C and Privacy Policy.
 */
export function InlineLegalCheckboxes({
  termsChecked,
  privacyChecked,
  onTermsChange,
  onPrivacyChange,
}: {
  termsChecked: boolean
  privacyChecked: boolean
  onTermsChange: (v: boolean) => void
  onPrivacyChange: (v: boolean) => void
}) {
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
    <div className="space-y-3 pt-1">
      <Checkbox id="signup-terms-check" checked={termsChecked} onChange={onTermsChange}>
        I have read and agree to the{' '}
        <span className="text-[#B388FF]">Terms &amp; Conditions</span>
      </Checkbox>
      <Checkbox id="signup-privacy-check" checked={privacyChecked} onChange={onPrivacyChange}>
        I have read and agree to the{' '}
        <span className="text-[#B388FF]">Privacy Policy</span>
      </Checkbox>
    </div>
  )
}
