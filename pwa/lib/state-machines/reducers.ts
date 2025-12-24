/**
 * State Machine Reducers
 * Explicit transition logic with guards
 */

import {
  EncounterState,
  EncounterEvent,
  EncounterStateMachine,
  CaptureSessionState,
  CaptureSessionEvent,
  CaptureSessionStateMachine,
  CaptureSessionDiagnostics,
  NoteState,
  NoteEvent,
  NoteStateMachine,
  ExportJobState,
  ExportJobEvent,
  ExportJobStateMachine,
} from './types';

// ============================================
// ENCOUNTER STATE MACHINE
// ============================================

const ENCOUNTER_TRANSITIONS: Record<EncounterState, EncounterEvent[]> = {
  DRAFT: ['SCHEDULE', 'CANCEL'],
  SCHEDULED: ['CHECK_IN', 'CANCEL'],
  CHECKED_IN: ['START', 'CANCEL'],
  IN_PROGRESS: ['START_RECORDING', 'CANCEL'],
  RECORDING: ['STOP_RECORDING', 'CANCEL'],
  TRANSCRIBING: ['TRANSCRIBE_COMPLETE', 'CANCEL'],
  NOTE_DRAFT: ['CREATE_NOTE', 'SUBMIT_NOTE', 'CANCEL'],
  NOTE_REVIEW: ['SIGN_NOTE', 'CANCEL'],
  NOTE_SIGNED: ['FINALIZE'],
  FINALIZED: [],
  CANCELLED: [],
};

const ENCOUNTER_STATE_MAP: Record<EncounterEvent, EncounterState> = {
  SCHEDULE: 'SCHEDULED',
  CHECK_IN: 'CHECKED_IN',
  START: 'IN_PROGRESS',
  START_RECORDING: 'RECORDING',
  STOP_RECORDING: 'TRANSCRIBING',
  START_TRANSCRIBE: 'TRANSCRIBING',
  TRANSCRIBE_COMPLETE: 'NOTE_DRAFT',
  CREATE_NOTE: 'NOTE_DRAFT',
  SUBMIT_NOTE: 'NOTE_REVIEW',
  SIGN_NOTE: 'NOTE_SIGNED',
  FINALIZE: 'FINALIZED',
  CANCEL: 'CANCELLED',
};

export function createEncounterStateMachine(
  initialState: EncounterState = 'DRAFT'
): EncounterStateMachine {
  let state = initialState;

  return {
    get state() {
      return state;
    },

    canTransition(event: EncounterEvent): boolean {
      const validEvents = ENCOUNTER_TRANSITIONS[state] || [];
      return validEvents.includes(event);
    },

    transition(event: EncounterEvent, context?: Record<string, any>): EncounterState {
      if (!this.canTransition(event)) {
        throw new Error(
          `Invalid transition: Cannot ${event} from ${state}. Valid transitions: ${ENCOUNTER_TRANSITIONS[state].join(', ')}`
        );
      }

      // Guard: Cannot start recording without stream
      if (event === 'START_RECORDING' && !context?.streamActive) {
        throw new Error('Cannot start recording: Audio stream not active');
      }

      // Guard: Cannot create note without audio
      if (event === 'CREATE_NOTE' && !context?.hasAudio) {
        throw new Error('Cannot create note: No audio recorded');
      }

      // Guard: Cannot finalize without signed note
      if (event === 'FINALIZE' && state !== 'NOTE_SIGNED') {
        throw new Error('Cannot finalize: Note must be signed first');
      }

      state = ENCOUNTER_STATE_MAP[event];
      return state;
    },

    getValidTransitions(): EncounterEvent[] {
      return ENCOUNTER_TRANSITIONS[state] || [];
    },
  };
}

// ============================================
// CAPTURE SESSION STATE MACHINE
// ============================================

const CAPTURE_TRANSITIONS: Record<CaptureSessionState, CaptureSessionEvent[]> = {
  IDLE: ['INITIALIZE', 'ABORT'],
  INITIALIZING: ['STREAM_READY', 'FAIL', 'ABORT'],
  STREAM_ACTIVE: ['START_RECORDING', 'FAIL', 'ABORT'],
  RECORDING: ['PAUSE', 'STOP', 'FAIL', 'ABORT'],
  PAUSED: ['RESUME', 'STOP', 'ABORT'],
  STOPPING: ['PROCESS', 'FAIL', 'ABORT'],
  PROCESSING: ['COMPLETE', 'FAIL', 'ABORT'],
  COMPLETE: [],
  FAILED: ['ABORT'],
  ABORTED: [],
};

const CAPTURE_STATE_MAP: Record<CaptureSessionEvent, CaptureSessionState> = {
  INITIALIZE: 'INITIALIZING',
  STREAM_READY: 'STREAM_ACTIVE',
  START_RECORDING: 'RECORDING',
  PAUSE: 'PAUSED',
  RESUME: 'RECORDING',
  STOP: 'STOPPING',
  PROCESS: 'PROCESSING',
  COMPLETE: 'COMPLETE',
  FAIL: 'FAILED',
  ABORT: 'ABORTED',
};

export function createCaptureSessionStateMachine(
  initialState: CaptureSessionState = 'IDLE'
): CaptureSessionStateMachine {
  let state = initialState;
  const diagnostics: CaptureSessionDiagnostics = {
    streamActive: false,
    recordingActive: false,
    audioLevel: 0,
    error: null,
    permissions: {
      microphone: 'prompt',
    },
    lastError: null,
  };

  return {
    get state() {
      return state;
    },

    canTransition(event: CaptureSessionEvent): boolean {
      const validEvents = CAPTURE_TRANSITIONS[state] || [];
      return validEvents.includes(event);
    },

    transition(event: CaptureSessionEvent, context?: Record<string, any>): CaptureSessionState {
      if (!this.canTransition(event)) {
        throw new Error(
          `Invalid transition: Cannot ${event} from ${state}. Valid transitions: ${CAPTURE_TRANSITIONS[state].join(', ')}`
        );
      }

      // Guard: Cannot start recording without active stream
      if (event === 'START_RECORDING' && !diagnostics.streamActive) {
        throw new Error('Cannot start recording: Stream not active');
      }

      // Update diagnostics
      if (event === 'STREAM_READY') {
        diagnostics.streamActive = true;
        diagnostics.permissions.microphone = 'granted';
      } else if (event === 'START_RECORDING') {
        diagnostics.recordingActive = true;
      } else if (event === 'STOP' || event === 'ABORT') {
        diagnostics.recordingActive = false;
      } else if (event === 'FAIL') {
        diagnostics.error = context?.error || 'Unknown error';
        diagnostics.lastError = {
          code: context?.code || 'UNKNOWN',
          message: context?.message || diagnostics.error,
          timestamp: new Date().toISOString(),
        };
        diagnostics.streamActive = false;
        diagnostics.recordingActive = false;
      }

      // Update audio level if provided
      if (context?.audioLevel !== undefined) {
        diagnostics.audioLevel = context.audioLevel;
      }

      state = CAPTURE_STATE_MAP[event];
      return state;
    },

    getValidTransitions(): CaptureSessionEvent[] {
      return CAPTURE_TRANSITIONS[state] || [];
    },

    getDiagnostics(): CaptureSessionDiagnostics {
      return { ...diagnostics };
    },
  };
}

// ============================================
// NOTE STATE MACHINE
// ============================================

const NOTE_TRANSITIONS: Record<NoteState, NoteEvent[]> = {
  DRAFT: ['AUTO_SAVE', 'SUBMIT', 'LOCK'],
  AUTO_SAVED: ['AUTO_SAVE', 'SUBMIT', 'LOCK'],
  SUBMITTED: ['REVIEW', 'LOCK'],
  UNDER_REVIEW: ['SIGN', 'AMEND', 'LOCK'],
  SIGNED: ['FINALIZE', 'AMEND'],
  AMENDED: ['SIGN', 'FINALIZE'],
  FINALIZED: [],
  LOCKED: [],
};

const NOTE_STATE_MAP: Record<NoteEvent, NoteState> = {
  AUTO_SAVE: 'AUTO_SAVED',
  SUBMIT: 'SUBMITTED',
  REVIEW: 'UNDER_REVIEW',
  SIGN: 'SIGNED',
  AMEND: 'AMENDED',
  FINALIZE: 'FINALIZED',
  LOCK: 'LOCKED',
};

export function createNoteStateMachine(initialState: NoteState = 'DRAFT'): NoteStateMachine {
  let state = initialState;

  return {
    get state() {
      return state;
    },

    canTransition(event: NoteEvent): boolean {
      const validEvents = NOTE_TRANSITIONS[state] || [];
      return validEvents.includes(event);
    },

    transition(event: NoteEvent, context?: Record<string, any>): NoteState {
      if (!this.canTransition(event)) {
        throw new Error(
          `Invalid transition: Cannot ${event} from ${state}. Valid transitions: ${NOTE_TRANSITIONS[state].join(', ')}`
        );
      }

      // Guard: Cannot sign without attestation
      if (event === 'SIGN' && !context?.attestation) {
        throw new Error('Cannot sign note: Attestation required');
      }

      // Guard: Cannot finalize unsigned note
      if (event === 'FINALIZE' && state !== 'SIGNED' && state !== 'AMENDED') {
        throw new Error('Cannot finalize: Note must be signed first');
      }

      state = NOTE_STATE_MAP[event];
      return state;
    },

    getValidTransitions(): NoteEvent[] {
      return NOTE_TRANSITIONS[state] || [];
    },

    requiresAttestation(): boolean {
      return state === 'UNDER_REVIEW' || state === 'AMENDED';
    },

    isImmutable(): boolean {
      return state === 'SIGNED' || state === 'FINALIZED' || state === 'LOCKED';
    },
  };
}

// ============================================
// EXPORT JOB STATE MACHINE
// ============================================

const EXPORT_TRANSITIONS: Record<ExportJobState, ExportJobEvent[]> = {
  PENDING: ['QUEUE', 'CANCEL'],
  QUEUED: ['START', 'CANCEL'],
  PROCESSING: ['PROGRESS', 'COMPLETE', 'FAIL', 'CANCEL'],
  COMPLETED: [],
  FAILED: ['RETRY', 'CANCEL'],
  CANCELLED: [],
  RETRYING: ['QUEUE', 'CANCEL'],
};

const EXPORT_STATE_MAP: Record<ExportJobEvent, ExportJobState> = {
  QUEUE: 'QUEUED',
  START: 'PROCESSING',
  PROGRESS: 'PROCESSING',
  COMPLETE: 'COMPLETED',
  FAIL: 'FAILED',
  CANCEL: 'CANCELLED',
  RETRY: 'RETRYING',
};

export function createExportJobStateMachine(
  initialState: ExportJobState = 'PENDING'
): ExportJobStateMachine {
  let state = initialState;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  return {
    get state() {
      return state;
    },

    canTransition(event: ExportJobEvent): boolean {
      const validEvents = EXPORT_TRANSITIONS[state] || [];
      return validEvents.includes(event);
    },

    transition(event: ExportJobEvent, context?: Record<string, any>): ExportJobState {
      if (!this.canTransition(event)) {
        throw new Error(
          `Invalid transition: Cannot ${event} from ${state}. Valid transitions: ${EXPORT_TRANSITIONS[state].join(', ')}`
        );
      }

      // Guard: Cannot retry if max retries exceeded
      if (event === 'RETRY' && retryCount >= MAX_RETRIES) {
        throw new Error(`Cannot retry: Maximum retry count (${MAX_RETRIES}) exceeded`);
      }

      if (event === 'RETRY') {
        retryCount++;
        state = 'RETRYING';
      } else {
        state = EXPORT_STATE_MAP[event];
      }

      return state;
    },

    getValidTransitions(): ExportJobEvent[] {
      return EXPORT_TRANSITIONS[state] || [];
    },

    canRetry(): boolean {
      return state === 'FAILED' && retryCount < MAX_RETRIES;
    },

    getRetryCount(): number {
      return retryCount;
    },
  };
}

