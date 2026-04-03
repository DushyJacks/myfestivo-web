import nodemailer from 'nodemailer'

/**
 * Email service using Gmail SMTP
 * 
 * Environment variables required:
 * - GMAIL_EMAIL: Gmail address (your-email@gmail.com)
 * - GMAIL_APP_PASSWORD: Gmail app password (16-character password from Google Account)
 */

// Create transporter once and reuse it
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Gmail credentials not configured. Set GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env.local')
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

/**
 * Send college email verification OTP
 */
export async function sendCollegeOTP(
  toEmail: string,
  otp: string,
  collegeDomain: string
): Promise<boolean> {
  try {
    const transporter = getTransporter()

    const mailOptions = {
      from: process.env.GMAIL_EMAIL || 'noreply@myfestivo.com',
      to: toEmail,
      subject: 'MyFestivo - College Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">MyFestivo</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">College Event Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
            <p style="color: #666; font-size: 16px;">
              You're verifying your college email <strong>${toEmail}</strong> with MyFestivo.
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">Your verification code:</p>
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px;">
              <strong>Note:</strong> This code expires in 10 minutes. Do not share it with anyone.
            </p>
            
            <div style="background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #0052cc; font-size: 14px;">
                <strong>Domain verified:</strong> ${collegeDomain}
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              If you didn't request this verification, you can safely ignore this email. 
              <br><br>
              © 2026 MyFestivo. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✓ OTP email sent to ${toEmail}`)
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return false
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log('✓ Email service connected successfully')
    return true
  } catch (error) {
    console.error('✗ Email service connection failed:', error)
    return false
  }
}
