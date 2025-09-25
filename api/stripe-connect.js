import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'create-account':
        return await createConnectAccount(req, res);
      case 'get-account':
        return await getConnectAccount(req, res);
      case 'create-account-link':
        return await createAccountLink(req, res);
      case 'debug-account':
        return await debugConnectAccount(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Stripe Connect API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Create Connect Account
async function createConnectAccount(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, businessName, ownerId, barId } = req.body;

  if (!email || !businessName || !ownerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
    return res.status(500).json({ error: 'Stripe configuration missing' });
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    business_profile: {
      name: businessName,
      product_description: 'Beach bar services and rentals',
    },
    metadata: {
      ownerId: ownerId,
      platform: 'ebar',
    },
  });

  const returnUrl = barId 
    ? `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${account.id}&barId=${barId}`
    : `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${account.id}`;
  
  const refreshUrl = barId 
    ? `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${account.id}&barId=${barId}`
    : `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${account.id}`;
  
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  res.status(200).json({
    accountId: account.id,
    onboardingUrl: accountLink.url,
  });
}

// Get Connect Account
async function getConnectAccount(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId } = req.query;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID required' });
  }

  const account = await stripe.accounts.retrieve(accountId);

  const isOnboarded = account.details_submitted && 
                     account.charges_enabled && 
                     account.payouts_enabled;

  let status = 'pending';
  if (isOnboarded) {
    status = 'active';
  } else if (account.details_submitted) {
    status = 'restricted';
  }

  console.log(`Connect account ${accountId} status:`, {
    status,
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements,
    currently_due: account.requirements?.currently_due || [],
    eventually_due: account.requirements?.eventually_due || [],
    past_due: account.requirements?.past_due || [],
    pending_verification: account.requirements?.pending_verification || []
  });

  res.status(200).json({
    accountId: account.id,
    isOnboarded,
    status,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    businessProfile: account.business_profile,
    requirements: account.requirements,
    currentlyDue: account.requirements?.currently_due || [],
    eventuallyDue: account.requirements?.eventually_due || [],
    pastDue: account.requirements?.past_due || [],
    pendingVerification: account.requirements?.pending_verification || [],
    disabled_reason: account.requirements?.disabled_reason,
  });
}

// Create Account Link
async function createAccountLink(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId, barId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID required' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
    return res.status(500).json({ error: 'Configuration missing' });
  }

  const returnUrl = barId 
    ? `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${accountId}&barId=${barId}`
    : `${process.env.FRONTEND_URL}/dashboard/connect/success?account=${accountId}`;
  
  const refreshUrl = barId 
    ? `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${accountId}&barId=${barId}`
    : `${process.env.FRONTEND_URL}/dashboard/connect/refresh?account=${accountId}`;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  res.status(200).json({
    accountId: accountId,
    onboardingUrl: accountLink.url,
  });
}

// Debug Connect Account
async function debugConnectAccount(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId } = req.query;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID required' });
  }

  const account = await stripe.accounts.retrieve(accountId);
  const requirements = account.requirements;
  
  const analysis = {
    account_id: account.id,
    created: new Date(account.created * 1000).toISOString(),
    country: account.country,
    type: account.type,
    business_type: account.business_type,
    
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    
    currently_due: requirements.currently_due || [],
    eventually_due: requirements.eventually_due || [],
    past_due: requirements.past_due || [],
    pending_verification: requirements.pending_verification || [],
    
    disabled_reason: requirements.disabled_reason,
    restrictions: account.capabilities?.restrictions || {},
    
    card_payments: account.capabilities?.card_payments,
    transfers: account.capabilities?.transfers,
    
    business_profile: {
      mcc: account.business_profile?.mcc,
      name: account.business_profile?.name,
      product_description: account.business_profile?.product_description,
      support_email: account.business_profile?.support_email,
      url: account.business_profile?.url
    },
    
    individual_verification: account.individual ? {
      first_name_provided: !!account.individual.first_name,
      last_name_provided: !!account.individual.last_name,
      dob_provided: !!account.individual.dob,
      ssn_provided: !!account.individual.ssn_last_4,
      phone_provided: !!account.individual.phone,
      email_provided: !!account.individual.email,
      address_provided: !!(account.individual.address?.line1),
      verification_status: account.individual.verification
    } : null,
    
    external_accounts_count: account.external_accounts?.data?.length || 0,
    has_bank_account: (account.external_accounts?.data?.length || 0) > 0,
    
    metadata: account.metadata
  };

  const recommendations = [];
  
  if (requirements.past_due?.length > 0) {
    recommendations.push({
      priority: 'URGENT',
      issue: 'Past due requirements',
      items: requirements.past_due,
      action: 'Submit these immediately to prevent account suspension'
    });
  }
  
  if (requirements.currently_due?.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Currently due requirements',
      items: requirements.currently_due,
      action: 'Complete these to enable full functionality'
    });
  }
  
  if (!account.charges_enabled && !account.payouts_enabled) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Both charges and payouts disabled',
      action: 'Account likely needs identity verification or business documents'
    });
  } else if (account.charges_enabled && !account.payouts_enabled) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Payouts disabled but charges enabled',
      action: 'Usually means bank account verification or additional ID documents needed'
    });
  }
  
  if (requirements.pending_verification?.length > 0) {
    recommendations.push({
      priority: 'INFO',
      issue: 'Documents under review',
      items: requirements.pending_verification,
      action: 'Wait 1-7 business days for Stripe review, or contact support if longer'
    });
  }

  res.status(200).json({
    analysis,
    recommendations,
    debug_info: {
      timestamp: new Date().toISOString(),
      raw_requirements: requirements
    }
  });
}
