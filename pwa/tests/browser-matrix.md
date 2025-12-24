# Browser Matrix Test Checklist

## Test Environment Setup

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Test Scenarios

## 1. Authentication Tests

### Firefox-Specific
- [ ] Login with email/password
- [ ] Session persists after page refresh
- [ ] Session persists after browser restart
- [ ] Password autofill works
- [ ] Password manager (LastPass, 1Password) integration
- [ ] Token refresh on expiration
- [ ] Logout clears all tokens
- [ ] Private/Incognito mode works

### Cross-Browser
- [ ] Login works in all browsers
- [ ] Session restore works in all browsers
- [ ] Token rotation works in all browsers
- [ ] Cookie settings (SameSite, Secure) correct

## 2. Microphone Tests

### Permission Handling
- [ ] Permission prompt appears
- [ ] Permission granted works
- [ ] Permission denied shows error
- [ ] Permission revoked during recording shows error
- [ ] Permission can be re-requested

### Recording Functionality
- [ ] Can start recording
- [ ] Can stop recording
- [ ] Can pause/resume recording
- [ ] Audio level meter shows activity
- [ ] Recording works with multiple devices
- [ ] Device selection works
- [ ] Error handling for missing mic
- [ ] Error handling for mic in use
- [ ] Diagnostics panel shows correct info

### Browser-Specific
- [ ] Firefox: getUserMedia works
- [ ] Firefox: Audio format compatibility
- [ ] Chrome: getUserMedia works
- [ ] Safari: getUserMedia works (iOS)
- [ ] Edge: getUserMedia works

## 3. State Machine Tests

### Encounter State Machine
- [ ] Cannot start recording without stream
- [ ] Cannot create note without audio
- [ ] Cannot finalize without signed note
- [ ] All valid transitions work
- [ ] Invalid transitions are blocked

### Capture Session State Machine
- [ ] Cannot start recording without active stream
- [ ] All valid transitions work
- [ ] Invalid transitions are blocked
- [ ] Diagnostics update correctly

### Note State Machine
- [ ] Cannot sign without attestation
- [ ] Cannot finalize unsigned note
- [ ] Signed notes are immutable
- [ ] Amendments create new versions

### Export Job State Machine
- [ ] Cannot retry beyond max retries
- [ ] Retry count increments correctly
- [ ] All valid transitions work

## 4. Audit & Attestation Tests

### Hash Chaining
- [ ] Audit events are hash-chained
- [ ] Hash chain integrity can be verified
- [ ] Previous hash links correctly
- [ ] Canonical JSON is stable

### Attestations
- [ ] Attestation requires signature
- [ ] Attestation hash is calculated correctly
- [ ] Attestation links to previous
- [ ] Signed notes are immutable
- [ ] Amendments append-only

## 5. UI/UX Tests

### Error Handling
- [ ] Hard-stop error banners appear
- [ ] Error messages are clear
- [ ] Diagnostics panel is collapsible
- [ ] Diagnostic info is accurate

### Gating Rules
- [ ] No audio → no note (enforced)
- [ ] No sign → no finalize (enforced)
- [ ] UI reflects gating state

## 6. Performance Tests

- [ ] Audio level monitoring doesn't lag
- [ ] State transitions are instant
- [ ] Hash calculation is fast
- [ ] No memory leaks in recording

## 7. Security Tests

- [ ] Tokens stored securely
- [ ] Tokens cleared on logout
- [ ] Hash chain cannot be tampered
- [ ] Attestations cannot be forged
- [ ] Audit events are append-only

## Automated Test Scripts

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e
```

### Test Files
- `tests/state-machines.test.ts` - State machine transitions
- `tests/auth-firefox.test.ts` - Firefox auth fixes
- `tests/mic-diagnostics.test.ts` - Microphone diagnostics
- `tests/hash-chain.test.ts` - Hash chain integrity
- `tests/attestation.test.ts` - Attestation flow

