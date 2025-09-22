# Stripe Connect Setup Guide for Ebar

This guide will help you set up Stripe Connect for your beach bar marketplace, enabling bar owners to receive payments directly while you collect platform fees.

## 🎯 Overview

Stripe Connect allows you to:
- **Bar owners** receive payments directly to their bank accounts
- **Platform fees** are automatically deducted (3% in this implementation)
- **Compliance** is handled by Stripe
- **Real-time** payment processing and payouts

## 📋 Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Connect Application**: Enable Stripe Connect in your Stripe Dashboard
3. **Environment Variables**: Set up your API keys
4. **Webhook Endpoint**: Configure webhooks for Connect events

## 🔧 Environment Setup

Add these environment variables to your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for Connect redirects)
FRONTEND_URL=http://localhost:5173
```

## 🚀 Stripe Dashboard Setup

### 1. Enable Stripe Connect

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Connect** → **Settings**
3. Enable **Express accounts** (recommended for your use case)
4. Configure your platform settings:
   - **Platform name**: Ebar
   - **Platform website**: Your domain
   - **Support email**: Your support email

### 2. Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.vercel.app/api/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `transfer.created`
   - `transfer.failed`
   - `charge.succeeded`
   - `charge.failed`

4. Copy the webhook signing secret to your environment variables

## 💻 Implementation Guide

### 1. Bar Owner Onboarding Flow

```typescript
// In your bar creation/management component
import { ConnectOnboarding } from '@/components/ConnectOnboarding';

<ConnectOnboarding
  ownerId={currentUser.uid}
  barName={barData.name}
  onAccountCreated={(accountId) => {
    // Store account ID in your database
    updateBarWithConnectAccount(barId, accountId);
  }}
/>
```

### 2. Payment Processing

```typescript
// Use ConnectPaymentForm instead of regular StripePaymentForm
import { ConnectPaymentForm } from '@/components/ConnectPaymentForm';

<ConnectPaymentForm
  amount={totalAmount}
  barId={barId}
  ownerId={barOwnerId}
  connectAccountId={barConnectAccountId}
  barName={barName}
  onSuccess={(paymentId) => {
    // Handle successful payment
    updateBookingStatus(bookingId, 'paid');
  }}
  onError={(error) => {
    // Handle payment error
    showError(error);
  }}
/>
```

### 3. Bar Owner Dashboard

```typescript
// Add Connect dashboard to bar owner's dashboard
import { ConnectDashboard } from '@/components/ConnectDashboard';

<ConnectDashboard
  accountId={connectAccountId}
  barName={barName}
/>
```

## 🏗️ Database Schema Updates

Add Connect account information to your beach bars:

```typescript
// Update your BeachBar interface
interface BeachBar {
  // ... existing fields
  connectAccountId?: string;
  connectAccountStatus?: 'pending' | 'active' | 'restricted';
  paymentSetupComplete?: boolean;
}
```

## 🔄 Payment Flow

### Customer Payment Process:

1. **Customer** selects beach bar and services
2. **System** creates Connect PaymentIntent with:
   - Total amount
   - Platform fee (3%)
   - Bar owner's Connect account ID
3. **Customer** pays with card
4. **Stripe** processes payment and:
   - Transfers net amount to bar owner
   - Deducts platform fee
   - Sends webhook events

### Bar Owner Payout Process:

1. **Bar owner** completes onboarding
2. **Payments** are automatically transferred to their bank account
3. **Payouts** occur on Stripe's schedule (typically 2 business days)
4. **Bar owner** can track earnings in their dashboard

## 🧪 Testing

### Test Connect Accounts

1. Create test Connect accounts in Stripe Dashboard
2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires Authentication**: `4000 0025 0000 3155`

### Test Webhooks

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## 📊 Monitoring & Analytics

### Key Metrics to Track:

- **Onboarding completion rate**
- **Payment success rate**
- **Platform fee revenue**
- **Bar owner satisfaction**

### Stripe Dashboard Features:

- **Connect** → **Accounts**: Monitor bar owner accounts
- **Payments**: Track all transactions
- **Transfers**: Monitor payouts to bar owners
- **Reports**: Generate financial reports

## 🚨 Important Considerations

### Compliance & Legal:

1. **Terms of Service**: Update to include Connect terms
2. **Privacy Policy**: Include Connect data handling
3. **Tax Reporting**: Stripe handles 1099 forms for bar owners
4. **PCI Compliance**: Stripe handles card data security

### Security:

1. **Webhook Verification**: Always verify webhook signatures
2. **Account Validation**: Verify bar owner identity
3. **Fraud Prevention**: Use Stripe Radar for fraud detection
4. **Data Protection**: Follow GDPR/privacy regulations

### Financial:

1. **Platform Fees**: Consider competitive pricing (3% is standard)
2. **Minimum Payouts**: Set minimum payout thresholds
3. **Currency Support**: Consider multi-currency support
4. **Refund Handling**: Implement refund policies

## 🔧 Troubleshooting

### Common Issues:

1. **Onboarding Failures**: Check account requirements
2. **Payment Failures**: Verify Connect account status
3. **Webhook Issues**: Check endpoint configuration
4. **Payout Delays**: Verify bank account details

### Support Resources:

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Support](https://support.stripe.com)
- [Connect Best Practices](https://stripe.com/docs/connect/best-practices)

## 🚀 Going Live

### Production Checklist:

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test with real bank accounts
- [ ] Set up monitoring and alerts
- [ ] Update legal documents
- [ ] Train support team on Connect features

### Launch Strategy:

1. **Soft Launch**: Start with a few trusted bar owners
2. **Monitor**: Watch for issues and feedback
3. **Scale**: Gradually onboard more bar owners
4. **Optimize**: Improve based on usage patterns

## 📈 Future Enhancements

Consider these advanced features:

- **Instant Payouts**: Offer same-day payouts for premium bar owners
- **Multi-Currency**: Support international bar owners
- **Advanced Analytics**: Detailed earnings reports
- **Mobile App**: Bar owner mobile app for payments
- **Subscription Plans**: Tiered platform fee structures

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Stripe Connect Documentation](https://stripe.com/docs/connect)
2. Review webhook logs in your Vercel dashboard
3. Test with Stripe's test mode first
4. Contact Stripe support for Connect-specific issues

Remember: Stripe Connect is powerful but requires careful setup. Take time to test thoroughly before going live!
