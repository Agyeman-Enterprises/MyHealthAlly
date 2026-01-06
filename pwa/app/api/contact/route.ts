import { NextResponse } from 'next/server';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';
import { supabase } from '@/lib/supabase/client';

/**
 * Contact form submission endpoint
 * Saves contact messages to database for support team to review
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Get user info
    const { userRecord, patientId } = await getCurrentUserAndPatient();
    
    // Save contact message to database
    // In production, this could also send an email notification
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        user_id: userRecord.id,
        patient_id: patientId || null,
        subject,
        message,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving contact message:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We will respond within 1-2 business days.',
      id: data.id,
    });
  } catch (err) {
    console.error('Error processing contact form:', err);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
