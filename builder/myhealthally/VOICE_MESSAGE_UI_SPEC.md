# Voice Message UI/UX Specification

**Version:** 1.0  
**Component Set:** Voice Messaging System  
**Target:** Patient Portal (MyHealthAlly)  
**Status:** ✅ Complete & Ready for Implementation  

---

## Overview

Complete UI/UX design for voice message recording, management, and playback in the patient portal. Includes biometric authentication, real-time recording interface, multilingual transcript support, and secure audio access.

---

## Components

### 1. BiometricUnlock Component
**Location:** `client/components/BiometricUnlock.tsx` (119 lines)

Provides toggle settings for Face ID and Fingerprint authentication.

**Features:**
- Face ID toggle with icon
- Fingerprint toggle with icon
- Password confirmation fallback when enabled
- Password visibility toggle
- Confirm/Cancel buttons
- Status indicators (Enabled/Not enabled)

**Usage:**
```tsx
import BiometricUnlock from "@/components/BiometricUnlock";

export default function Settings() {
  return <BiometricUnlock />;
}
```

**Props:** None (internal state management)

**Styling:**
- Teal accent for icons
- Emerald for fingerprint section
- Toggle switches with smooth animations
- Hover states on settings items

---

### 2. RecordButton Component
**Location:** `client/components/RecordButton.tsx` (66 lines)

Large circular red button for initiating voice recordings.

**Features:**
- Large circular button (96px diameter)
- Red color (#E53935 primary, #DC2626 hover)
- White microphone icon
- Stop button (square icon) during recording
- Label below button
- Pulsing animation when recording
- Hover scale effect

**Usage:**
```tsx
import RecordButton from "@/components/RecordButton";

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <RecordButton
      isRecording={isRecording}
      onRecordStart={() => setIsRecording(true)}
      onRecordStop={() => setIsRecording(false)}
    />
  );
}
```

**Props:**
- `isRecording?: boolean` - Controls button state
- `onRecordStart?: () => void` - Called when recording starts
- `onRecordStop?: () => void` - Called when recording stops

**Styling:**
- Base color: `#E53935` (red-600)
- Hover color: `#DC2626` (red-700)
- Pulsing rings animation during recording
- Scale animation on hover and click

---

### 3. RecordingState Component
**Location:** `client/components/RecordingState.tsx` (113 lines)

Full-screen modal showing active recording state with timer and waveform animation.

**Features:**
- Modal overlay with dark background
- Recording icon with pulsing animation
- Timer (MM:SS format)
- Animated waveform visualization (20 bars)
- Recording tips/info box
- Stop Recording button (primary, red)
- Cancel button (secondary)

**Usage:**
```tsx
import RecordingState from "@/components/RecordingState";

const [isRecording, setIsRecording] = useState(false);
const [recordTime, setRecordTime] = useState(0);

return (
  <>
    <RecordingState
      isRecording={isRecording}
      onStop={() => {
        setIsRecording(false);
        // Handle stop
      }}
      onCancel={() => {
        setIsRecording(false);
        // Handle cancel
      }}
    />
  </>
);
```

**Props:**
- `isRecording: boolean` - Show/hide recording modal
- `onStop?: () => void` - Called when stop button clicked
- `onCancel?: () => void` - Called when cancel button clicked

**Design Details:**
- Waveform animation with keyframe wave animation
- 20 vertical bars with random heights
- Staggered animation delays for wave effect
- Large 4xl timer display
- Info box with recording tips

---

### 4. RecordingConfirmation Component
**Location:** `client/components/RecordingConfirmation.tsx` (148 lines)

Modal showing post-recording confirmation with processing state and summary.

**Features:**
- Two-state UI: Processing → Success
- Processing state with animated spinner
- Success state with checkmark icon
- Recording duration summary
- Transcript preview
- Send/Re-record/Discard buttons
- AI summary notice

**Usage:**
```tsx
import RecordingConfirmation from "@/components/RecordingConfirmation";

const [showConfirmation, setShowConfirmation] = useState(false);

return (
  <RecordingConfirmation
    isOpen={showConfirmation}
    duration={105} // seconds
    transcript="Sample transcript..."
    onSave={() => {
      // Send message
      setShowConfirmation(false);
    }}
    onRetry={() => {
      // Start new recording
      setShowConfirmation(false);
    }}
    onDiscard={() => {
      // Delete recording
      setShowConfirmation(false);
    }}
  />
);
```

**Props:**
- `duration: number` - Recording length in seconds
- `transcript?: string` - Transcript preview text
- `onSave?: () => void` - Send button action
- `onRetry?: () => void` - Re-record button action
- `onDiscard?: () => void` - Delete button action

**States:**
1. **Processing:**
   - Spinning mic icon
   - "Processing your recording" heading
   - Transcription progress indicator
   - Recording duration display

2. **Success:**
   - Green checkmark icon
   - "Message ready!" heading
   - Recording summary card
   - Transcript preview (1-2 lines)
   - AI summary coming notice
   - Three action buttons

---

## Pages

### 5. VoiceMessages Page
**Location:** `client/pages/VoiceMessages.tsx` (154 lines)

Patient's voice message inbox listing all recorded messages.

**Features:**
- PatientLayout wrapper with nav
- Header with icon and description
- Empty state when no messages
- Message list cards with:
  - Date, time, duration
  - Transcript preview (2 lines truncated)
  - AI summary badge (if available)
  - Processing status badge
  - Reviewed status indicator
- Hover effects with shadow increase

**Usage:**
```tsx
import VoiceMessages from "@/pages/VoiceMessages";

// In App.tsx routes:
<Route path="/voice-messages" element={<VoiceMessages />} />
```

**Navigation:**
- Sidebar nav item: "Voice Messages" → `/voice-messages`
- Click message card �� `/voice-messages/:id`
- Empty state button → `/dashboard`

**Empty State:**
- Large message icon
- "No messages yet" heading
- Instruction text with link to dashboard
- CTA button to record first message

**Message Card Contents:**
```
🎤 Voice Message | Date • Time
"Transcript preview text that is truncated to two lines..."
🎵 1:45 | ✨ AI summary | ✓ Reviewed
```

---

### 6. VoiceMessageDetail Page
**Location:** `client/pages/VoiceMessageDetail.tsx` (228 lines)

Detailed view of a single voice message with full transcript, AI summary, and audio playback.

**Features:**
- PatientLayout wrapper
- Back button to message list
- Header with message badge and timestamp
- Review status indicator
- Full transcript section with:
  - Multi-language tabs (English, Español, Français)
  - Full text in selected language
  - Word count display
- AI Summary section (if available)
  - Sparkle icon
  - Summary text
  - Generation note
- Original audio section with:
  - Description
  - "Play original audio recording" button
  - Privacy modal on click

**Usage:**
```tsx
import VoiceMessageDetail from "@/pages/VoiceMessageDetail";

// In App.tsx routes:
<Route path="/voice-messages/:id" element={<VoiceMessageDetail />} />
```

**Multilingual Support:**
```
Language tabs:
- English (default)
- Español
- Français

Transcripts stored per language and displayed based on selection.
```

**Audio Access Modal:**
- Title: "Sensitive audio"
- Description about privacy protection
- "Play audio" button (primary)
- "Cancel" button (secondary)
- Logged access for security

---

## Design System Integration

### Colors
```
Red (Recording):    #E53935 / #DC2626
Teal (Primary):     #2BA39B / #0D8B7C
Amber (Audio):      #F59E0B / #D97706
Green (Success):    #10B981 / #059669
Slate (Neutral):    #64748B - #1E293B
```

### Typography
- **Headers:** Bold, Slate-900, 28-36px
- **Labels:** Medium, Slate-900, 14-16px
- **Body:** Regular, Slate-600, 14px
- **Small:** Regular, Slate-500, 12px

### Spacing
- Modal padding: 32px (8 × 4)
- Card padding: 24px (6 × 4)
- Section gaps: 24px (6 × 4)
- Button padding: 12px vertical × 16px horizontal

### Border Radius
- Buttons: 8px (rounded-lg)
- Cards: 12px (rounded-xl)
- Modals: 16px (rounded-2xl)
- Small elements: 6px (rounded)

---

## Interaction Flows

### Recording Flow
```
1. User clicks Record Button
   ↓
2. RecordingState modal opens with timer
   ↓
3. User speaks (waveform animates)
   ↓
4. User clicks "Stop Recording" or waits for timeout
   ↓
5. RecordingConfirmation modal shows
   ↓
6a. User clicks "Send Message" → Message saved, confirmation shown
6b. User clicks "Re-record" → Back to RecordingState
6c. User clicks "Discard" → Closes modals, returns to dashboard
```

### Viewing Message Flow
```
1. User visits `/voice-messages`
   ↓
2. Views list of all recordings
   ↓
3. Clicks a message card
   ↓
4. Opens `/voice-messages/:id`
   ↓
5. Sees full transcript (default language)
   ↓
6a. User can change language tabs to view other transcripts
6b. User can scroll to see AI summary
6c. User can click "Play original audio recording"
   ↓
7. Audio access modal confirms privacy/compliance
   ↓
8. User can listen or cancel
```

---

## Accessibility Features

### Keyboard Navigation
- All buttons accessible via Tab
- Enter/Space to activate buttons
- Escape to close modals
- Language tabs focusable

### Screen Reader Support
- Semantic HTML (button, heading, section elements)
- Aria labels on icons
- Modal roles properly marked
- Status updates announced

### Visual Accessibility
- High color contrast (WCAG AA)
- Red used with icons, not sole identifier
- Text resizable up to 200%
- No flashing animations (respects prefers-reduced-motion)

---

## Mobile Responsiveness

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adjustments
- **Mobile:**
  - Full-width modals with max-width
  - Touch targets ≥ 44px
  - Stacked layout on small screens
  - Language tabs scroll horizontally if needed

- **Tablet:**
  - Side-by-side layout for transcript + summary
  - Larger touch targets

- **Desktop:**
  - Optimal reading width (max-w-4xl)
  - Full feature set available

---

## Internationalization (i18n)

### Supported Languages
1. English (default)
2. Spanish (Español)
3. French (Français)
4. Can be extended to more languages

### Text Considerations
- Transcript lengths vary by language
- German/Dutch text ~20% longer than English
- Truncation must handle different lengths
- Line clamping set to 2 lines for preview

### Implementation
```tsx
const transcripts = {
  english: "English text...",
  spanish: "Texto en español...",
  french: "Texte en français...",
};

// Display selected language
{transcripts[selectedLanguage]}
```

---

## State Management

### Component State
- `isRecording`: Boolean
- `selectedLanguage`: String (language code)
- `audioModalOpen`: Boolean
- `recordTime`: Number (seconds)

### Props Flow
```
Dashboard
├── RecordButton (state: isRecording)
├── RecordingState (isRecording)
└── RecordingConfirmation (duration, transcript)

VoiceMessages
└── Message list (map over messages array)

VoiceMessageDetail
├── Language selector (selectedLanguage)
├── Transcript display (filtered by language)
├── Audio button (audioModalOpen)
└── AudioAccessModal
```

---

## Implementation Checklist

### Components
- [x] BiometricUnlock.tsx
- [x] RecordButton.tsx
- [x] RecordingState.tsx
- [x] RecordingConfirmation.tsx

### Pages
- [x] VoiceMessages.tsx
- [x] VoiceMessageDetail.tsx

### Integration
- [x] Add to PatientNav sidebar
- [x] Add routes to App.tsx
- [x] Add to PatientSettings page

### Testing
- [ ] Recording starts/stops correctly
- [ ] Timer counts up accurately
- [ ] Waveform animation smooth
- [ ] Multilingual tabs switch properly
- [ ] Audio modal displays correctly
- [ ] Mobile responsive on all breakpoints
- [ ] All buttons clickable and functional
- [ ] No console errors

---

## Future Enhancements

### Phase 2
- Real audio recording (MediaRecorder API)
- Audio file storage
- Waveform visualization from actual audio
- Real transcription service integration
- AI summary generation

### Phase 3
- Voice message templates
- Scheduled recording reminders
- Voice message sharing with multiple providers
- Recording analytics
- Voice message search

### Phase 4
- Real-time collaboration (clinician can comment on recording)
- Voice message reactions/voting
- Integration with clinical workflows
- Advanced audio processing (noise reduction)

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Mobile: Android 10+

---

## Performance Notes

- Modal components render on-demand
- Waveform animation uses CSS keyframes (GPU accelerated)
- List virtualization recommended for 100+ messages
- Lazy load transcripts for large records
- Cache language tabs to prevent re-renders

---

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| BiometricUnlock.tsx | 119 | Biometric auth settings |
| RecordButton.tsx | 66 | Record button UI |
| RecordingState.tsx | 113 | Recording modal interface |
| RecordingConfirmation.tsx | 148 | Post-recording confirmation |
| VoiceMessages.tsx | 154 | Message list page |
| VoiceMessageDetail.tsx | 228 | Message detail & view |
| **Total** | **828** | **Complete voice system** |

---

**Status:** ✅ **COMPLETE & READY FOR CURSOR INTEGRATION**

All components are styled, responsive, and ready for API integration. No backend dependencies - components handle UI state independently.
