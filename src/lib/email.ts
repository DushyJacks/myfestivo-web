import { Resend } from 'resend';

/**
 * Email Automation Service — MyFestivo
 * Powered by Resend
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@myfestivo.live';
const FROM = `MyFestivo <${FROM_EMAIL}>`;

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────

function wrapHtml(bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Arial,sans-serif;color:#333333;">
      <div style="max-width:600px;margin:20px auto;background-color:#ffffff;padding:30px;border:1px solid #eaeaea;border-radius:8px;">
        <div style="border-bottom:2px solid #B388FF;padding-bottom:15px;margin-bottom:20px;">
          <h1 style="color:#222;margin:0;font-size:22px;letter-spacing:0.5px;">MyFestivo</h1>
        </div>
        <div style="line-height:1.6;font-size:15px;">
          ${bodyContent}
        </div>
        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eaeaea;font-size:12px;color:#888888;">
          <p>© ${new Date().getFullYear()} MyFestivo · <a href="https://myfestivo.live" style="color:#B388FF;">myfestivo.live</a></p>
          <p>You're receiving this email regarding your activity on MyFestivo.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function h2(text: string) {
  return `<h2 style="margin:0 0 10px;font-size:20px;font-weight:600;color:#111;">${text}</h2>`;
}

function p(text: string) {
  return `<p style="margin:0 0 15px;">${text}</p>`;
}

function ctaButton(label: string, url: string) {
  return `
    <div style="margin:25px 0;">
      <a href="${url}" style="background-color:#B388FF;color:#fff;font-weight:bold;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">${label}</a>
    </div>
  `;
}

function listBlock(items: { label: string; value: string }[]) {
  const rows = items.map(item => `<li><strong>${item.label}:</strong> ${item.value}</li>`).join('');
  return `<ul style="background-color:#f4f4f5;padding:15px 15px 15px 35px;border-radius:6px;">${rows}</ul>`;
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
    const subject = `✅ You're registered for ${eventTitle} — MyFestivo`;
    
    const html = wrapHtml(`
      ${h2("You're registered! 🎉")}
      ${p(`Hi <strong>${userName}</strong>, your spot is secured for <strong>${eventTitle}</strong>.`)}
      
      ${listBlock([
        { label: 'Event', value: eventTitle },
        { label: 'Sub-Event', value: subEventName },
        { label: 'Date', value: eventDate },
        { label: 'Venue', value: eventVenue },
      ])}
      
      ${ctaButton('View Event', `https://myfestivo.live/events/${eventId}`)}
      ${p('Keep your registration pass handy — you\'ll need it for check-in.')}
    `);

    const text = `Hi ${userName},\n\nYou're registered for ${eventTitle}!\n\nEvent Details:\n- Sub-Event: ${subEventName}\n- Date: ${eventDate}\n- Venue: ${eventVenue}\n\nView Event: https://myfestivo.live/events/${eventId}\n\nKeep your registration pass handy — you'll need it for check-in.\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Registration confirmation sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendRegistrationConfirmation failed:', error);
    return false;
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
    const subject = `💳 Payment confirmed for ${eventTitle} — MyFestivo`;
    
    const html = wrapHtml(`
      ${h2('Payment received 💳')}
      ${p(`Hi <strong>${userName}</strong>, your payment of <strong>₹${amount}</strong> for <strong>${eventTitle}</strong> has been confirmed.`)}
      
      ${listBlock([
        { label: 'Event', value: eventTitle },
        { label: 'Amount Paid', value: `₹${amount}` },
        { label: 'Transaction ID', value: transactionId },
        { label: 'Status', value: 'PAID' },
      ])}
      
      ${ctaButton('View Registration', `https://myfestivo.live/events/${eventId}`)}
    `);

    const text = `Hi ${userName},\n\nYour payment of ₹${amount} for ${eventTitle} has been confirmed.\n\nPayment Details:\n- Transaction ID: ${transactionId}\n- Status: PAID\n\nView Registration: https://myfestivo.live/events/${eventId}\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Payment confirmation sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendPaymentConfirmation failed:', error);
    return false;
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
    const timeLabel = hoursUntilEvent <= 1 ? '1 hour' : hoursUntilEvent <= 24 ? `${hoursUntilEvent} hours` : '24 hours';
    const subject = `⏰ Reminder: ${eventTitle} starts in ${timeLabel} — MyFestivo`;
    
    const html = wrapHtml(`
      ${h2(`${eventTitle} starts soon ⏰`)}
      ${p(`Hi <strong>${userName}</strong>, your event <strong>${eventTitle}</strong> is starting in <strong>${timeLabel}</strong>.`)}
      
      ${listBlock([
        { label: 'Event', value: eventTitle },
        { label: 'Date & Time', value: eventDate },
        { label: 'Venue', value: eventVenue },
      ])}
      
      ${ctaButton('View Event & Pass', `https://myfestivo.live/events/${eventId}`)}
      ${p('Don\'t forget to bring your QR check-in pass!')}
    `);

    const text = `Hi ${userName},\n\nYour event ${eventTitle} is starting in ${timeLabel}.\n\nDetails:\n- Date & Time: ${eventDate}\n- Venue: ${eventVenue}\n\nView Event: https://myfestivo.live/events/${eventId}\n\nDon't forget to bring your QR check-in pass!\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Event reminder sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendEventReminder failed:', error);
    return false;
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
    const subject = `📢 ${announcementTitle} — ${eventTitle} | MyFestivo`;
    
    const html = wrapHtml(`
      ${h2(announcementTitle)}
      ${p(`Hi <strong>${userName}</strong>, there's a new announcement for <strong>${eventTitle}</strong>.`)}
      
      <div style="background:#f4f4f5;padding:15px;border-radius:6px;border-left:4px solid #B388FF;">
        <p style="margin:0;">${announcementMessage}</p>
      </div>
      
      ${ctaButton('View Announcement', `https://myfestivo.live/events/${eventId}`)}
    `);

    const text = `Hi ${userName},\n\nThere's a new announcement for ${eventTitle}:\n\n${announcementTitle}\n\n${announcementMessage}\n\nView Details: https://myfestivo.live/events/${eventId}\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Announcement notification sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendAnnouncementNotification failed:', error);
    return false;
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
    const subject = `📋 Task assigned: ${taskTitle} — ${eventTitle} | MyFestivo`;
    
    const html = wrapHtml(`
      ${h2(`New task: ${taskTitle}`)}
      ${p(`Hi <strong>${assigneeName}</strong>, <strong>${assignedBy}</strong> has assigned you a task for <strong>${eventTitle}</strong>.`)}
      
      ${listBlock([
        { label: 'Task', value: taskTitle },
        { label: 'Description', value: taskDescription },
        { label: 'Deadline', value: deadline || 'No deadline' },
        { label: 'Assigned By', value: assignedBy },
      ])}
      
      ${ctaButton('View Task Board', `https://myfestivo.live/events/${eventId}`)}
    `);

    const text = `Hi ${assigneeName},\n\n${assignedBy} has assigned you a task for ${eventTitle}.\n\nTask: ${taskTitle}\nDescription: ${taskDescription}\nDeadline: ${deadline || 'None'}\n\nView Task Board: https://myfestivo.live/events/${eventId}\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Task assignment sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendTaskAssignment failed:', error);
    return false;
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
      ${p(messageBody.replace(/\n/g, '<br/>'))}
      ${ctaLabel && ctaUrl ? ctaButton(ctaLabel, ctaUrl) : ''}
    `);

    let text = `${subject}\n\n${messageBody}\n`;
    if (ctaLabel && ctaUrl) {
      text += `\n${ctaLabel}: ${ctaUrl}\n`;
    }
    text += `\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: `${subject} — MyFestivo`,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Custom message sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendCustomMessage failed:', error);
    return false;
  }
}

// ─── 7. College Email Verification OTP ───────────────────────────────────────

export async function sendCollegeOTP(
  toEmail: string,
  otp: string,
  collegeDomain: string
): Promise<boolean> {
  try {
    const subject = 'MyFestivo — College Email Verification OTP';
    
    const html = wrapHtml(`
      ${h2('Verify your college email')}
      ${p(`You're verifying <strong>${toEmail}</strong> with domain <strong>@${collegeDomain}</strong>.`)}
      
      <div style="background-color:#f4f4f5;padding:25px;text-align:center;border-radius:6px;margin:20px 0;">
        <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;color:#555;">Your verification code</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#B388FF;">${otp}</div>
      </div>
      
      ${p('This code expires in <strong>10 minutes</strong>. Do not share it with anyone.')}
    `);

    const text = `Verify your college email\n\nYou're verifying ${toEmail} with domain @${collegeDomain}.\n\nYour verification code is:\n${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] OTP sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendCollegeOTP failed:', error);
    return false;
  }
}

// ─── 8. Signup OTP Verification ───────────────────────────────────────────────

export async function sendSignupOTP(
  toEmail: string,
  otp: string,
  userName: string
): Promise<boolean> {
  try {
    const subject = 'MyFestivo — Verify your account';
    
    const html = wrapHtml(`
      ${h2('Verify your email address')}
      ${p(`Hi <strong>${userName}</strong>, thanks for signing up! Use the code below to verify your account and complete registration.`)}
      
      <div style="background-color:#f4f4f5;padding:25px;text-align:center;border-radius:6px;margin:20px 0;">
        <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;color:#555;">Your verification code</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:5px;color:#B388FF;">${otp}</div>
      </div>
      
      ${p('This code expires in <strong>10 minutes</strong>. If you didn\'t create an account, you can safely ignore this email.')}
    `);

    const text = `Verify your email address\n\nHi ${userName}, thanks for signing up! Use the code below to verify your account and complete registration.\n\nYour verification code is:\n${otp}\n\nThis code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Signup OTP sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendSignupOTP failed:', error);
    return false;
  }
}

// ─── 9. Team Invitation ───────────────────────────────────────────────────────

export async function sendTeamInvitation(
  toEmail: string,
  captainName: string,
  teamName: string,
  eventTitle: string,
  subEventName: string,
  eventId: string
): Promise<boolean> {
  try {
    const subject = `🤝 ${captainName} invited you to join team "${teamName}" — ${eventTitle} | MyFestivo`;
    
    const html = wrapHtml(`
      ${h2(`You've been invited to a team! 🤝`)}
      ${p(`<strong>${captainName}</strong> has invited you to join team <strong>${teamName}</strong> for <strong>${eventTitle}</strong>.`)}
      
      ${listBlock([
        { label: 'Event', value: eventTitle },
        { label: 'Sub-Event', value: subEventName },
        { label: 'Team', value: teamName },
        { label: 'Invited By', value: captainName },
      ])}
      
      <div style="background-color:#f4f4f5;padding:15px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;">Log in to your MyFestivo dashboard to <strong>Accept</strong> or <strong>Decline</strong> this team invitation.</p>
      </div>
      
      ${ctaButton('Go to Dashboard', `https://myfestivo.live/dashboard`)}
      ${p('If you didn\'t expect this invite, you can safely ignore or decline it.')}
    `);

    const text = `Hi,\n\n${captainName} has invited you to join team "${teamName}" for ${eventTitle}.\n\nDetails:\n- Sub-Event: ${subEventName}\n\nLog in to your MyFestivo dashboard to Accept or Decline this team invitation.\n\nDashboard: https://myfestivo.live/dashboard\n\nIf you didn't expect this invite, you can safely ignore or decline it.\n\nMyFestivo`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) throw error;
    console.log(`[Email] Team invitation sent → ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] sendTeamInvitation failed:', error);
    return false;
  }
}

// ─── Test connection ──────────────────────────────────────────────────────────

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    console.log('[Email] ✓ Resend configured successfully');
    return true;
  } catch (error) {
    console.error('[Email] ✗ Resend configuration failed:', error);
    return false;
  }
}
