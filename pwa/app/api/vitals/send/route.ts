import { NextResponse } from 'next/server';
import { assertAttachedPatient } from '@/lib/server/assertAttachedPatient';
import { apiClient } from '@/lib/api/solopractice-client';

export async function POST(req: Request) {
  try {
    await assertAttachedPatient(); // 🔒 HARD GATE
    const body = await req.json();

    const { type, value, value2, unit, metadata } = body;

    if (!type || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields: type, value' }, { status: 400 });
    }

    // Build measurement value object
    const measurementValue: Record<string, unknown> = {
      value: typeof value === 'string' ? parseFloat(value) : value,
      unit: unit || '',
    };

    if (value2 !== undefined) {
      measurementValue['value2'] = typeof value2 === 'string' ? parseFloat(value2) : value2;
    }

    // Send to SoloPractice - recordMeasurement already has guard built-in
    // but we've already asserted attachment above, so this is safe
    const spResponse = await apiClient.recordMeasurement({
      type,
      value: measurementValue,
      source: 'manual',
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true, response: spResponse });
  } catch (error) {
    console.error('Error sending vitals to care team:', error);
    const message = error instanceof Error ? error.message : 'Failed to send vitals';
    
    // Check if it's an attachment error
    if (message.includes('not attached') || message.includes('No patient record')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

