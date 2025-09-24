import nodemailer from 'nodemailer';

// Email templates
const getWelcomeTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to BeachVibe!</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb;">Welcome to BeachVibe!</h1>
    </div>
    
    <div style="background-color: #2563eb; padding: 30px; border-radius: 10px; color: white; text-align: center;">
        <h2 style="margin: 0 0 20px 0;">Hello ${data.firstName}!</h2>
        <p style="font-size: 18px; margin: 0;">Welcome to the ultimate beach bar experience!</p>
    </div>
    
    <div style="margin: 30px 0;">
        <h3 style="color: #2563eb;">What's Next?</h3>
        <ul style="line-height: 1.6;">
            <li>Discover amazing beach bars near you</li>
            <li>Book sunbeds and umbrellas in advance</li>
            <li>Order drinks and food with QR codes</li>
            <li>Rate and review your experiences</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://yourdomain.com/search" style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Exploring</a>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Thanks for joining BeachVibe!</p>
        <p>Questions? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
  `;
};

const getBookingTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation - BeachVibe</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb;">Booking Confirmed!</h1>
    </div>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin-top: 0;">Hello ${data.firstName} ${data.lastName}!</h2>
        <p>Your beach spot has been successfully reserved. Here are your booking details:</p>
    </div>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #2563eb; margin-top: 0;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Beach Bar:</td>
                <td style="padding: 8px 0;">${data.barName}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0;">${data.bookingDate}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0;">${data.bookingTime}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Spot:</td>
                <td style="padding: 8px 0;">${data.spotType} ${data.spotNumber}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Total:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">$${data.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0; font-family: monospace;">${data.bookingId}</td>
            </tr>
        </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://yourdomain.com/booking-history" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking</a>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>Pro Tip:</strong> Show this email or your booking ID at the beach bar for easy check-in!</p>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Questions about your booking? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
  `;
};

const getDeletionTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Deleted - BeachVibe</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626;">Account Deleted</h1>
    </div>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #dc2626; margin-top: 0;">Goodbye ${data.firstName} ${data.lastName}</h2>
        <p>Your BeachVibe account has been successfully deleted on ${data.deletionDate}.</p>
    </div>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #dc2626; margin-top: 0;">What was deleted:</h3>
        <ul style="line-height: 1.6;">
            <li>Your account profile and personal information</li>
            <li>All booking history and preferences</li>
            <li>Favorite beach bars and reviews</li>
            <li>Payment information and transaction history</li>
        </ul>
    </div>
    
    <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;"><strong>Note:</strong> This action cannot be undone. If you change your mind, you'll need to create a new account.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://yourdomain.com/auth" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Create New Account</a>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for using BeachVibe!</p>
        <p>Questions? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
  `;
};

// Email API Handler for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shahwaizn933@gmail.com',
        pass: 'zarkwdkhplqmiubf',
      },
    });

    let mailOptions = {};
    const fromEmail = 'shahwaizn933@gmail.com';
    const fromName = 'BeachVibe';

    switch (type) {
      case 'welcome':
        mailOptions = {
          from: `${fromName} <${fromEmail}>`,
          to: data.email,
          subject: `Welcome to BeachVibe, ${data.firstName}!`,
          html: getWelcomeTemplate(data),
        };
        break;
      
      case 'booking':
        mailOptions = {
          from: `${fromName} <${fromEmail}>`,
          to: data.email,
          subject: `Booking Confirmed - ${data.barName} on ${data.bookingDate}`,
          html: getBookingTemplate(data),
        };
        break;
      
      case 'account_deletion':
        mailOptions = {
          from: `${fromName} <${fromEmail}>`,
          to: data.email,
          subject: `Account Deleted - BeachVibe`,
          html: getDeletionTemplate(data),
        };
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${data.email}`);
    res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

