// src/lib/emailService.ts
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: 'shahwaizn933@gmail.com',
      pass: 'zarkwdkhplqmiubf', // App Password for Gmail
    },
  });
};

export interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface BookingEmailData {
  firstName: string;
  lastName: string;
  email: string;
  barName: string;
  barLocation: string;
  bookingDate: string;
  bookingTime: string;
  spotType: string;
  spotNumber: string;
  totalAmount: number;
  bookingId: string;
  qrCodeUrl?: string;
}

export interface AccountDeletionEmailData {
  firstName: string;
  lastName: string;
  email: string;
  deletionDate: string;
}

export interface BarVerificationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  barName: string;
  barLocation: string;
  isApproved: boolean;
  rejectionReason?: string;
}

// Email templates
const getWelcomeEmailTemplate = (data: WelcomeEmailData) => {
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
        <a href="https://ebar.vercel.app/search" style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Exploring</a>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Thanks for joining BeachVibe!</p>
        <p>Questions? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
  `;
};

const getBookingConfirmationTemplate = (data: BookingEmailData) => {
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
                <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">€{data.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0; font-family: monospace;">${data.bookingId}</td>
            </tr>
        </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://ebar.vercel.app/booking-history" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking</a>
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

const getAccountDeletionTemplate = (data: AccountDeletionEmailData) => {
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
        <a href="https://ebar.vercel.app/auth" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Create New Account</a>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for using BeachVibe!</p>
        <p>Questions? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
  `;
};

const getBarVerificationTemplate = (data: BarVerificationEmailData) => {
  if (data.isApproved) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bar Verified - BeachVibe</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a;">🎉 Bar Verified!</h1>
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #16a34a; margin-top: 0;">Congratulations ${data.firstName}!</h2>
        <p>Your beach bar "<strong>${data.barName}</strong>" in ${data.barLocation} has been successfully verified and is now live on BeachVibe!</p>
    </div>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #16a34a; margin-top: 0;">What's Next?</h3>
        <ul style="line-height: 1.6;">
            <li>Your bar is now visible to customers on our platform</li>
            <li>Customers can start making bookings and orders</li>
            <li>You can manage your bar settings in your dashboard</li>
            <li>Set up Stripe Connect for payment processing</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://ebar.vercel.app/dashboard" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Your Bar</a>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for joining BeachVibe!</p>
        <p>Questions? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
    `;
  } else {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bar Verification Update - BeachVibe</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626;">Bar Verification Update</h1>
    </div>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #dc2626; margin-top: 0;">Hello ${data.firstName}</h2>
        <p>We've reviewed your beach bar "<strong>${data.barName}</strong>" in ${data.barLocation} and need some additional information before we can approve it.</p>
    </div>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #dc2626; margin-top: 0;">Required Changes:</h3>
        <p style="line-height: 1.6;">${data.rejectionReason || 'Please review your bar information and ensure all details are accurate and complete.'}</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;"><strong>Next Steps:</strong> Please update your bar information and resubmit for verification.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://ebar.vercel.app/dashboard" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Update Bar Information</a>
    </div>
    
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Questions? Contact us at support@beachvibe.com</p>
    </div>
</body>
</html>
    `;
  }
};

class EmailService {
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = 'shahwaizn933@gmail.com';
    this.fromName = 'BeachVibe';
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.email,
        subject: `Welcome to BeachVibe, ${data.firstName}!`,
        html: getWelcomeEmailTemplate(data),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${data.email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.email,
        subject: `Booking Confirmed - ${data.barName} on ${data.bookingDate}`,
        html: getBookingConfirmationTemplate(data),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Booking confirmation email sent successfully to ${data.email}`);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return false;
    }
  }

  async sendAccountDeletionEmail(data: AccountDeletionEmailData): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.email,
        subject: `Account Deleted - BeachVibe`,
        html: getAccountDeletionTemplate(data),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Account deletion email sent successfully to ${data.email}`);
      return true;
    } catch (error) {
      console.error('Error sending account deletion email:', error);
      return false;
    }
  }

  async sendBarVerificationEmail(data: BarVerificationEmailData): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const subject = data.isApproved 
        ? `🎉 Your bar "${data.barName}" has been verified!`
        : `Bar verification update for "${data.barName}"`;
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: `${data.firstName} ${data.lastName} <${data.email}>`,
        subject: subject,
        html: getBarVerificationTemplate(data),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Bar verification email sent successfully to ${data.email}`);
      return true;
    } catch (error) {
      console.error('Error sending bar verification email:', error);
      return false;
    }
  }

  // Generic method to send emails
  async sendEmail(
    to: string,
    toName: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: `${toName} <${to}>`,
        subject: subject,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();