package com.agyeman.myhealthally.core.governance

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger

/**
 * Rule 10: No One-Size-Fits-All Medicine
 * 
 * MHA must always:
 * - Ask clarifying questions
 * - Flag uncertainty
 * - Escalate ambiguity
 * 
 * If MHA starts giving generic protocols, optimizing for speed over safety,
 * or reducing nuance → you are drifting toward harm.
 */
object UncertaintyFlags {
    
    /**
     * Flag uncertainty in AI response or clinical suggestion
     * 
     * This should be called whenever:
     * - AI output is ambiguous
     * - Clinical data is incomplete
     * - Multiple interpretations are possible
     * - Generic protocol would be inappropriate
     */
    suspend fun flagUncertainty(
        context: String,
        uncertaintyType: UncertaintyType,
        details: Map<String, Any>,
        auditLogger: AuditLogger
    ) {
        // Log uncertainty flag
        auditLogger.logPHIAccess(
            resource = "uncertainty_flags",
            action = "flagged",
            userId = null,
            patientId = details["patient_id"] as? String,
            details = mapOf(
                "uncertainty_type" to uncertaintyType.name,
                "context" to context,
                "details" to details.toString()
            )
        )
        
        Logger.w("Uncertainty", "Uncertainty flagged: ${uncertaintyType.name} in context: $context")
    }
    
    /**
     * Check if escalation is required due to uncertainty
     */
    fun requiresEscalation(uncertaintyType: UncertaintyType): Boolean {
        return when (uncertaintyType) {
            UncertaintyType.AMBIGUOUS_SYMPTOMS -> true
            UncertaintyType.INCOMPLETE_DATA -> true
            UncertaintyType.CONFLICTING_INFORMATION -> true
            UncertaintyType.HIGH_RISK_UNCERTAINTY -> true
            UncertaintyType.MULTIPLE_INTERPRETATIONS -> true
            UncertaintyType.GENERIC_PROTOCOL_INAPPROPRIATE -> true
            UncertaintyType.LOW_CONFIDENCE -> false  // May not require escalation
        }
    }
    
    /**
     * Get escalation prompt for uncertainty type
     */
    fun getEscalationPrompt(uncertaintyType: UncertaintyType): String {
        return when (uncertaintyType) {
            UncertaintyType.AMBIGUOUS_SYMPTOMS -> 
                "Your symptoms require clarification. Please contact your healthcare provider for evaluation."
            UncertaintyType.INCOMPLETE_DATA -> 
                "Additional information is needed. Please provide more details or contact your healthcare provider."
            UncertaintyType.CONFLICTING_INFORMATION -> 
                "There appears to be conflicting information. Please contact your healthcare provider to clarify."
            UncertaintyType.HIGH_RISK_UNCERTAINTY -> 
                "This situation requires immediate medical evaluation. Please contact your healthcare provider or seek emergency care if needed."
            UncertaintyType.MULTIPLE_INTERPRETATIONS -> 
                "This situation could have multiple interpretations. Please consult with your healthcare provider."
            UncertaintyType.GENERIC_PROTOCOL_INAPPROPRIATE -> 
                "A personalized approach is needed. Please consult with your healthcare provider for individualized care."
            UncertaintyType.LOW_CONFIDENCE -> 
                "The information provided may not be sufficient. Please consult with your healthcare provider."
        }
    }
}

/**
 * Uncertainty types
 */
enum class UncertaintyType {
    AMBIGUOUS_SYMPTOMS,              // Symptoms are ambiguous
    INCOMPLETE_DATA,                 // Data is incomplete
    CONFLICTING_INFORMATION,         // Information conflicts
    HIGH_RISK_UNCERTAINTY,           // High-risk situation with uncertainty
    MULTIPLE_INTERPRETATIONS,        // Multiple valid interpretations
    GENERIC_PROTOCOL_INAPPROPRIATE,  // Generic protocol would be inappropriate
    LOW_CONFIDENCE                   // Low confidence in assessment
}
