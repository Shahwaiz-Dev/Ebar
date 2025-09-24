import { useState } from 'react';

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

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (type: string, data: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Email sending failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
    return sendEmail('welcome', data);
  };

  const sendBookingConfirmationEmail = async (data: BookingEmailData): Promise<boolean> => {
    return sendEmail('booking', data);
  };

  const sendAccountDeletionEmail = async (data: AccountDeletionEmailData): Promise<boolean> => {
    return sendEmail('account_deletion', data);
  };

  const sendBarVerificationEmail = async (data: BarVerificationEmailData): Promise<boolean> => {
    return sendEmail('bar_verification', data);
  };

  return {
    isLoading,
    sendWelcomeEmail,
    sendBookingConfirmationEmail,
    sendAccountDeletionEmail,
    sendBarVerificationEmail,
    sendEmail,
  };
};

