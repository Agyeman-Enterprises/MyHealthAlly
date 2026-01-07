/**
 * Email Service - Resend Integration
 * 
 * Handles sending emails via Resend API
 * Falls back gracefully if Resend is not configured
 */

import { env } from '@/lib/env';
import { supabaseService } from '@/lib/supabase/service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let resendClient: any = null;
let useResend = false;

// Initialize Resend client if API key is available
if (env.RESEND_API_KEY) {
  try {
    // Dynamic import to avoid bundling in client-side code
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resend } = require('resend');
    resendClient = new Resend(env.RESEND_API_KEY);
    useResend = true;
    console.log('[Resend] Email service initialized');
  } catch (error) {
    console.warn('[Resend] Failed to initialize Resend client:', error);
    useResend = false;
  }
} else {
  console.log('[Resend] Resend API key not configured, email sending disabled');
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get admin email addresses for notifications
 */
async function getAdminEmails(): Promise<string[]> {
  const adminEmails: string[] = [];
  
  // First, try environment variable
  if (env.ADMIN_EMAIL) {
    adminEmails.push(env.ADMIN_EMAIL);
  }
  
  // Then, try to get from database
  if (supabaseService) {
    try {
      const { data: admins } = await supabaseService
        .from('users')
        .select('email')
        .eq('role', 'admin')
        .neq('status', 'suspended'); // Notify all admins except suspended ones
      
      if (admins) {
        for (const admin of admins) {
          if (admin.email && !adminEmails.includes(admin.email)) {
            adminEmails.push(admin.email);
          }
        }
      }
    } catch (error) {
      console.error('[Resend] Failed to fetch admin emails:', error);
    }
  }
  
  // Fallback to RESEND_FROM_EMAIL if no admins found
  if (adminEmails.length === 0 && env.RESEND_FROM_EMAIL) {
    adminEmails.push(env.RESEND_FROM_EMAIL);
  }
  
  return adminEmails;
}

/**
 * Log email failure to console with full context
 */
function logEmailFailureToConsole(
  emailType: string,
  recipient: string,
  error: string,
  context?: Record<string, unknown>
): void {
  const logData = {
    type: 'EMAIL_SEND_FAILURE',
    emailType,
    recipient,
    error,
    timestamp: new Date().toISOString(),
    ...context,
  };
  console.error('[Resend] Email failure details:', JSON.stringify(logData, null, 2));
}

/**
 * Notify admins about email failure
 * Uses a separate Resend attempt (might work if original failure was recipient-specific)
 */
async function notifyAdminOfEmailFailure(
  emailType: string,
  recipient: string,
  error: string
): Promise<void> {
  const adminEmails = await getAdminEmails();
  
  if (adminEmails.length === 0) {
    console.warn('[Resend] No admin emails configured - cannot send failure notification');
    return;
  }
  
  // Try to send notification via Resend (might work if original failure was recipient-specific)
  if (useResend && resendClient) {
    try {
      const notificationHtml = `
        <h2>⚠️ Email Send Failure Alert</h2>
        <p><strong>Email Type:</strong> ${emailType}</p>
        <p><strong>Intended Recipient:</strong> ${recipient}</p>
        <p><strong>Error:</strong> ${error}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><small>This is an automated notification from MyHealthAlly email service.</small></p>
      `;
      
      const result = await resendClient.emails.send({
        from: env.RESEND_FROM_EMAIL || 'noreply@myhealthally.co',
        to: adminEmails,
        subject: `[ALERT] Email Send Failed: ${emailType}`,
        html: notificationHtml,
        tags: [
          { name: 'category', value: 'system-alert' },
          { name: 'alert-type', value: 'email-failure' },
        ],
      });
      
      if (result.error) {
        // If Resend notification also fails, log detailed error
        console.error('[Resend] Failed to notify admin via email:', result.error);
        logEmailFailureToConsole(emailType, recipient, error, { 
          notificationAttempt: 'failed',
          notificationError: result.error.message 
        });
      } else {
        console.log('[Resend] Admin notified of email failure via email');
      }
    } catch (notifyError) {
      // If notification attempt throws, log detailed error
      console.error('[Resend] Exception notifying admin:', notifyError);
      logEmailFailureToConsole(emailType, recipient, error, { 
        notificationAttempt: 'exception',
        notificationError: notifyError instanceof Error ? notifyError.message : 'Unknown error'
      });
    }
  } else {
    // Resend not available, log detailed error
    logEmailFailureToConsole(emailType, recipient, error, { 
      notificationAttempt: 'skipped',
      reason: 'Resend not configured'
    });
  }
}

/**
 * Send email via Resend
 * Returns success status and message ID if successful
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!useResend || !resendClient) {
    console.warn('[Resend] Email sending skipped - Resend not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const fromEmail = options.from || env.RESEND_FROM_EMAIL || 'noreply@myhealthally.co';
    
    const result = await resendClient.emails.send({
      from: fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
      tags: options.tags,
    });

    if (result.error) {
      console.error('[Resend] Email send error:', result.error);
      const errorMessage = result.error.message || 'Failed to send email';
      
      // Notify admin of failure (async, don't await to avoid blocking)
      notifyAdminOfEmailFailure(
        options.subject || 'Unknown',
        Array.isArray(options.to) ? options.to.join(', ') : options.to,
        errorMessage
      ).catch(err => {
        console.error('[Resend] Failed to notify admin:', err);
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('[Resend] Email send exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error sending email';
    
    // Notify admin of failure (async, don't await to avoid blocking)
    notifyAdminOfEmailFailure(
      options.subject || 'Unknown',
      Array.isArray(options.to) ? options.to.join(', ') : options.to,
      errorMessage
    ).catch(err => {
      console.error('[Resend] Failed to notify admin:', err);
    });
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send contact form notification email
 */
export async function sendContactFormEmail(data: {
  from: string;
  subject: string;
  message: string;
  userName?: string;
  patientId?: string;
}): Promise<SendEmailResult> {
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${data.from}${data.userName ? ` (${data.userName})` : ''}</p>
    ${data.patientId ? `<p><strong>Patient ID:</strong> ${data.patientId}</p>` : ''}
    <p><strong>Subject:</strong> ${data.subject}</p>
    <hr>
    <p><strong>Message:</strong></p>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
  `;

  const text = `
New Contact Form Submission

From: ${data.from}${data.userName ? ` (${data.userName})` : ''}
${data.patientId ? `Patient ID: ${data.patientId}\n` : ''}
Subject: ${data.subject}

Message:
${data.message}
  `;

  return sendEmail({
    to: env.RESEND_FROM_EMAIL || 'support@myhealthally.co',
    from: env.RESEND_FROM_EMAIL || 'noreply@myhealthally.co',
    subject: `Contact Form: ${data.subject}`,
    html,
    text,
    replyTo: data.from,
    tags: [
      { name: 'category', value: 'contact-form' },
      ...(data.patientId ? [{ name: 'patient-id', value: data.patientId }] : []),
    ],
  });
}

/**
 * Send practice registration notification email
 */
export async function sendPracticeRegistrationEmail(data: {
  practiceName: string;
  practiceId: string;
  registeredBy: string;
  email?: string;
}): Promise<SendEmailResult> {
  const html = `
    <h2>New Practice Registration</h2>
    <p><strong>Practice Name:</strong> ${data.practiceName}</p>
    <p><strong>Practice ID:</strong> ${data.practiceId}</p>
    <p><strong>Registered By:</strong> ${data.registeredBy}</p>
    ${data.email ? `<p><strong>Contact Email:</strong> ${data.email}</p>` : ''}
    <p>Please review and approve this practice registration in the admin panel.</p>
  `;

  return sendEmail({
    to: env.RESEND_FROM_EMAIL || 'admin@myhealthally.co',
    from: env.RESEND_FROM_EMAIL || 'noreply@myhealthally.co',
    subject: `New Practice Registration: ${data.practiceName}`,
    html,
    tags: [
      { name: 'category', value: 'practice-registration' },
      { name: 'practice-id', value: data.practiceId },
    ],
  });
}

/**
 * Check if Resend is available
 */
export function isResendAvailable(): boolean {
  return useResend && resendClient !== null;
}
