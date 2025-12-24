/**
 * State Machine Tests
 * Automated tests for state machine transitions and guards
 */

import {
  createEncounterStateMachine,
  createCaptureSessionStateMachine,
  createNoteStateMachine,
  createExportJobStateMachine,
} from '../lib/state-machines/reducers';

describe('Encounter State Machine', () => {
  it('should start in DRAFT state', () => {
    const sm = createEncounterStateMachine('DRAFT');
    expect(sm.state).toBe('DRAFT');
  });

  it('should transition SCHEDULE -> SCHEDULED', () => {
    const sm = createEncounterStateMachine('DRAFT');
    sm.transition('SCHEDULE');
    expect(sm.state).toBe('SCHEDULED');
  });

  it('should block invalid transitions', () => {
    const sm = createEncounterStateMachine('DRAFT');
    expect(() => sm.transition('FINALIZE')).toThrow();
  });

  it('should enforce gating: cannot start recording without stream', () => {
    const sm = createEncounterStateMachine('IN_PROGRESS');
    expect(() => sm.transition('START_RECORDING', { streamActive: false })).toThrow(
      'Cannot start recording: Audio stream not active'
    );
  });

  it('should enforce gating: cannot create note without audio', () => {
    const sm = createEncounterStateMachine('TRANSCRIBING');
    sm.transition('TRANSCRIBE_COMPLETE', { hasAudio: false });
    expect(() => sm.transition('CREATE_NOTE', { hasAudio: false })).toThrow(
      'Cannot create note: No audio recorded'
    );
  });

  it('should enforce gating: cannot finalize without signed note', () => {
    const sm = createEncounterStateMachine('NOTE_DRAFT');
    expect(() => sm.transition('FINALIZE')).toThrow(
      'Cannot finalize: Note must be signed first'
    );
  });
});

describe('Capture Session State Machine', () => {
  it('should start in IDLE state', () => {
    const sm = createCaptureSessionStateMachine('IDLE');
    expect(sm.state).toBe('IDLE');
  });

  it('should transition through recording flow', () => {
    const sm = createCaptureSessionStateMachine('IDLE');
    sm.transition('INITIALIZE');
    expect(sm.state).toBe('INITIALIZING');
    
    sm.transition('STREAM_READY');
    expect(sm.state).toBe('STREAM_ACTIVE');
    expect(sm.getDiagnostics().streamActive).toBe(true);
    
    sm.transition('START_RECORDING');
    expect(sm.state).toBe('RECORDING');
    expect(sm.getDiagnostics().recordingActive).toBe(true);
    
    sm.transition('STOP');
    expect(sm.state).toBe('STOPPING');
    
    sm.transition('PROCESS');
    expect(sm.state).toBe('PROCESSING');
    
    sm.transition('COMPLETE');
    expect(sm.state).toBe('COMPLETE');
  });

  it('should block recording without active stream', () => {
    const sm = createCaptureSessionStateMachine('IDLE');
    sm.transition('INITIALIZE');
    expect(() => sm.transition('START_RECORDING')).toThrow(
      'Cannot start recording: Stream not active'
    );
  });

  it('should capture diagnostics on failure', () => {
    const sm = createCaptureSessionStateMachine('RECORDING');
    sm.transition('FAIL', { error: 'Test error', code: 'TEST_ERROR', message: 'Test message' });
    
    const diagnostics = sm.getDiagnostics();
    expect(diagnostics.error).toBe('Test error');
    expect(diagnostics.lastError?.code).toBe('TEST_ERROR');
    expect(diagnostics.streamActive).toBe(false);
    expect(diagnostics.recordingActive).toBe(false);
  });
});

describe('Note State Machine', () => {
  it('should start in DRAFT state', () => {
    const sm = createNoteStateMachine('DRAFT');
    expect(sm.state).toBe('DRAFT');
  });

  it('should transition through note lifecycle', () => {
    const sm = createNoteStateMachine('DRAFT');
    sm.transition('AUTO_SAVE');
    expect(sm.state).toBe('AUTO_SAVED');
    
    sm.transition('SUBMIT');
    expect(sm.state).toBe('SUBMITTED');
    
    sm.transition('REVIEW');
    expect(sm.state).toBe('UNDER_REVIEW');
    expect(sm.requiresAttestation()).toBe(true);
    
    sm.transition('SIGN', { attestation: true });
    expect(sm.state).toBe('SIGNED');
    expect(sm.isImmutable()).toBe(true);
    
    sm.transition('FINALIZE');
    expect(sm.state).toBe('FINALIZED');
  });

  it('should enforce gating: cannot sign without attestation', () => {
    const sm = createNoteStateMachine('UNDER_REVIEW');
    expect(() => sm.transition('SIGN', { attestation: false })).toThrow(
      'Cannot sign note: Attestation required'
    );
  });

  it('should enforce gating: cannot finalize unsigned note', () => {
    const sm = createNoteStateMachine('SUBMITTED');
    expect(() => sm.transition('FINALIZE')).toThrow(
      'Cannot finalize: Note must be signed first'
    );
  });
});

describe('Export Job State Machine', () => {
  it('should start in PENDING state', () => {
    const sm = createExportJobStateMachine('PENDING');
    expect(sm.state).toBe('PENDING');
  });

  it('should transition through export flow', () => {
    const sm = createExportJobStateMachine('PENDING');
    sm.transition('QUEUE');
    expect(sm.state).toBe('QUEUED');
    
    sm.transition('START');
    expect(sm.state).toBe('PROCESSING');
    
    sm.transition('COMPLETE');
    expect(sm.state).toBe('COMPLETED');
  });

  it('should allow retry on failure', () => {
    const sm = createExportJobStateMachine('PROCESSING');
    sm.transition('FAIL');
    expect(sm.state).toBe('FAILED');
    expect(sm.canRetry()).toBe(true);
    
    sm.transition('RETRY');
    expect(sm.state).toBe('RETRYING');
    expect(sm.getRetryCount()).toBe(1);
  });

  it('should block retry after max retries', () => {
    const sm = createExportJobStateMachine('FAILED');
    sm.transition('RETRY'); // 1
    sm.transition('QUEUE');
    sm.transition('START');
    sm.transition('FAIL');
    sm.transition('RETRY'); // 2
    sm.transition('QUEUE');
    sm.transition('START');
    sm.transition('FAIL');
    sm.transition('RETRY'); // 3
    sm.transition('QUEUE');
    sm.transition('START');
    sm.transition('FAIL');
    
    expect(sm.canRetry()).toBe(false);
    expect(() => sm.transition('RETRY')).toThrow(
      'Cannot retry: Maximum retry count (3) exceeded'
    );
  });
});

