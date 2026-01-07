/**
 * Practice Registration Email Notification
 * 
 * Sends email notification when a practice registers
 */

import { NextResponse } from 'next/server';
import { sendPracticeRegistrationEmail } from '@/lib/services/email-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { practiceName, practiceId, registeredBy, email } = body;

    if (!practiceName || !practiceId || !registeredBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendPracticeRegistrationEmail({
      practiceName,
      practiceId,
      registeredBy,
      email,
    });

    if (!result.success) {
      console.error('Failed to send practice registration email:', result.error);
      // Don't fail the request - email is optional
      return NextResponse.json({
        success: false,
        warning: 'Practice registered but email notification failed',
        error: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error('Error sending practice registration email:', err);
    // Don't fail - email is optional
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
