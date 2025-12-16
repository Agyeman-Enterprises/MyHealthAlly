/**
 * Patient-Facing UX Copy
 * Modular copy for signup, footers, modals, tooltips, and screens
 */

export const PatientFacingCopy = {
  /**
   * A. Signup / Onboarding Screen
   */
  onboarding: {
    title: 'Welcome to MyHealthAlly',
    description: `MyHealthAlly helps you stay connected with your care team by organizing your health information and making it easier to communicate, schedule follow-ups, and share records.`,
    features: [
      'Log symptoms, events, and updates',
      'Upload hospital or discharge paperwork',
      'Request appointments or refills',
      'Keep a personal health timeline',
    ],
    important: {
      title: 'Important:',
      text: 'MyHealthAlly is a coordination tool — not a medical provider.',
      callout: '👉 All medical decisions are made by your healthcare team.',
    },
    continueButton: 'Continue',
  },

  /**
   * B. Persistent Footer Disclaimer (Short)
   */
  footerDisclaimer: {
    text: 'MyHealthAlly does not provide medical advice or emergency services.',
    emergency: 'Always call 911 for emergencies.',
  },

  /**
   * C. Upload Screen (Docs / Images / Voice)
   */
  upload: {
    title: 'Share Health Information',
    description: `You may upload documents, photos, voice notes, or text to keep your care team informed.`,
    notes: [
      'Submissions are reviewed during business hours',
      'Uploading information does not guarantee immediate response',
      'All clinical decisions are made by licensed clinicians',
    ],
    emergencyWarning: '🚨 Do not use this feature for emergencies.',
  },

  /**
   * D. Medication Refill / Change Request Screen
   */
  medicationRequest: {
    title: 'Medication Requests',
    description: 'You may request medication refills or report medication changes here.',
    pleaseNote: 'Please note:',
    notes: [
      'Requests are reviewed by your care team',
      'Refills are not automatic',
      'Medication changes may require an appointment',
      'Processing may take time',
    ],
    warning: '👉 Do not stop or change medications unless instructed by your clinician.',
  },

  /**
   * E. Hospitalization Notification Screen
   */
  hospitalization: {
    title: 'Hospital Stay or ER Visit',
    description: 'If you were hospitalized or seen in the emergency room:',
    actions: [
      'Upload discharge paperwork if available',
      'Share updated medication lists',
      'Notify us so follow-up care can be arranged',
    ],
    nextSteps: 'Your care team will review this information and determine next steps.',
  },

  /**
   * F. Full Terms Page (UX Summary Intro)
   */
  termsSummary: {
    title: 'Using MyHealthAlly',
    description: 'By using MyHealthAlly, you understand that:',
    points: [
      'It supports communication and coordination',
      'It does not replace medical care',
      'Your care team makes all medical decisions',
    ],
    viewFullTerms: 'View Full Terms & Disclaimers',
  },

  /**
   * Emergency Guidance
   */
  emergency: {
    title: 'Medical Emergency',
    message: 'If you are experiencing a medical emergency, please call 911 immediately.',
    symptoms: [
      'Chest pain or pressure',
      'Difficulty breathing',
      'Severe allergic reactions',
      'Signs of stroke',
      'Severe trauma or injury',
      'Loss of consciousness',
      'Severe abdominal pain',
      'Suicidal thoughts or self-harm',
    ],
    call911: 'Call 911',
    doNotUse: 'Do not use MyHealthAlly for emergency situations.',
  },

  /**
   * Status Messages
   */
  status: {
    submittedForReview: 'Submitted for clinician review',
    underReview: 'Under Review',
    reviewPending: 'Review Pending',
    processing: 'Processing',
    completed: 'Completed',
  },
};
