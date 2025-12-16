/**
 * Rule 6: Regulatory Shadow Mode
 * 
 * MHA must always be able to operate in:
 * - "Educational Mode" - No clinical claims
 * - "Clinical Support Mode" - With disclaimers
 * - "Non-medical Wellness Mode" - Wellness only
 */

export enum SystemMode {
  EDUCATIONAL = 'educational',
  CLINICAL_SUPPORT = 'clinical_support',
  WELLNESS_ONLY = 'wellness_only',
}

export enum ClinicalFeature {
  EDUCATIONAL_CONTENT = 'educational_content',
  CLINICAL_MESSAGING = 'clinical_messaging',
  VITAL_TRACKING = 'vital_tracking',
  MEDICATION_REFILLS = 'medication_refills',
  APPOINTMENT_SCHEDULING = 'appointment_scheduling',
  AI_SUGGESTIONS = 'ai_suggestions',
  EMERGENCY_ESCALATION = 'emergency_escalation',
}

const MODE_FEATURES: Record<SystemMode, Set<ClinicalFeature>> = {
  [SystemMode.EDUCATIONAL]: new Set([
    ClinicalFeature.EDUCATIONAL_CONTENT,
    ClinicalFeature.APPOINTMENT_SCHEDULING,
    ClinicalFeature.MEDICATION_REFILLS,
  ]),
  [SystemMode.CLINICAL_SUPPORT]: new Set([
    ClinicalFeature.EDUCATIONAL_CONTENT,
    ClinicalFeature.CLINICAL_MESSAGING,
    ClinicalFeature.VITAL_TRACKING,
    ClinicalFeature.MEDICATION_REFILLS,
    ClinicalFeature.APPOINTMENT_SCHEDULING,
    ClinicalFeature.AI_SUGGESTIONS,
    ClinicalFeature.EMERGENCY_ESCALATION,
  ]),
  [SystemMode.WELLNESS_ONLY]: new Set([
    ClinicalFeature.EDUCATIONAL_CONTENT,
    ClinicalFeature.APPOINTMENT_SCHEDULING,
  ]),
};

export function isFeatureAllowed(mode: SystemMode, feature: ClinicalFeature): boolean {
  return MODE_FEATURES[mode]?.has(feature) ?? false;
}

export function getModeDisclaimer(mode: SystemMode): string {
  switch (mode) {
    case SystemMode.EDUCATIONAL:
      return `MyHealth Ally is operating in Educational Mode. All information provided is for educational purposes only and does not constitute medical advice. Please consult with your healthcare provider for medical decisions.`;
    case SystemMode.CLINICAL_SUPPORT:
      return `MyHealth Ally provides clinical support tools to assist you in navigating your healthcare. MyHealth Ally is not your doctor and does not provide medical diagnosis, treatment, or prescriptions. Always consult with your healthcare provider for medical decisions.`;
    case SystemMode.WELLNESS_ONLY:
      return `MyHealth Ally is operating in Wellness Mode. This mode provides general wellness information only and does not address medical conditions or provide clinical support. For medical concerns, please consult with your healthcare provider.`;
  }
}
