# Stripe Payment Integration Setup

This guide will help you set up real Stripe payments for your beach bar application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your application deployed to Vercel

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Getting Your Stripe Keys

1. **Publishable Key**: Go to your Stripe Dashboard → Developers → API Keys
2. **Secret Key**: Use the test secret key for development, production secret key for live
3. **Webhook Secret**: Set up webhooks in Stripe Dashboard → Developers → Webhooks

## Setting Up Webhooks

1. In your Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-vercel-domain.vercel.app/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to your environment variables

## Vercel Deployment

1. Add your environment variables in Vercel:
   - Go to your project settings in Vercel
   - Navigate to Environment Variables
   - Add all the environment variables listed above

2. Deploy your application:
   ```bash
   vercel --prod
   ```

## Testing Payments

### Test Card Numbers

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test CVC and Expiry

- **CVC**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)

## Production Checklist

Before going live:

1. [ ] Switch to production Stripe keys
2. [ ] Set up production webhook endpoint
3. [ ] Test with real payment methods
4. [ ] Configure email receipts
5. [ ] Set up order fulfillment workflow
6. [ ] Test refund process
7. [ ] Set up fraud detection

## Security Notes

- Never expose your secret key in client-side code
- Always use HTTPS in production
- Validate webhook signatures
- Implement proper error handling
- Store sensitive data securely

## Troubleshooting

### Common Issues

1. **Payment fails**: Check your Stripe dashboard for error details
2. **Webhook not working**: Verify the webhook URL and secret
3. **Environment variables**: Ensure all variables are set in Vercel
4. **CORS issues**: Check your API routes configuration

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=stripe:*
```

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Vercel Documentation: https://vercel.com/docs 