# Debugging Stripe Integration Issues

## The "Cannot read properties of undefined (reading 'match')" Error

This error typically occurs when:

1. **Stripe publishable key is not set**
2. **Invalid Stripe key format**
3. **Stripe library failed to load**

## Quick Fix Steps

### 1. Check Environment Variables

Visit your test page: `https://your-app.vercel.app/stripe-test`

Look for the "Environment Variables Status" section. All should show "Set".

### 2. Verify Stripe Key Format

Your `VITE_STRIPE_PUBLISHABLE_KEY` should:
- Start with `pk_test_` (for testing) or `pk_live_` (for production)
- Be approximately 100+ characters long
- Not contain spaces or special characters

Example: `pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG`

### 3. Check Browser Console

Open browser developer tools (F12) and look for:
- ✅ "Stripe Publishable Key: Set"
- ✅ "Stripe loaded successfully"
- ❌ Any error messages

### 4. Common Issues and Solutions

#### Issue: "Stripe Publishable Key: Not Set"
**Solution**: Set the environment variable in Vercel dashboard

#### Issue: "Invalid Stripe publishable key format"
**Solution**: Make sure your key starts with `pk_test_` or `pk_live_`

#### Issue: "Failed to load Stripe"
**Solution**: Check if your key is valid in Stripe dashboard

## Environment Variables Checklist

In your Vercel dashboard, ensure these are set:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## Testing Steps

1. **Visit the test page**: `/stripe-test`
2. **Check environment status**: All should be "Set"
3. **Try creating a payment intent**: Click "Create Test Payment Intent"
4. **Test with card**: `4242 4242 4242 4242`
5. **Check console**: No errors should appear

## If Still Not Working

1. **Redeploy your app** after setting environment variables
2. **Clear browser cache** and try again
3. **Check Stripe Dashboard** for any account issues
4. **Verify API endpoints** are working: `/api/create-payment-intent`

## Debug Commands

Add this to your browser console to check:

```javascript
// Check if environment variable is set
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Check if it's a valid format
const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log('Valid format:', key && (key.startsWith('pk_test_') || key.startsWith('pk_live_')));
```

## Contact Support

If the issue persists:
1. Check Stripe Dashboard for account status
2. Verify your Stripe account is active
3. Contact Stripe support if needed 