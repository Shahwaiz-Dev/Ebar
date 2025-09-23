# Nodemailer Setup Guide

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=BeachVibe
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password as `EMAIL_PASS`

### Step 3: Update Environment Variables
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
FROM_EMAIL=your-gmail@gmail.com
FROM_NAME=BeachVibe
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
FROM_EMAIL=your-email@outlook.com
FROM_NAME=BeachVibe
```

### Custom SMTP
```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
FROM_EMAIL=your-email@yourdomain.com
FROM_NAME=BeachVibe
```

## Vercel Deployment

### Step 1: Add Environment Variables
```bash
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add FROM_EMAIL
vercel env add FROM_NAME
```

### Step 2: Deploy
```bash
vercel --prod
```

## Testing

### Test Email Sending
```javascript
// Test in your app
const testEmail = async () => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
        },
      }),
    });
    
    const result = await response.json();
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
};
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure EMAIL_USER is correct

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP settings
   - Try different port (587, 465, 25)

3. **Email Not Delivered**
   - Check spam folder
   - Verify FROM_EMAIL is valid
   - Check email provider limits

### Debug Mode
Add this to your email service for debugging:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Enable debug mode
  logger: true, // Enable logging
});
```

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service for production
- Regularly rotate app passwords
- Monitor email sending limits and quotas
