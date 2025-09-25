# Subscription System Setup Guide

This guide will help you set up the subscription system for BeachVibe with three pricing tiers.

## Subscription Plans

| Plan | Price | Booking Limit | Features |
|------|-------|---------------|----------|
| Starter | €5.99/month | 100 bookings | Basic analytics, QR codes, Basic menu management, Email support |
| Professional | €7.99/month | 300 bookings | Advanced analytics, Full menu management, Customer management, Priority support |
| Premium | €10.99/month | 700 bookings | Premium analytics, Advanced menu management, Customer management, Payment management, Priority support |

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=whsec_...
```

## Setup Steps

### 1. Create Stripe Products

Run the setup script to create products and prices in Stripe:

```bash
node scripts/setup-stripe-products.js
```

This will create:
- 3 products (one for each plan)
- 3 monthly recurring prices
- Output the IDs you need for configuration

### 2. Update API Configuration

Update `api/create-subscription.js` with the product and price IDs from step 1:

```javascript
const SUBSCRIPTION_PRODUCTS = {
  starter: {
    productId: 'prod_...', // From script output
    priceId: 'price_...', // From script output
  },
  professional: {
    productId: 'prod_...',
    priceId: 'price_...',
  },
  premium: {
    productId: 'prod_...',
    priceId: 'price_...',
  },
};
```

### 3. Configure Stripe Webhooks

1. Go to your Stripe Dashboard > Webhooks
2. Create a new webhook endpoint: `https://yourdomain.com/api/subscription-webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to your `.env` file

### 4. Update Firestore Security Rules

The subscription rules are already added to `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

### 5. Test the System

1. Navigate to the Dashboard > Subscription tab
2. Try upgrading to a plan (use Stripe test cards)
3. Verify booking limits are enforced
4. Test feature restrictions (Analytics and Payments tabs)

## Features Locked by Subscription

### Starter Plan (€5.99)
- ✅ 100 bookings/month
- ✅ Basic analytics
- ✅ QR codes
- ✅ Basic menu management
- ❌ Advanced analytics (locked)
- ❌ Payment management (locked)

### Professional Plan (€7.99)
- ✅ 300 bookings/month
- ✅ Advanced analytics
- ✅ QR codes
- ✅ Full menu management
- ✅ Customer management
- ❌ Payment management (locked)

### Premium Plan (€10.99)
- ✅ 700 bookings/month
- ✅ Premium analytics & reports
- ✅ QR codes
- ✅ Advanced menu management
- ✅ Customer management
- ✅ Payment management (Stripe Connect)

## API Endpoints

- `POST /api/create-subscription` - Create Stripe checkout session
- `POST /api/subscription-webhook` - Handle Stripe webhooks

## Database Collections

### subscriptions
```javascript
{
  id: string,
  userId: string,
  tier: 'starter' | 'professional' | 'premium',
  status: 'active' | 'inactive' | 'cancelled' | 'past_due',
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  currentPeriodStart: Timestamp,
  currentPeriodEnd: Timestamp,
  bookingsUsed: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Booking Limit Enforcement

Booking limits are enforced at the bar owner level:
1. When a customer makes a booking, the system checks the bar owner's subscription
2. If the owner has reached their monthly limit, the booking is rejected
3. The booking count is incremented for successful bookings
4. Counts reset at the start of each billing period

## Testing with Stripe Test Cards

Use these test cards for testing:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## Troubleshooting

### Webhook Issues
- Check webhook endpoint is accessible
- Verify webhook secret is correct
- Check Stripe Dashboard > Webhooks for delivery attempts

### Subscription Not Created
- Check Stripe Dashboard > Payments for successful payments
- Verify webhook is processing `customer.subscription.created` events
- Check browser network tab for API errors

### Features Not Unlocking
- Verify subscription status is 'active'
- Check user subscription data in Firestore
- Refresh the page after subscription changes
