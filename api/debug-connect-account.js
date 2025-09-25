import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    // Get comprehensive account details
    const account = await stripe.accounts.retrieve(accountId);

    // Get detailed requirements analysis
    const requirements = account.requirements;
    
    // Analyze specific restriction reasons
    const analysis = {
      account_id: account.id,
      created: new Date(account.created * 1000).toISOString(),
      country: account.country,
      type: account.type,
      business_type: account.business_type,
      
      // Core status
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      
      // Requirements breakdown
      currently_due: requirements.currently_due || [],
      eventually_due: requirements.eventually_due || [],
      past_due: requirements.past_due || [],
      pending_verification: requirements.pending_verification || [],
      
      // Restriction details
      disabled_reason: requirements.disabled_reason,
      restrictions: account.capabilities?.restrictions || {},
      
      // Capabilities status
      card_payments: account.capabilities?.card_payments,
      transfers: account.capabilities?.transfers,
      
      // Business profile
      business_profile: {
        mcc: account.business_profile?.mcc,
        name: account.business_profile?.name,
        product_description: account.business_profile?.product_description,
        support_email: account.business_profile?.support_email,
        url: account.business_profile?.url
      },
      
      // Individual details (if any)
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
      
      // External account (bank details)
      external_accounts_count: account.external_accounts?.data?.length || 0,
      has_bank_account: (account.external_accounts?.data?.length || 0) > 0,
      
      // Metadata
      metadata: account.metadata
    };

    // Provide specific recommendations
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

  } catch (error) {
    console.error('Error debugging Connect account:', error);
    res.status(500).json({ 
      error: 'Failed to debug Connect account',
      details: error.message 
    });
  }
}
