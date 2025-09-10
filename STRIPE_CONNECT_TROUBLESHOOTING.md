# Stripe Connect Troubleshooting Guide

## Common Issues and Solutions

### 1. "Stripe Connect account not connecting after setup"

**Symptoms:**
- User completes Stripe onboarding but account doesn't show as connected
- Dashboard shows "Not Connected" status
- Payments fail with "account not found" errors

**Root Causes:**
1. **Environment Variable Issue**: `VITE_APP_URL` not set correctly
2. **API Endpoint Errors**: Backend APIs failing silently
3. **Firebase Update Issues**: Bar document not updated with Stripe account ID
4. **Stripe Account Incomplete**: Onboarding process not fully completed

### 2. Environment Variables Configuration

**Required Variables:**
```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (CRITICAL for Stripe Connect)
VITE_APP_URL=https://your-app.vercel.app
```

**Common Mistakes:**
- Using `NEXT_PUBLIC_APP_URL` instead of `VITE_APP_URL` (this is a Vite project, not Next.js)
- Not setting the app URL at all
- Using HTTP instead of HTTPS
- Missing trailing slash or having extra characters

### 3. Step-by-Step Debugging Process

#### Step 1: Check Environment Variables
1. Go to your Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Verify all variables are set correctly
4. Redeploy your application after making changes

#### Step 2: Test API Endpoints
Test each endpoint individually:

```bash
# Test create-connect-account
curl -X POST https://your-app.vercel.app/api/create-connect-account \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "country": "US"}'

# Test check-connect-account
curl -X GET "https://your-app.vercel.app/api/check-connect-account?accountId=acct_xxx"

# Test update-bar-stripe-account
curl -X POST https://your-app.vercel.app/api/update-bar-stripe-account \
  -H "Content-Type: application/json" \
  -d '{"barId": "bar_xxx", "stripeAccountId": "acct_xxx"}'
```

#### Step 3: Check Browser Console
1. Open browser developer tools (F12)
2. Look for error messages in the console
3. Check network tab for failed API calls
4. Verify environment variables are loaded

#### Step 4: Check Vercel Logs
1. Go to Vercel dashboard → Functions
2. Check logs for your API endpoints
3. Look for error messages or stack traces

### 4. Common Error Messages and Solutions

#### "App URL configuration error"
**Solution:** Set `VITE_APP_URL` environment variable in Vercel

#### "Stripe configuration error"
**Solution:** Set `STRIPE_SECRET_KEY` environment variable in Vercel

#### "Account ID is required"
**Solution:** Check that the account ID is being passed correctly from the frontend

#### "Bar ID and Stripe Account ID are required"
**Solution:** Verify the bar document exists and the Stripe account ID is valid

#### "Failed to create connect account"
**Solution:** Check Stripe API key permissions and account status

### 5. Testing the Complete Flow

#### Test 1: Create Connect Account
1. Go to dashboard
2. Click "Set Up Stripe Connect"
3. Check browser console for errors
4. Verify redirect to Stripe onboarding

#### Test 2: Complete Onboarding
1. Complete Stripe onboarding process
2. Verify redirect back to success page
3. Check that account ID is in URL parameters

#### Test 3: Verify Connection
1. Return to dashboard
2. Check that status shows "Active"
3. Verify bar document has `stripeAccountId` field

### 6. Firebase Database Verification

Check that the bar document is updated correctly:

```javascript
// In Firebase console or via code
const barDoc = await getDoc(doc(db, 'beachBars', 'bar_id'));
console.log(barDoc.data());
// Should show: { stripeAccountId: 'acct_xxx', isStripeConnected: true }
```

### 7. Stripe Dashboard Verification

1. Go to Stripe Dashboard → Connect → Accounts
2. Find the account created for your test
3. Verify account status is "Complete"
4. Check that required information is provided

### 8. Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in production
- [ ] App URL uses HTTPS
- [ ] Stripe Connect is enabled in live mode
- [ ] Webhook endpoints are configured
- [ ] Test with real bank accounts
- [ ] Monitor error logs

### 9. Quick Fixes

#### Fix 1: Environment Variables
```bash
# Add to Vercel environment variables
VITE_APP_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_your_live_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

#### Fix 2: Redeploy Application
```bash
vercel --prod --force
```

#### Fix 3: Clear Browser Cache
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Try in incognito mode

### 10. Advanced Debugging

#### Enable Detailed Logging
Add to your API functions:
```javascript
console.log('Request body:', req.body);
console.log('Environment check:', {
  stripeKey: !!process.env.STRIPE_SECRET_KEY,
  appUrl: process.env.VITE_APP_URL
});
```

#### Check Stripe Account Status
```javascript
const account = await stripe.accounts.retrieve(accountId);
console.log('Account status:', {
  id: account.id,
  chargesEnabled: account.charges_enabled,
  detailsSubmitted: account.details_submitted,
  payoutsEnabled: account.payouts_enabled,
  requirements: account.requirements
});
```

### 11. Support Resources

- **Stripe Connect Documentation**: https://stripe.com/docs/connect
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables
- **Firebase Firestore**: https://firebase.google.com/docs/firestore

### 12. Still Having Issues?

If the problem persists:

1. **Check Vercel Function Logs** for specific error messages
2. **Test API endpoints directly** using curl or Postman
3. **Verify Stripe account permissions** in Stripe Dashboard
4. **Check Firebase security rules** allow updates to bar documents
5. **Contact support** with specific error messages and logs
