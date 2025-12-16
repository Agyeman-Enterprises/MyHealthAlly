package com.agyeman.myhealthally.core.enforcement

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.security.MessageDigest
import java.util.*

/**
 * R9: AI Advisory Boundary Enforcement
 * 
 * AI may:
 * - suggest
 * - flag
 * - recommend
 * 
 * AI may NOT:
 * - finalize diagnoses
 * - finalize meds
 * - finalize plans
 * - mutate clinical state
 * 
 * Every AI-originated suggestion must have an explicit provider action logged.
 */
object AiAdvisoryBoundary {
    
    /**
     * Enforce AI advisory boundary
     * 
     * @param context The enforcement context containing AI output and proposed action
     * @return EnforcementResult indicating if the action is allowed
     */
    fun enforceAiAdvisoryBoundary(context: AiEnforcementContext): EnforcementResult {
        // If not AI-originated, allow (provider-initiated actions are allowed)
        if (!context.isAiOriginated) {
            return EnforcementResult.allowed("Not AI-originated")
        }
        
        // Check if AI is attempting to mutate clinical state
        val clinicalMutation = detectClinicalMutation(context)
        
        if (clinicalMutation != null) {
            // AI is attempting clinical mutation - require provider approval
            if (context.providerAction == null) {
                Logger.w("R9", "AI attempted clinical mutation without provider approval: ${clinicalMutation.type}")
                
                return EnforcementResult.blocked(
                    reason = "AI cannot finalize clinical decisions without provider approval",
                    details = mapOf(
                        "mutation_type" to clinicalMutation.type.name,
                        "ai_output_hash" to context.aiOutputHash,
                        "required_action" to "provider_approval"
                    )
                )
            }
            
            // Validate provider action
            val validActions = setOf(ProviderAction.ACCEPTED, ProviderAction.MODIFIED, ProviderAction.REJECTED)
            if (!validActions.contains(context.providerAction)) {
                Logger.w("R9", "Invalid provider action: ${context.providerAction}")
                
                return EnforcementResult.blocked(
                    reason = "Invalid provider action. Must be: accepted, modified, or rejected",
                    details = mapOf(
                        "provided_action" to (context.providerAction?.name ?: "null"),
                        "valid_actions" to validActions.map { it.name }
                    )
                )
            }
            
            // Provider approval exists and is valid - allow with audit
            Logger.i("R9", "AI clinical mutation approved by provider: ${context.providerAction}")
            
            // Persist AI decision trail
            persistAiDecisionTrail(context)
            
            return EnforcementResult.allowed(
                reason = "Provider approved AI suggestion",
                details = mapOf(
                    "provider_action" to context.providerAction!!.name,
                    "ai_output_hash" to context.aiOutputHash
                )
            )
        }
        
        // AI is only suggesting/flagging/recommending - allow
        return EnforcementResult.allowed("AI advisory action only")
    }
    
    /**
     * Detect if AI output attempts to mutate clinical state
     */
    private fun detectClinicalMutation(context: AiEnforcementContext): ClinicalMutation? {
        // Check for diagnosis finalization
        if (context.proposedDiagnosis != null && context.isFinalized) {
            return ClinicalMutation(ClinicalMutationType.DIAGNOSIS, context.proposedDiagnosis)
        }
        
        // Check for medication finalization
        if (context.proposedMedication != null && context.isFinalized) {
            return ClinicalMutation(ClinicalMutationType.MEDICATION, context.proposedMedication)
        }
        
        // Check for care plan finalization
        if (context.proposedCarePlan != null && context.isFinalized) {
            return ClinicalMutation(ClinicalMutationType.CARE_PLAN, context.proposedCarePlan)
        }
        
        // Check for clinical state mutation
        if (context.proposedClinicalState != null) {
            return ClinicalMutation(ClinicalMutationType.CLINICAL_STATE, context.proposedClinicalState)
        }
        
        return null
    }
    
    /**
     * Persist AI decision trail for audit
     */
    private fun persistAiDecisionTrail(context: AiEnforcementContext) {
        // In production, this would write to database
        // For now, log it
        Logger.i("R9", "AI Decision Trail", null)
        Logger.i("R9", "  AI Input Hash: ${context.aiInputHash}")
        Logger.i("R9", "  AI Output Hash: ${context.aiOutputHash}")
        Logger.i("R9", "  AI Output: ${context.aiOutput}")
        Logger.i("R9", "  Provider Action: ${context.providerAction}")
        Logger.i("R9", "  Timestamp: ${Date()}")
        
        // TODO: Write to audit log database
        // auditLogger.logAiDecision(
        //     aiInputHash = context.aiInputHash,
        //     aiOutputHash = context.aiOutputHash,
        //     aiOutput = context.aiOutput,
        //     providerAction = context.providerAction!!,
        //     providerId = context.providerId,
        //     patientId = context.patientId
        // )
    }
    
    /**
     * Calculate hash of AI input/output for audit trail
     */
    fun calculateHash(content: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(content.toByteArray())
        return Base64.getEncoder().encodeToString(hashBytes)
    }
}

/**
 * AI Enforcement Context
 */
data class AiEnforcementContext(
    val isAiOriginated: Boolean,
    val aiInput: String? = null,
    val aiInputHash: String? = null,
    val aiOutput: String? = null,
    val aiOutputHash: String? = null,
    val proposedDiagnosis: String? = null,
    val proposedMedication: String? = null,
    val proposedCarePlan: String? = null,
    val proposedClinicalState: Map<String, Any>? = null,
    val isFinalized: Boolean = false,
    val providerAction: ProviderAction? = null,
    val providerId: String? = null,
    val patientId: String? = null
) {
    init {
        // Auto-calculate hashes if not provided
        if (aiInput != null && aiInputHash == null) {
            // This would be set by caller, but we can calculate here
        }
        if (aiOutput != null && aiOutputHash == null) {
            // This would be set by caller, but we can calculate here
        }
    }
}

/**
 * Provider action types
 */
enum class ProviderAction {
    ACCEPTED,   // Provider accepted AI suggestion as-is
    MODIFIED,   // Provider modified AI suggestion
    REJECTED    // Provider rejected AI suggestion
}

/**
 * Clinical mutation types
 */
enum class ClinicalMutationType {
    DIAGNOSIS,
    MEDICATION,
    CARE_PLAN,
    CLINICAL_STATE
}

/**
 * Clinical mutation detected
 */
data class ClinicalMutation(
    val type: ClinicalMutationType,
    val content: Any
)

/**
 * Enforcement result
 */
sealed class EnforcementResult {
    abstract val reason: String
    abstract val details: Map<String, Any>?
    
    data class Allowed(
        override val reason: String,
        override val details: Map<String, Any>? = null
    ) : EnforcementResult()
    
    data class Blocked(
        override val reason: String,
        override val details: Map<String, Any>? = null
    ) : EnforcementResult()
    
    companion object {
        fun allowed(reason: String, details: Map<String, Any>? = null) = Allowed(reason, details)
        fun blocked(reason: String, details: Map<String, Any>? = null) = Blocked(reason, details)
    }
}
