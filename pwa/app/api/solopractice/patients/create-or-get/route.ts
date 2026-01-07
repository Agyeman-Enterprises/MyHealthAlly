/**
 * SP Patient Creation/Retrieval Endpoint
 * 
 * Idempotent: if patient exists in SP, return existing spPatientId.
 * This is the ONLY place SP patient creation is allowed.
 */

import { NextResponse } from 'next/server';
import { getApiBaseUrlFromRequest } from '@/lib/utils/api-base-url';

// API key from environment (optional)
const SP_API_KEY = (process.env as Record<string, string | undefined>)['SOLOPRACTICE_API_KEY'] || '';

export async function POST(req: Request) {
  // Autoconfig API base URL from request headers
  const SP_BASE_URL = getApiBaseUrlFromRequest(req);
  try {
    const body = await req.json();

    // Minimal validation
    if (!body?.tenantPracticeId || !body?.mhaPatientId || !body?.mhaUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call SP backend (idempotent create-or-get)
    const spRes = await fetch(`${SP_BASE_URL}/api/portal/patients/create-or-get`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': SP_API_KEY ? `Bearer ${SP_API_KEY}` : '',
      },
      body: JSON.stringify(body),
    });

    if (!spRes.ok) {
      const text = await spRes.text().catch(() => '');
      return NextResponse.json(
        { error: `SoloPractice error: ${spRes.status} ${text}` },
        { status: 502 }
      );
    }

    const json = await spRes.json();
    if (!json?.spPatientId) {
      return NextResponse.json({ error: 'Missing spPatientId from SP' }, { status: 502 });
    }

    return NextResponse.json({ spPatientId: json.spPatientId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

