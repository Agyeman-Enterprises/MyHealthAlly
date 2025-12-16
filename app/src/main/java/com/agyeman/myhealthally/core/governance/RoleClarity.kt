package com.agyeman.myhealthally.core.governance

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.util.Date

/**
 * Rule 4: Radical Role Clarity
 * 
 * MHA must always declare:
 * "I am not your doctor. I assist you in understanding and navigating care."
 * 
 * Every interface must:
 * - Reinforce human-in-the-loop
 * - Require clinician confirmation
 * - Log user acknowledgment
 */
object RoleClarity {
    
    /**
     * Standard disclaimer text that must appear on all clinical interfaces
     */
    const val STANDARD_DISCLAIMER = """
        MyHealth Ally is a patient engagement platform that assists you in understanding 
        and navigating your healthcare. MyHealth Ally is not your doctor and does not 
        provide medical diagnosis, treatment, or prescriptions. Always consult with your 
        healthcare provider for medical decisions.
    """.trimIndent()
    
    /**
     * Emergency disclaimer - shown when emergency symptoms detected
     */
    const val EMERGENCY_DISCLAIMER = """
        If you are experiencing a medical emergency, please call 911 immediately. 
        MyHealth Ally cannot provide emergency medical care.
    """.trimIndent()
    
    /**
     * AI advisory disclaimer - shown with AI-generated content
     */
    const val AI_ADVISORY_DISCLAIMER = """
        The information provided is for educational purposes only and is not a substitute 
        for professional medical advice. All clinical decisions must be made by your 
        healthcare provider.
    """.trimIndent()
    
    /**
     * Log user acknowledgment of disclaimer
     * 
     * This must be called whenever a user acknowledges a disclaimer
     */
    suspend fun logDisclaimerAcknowledgment(
        userId: String,
        patientId: String?,
        disclaimerType: DisclaimerType,
        context: String,
        auditLogger: AuditLogger
    ) {
        auditLogger.logPHIAccess(
            resource = "disclaimers",
            action = "acknowledged",
            userId = userId,
            patientId = patientId,
            details = mapOf(
                "disclaimer_type" to disclaimerType.name,
                "context" to context,
                "timestamp" to Date().toString()
            )
        )
        
        Logger.i("RoleClarity", "Disclaimer acknowledged: ${disclaimerType.name} by user $userId")
    }
    
    /**
     * Check if user has acknowledged required disclaimers
     * 
     * In production, this would check a database of acknowledgments
     */
    suspend fun hasAcknowledgedDisclaimers(
        userId: String,
        requiredTypes: List<DisclaimerType>
    ): Boolean {
        // In production, query acknowledgment database
        // For now, return false to require acknowledgment
        return false
    }
    
    /**
     * Get required disclaimers for a feature
     */
    fun getRequiredDisclaimers(feature: Feature): List<DisclaimerType> {
        return when (feature) {
            Feature.MESSAGING -> listOf(DisclaimerType.STANDARD)
            Feature.VITALS -> listOf(DisclaimerType.STANDARD, DisclaimerType.EDUCATIONAL)
            Feature.MEDICATIONS -> listOf(DisclaimerType.STANDARD, DisclaimerType.AI_ADVISORY)
            Feature.EMERGENCY -> listOf(DisclaimerType.STANDARD, DisclaimerType.EMERGENCY)
            Feature.AI_SUGGESTIONS -> listOf(DisclaimerType.STANDARD, DisclaimerType.AI_ADVISORY)
        }
    }
}

/**
 * Disclaimer types
 */
enum class DisclaimerType {
    STANDARD,      // Standard platform disclaimer
    EMERGENCY,     // Emergency situation disclaimer
    AI_ADVISORY,   // AI-generated content disclaimer
    EDUCATIONAL    // Educational content disclaimer
}

/**
 * Features that require disclaimers
 */
enum class Feature {
    MESSAGING,
    VITALS,
    MEDICATIONS,
    EMERGENCY,
    AI_SUGGESTIONS
}
