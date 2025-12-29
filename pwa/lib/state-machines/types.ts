/**
 * State Machine Types
 * Explicit state machines for Encounter, CaptureSession, Note, ExportJob
 * All transitions are guarded and validated
 */

// ============================================
// ENCOUNTER STATE MACHINE
// ============================================

export type EncounterState =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'NOTE_DRAFT'
  | 'NOTE_REVIEW'
  | 'NOTE_SIGNED'
  | 'FINALIZED'
  | 'CANCELLED';

export type EncounterEvent =
  | 'SCHEDULE'
  | 'CHECK_IN'
  | 'START'
  | 'START_RECORDING'
  | 'STOP_RECORDING'
  | 'START_TRANSCRIBE'
  | 'TRANSCRIBE_COMPLETE'
  | 'CREATE_NOTE'
  | 'SUBMIT_NOTE'
  | 'SIGN_NOTE'
  | 'FINALIZE'
  | 'CANCEL';

export interface EncounterStateMachine {
  state: EncounterState;
  canTransition(event: EncounterEvent): boolean;
  transition(event: EncounterEvent, context?: Record<string, unknown>): EncounterState;
  getValidTransitions(): EncounterEvent[];
}

// ============================================
// CAPTURE SESSION STATE MACHINE
// ============================================

export type CaptureSessionState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'STREAM_ACTIVE'
  | 'RECORDING'
  | 'PAUSED'
  | 'STOPPING'
  | 'PROCESSING'
  | 'COMPLETE'
  | 'FAILED'
  | 'ABORTED';

export type CaptureSessionEvent =
  | 'INITIALIZE'
  | 'STREAM_READY'
  | 'START_RECORDING'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'PROCESS'
  | 'COMPLETE'
  | 'FAIL'
  | 'ABORT';

export interface CaptureSessionStateMachine {
  state: CaptureSessionState;
  canTransition(event: CaptureSessionEvent): boolean;
  transition(event: CaptureSessionEvent, context?: Record<string, unknown>): CaptureSessionState;
  getValidTransitions(): CaptureSessionEvent[];
  getDiagnostics(): CaptureSessionDiagnostics;
}

export interface CaptureSessionDiagnostics {
  streamActive: boolean;
  recordingActive: boolean;
  audioLevel: number;
  error: string | null;
  permissions: {
    microphone: 'granted' | 'denied' | 'prompt';
  };
  lastError: {
    code: string;
    message: string;
    timestamp: string;
  } | null;
}

// ============================================
// NOTE STATE MACHINE
// ============================================

export type NoteState =
  | 'DRAFT'
  | 'AUTO_SAVED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SIGNED'
  | 'AMENDED'
  | 'FINALIZED'
  | 'LOCKED';

export type NoteEvent =
  | 'AUTO_SAVE'
  | 'SUBMIT'
  | 'REVIEW'
  | 'SIGN'
  | 'AMEND'
  | 'FINALIZE'
  | 'LOCK';

export interface NoteStateMachine {
  state: NoteState;
  canTransition(event: NoteEvent): boolean;
  transition(event: NoteEvent, context?: Record<string, unknown>): NoteState;
  getValidTransitions(): NoteEvent[];
  requiresAttestation(): boolean;
  isImmutable(): boolean;
}

// ============================================
// EXPORT JOB STATE MACHINE
// ============================================

export type ExportJobState =
  | 'PENDING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RETRYING';

export type ExportJobEvent =
  | 'QUEUE'
  | 'START'
  | 'PROGRESS'
  | 'COMPLETE'
  | 'FAIL'
  | 'CANCEL'
  | 'RETRY';

export interface ExportJobStateMachine {
  state: ExportJobState;
  canTransition(event: ExportJobEvent): boolean;
  transition(event: ExportJobEvent, context?: Record<string, unknown>): ExportJobState;
  getValidTransitions(): ExportJobEvent[];
  canRetry(): boolean;
  getRetryCount(): number;
}

