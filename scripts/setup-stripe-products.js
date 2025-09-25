// Script to create Stripe products and prices for subscription plans
// Run this once to set up your Stripe account with the required products

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 599, // 5.99 EUR in cents
    currency: 'eur',
    features: [
      'Up to 100 bookings/month',
      'Basic analytics',
      'QR codes',
      'Basic menu management',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 799, // 7.99 EUR in cents
    currency: 'eur',
    features: [
      'Up to 300 bookings/month',
      'Advanced analytics',
      'QR codes',
      'Full menu management',
      'Customer management',
      'Priority email support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 1099, // 10.99 EUR in cents
    currency: 'eur',
    features: [
      'Up to 700 bookings/month',
      'Premium analytics & reports',
      'QR codes',
      'Advanced menu management',
      'Customer management',
      'Payment management',
      'Priority support'
    ]
  }
];

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...\n');

  for (const plan of subscriptionPlans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: `BeachVibe ${plan.name}`,
        description: `BeachVibe subscription plan: ${plan.features.join(', ')}`,
        metadata: {
          plan_id: plan.id,
          plan_type: 'subscription'
        }
      });

      console.log(`✅ Created product: ${product.name} (${product.id})`);

      // Create recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency,
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan_id: plan.id
        }
      });

      console.log(`✅ Created monthly price: €${plan.price / 100} (${price.id})`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Price ID: ${price.id}\n`);

      // Output for API configuration
      console.log(`Update your api/create-subscription.js with:`);
      console.log(`${plan.id}: {`);
      console.log(`  productId: '${product.id}',`);
      console.log(`  priceId: '${price.id}',`);
      console.log(`},\n`);

    } catch (error) {
      console.error(`❌ Error creating ${plan.name}:`, error.message);
    }
  }

  console.log('\n🎉 Stripe setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update the SUBSCRIPTION_PRODUCTS object in api/create-subscription.js');
  console.log('2. Set up webhook endpoint at /api/subscription-webhook');
  console.log('3. Configure webhook events in Stripe Dashboard');
  console.log('4. Test the subscription flow');
}

// Check if Stripe key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Please set STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

createStripeProducts().catch(console.error);
