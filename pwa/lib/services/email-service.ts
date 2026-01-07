/**
 * Email Service - Resend Integration
 * 
 * Handles sending emails via Resend API
 * Falls back gracefully if Resend is not configured
 */

import { env } from '@/lib/env';

let resendClient: any = null;
let useResend = false;

// Initialize Resend client if API key is available
if (env.RESEND_API_KEY) {
  try {
    // Dynamic import to avoid bundling in client-side code
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
    const fromEmail = options.from || env.RESEND_FROM_EMAIL || 'noreply@myhealthally.com';
    
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
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('[Resend] Email send exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
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
    to: env.RESEND_FROM_EMAIL || 'support@myhealthally.com',
    from: env.RESEND_FROM_EMAIL || 'noreply@myhealthally.com',
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
    to: env.RESEND_FROM_EMAIL || 'admin@myhealthally.com',
    from: env.RESEND_FROM_EMAIL || 'noreply@myhealthally.com',
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
