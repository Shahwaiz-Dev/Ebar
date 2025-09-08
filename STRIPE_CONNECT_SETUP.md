# Stripe Connect Setup Guide

This guide will help you set up Stripe Connect for your beach bar marketplace platform.

## Prerequisites

1. A Stripe account with Connect enabled
2. Your application deployed to Vercel
3. Environment variables configured

## Environment Variables

Add these to your `.env` file and Vercel dashboard:

```env
# Existing Stripe variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# New Stripe Connect variables
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Stripe Connect Setup

### 1. Enable Stripe Connect

1. Go to your Stripe Dashboard
2. Navigate to Connect → Settings
3. Enable Connect for your account
4. Configure your platform settings

### 2. Configure Platform Settings

In Stripe Dashboard → Connect → Settings:

- **Platform Name**: Your Beach Bar Platform
- **Platform Website**: https://your-app.vercel.app
- **Support Email**: support@yourplatform.com
- **Business Type**: Marketplace

### 3. Set Up Webhooks

Add these webhook endpoints in Stripe Dashboard → Developers → Webhooks:

**Endpoint 1: Payment Processing**
- URL: `https://your-app.vercel.app/api/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

**Endpoint 2: Connect Events**
- URL: `https://your-app.vercel.app/api/connect-webhook`
- Events: `account.updated`, `capability.updated`

## Platform Fee Structure

### Default Fee Structure
- **Platform Fee**: 15% of each transaction
- **Bar Owner Payout**: 85% of each transaction
- **Setup Fee**: $0
- **Monthly Fee**: $0

### Tiered Fee Structure (Optional)
- **New Bars (0-10 bookings)**: 20% platform fee
- **Established Bars (10+ bookings)**: 15% platform fee
- **Premium Bars (50+ bookings)**: 12% platform fee

## Testing Stripe Connect

### Test Account Creation
1. Use test mode in Stripe Dashboard
2. Create test Connect accounts
3. Test the onboarding flow

### Test Payments
1. Use test card: `4242 4242 4242 4242`
2. Verify platform fees are calculated correctly
3. Check that transfers are created

## Production Checklist

Before going live:

1. [ ] Switch to live Stripe keys
2. [ ] Enable Connect in live mode
3. [ ] Set up production webhooks
4. [ ] Test with real bank accounts
5. [ ] Configure tax reporting
6. [ ] Set up compliance monitoring

## API Endpoints

### Create Connect Account
```
POST /api/create-connect-account
{
  "email": "barowner@example.com",
  "country": "US"
}
```

### Check Connect Account
```
GET /api/check-connect-account?accountId=acct_xxx
```

### Create Payment with Platform Fee
```
POST /api/create-payment-intent
{
  "amount": 100.00,
  "barOwnerAccountId": "acct_xxx",
  "platformFeePercentage": 15
}
```

## Revenue Tracking

### Platform Revenue
- Track all platform fees collected
- Monitor transaction volumes
- Generate revenue reports

### Bar Owner Payouts
- Track individual bar owner earnings
- Monitor payout schedules
- Handle payout disputes

## Compliance

### Tax Reporting
- Stripe handles 1099 forms automatically
- Configure tax settings in Stripe Dashboard
- Monitor compliance requirements

### Dispute Management
- Handle payment disputes through Stripe
- Monitor chargeback rates
- Implement fraud prevention

## Support

### For Bar Owners
- Stripe Connect onboarding support
- Payment processing help
- Payout schedule information

### For Platform
- Revenue monitoring
- Compliance management
- Technical support

## Monitoring

### Key Metrics
- Total platform revenue
- Transaction success rate
- Bar owner satisfaction
- Dispute rate

### Alerts
- Failed payments
- High dispute rates
- Account verification issues
- Payout failures

## Next Steps

1. **Deploy the updated code** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Enable Stripe Connect** in your Stripe account
4. **Test the integration** with test accounts
5. **Go live** with real bar owners

## Troubleshooting

### Common Issues

1. **Connect account not created**
   - Check Stripe API keys
   - Verify webhook endpoints
   - Check account creation logs

2. **Payments not processing**
   - Verify Connect account is complete
   - Check payment intent creation
   - Monitor webhook events

3. **Payouts not working**
   - Verify bank account details
   - Check payout schedule
   - Monitor transfer status

### Debug Commands

```bash
# Check Stripe Connect status
curl -X GET "https://your-app.vercel.app/api/check-connect-account?accountId=acct_xxx"

# Test payment creation
curl -X POST "https://your-app.vercel.app/api/create-payment-intent" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "barOwnerAccountId": "acct_xxx"}'
```
