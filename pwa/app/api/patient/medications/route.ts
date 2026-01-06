import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { translateText } from '@/lib/utils/translate';

type MedicationPayload = {
  id?: string; // Solopractice medication ID (for tracking)
  solopractice_medication_id?: string; // Alternative field name
  patient_id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  ndc_code?: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  route?: string;
  schedule?: Record<string, unknown>;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_prn?: boolean;
  refills_remaining?: number;
  refills_total?: number; // Total number of refills prescribed
  last_refill_date?: string;
  days_supply?: number; // Days supply for calculating next refill due date
  pharmacy?: string;
  pharmacy_phone?: string;
  pharmacy_address?: string;
  instructions?: string;
  indication?: string;
  prescriber_id?: string;
  prescriber_name?: string;
  discontinued_at?: string;
  discontinued_reason?: string;
  action?: 'create' | 'update' | 'discontinue'; // Action type from Solopractice
};

/**
 * Calculate next refill due date based on last refill date and days supply
 */
function calculateNextRefillDueDate(
  lastRefillDate: string | undefined,
  daysSupply: number | undefined
): string | null {
  if (!lastRefillDate || !daysSupply) {
    return null;
  }

  try {
    const lastRefill = new Date(lastRefillDate);
    const nextDue = new Date(lastRefill);
    nextDue.setDate(nextDue.getDate() + daysSupply);
    const dateStr = nextDue.toISOString().split('T')[0];
    return dateStr || null; // Return as YYYY-MM-DD
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mha-signature');
    if (!env.INBOUND_WEBHOOK_SECRET || signature !== env.INBOUND_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = (await req.json()) as MedicationPayload;
    
    // Validate required fields
    if (!body?.patient_id || !body?.name || !body?.dosage || !body?.dosage_unit || !body?.frequency) {
      return new NextResponse('Invalid payload: missing required fields', { status: 400 });
    }

    if (!supabaseService) {
      return new NextResponse('Database service not available', { status: 500 });
    }

    // Check if patient exists and is registered in MHA
    const { data: patient, error: patientError } = await supabaseService
      .from('patients')
      .select('id, user_id, preferred_language, users(preferred_language)')
      .eq('id', body.patient_id)
      .single();

    if (patientError || !patient) {
      console.log(`Patient ${body.patient_id} not found in MHA - medication sync skipped`);
      return NextResponse.json({ 
        ok: false, 
        message: 'Patient not registered in MHA',
        patient_id: body.patient_id 
      });
    }

    // Get patient preferred language for translation
    const langFromPatient = (patient as { preferred_language?: string })?.preferred_language;
    const langFromUser = (patient as { users?: { preferred_language?: string } })?.users?.preferred_language;
    const preferredLang = langFromPatient || langFromUser || 'en';

    // Translate instructions if provided
    let translatedInstructions = body.instructions;
    if (body.instructions && preferredLang !== 'en') {
      try {
        const { translatedText } = await translateText(body.instructions, preferredLang);
        translatedInstructions = translatedText;
      } catch (err) {
        console.error('Error translating medication instructions:', err);
        // Continue with original instructions if translation fails
      }
    }

    // Check if medication already exists (by Solopractice ID or by patient + name + dosage)
    const solopracticeId = body.id || body.solopractice_medication_id;
    let existingMedication = null;

    if (solopracticeId) {
      // Try to find by Solopractice ID (if we store it)
      // For now, we'll match by patient_id + name + dosage as a fallback
      const { data: existing } = await supabaseService
        .from('medications')
        .select('id')
        .eq('patient_id', body.patient_id)
        .eq('name', body.name)
        .eq('dosage', body.dosage)
        .eq('dosage_unit', body.dosage_unit)
        .maybeSingle();
      
      existingMedication = existing;
    }

    // Calculate next refill due date
    const nextRefillDueDate = calculateNextRefillDueDate(
      body.last_refill_date,
      body.days_supply
    );

    // Prepare medication data
    const medicationData: Record<string, unknown> = {
      patient_id: body.patient_id,
      name: body.name,
      generic_name: body.generic_name || null,
      brand_name: body.brand_name || null,
      ndc_code: body.ndc_code || null,
      dosage: body.dosage,
      dosage_unit: body.dosage_unit,
      frequency: body.frequency,
      route: body.route || null,
      schedule: body.schedule || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      is_active: body.is_active !== undefined ? body.is_active : (body.action !== 'discontinue'),
      is_prn: body.is_prn || false,
      refills_remaining: body.refills_remaining !== undefined ? body.refills_remaining : null,
      last_refill_date: body.last_refill_date || null,
      days_supply: body.days_supply || null,
      next_refill_due_date: nextRefillDueDate,
      pharmacy: body.pharmacy || null,
      pharmacy_phone: body.pharmacy_phone || null,
      instructions: translatedInstructions || null,
      instructions_language: preferredLang,
      indication: body.indication || null,
      solopractice_medication_id: solopracticeId || null,
      updated_at: new Date().toISOString(),
    };

    // Handle discontinuation
    if (body.action === 'discontinue' || body.discontinued_at) {
      medicationData['is_active'] = false;
      medicationData['discontinued_at'] = body.discontinued_at || new Date().toISOString();
      medicationData['discontinued_reason'] = body.discontinued_reason || null;
    }

    // Handle prescriber
    if (body.prescriber_id) {
      medicationData['prescriber_id'] = body.prescriber_id;
    }

    // Upsert medication
    let result;
    if (existingMedication) {
      // Update existing medication
      const { data, error } = await supabaseService
        .from('medications')
        .update(medicationData)
        .eq('id', existingMedication.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating medication:', error);
        return new NextResponse(`Error updating medication: ${error.message}`, { status: 500 });
      }

      result = data;
    } else {
      // Create new medication
      const { data, error } = await supabaseService
        .from('medications')
        .insert({
          ...medicationData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating medication:', error);
        return new NextResponse(`Error creating medication: ${error.message}`, { status: 500 });
      }

      result = data;
    }

    // Store refill tracking information
    // We can add a separate table for refill tracking if needed, or store in medication metadata
    if (nextRefillDueDate || body.refills_remaining !== undefined) {
      // Optionally create/update a refill tracking record
      // For now, we'll store next_refill_due_date in a JSONB field or add it to the medication
      // Since the schema doesn't have next_refill_due_date, we'll calculate it on read
    }

    return NextResponse.json({ 
      ok: true, 
      medication_id: result.id,
      action: existingMedication ? 'updated' : 'created',
      next_refill_due_date: nextRefillDueDate,
      preferred_language: preferredLang,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process medication';
    console.error('Medication webhook error:', err);
    return new NextResponse(message, { status: 500 });
  }
}

