# Deploying to Vercel with Stripe Integration

## Pre-deployment Checklist

1. [ ] Stripe account created
2. [ ] Stripe API keys obtained
3. [ ] Webhook endpoint configured in Stripe
4. [ ] Environment variables ready

## Step 1: Prepare Environment Variables

Create a `.env.local` file for local development:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

## Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

   - `VITE_STRIPE_PUBLISHABLE_KEY` (your publishable key)
   - `STRIPE_SECRET_KEY` (your secret key)
   - `STRIPE_WEBHOOK_SECRET` (your webhook secret)

4. Redeploy your application

## Step 4: Configure Stripe Webhooks

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
4. Copy the webhook signing secret
5. Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 5: Test the Integration

1. Visit your deployed application
2. Navigate to a payment flow
3. Use test card: `4242 4242 4242 4242`
4. Complete a test payment
5. Check Stripe Dashboard for payment confirmation

## Troubleshooting

### Common Issues

1. **Environment variables not working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

2. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check webhook secret is set
   - Ensure HTTPS is used

3. **Payment fails**
   - Check Stripe Dashboard for error details
   - Verify API keys are correct
   - Test with Stripe's test cards

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy with fresh environment
vercel --prod --force
```

## Production Checklist

Before going live:

- [ ] Switch to production Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Configure email receipts
- [ ] Set up order fulfillment
- [ ] Test refund process
- [ ] Enable fraud detection
- [ ] Set up monitoring and alerts

## Security Notes

- Never commit environment variables to version control
- Use HTTPS in production
- Validate webhook signatures
- Implement proper error handling
- Monitor for suspicious activity 