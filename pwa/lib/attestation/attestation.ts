/**
 * Attestation System
 * Digital signatures with hash chaining for medico-legal compliance
 */

import { createAttestationHash } from '../auth/hash-chain';
import { supabase } from '../supabase/client';

export interface AttestationRequest {
  noteId: string;
  clinicianId: string;
  attestationText: string;
  signatureData: {
    clinicianName: string;
    credentials: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface AttestationResponse {
  id: string;
  signatureHash: string;
  signedAt: string;
}

/**
 * Create attestation for a note
 * Requires: Note must be in UNDER_REVIEW or AMENDED state
 */
export async function createAttestation(
  request: AttestationRequest
): Promise<AttestationResponse> {
  // Get previous attestation hash for this note
  const { data: previousAttestation } = await supabase
    .from('attestations')
    .select('signature_hash')
    .eq('note_id', request.noteId)
    .order('signed_at', { ascending: false })
    .limit(1)
    .single();

  const previousHash = previousAttestation?.signature_hash || null;

  // Create hash
  const { hash, canonical } = await createAttestationHash(
    request.noteId,
    request.clinicianId,
    request.attestationText,
    request.signatureData,
    previousHash
  );

  // Store attestation via database function
  const { data, error } = await supabase.rpc('create_attestation', {
    p_note_id: request.noteId,
    p_clinician_id: request.clinicianId,
    p_attestation_text: request.attestationText,
    p_signature_data: request.signatureData,
  });

  if (error) {
    throw new Error(`Failed to create attestation: ${error.message}`);
  }

  // Update note state to SIGNED
  const { error: noteError } = await supabase
    .from('notes')
    .update({ state: 'SIGNED', signed_at: new Date().toISOString() })
    .eq('id', request.noteId);

  if (noteError) {
    throw new Error(`Failed to update note state: ${noteError.message}`);
  }

  return {
    id: data,
    signatureHash: hash,
    signedAt: new Date().toISOString(),
  };
}

/**
 * Verify attestation chain integrity
 */
export async function verifyAttestationChain(noteId: string): Promise<{
  valid: boolean;
  invalidIndex: number | null;
  attestations: Array<{ id: string; hash: string; previousHash: string | null }>;
}> {
  const { data: attestations, error } = await supabase
    .from('attestations')
    .select('id, signature_hash, previous_attestation_hash')
    .eq('note_id', noteId)
    .order('signed_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch attestations: ${error.message}`);
  }

  // Verify hash chain
  for (let i = 0; i < attestations.length; i++) {
    const att = attestations[i];
    
    // First attestation should have null previous hash
    if (i === 0 && att.previous_attestation_hash !== null) {
      return { valid: false, invalidIndex: i, attestations };
    }

    // Subsequent attestations should link to previous
    if (i > 0) {
      const previous = attestations[i - 1];
      if (att.previous_attestation_hash !== previous.signature_hash) {
        return { valid: false, invalidIndex: i, attestations };
      }
    }
  }

  return { valid: true, invalidIndex: null, attestations };
}

/**
 * Default attestation text
 */
export const DEFAULT_ATTESTATION_TEXT = `I attest that I have reviewed and agree with the above note. This note accurately reflects the patient encounter and my clinical assessment.`;

