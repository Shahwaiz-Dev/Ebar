import { emailService, WelcomeEmailData, BookingEmailData, AccountDeletionEmailData } from '@/lib/emailService';

// Welcome Email API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  try {
    let success = false;

    switch (type) {
      case 'welcome':
        success = await emailService.sendWelcomeEmail(data as WelcomeEmailData);
        break;
      
      case 'booking':
        success = await emailService.sendBookingConfirmationEmail(data as BookingEmailData);
        break;
      
      case 'account_deletion':
        success = await emailService.sendAccountDeletionEmail(data as AccountDeletionEmailData);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    if (success) {
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

