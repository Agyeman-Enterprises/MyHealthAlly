/**
 * Admin API: Process Monthly Overages
 * 
 * Manually trigger overage calculation and billing for all subscriptions
 * This is typically run automatically via cron, but can be triggered manually
 */

import { NextResponse } from 'next/server';
import { processMonthlyOverages } from '@/lib/services/overage-billing-automation';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Check authentication (admin only in production)
    const { user } = await getCurrentUserAndPatient();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check in production
    // For now, allow any authenticated user (dev mode)

    const result = await processMonthlyOverages();

    return NextResponse.json({
      success: true,
      processed: result.processed,
      totalOverageCents: result.totalOverageCents,
      totalOverageDollars: (result.totalOverageCents / 100).toFixed(2),
      errors: result.errors,
      message: `Processed ${result.processed} subscriptions with $${(result.totalOverageCents / 100).toFixed(2)} in overages`,
    });
  } catch (error) {
    console.error('Error processing overages:', error);
    const message = error instanceof Error ? error.message : 'Failed to process overages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
