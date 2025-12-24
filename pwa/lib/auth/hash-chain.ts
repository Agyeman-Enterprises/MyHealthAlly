/**
 * Hash Chain Utilities
 * SHA-256 hash chaining for audit events and attestations
 */

/**
 * Create canonical JSON (stable key ordering)
 */
export function createCanonicalJSON(obj: Record<string, any>): string {
  // Sort keys recursively
  const sorted = sortKeys(obj);
  return JSON.stringify(sorted, null, 0);
}

function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }

  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortKeys(obj[key]);
  }

  return sorted;
}

/**
 * Calculate SHA-256 hash of canonical JSON
 */
export async function calculateHash(data: Record<string, any>): Promise<string> {
  const canonical = createCanonicalJSON(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(canonical);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Create hash-chained audit event
 */
export async function createHashChainedEvent(
  eventType: string,
  entityType: string,
  entityId: string | null,
  eventData: Record<string, any>,
  previousHash: string | null
): Promise<{ hash: string; canonical: string }> {
  const canonicalData = {
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    event_data: eventData,
    previous_hash: previousHash,
    timestamp: new Date().toISOString(),
  };

  const canonical = createCanonicalJSON(canonicalData);
  const hash = await calculateHash(canonicalData);

  return { hash, canonical };
}

/**
 * Create attestation signature hash
 */
export async function createAttestationHash(
  noteId: string,
  clinicianId: string,
  attestationText: string,
  signatureData: Record<string, any>,
  previousHash: string | null
): Promise<{ hash: string; canonical: string }> {
  const canonicalData = {
    note_id: noteId,
    clinician_id: clinicianId,
    attestation_text: attestationText,
    signature_data: signatureData,
    previous_hash: previousHash,
    timestamp: new Date().toISOString(),
  };

  const canonical = createCanonicalJSON(canonicalData);
  const hash = await calculateHash(canonicalData);

  return { hash, canonical };
}

/**
 * Verify hash chain integrity
 */
export async function verifyHashChain(
  events: Array<{ hash: string; previous_hash: string | null; data: Record<string, any> }>
): Promise<{ valid: boolean; invalidIndex: number | null }> {
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    
    // Verify current event hash
    const calculatedHash = await calculateHash(event.data);
    if (calculatedHash !== event.hash) {
      return { valid: false, invalidIndex: i };
    }

    // Verify previous hash link (except first event)
    if (i > 0) {
      const previousEvent = events[i - 1];
      if (event.previous_hash !== previousEvent.hash) {
        return { valid: false, invalidIndex: i };
      }
    }
  }

  return { valid: true, invalidIndex: null };
}

