# Razorpay Integration Guide for MyFestivo

## Overview
Razorpay is now fully integrated into your event registration system. Users will see a payment modal when registering for paid events.

## Quick Setup (5 minutes)

### Step 1: Get Razorpay API Keys
1. Visit https://razorpay.com and sign up
2. Go to **Dashboard → Settings → API Keys**
3. Choose **Test** or **Live** mode based on your environment
4. Copy your **Key ID** (Public) and **Key Secret** (Private)

### Step 2: Create `.env.local` File
Create a new file in `myfestivo-web/.env.local`:

```env
# Razorpay Keys (get from https://dashboard.razorpay.com/app/keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Keep your existing Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### Step 3: Restart Your Dev Server
```bash
npm run dev
```

## How It Works

### Payment Flow
```
User Registers → Select Sub-Event → Review Details
                                    ↓
                        If event price > 0
                                    ↓
                        Payment Modal Opens
                                    ↓
                        User Completes Payment
                                    ↓
                        Razorpay Verifies
                                    ↓
                        Transact ID Saved
                        Status: PAID
                        User Gets QR Pass
```

### For Free Events
- No payment modal shown
- Registration instantly approved
- User immediately gets QR pass

## Testing

### Test Mode Setup
1. In Razorpay Dashboard, select **Test Mode**
2. Copy test credentials to `.env.local`
3. Use Razorpay's test payment details:
   - **Card**: 4111111111111111 (Visa)
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **OTP**: 123456 (if required)

### Verify Integration
1. Create a paid event with price > 0
2. Register as a user
3. Click through to payment modal
4. Complete test payment
5. Check database for transaction ID and PAID status

## File Changes

### New Files Created
- **`src/lib/razorpay.ts`** - Payment utility functions
  - `loadRazorpayScript()` - Load Razorpay SDK
  - `initiatePayment()` - Open payment modal
  - `toPaise()` / `toRupees()` - Amount conversion

- **`src/components/event/PaymentModal.tsx`** - Payment UI
  - Shows event details and amount
  - Integrates with Razorpay Checkout
  - Displays success/error states

### Modified Files
- **`src/components/event/RegistrationWizard.tsx`**
  - Added payment flow to registration
  - Shows payment modal for paid events
  - Records transaction on success

- **`src/lib/events-context.tsx`**
  - Updated `submitTransaction()` to auto-approve Razorpay payments

- **`package.json`**
  - Added `razorpay` dependency

## Features

✅ **Razorpay Secure Checkout** - PCI DSS Level 1 compliant
✅ **Multiple Payment Methods** - Cards, UPI, Wallets, Net Banking, etc.
✅ **Automatic Verification** - Payments auto-marked as PAID
✅ **Transaction Tracking** - Full transaction ID logging
✅ **Error Handling** - Graceful error messages
✅ **Test Mode** - Full testing without real payments

## Admin Dashboard

### Payment Management Tab
- View all registrations and their payment status
- See transaction IDs for verification
- Manually approve/reject payments if needed
- Export payment reports

### Payment Statuses
| Status | Meaning |
|--------|---------|
| PAID | Payment successful, user can check in |
| PENDING | Awaiting payment or admin approval |
| REFUNDED | Refund issued, registration canceled |

## Security Notes

⚠️ **Important**: Never commit `.env.local` to git
- Add to `.gitignore`: `echo ".env.local" >> .gitignore`
- Always use environment-specific keys
- Keep `RAZORPAY_KEY_SECRET` secure (backend only)

## Troubleshooting

### "Razorpay is not available" Error
- Ensure Razorpay script loads: Check browser console
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Hard refresh browser (Ctrl+Shift+R)

### Payment Modal Won't Open
- Check browser console for errors
- Verify event has `price > 0`
- Ensure user is logged in
- Check Razorpay status page

### Transaction Not Recording
- Verify Firebase rules allow payment updates
- Check `RAZORPAY_KEY_ID` matches your account
- Look at browser console and server logs

## Going Live

### Before Launch
1. Switch Razorpay to **Live Mode**
2. Get Live Key ID and Key Secret
3. Update `.env.local` with live credentials
4. Test with real small transactions
5. Set up settlement account in Razorpay

### Live Configuration
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

## Support & Resources

- **Razorpay Docs**: https://razorpay.com/docs
- **Razorpay Support**: https://razorpay.com/support
- **Test Payment Details**: https://razorpay.com/docs/payment-gateway/test-payment-details/
- **Pricing**: https://razorpay.com/pricing/

## Questions?

Check the integration code:
- `src/lib/razorpay.ts` - Core payment logic
- `src/components/event/PaymentModal.tsx` - UI implementation
- `src/components/event/RegistrationWizard.tsx` - Payment flow
