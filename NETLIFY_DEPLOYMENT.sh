#!/usr/bin/env bash
# MyFestivo Netlify Deployment Setup
# Run this as a reference to set all environment variables in Netlify

# Generated on: April 4, 2026
# Production Domain: https://myfestivo.live

# ============================================================
# STEP 1: Add These Environment Variables to Netlify
# ============================================================
# Login to netlify.com
# Select your site → Site settings → Build & deploy → Environment
# Click "Edit variables" and add all of these:

# FIREBASE (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyCFG1SNWfez77o-KoWOkYnn6D1D86d_BPI"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="myfestivo.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="myfestivo"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="myfestivo.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="56147733860"
NEXT_PUBLIC_FIREBASE_APP_ID="1:56147733860:web:d1ded45a63df30de691e71"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-CLLF8QR316"

# APPLICATION
NEXT_PUBLIC_APP_URL="https://myfestivo.live"
NODE_ENV="production"

# GMAIL (Email Configuration)
GMAIL_EMAIL="myfestivo@gmail.com"
GMAIL_APP_PASSWORD="PASTE_YOUR_16_CHAR_PASSWORD_HERE"

# RAZORPAY (Get from https://dashboard.razorpay.com → Settings → API Keys)
NEXT_PUBLIC_RAZORPAY_KEY="rzp_live_XXXXXXXXXXXXXXXX"  # (Paste your Key ID)
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXX"                 # (Paste your Secret Key)

# ============================================================
# STEP 2: Get Missing Secrets
# ============================================================
# 
# GMAIL_APP_PASSWORD:
#   1. Go to https://myaccount.google.com/security
#   2. Enable 2-Step Verification (if not already)
#   3. Go to Security → App passwords
#   4. Select Mail + Windows Computer
#   5. Copy the 16-character password Google generates
#   6. Paste it above as GMAIL_APP_PASSWORD
#
# RAZORPAY Keys:
#   1. Go to https://dashboard.razorpay.com
#   2. Settings → API Keys
#   3. Copy Key ID → NEXT_PUBLIC_RAZORPAY_KEY
#   4. Copy Secret Key → RAZORPAY_KEY_SECRET
#

# ============================================================
# STEP 3: Deploy to Netlify
# ============================================================
#
# Option A: GitHub Auto-Deploy (Recommended)
#   1. Push code to GitHub: git push origin main
#   2. Netlify auto-detects and deploys
#   3. Monitor at your Netlify dashboard
#
# Option B: Manual Netlify Deploy
#   1. npm install -g netlify-cli
#   2. netlify login
#   3. netlify deploy --prod
#

# ============================================================
# VERIFICATION
# ============================================================
# After deployment, verify:
# ✓ Site builds without Firebase errors
# ✓ Login works (Firebase Auth)
# ✓ Email verification OTP sends (Gmail)
# ✓ Payments work (Razorpay)
# ✓ https://myfestivo.live loads without errors
