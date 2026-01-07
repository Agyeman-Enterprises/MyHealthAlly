# Resend Email Service Setup

## Overview

MyHealthAlly uses **Resend** for sending transactional emails. This provides:
- Reliable email delivery
- Professional email templates
- Email tracking and analytics
- Automatic fallback (emails are optional, won't break functionality)

## Setup

### 1. Get Resend API Key

1. Sign up at [Resend](https://resend.com) (free tier available)
2. Create an API key
3. Verify your domain (for production)
4. Copy your API key

### 2. Add Environment Variables

Add to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Note:** `RESEND_FROM_EMAIL` is optional. If not set, defaults to `noreply@myhealthally.co`.

### 3. Verify Domain (Production)

For production, you need to:
1. Add your domain in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain ownership
4. Use verified domain in `RESEND_FROM_EMAIL`

## Current Email Features

### 1. Contact Form Notifications

When users submit the contact form:
- Email sent to support/admin
- Includes user info, subject, and message
- Reply-to set to user's email

### 2. Practice Registration Notifications

When practices register:
- Email sent to admin
- Includes practice details
- Triggers admin review workflow

## Email Service API

### Basic Email Sending

```typescript
import { sendEmail } from '@/lib/services/email-service';

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to MyHealthAlly</h1>',
  text: 'Welcome to MyHealthAlly',
});
```

### Contact Form Email

```typescript
import { sendContactFormEmail } from '@/lib/services/email-service';

await sendContactFormEmail({
  from: 'user@example.com',
  subject: 'Question about billing',
  message: 'I have a question...',
  userName: 'John Doe',
  patientId: 'patient-123',
});
```

### Practice Registration Email

```typescript
import { sendPracticeRegistrationEmail } from '@/lib/services/email-service';

await sendPracticeRegistrationEmail({
  practiceName: 'Acme Medical Center',
  practiceId: 'acme-001',
  registeredBy: 'admin@acme.com',
  email: 'contact@acme.com',
});
```

## Fallback Behavior

- **If Resend is not configured**: Emails are skipped, functionality continues normally
- **If email send fails**: Error is logged to server console/logs, but doesn't break the request
- **No hard failures**: All email sending is optional and graceful

### Error Notification

**When Resend fails, admins are automatically notified:**

1. **Email Notification** (if Resend is still working):
   - Admin receives email alert about the failure
   - Includes: email type, recipient, error message, timestamp
   - Sent to: `ADMIN_EMAIL` env var OR all users with `role='admin'` from database

2. **Database Logging** (fallback if email notification fails):
   - Failure logged to `contact_messages` table
   - Admins can review in admin dashboard
   - Includes full error context

3. **Console Logging**:
   - Errors logged to server console/logs
   - Visible in development console and production logs

**Configuration:**
- Set `ADMIN_EMAIL` in `.env.local` for primary admin notification
- Or ensure at least one user in database has `role='admin'`
- If neither is configured, falls back to `RESEND_FROM_EMAIL`

**Example `.env.local`:**
```env
ADMIN_EMAIL=admin@myhealthally.co
```

## Cost

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for development and small production deployments

**Paid Plans:**
- Start at $20/month for 50,000 emails
- Scales automatically

## Security

- **API Key**: Keep secure, never commit to git
- **Domain Verification**: Required for production
- **SPF/DKIM**: Automatically configured when domain is verified
- **No PII in logs**: Email addresses are not logged

## Testing

### Check if Resend is Available

```typescript
import { isResendAvailable } from '@/lib/services/email-service';

if (isResendAvailable()) {
  console.log('Resend is configured and ready');
} else {
  console.log('Resend not configured - emails will be skipped');
}
```

### Test Email Sending

1. Add `RESEND_API_KEY` to `.env.local`
2. Submit contact form or register practice
3. Check Resend dashboard for sent emails
4. Verify email delivery

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify API key is active in Resend dashboard
3. Check console logs for Resend errors
4. Verify domain is verified (for production)

### Email Delivery Issues

1. Check spam folder
2. Verify domain DNS records (SPF, DKIM)
3. Check Resend dashboard for delivery status
4. Review Resend logs for bounce/spam reports

## Future Email Features

Potential additions:
- Welcome emails for new users
- Password reset emails
- Appointment reminders
- Medication refill notifications
- Practice approval notifications
- Follow-up care reminders
