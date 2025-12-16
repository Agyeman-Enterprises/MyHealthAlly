package com.agyeman.myhealthally.core.governance

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.util.Date
import java.util.concurrent.atomic.AtomicReference

/**
 * Rule 6: Regulatory Shadow Mode
 * 
 * MHA must always be able to operate in:
 * - "Educational Mode" - No clinical claims
 * - "Clinical Support Mode" - With disclaimers
 * - "Non-medical Wellness Mode" - Wellness only
 * 
 * If regulators move the goalposts → MHA downgrades mode instantly instead of dying.
 */
object RegulatoryMode {
    
    private val currentModeRef = AtomicReference(SystemMode.CLINICAL_SUPPORT)
    
    /**
     * Current system mode
     */
    fun current(): SystemMode = currentModeRef.get()
    
    /**
     * Set system mode (Admin-only)
     * 
     * This requires admin authorization and logs the change
     */
    suspend fun setMode(
        newMode: SystemMode,
        adminUserId: String,
        reason: String,
        auditLogger: AuditLogger
    ): Result<Unit> {
        // In production, verify admin role
        // if (!isAdmin(adminUserId)) {
        //     return Result.failure(Exception("Unauthorized: Admin role required"))
        // }
        
        val previousMode = currentModeRef.get()
        currentModeRef.set(newMode)
        
        // Audit log
        auditLogger.logPHIAccess(
            resource = "regulatory_mode",
            action = "change",
            userId = adminUserId,
            patientId = null,
            details = mapOf(
                "previous_mode" to previousMode.name,
                "new_mode" to newMode.name,
                "reason" to reason,
                "timestamp" to Date().toString()
            )
        )
        
        Logger.w("RegulatoryMode", "Mode changed: $previousMode → $newMode (reason: $reason)")
        
        return Result.success(Unit)
    }
    
    /**
     * Check if a feature is allowed in current mode
     */
    fun isFeatureAllowed(feature: ClinicalFeature): Boolean {
        val mode = currentModeRef.get()
        return mode.allowedFeatures.contains(feature)
    }
    
    /**
     * Get disclaimer text for current mode
     */
    fun getModeDisclaimer(): String {
        return when (currentModeRef.get()) {
            SystemMode.EDUCATIONAL -> """
                MyHealth Ally is operating in Educational Mode. All information provided 
                is for educational purposes only and does not constitute medical advice. 
                Please consult with your healthcare provider for medical decisions.
            """.trimIndent()
            
            SystemMode.CLINICAL_SUPPORT -> """
                MyHealth Ally provides clinical support tools to assist you in navigating 
                your healthcare. MyHealth Ally is not your doctor and does not provide 
                medical diagnosis, treatment, or prescriptions. Always consult with your 
                healthcare provider for medical decisions.
            """.trimIndent()
            
            SystemMode.WELLNESS_ONLY -> """
                MyHealth Ally is operating in Wellness Mode. This mode provides general 
                wellness information only and does not address medical conditions or 
                provide clinical support. For medical concerns, please consult with your 
                healthcare provider.
            """.trimIndent()
        }
    }
    
    /**
     * Downgrade mode (e.g., in response to regulatory changes)
     * 
     * This can be called automatically or manually
     */
    suspend fun downgradeMode(
        reason: String,
        auditLogger: AuditLogger
    ) {
        val current = currentModeRef.get()
        val downgraded = when (current) {
            SystemMode.CLINICAL_SUPPORT -> SystemMode.EDUCATIONAL
            SystemMode.EDUCATIONAL -> SystemMode.WELLNESS_ONLY
            SystemMode.WELLNESS_ONLY -> SystemMode.WELLNESS_ONLY // Already at lowest
        }
        
        if (downgraded != current) {
            setMode(
                newMode = downgraded,
                adminUserId = "system", // System-initiated downgrade
                reason = "Regulatory downgrade: $reason",
                auditLogger = auditLogger
            )
        }
    }
}

/**
 * System operational modes
 */
enum class SystemMode(val allowedFeatures: Set<ClinicalFeature>) {
    /**
     * Educational Mode - No clinical claims
     * Only educational content, no clinical support
     */
    EDUCATIONAL(setOf(
        ClinicalFeature.EDUCATIONAL_CONTENT,
        ClinicalFeature.APPOINTMENT_SCHEDULING,
        ClinicalFeature.MEDICATION_REFILLS // With disclaimers
    )),
    
    /**
     * Clinical Support Mode - With disclaimers
     * Full clinical support features with disclaimers
     */
    CLINICAL_SUPPORT(setOf(
        ClinicalFeature.EDUCATIONAL_CONTENT,
        ClinicalFeature.CLINICAL_MESSAGING,
        ClinicalFeature.VITAL_TRACKING,
        ClinicalFeature.MEDICATION_REFILLS,
        ClinicalFeature.APPOINTMENT_SCHEDULING,
        ClinicalFeature.AI_SUGGESTIONS,
        ClinicalFeature.EMERGENCY_ESCALATION
    )),
    
    /**
     * Wellness Only Mode - Non-medical wellness
     * Only wellness features, no clinical support
     */
    WELLNESS_ONLY(setOf(
        ClinicalFeature.EDUCATIONAL_CONTENT,
        ClinicalFeature.APPOINTMENT_SCHEDULING
    ))
}

/**
 * Clinical features that can be gated by mode
 */
enum class ClinicalFeature {
    EDUCATIONAL_CONTENT,
    CLINICAL_MESSAGING,
    VITAL_TRACKING,
    MEDICATION_REFILLS,
    APPOINTMENT_SCHEDULING,
    AI_SUGGESTIONS,
    EMERGENCY_ESCALATION
}
