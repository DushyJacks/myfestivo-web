import nodemailer from 'nodemailer'

/**
 * Email Automation Service — MyFestivo
 *
 * Sender: myfestivo@gmail.com
 *
 * Required environment variables:
 *   GMAIL_EMAIL         = myfestivo@gmail.com
 *   GMAIL_APP_PASSWORD  = <16-char Gmail App Password from Google Account settings>
 *
 * How to generate an App Password:
 *   1. Go to https://myaccount.google.com/security
 *   2. Enable 2-Step Verification
 *   3. Search "App passwords" → create one for "Mail"
 *   4. Paste the 16-character code as GMAIL_APP_PASSWORD
 */

const FROM_NAME = 'MyFestivo'
const FROM_EMAIL = process.env.GMAIL_EMAIL || 'myfestivo@gmail.com'
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`

// ─── Transporter (singleton) ──────────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error(
      '[MyFestivo Email] Gmail credentials not configured.\n' +
      'Set GMAIL_EMAIL=myfestivo@gmail.com and GMAIL_APP_PASSWORD in .env.local (and Netlify env vars).'
    )
    throw new Error('Email service not configured')
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  return transporter
}

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────

function wrapHtml(bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MyFestivo</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',Arial,sans-serif;color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:12px;border:1px solid rgba(179,136,255,0.12);overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a0a2e 0%,#0d0014 100%);padding:28px 36px;border-bottom:1px solid rgba(179,136,255,0.15);">
                <span style="font-size:20px;font-weight:700;color:#B388FF;letter-spacing:0.05em;">MyFestivo</span>
                <span style="font-size:11px;color:rgba(255,255,255,0.3);margin-left:10px;font-family:monospace;letter-spacing:0.1em;">COLLEGE EVENT PLATFORM</span>
              </td>
            </tr>
            <!-- Body -->
            <tr><td style="padding:32px 36px;">${bodyContent}</td></tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.05);background:#0d0d0d;">
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);font-family:monospace;">
                  © ${new Date().getFullYear()} MyFestivo · <a href="https://myfestivo.live" style="color:rgba(179,136,255,0.6);text-decoration:none;">myfestivo.live</a>
                  <br/>You're receiving this because you have an account on MyFestivo.
                  <br/>If you didn't sign up, please ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}

function h2(text: string) {
  return `<h2 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;">${text}</h2>`
}

function p(text: string, style = '') {
  return `<p style="margin:12px 0;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;${style}">${text}</p>`
}

function badge(text: string, color = '#B388FF') {
  return `<span style="display:inline-block;background:rgba(179,136,255,0.12);border:1px solid rgba(179,136,255,0.3);color:${color};font-size:11px;font-family:monospace;letter-spacing:0.08em;padding:3px 10px;border-radius:20px;">${text.toUpperCase()}</span>`
}

function ctaButton(label: string, url: string) {
  return `
    <div style="margin:24px 0;">
      <a href="${url}" style="display:inline-block;background:#B388FF;color:#000000;font-weight:700;font-size:13px;letter-spacing:0.06em;padding:12px 28px;border-radius:8px;text-decoration:none;">${label}</a>
    </div>
  `
}

function divider() {
  return `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;" />`
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;font-size:11px;font-family:monospace;color:rgba(255,255,255,0.3);letter-spacing:0.08em;text-transform:uppercase;width:120px;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:rgba(255,255,255,0.75);">${value}</td>
    </tr>
  `
}

// ─── 1. Registration Confirmation ─────────────────────────────────────────────

export async function sendRegistrationConfirmation(
  toEmail: string,
  userName: string,
  eventTitle: string,
  subEventName: string,
  eventDate: string,
  eventVenue: string,
  eventId: string
): Promise<boolean> {
  try {
    const html = wrapHtml(`
      ${badge('Registration Confirmed')}
      <div style="margin-top:16px;">
        ${h2("You're registered! 🎉")}
        ${p(`Hi <strong style="color:#fff;">${userName}</strong>, your spot is secured for <strong style="color:#B388FF;">${eventTitle}</strong>.`)}
      </div>
      ${divider()}
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow('Event', eventTitle)}
        ${infoRow('Sub-Event', subEventName)}
        ${infoRow('Date', eventDate)}
        ${infoRow('Venue', eventVenue)}
      </table>
      ${ctaButton('View Event', `https://myfestivo.live/events/${eventId}`)}
      ${p('Keep your registration pass handy — you\'ll need it for check-in.', 'font-size:13px;color:rgba(255,255,255,0.35);')}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: `✅ You're registered for ${eventTitle} — MyFestivo`,
      html,
    })
    console.log(`[Email] Registration confirmation sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendRegistrationConfirmation failed:', error)
    return false
  }
}

// ─── 2. Payment Confirmation ──────────────────────────────────────────────────

export async function sendPaymentConfirmation(
  toEmail: string,
  userName: string,
  eventTitle: string,
  amount: number,
  transactionId: string,
  eventId: string
): Promise<boolean> {
  try {
    const html = wrapHtml(`
      ${badge('Payment Confirmed', '#4ade80')}
      <div style="margin-top:16px;">
        ${h2('Payment received 💳')}
        ${p(`Hi <strong style="color:#fff;">${userName}</strong>, your payment of <strong style="color:#4ade80;">₹${amount}</strong> for <strong style="color:#B388FF;">${eventTitle}</strong> has been confirmed.`)}
      </div>
      ${divider()}
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow('Event', eventTitle)}
        ${infoRow('Amount Paid', `₹${amount}`)}
        ${infoRow('Transaction ID', transactionId)}
        ${infoRow('Status', 'PAID')}
      </table>
      ${ctaButton('View Registration', `https://myfestivo.live/events/${eventId}`)}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: `💳 Payment confirmed for ${eventTitle} — MyFestivo`,
      html,
    })
    console.log(`[Email] Payment confirmation sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendPaymentConfirmation failed:', error)
    return false
  }
}

// ─── 3. Event Reminder ────────────────────────────────────────────────────────

export async function sendEventReminder(
  toEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventVenue: string,
  hoursUntilEvent: number,
  eventId: string
): Promise<boolean> {
  try {
    const timeLabel = hoursUntilEvent <= 1
      ? '1 hour'
      : hoursUntilEvent <= 24
      ? `${hoursUntilEvent} hours`
      : '24 hours'

    const html = wrapHtml(`
      ${badge(`Reminder: ${timeLabel} to go`, '#facc15')}
      <div style="margin-top:16px;">
        ${h2(`${eventTitle} starts soon ⏰`)}
        ${p(`Hi <strong style="color:#fff;">${userName}</strong>, your event <strong style="color:#B388FF;">${eventTitle}</strong> is starting in <strong style="color:#facc15;">${timeLabel}</strong>.`)}
      </div>
      ${divider()}
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow('Event', eventTitle)}
        ${infoRow('Date & Time', eventDate)}
        ${infoRow('Venue', eventVenue)}
      </table>
      ${ctaButton('View Event & Pass', `https://myfestivo.live/events/${eventId}`)}
      ${p('Don\'t forget to bring your QR check-in pass!', 'font-size:13px;color:rgba(255,255,255,0.35);')}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: `⏰ Reminder: ${eventTitle} starts in ${timeLabel} — MyFestivo`,
      html,
    })
    console.log(`[Email] Event reminder sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendEventReminder failed:', error)
    return false
  }
}

// ─── 4. Announcement Notification ────────────────────────────────────────────

export async function sendAnnouncementNotification(
  toEmail: string,
  userName: string,
  eventTitle: string,
  announcementTitle: string,
  announcementMessage: string,
  eventId: string
): Promise<boolean> {
  try {
    const html = wrapHtml(`
      ${badge('New Announcement')}
      <div style="margin-top:16px;">
        ${h2(announcementTitle)}
        ${p(`Hi <strong style="color:#fff;">${userName}</strong>, there's a new announcement for <strong style="color:#B388FF;">${eventTitle}</strong>.`)}
      </div>
      ${divider()}
      <div style="background:rgba(179,136,255,0.06);border:1px solid rgba(179,136,255,0.15);border-radius:8px;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;">${announcementMessage}</p>
      </div>
      ${ctaButton('View Announcement', `https://myfestivo.live/events/${eventId}`)}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: `📢 ${announcementTitle} — ${eventTitle} | MyFestivo`,
      html,
    })
    console.log(`[Email] Announcement notification sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendAnnouncementNotification failed:', error)
    return false
  }
}

// ─── 5. Task Assignment ───────────────────────────────────────────────────────

export async function sendTaskAssignment(
  toEmail: string,
  assigneeName: string,
  taskTitle: string,
  taskDescription: string,
  eventTitle: string,
  deadline: string,
  assignedBy: string,
  eventId: string
): Promise<boolean> {
  try {
    const html = wrapHtml(`
      ${badge('Task Assigned')}
      <div style="margin-top:16px;">
        ${h2(`New task: ${taskTitle}`)}
        ${p(`Hi <strong style="color:#fff;">${assigneeName}</strong>, <strong style="color:rgba(255,255,255,0.5);">${assignedBy}</strong> has assigned you a task for <strong style="color:#B388FF;">${eventTitle}</strong>.`)}
      </div>
      ${divider()}
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${infoRow('Task', taskTitle)}
        ${infoRow('Description', taskDescription)}
        ${infoRow('Deadline', deadline || 'No deadline')}
        ${infoRow('Assigned By', assignedBy)}
      </table>
      ${ctaButton('View Task Board', `https://myfestivo.live/events/${eventId}`)}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: `📋 Task assigned: ${taskTitle} — ${eventTitle} | MyFestivo`,
      html,
    })
    console.log(`[Email] Task assignment sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendTaskAssignment failed:', error)
    return false
  }
}

// ─── 6. Custom Info / Message Email ──────────────────────────────────────────

export async function sendCustomMessage(
  toEmail: string,
  subject: string,
  messageBody: string,
  ctaLabel?: string,
  ctaUrl?: string
): Promise<boolean> {
  try {
    const html = wrapHtml(`
      ${h2(subject)}
      <div style="margin-top:16px;">
        ${p(messageBody.replace(/\n/g, '<br/>'))}
      </div>
      ${ctaLabel && ctaUrl ? ctaButton(ctaLabel, ctaUrl) : ''}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: `${subject} — MyFestivo`,
      html,
    })
    console.log(`[Email] Custom message sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendCustomMessage failed:', error)
    return false
  }
}

// ─── 7. College Email Verification OTP ───────────────────────────────────────

export async function sendCollegeOTP(
  toEmail: string,
  otp: string,
  collegeDomain: string
): Promise<boolean> {
  try {
    const html = wrapHtml(`
      ${badge('Email Verification')}
      <div style="margin-top:16px;">
        ${h2('Verify your college email')}
        ${p(`You're verifying <strong style="color:#fff;">${toEmail}</strong> with domain <strong style="color:#B388FF;">@${collegeDomain}</strong>.`)}
      </div>
      ${divider()}
      <div style="background:rgba(179,136,255,0.08);border:2px solid rgba(179,136,255,0.3);border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:11px;font-family:monospace;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;">Your verification code</p>
        <div style="font-size:38px;font-weight:700;color:#B388FF;letter-spacing:8px;font-family:monospace;">${otp}</div>
      </div>
      ${p('This code expires in <strong>10 minutes</strong>. Do not share it with anyone.', 'font-size:13px;color:rgba(255,255,255,0.35);')}
    `)

    await getTransporter().sendMail({
      from: FROM,
      to: toEmail,
      subject: 'MyFestivo — College Email Verification OTP',
      html,
    })
    console.log(`[Email] OTP sent → ${toEmail}`)
    return true
  } catch (error) {
    console.error('[Email] sendCollegeOTP failed:', error)
    return false
  }
}

// ─── Test connection ──────────────────────────────────────────────────────────

export async function testEmailConnection(): Promise<boolean> {
  try {
    await getTransporter().verify()
    console.log('[Email] ✓ Gmail SMTP connected successfully (myfestivo@gmail.com)')
    return true
  } catch (error) {
    console.error('[Email] ✗ Connection failed:', error)
    return false
  }
}
