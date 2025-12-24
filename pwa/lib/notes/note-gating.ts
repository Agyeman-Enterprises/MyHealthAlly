/**
 * Note Gating Rules
 * Enforces: No audio → No note
 */

export interface NoteGatingContext {
  hasAudio: boolean;
  audioValidated: boolean;
  captureSessionId: string | null;
  transcriptId: string | null;
}

/**
 * Check if note can be created
 * Hard-stop: Cannot create note without validated audio
 */
export function canCreateNote(context: NoteGatingContext): { allowed: boolean; reason?: string } {
  if (!context.hasAudio) {
    return {
      allowed: false,
      reason: 'Cannot create note: No audio recorded. Please record audio first.',
    };
  }

  if (!context.audioValidated) {
    return {
      allowed: false,
      reason: 'Cannot create note: Audio not validated. Please ensure recording completed successfully.',
    };
  }

  return { allowed: true };
}

/**
 * Check if note can be signed
 * Hard-stop: Cannot sign without attestation
 */
export function canSignNote(hasAttestation: boolean): { allowed: boolean; reason?: string } {
  if (!hasAttestation) {
    return {
      allowed: false,
      reason: 'Cannot sign note: Attestation required. Please complete attestation first.',
    };
  }

  return { allowed: true };
}

/**
 * Check if encounter can be finalized
 * Hard-stop: Cannot finalize without signed note
 */
export function canFinalizeEncounter(noteState: string): { allowed: boolean; reason?: string } {
  if (noteState !== 'SIGNED' && noteState !== 'AMENDED') {
    return {
      allowed: false,
      reason: 'Cannot finalize encounter: Note must be signed first.',
    };
  }

  return { allowed: true };
}

