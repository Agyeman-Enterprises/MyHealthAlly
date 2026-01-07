/**
 * SoloPractice Messages API Proxy
 * GET /api/portal/messages/threads
 * 
 * Proxies message thread requests to SoloPractice backend
 * All CG rules (R1-R12) enforced server-side by SoloPractice
 */

import { NextResponse } from 'next/server';
import { assertAttachedPatient } from '@/lib/server/assertAttachedPatient';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Ensure user is authenticated and has patient attached
    await assertAttachedPatient(); // 🔒 HARD GATE

    // Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - no session' },
        { status: 401 }
      );
    }

    // Get SoloPractice backend URL
    // NOTE: This should point to the SoloPractice backend server, not the Next.js server
    // In production, set NEXT_PUBLIC_API_BASE_URL to your SoloPractice backend URL
    const SP_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL || process.env['SOLOPRACTICE_BASE_URL'] || 'http://localhost:8000';
    
    // Prevent proxy loop - if SP_BASE_URL points to this server, return error
    if (typeof window === 'undefined' && SP_BASE_URL.includes('localhost:3000')) {
      return NextResponse.json(
        { error: 'SoloPractice backend URL not configured. Set NEXT_PUBLIC_API_BASE_URL or SOLOPRACTICE_BASE_URL to your SoloPractice backend URL.' },
        { status: 500 }
      );
    }
    
    // Proxy request to SoloPractice backend
    const spRes = await fetch(`${SP_BASE_URL}/api/portal/messages/threads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!spRes.ok) {
      const text = await spRes.text().catch(() => '');
      return NextResponse.json(
        { error: `SoloPractice error: ${spRes.status} ${text}` },
        { status: spRes.status }
      );
    }

    const threads = await spRes.json();
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching message threads:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch threads';
    
    // Check if it's an auth error
    if (message.includes('Unauthorized') || message.includes('not attached')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
