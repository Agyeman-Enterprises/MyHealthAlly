package com.agyeman.myhealthally.core.governance

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.util.Date
import java.util.concurrent.ConcurrentHashMap

/**
 * Rule 9: Assume Users Will Misuse MHA
 * 
 * Red Team assumption: Someone will use MHA instead of seeing a doctor.
 * 
 * Countermeasures:
 * - Friction at critical points
 * - Clear escalation prompts
 * - Mandatory "seek care now" triggers
 * - Logging of ignored warnings
 */
class MisuseDetection(
    private val auditLogger: AuditLogger
) {
    
    private val ignoredWarnings = ConcurrentHashMap<String, MutableList<WarningEvent>>()
    private val escalationPrompts = ConcurrentHashMap<String, MutableList<EscalationEvent>>()
    
    /**
     * Log that user ignored a warning
     * 
     * This protects you legally - you warned them, they ignored it
     */
    suspend fun logIgnoredWarning(
        userId: String,
        patientId: String?,
        warningType: WarningType,
        warningText: String,
        context: String
    ) {
        val key = "${userId}:${patientId ?: "unknown"}"
        val warnings = ignoredWarnings.getOrPut(key) { mutableListOf() }
        
        val event = WarningEvent(
            warningType = warningType,
            warningText = warningText,
            context = context,
            timestamp = Date()
        )
        warnings.add(event)
        
        // Audit log
        auditLogger.logPHIAccess(
            resource = "warnings",
            action = "ignored",
            userId = userId,
            patientId = patientId,
            details = mapOf(
                "warning_type" to warningType.name,
                "warning_text" to warningText,
                "context" to context,
                "timestamp" to event.timestamp.toString()
            )
        )
        
        Logger.w("MisuseDetection", "Warning ignored: ${warningType.name} by user $userId")
        
        // If too many warnings ignored, escalate
        if (warnings.size >= 3) {
            Logger.e("MisuseDetection", "Multiple warnings ignored by user $userId - potential misuse")
        }
    }
    
    /**
     * Log escalation prompt shown to user
     */
    suspend fun logEscalationPrompt(
        userId: String,
        patientId: String?,
        escalationType: EscalationType,
        promptText: String,
        userResponse: EscalationResponse
    ) {
        val key = "${userId}:${patientId ?: "unknown"}"
        val escalations = escalationPrompts.getOrPut(key) { mutableListOf() }
        
        val event = EscalationEvent(
            escalationType = escalationType,
            promptText = promptText,
            userResponse = userResponse,
            timestamp = Date()
        )
        escalations.add(event)
        
        // Audit log
        auditLogger.logPHIAccess(
            resource = "escalations",
            action = "prompt_shown",
            userId = userId,
            patientId = patientId,
            details = mapOf(
                "escalation_type" to escalationType.name,
                "prompt_text" to promptText,
                "user_response" to userResponse.name,
                "timestamp" to event.timestamp.toString()
            )
        )
        
        Logger.i("MisuseDetection", "Escalation prompt: ${escalationType.name} - User response: ${userResponse.name}")
    }
    
    /**
     * Get ignored warnings for a user
     */
    fun getIgnoredWarnings(userId: String, patientId: String?): List<WarningEvent> {
        val key = "${userId}:${patientId ?: "unknown"}"
        return ignoredWarnings[key] ?: emptyList()
    }
    
    /**
     * Check if user has ignored too many warnings
     */
    fun hasExcessiveIgnoredWarnings(userId: String, patientId: String?): Boolean {
        val warnings = getIgnoredWarnings(userId, patientId)
        return warnings.size >= 3
    }
}

/**
 * Warning types
 */
enum class WarningType {
    EMERGENCY_SYMPTOMS,      // User has emergency symptoms but didn't call 911
    AFTER_HOURS_URGENT,      // User sent urgent message after hours
    MISSING_LABS,            // User requested refill without required labs
    CRITICAL_VITALS,         // User recorded critical vitals but didn't escalate
    REPEATED_REQUESTS,       // User repeatedly requests same thing
    BYPASS_ATTEMPT           // User tried to bypass safety checks
}

/**
 * Escalation types
 */
enum class EscalationType {
    SEEK_IMMEDIATE_CARE,     // "Seek immediate medical care"
    CALL_911,                // "Call 911 now"
    CONTACT_PROVIDER,        // "Contact your provider"
    COMPLETE_LABS,           // "Complete required labs first"
    SCHEDULE_APPOINTMENT     // "Schedule an appointment"
}

/**
 * User response to escalation prompt
 */
enum class EscalationResponse {
    ACKNOWLEDGED,            // User acknowledged
    DISMISSED,               // User dismissed
    ACTED,                   // User took action (e.g., called 911)
    IGNORED                  // User ignored
}

/**
 * Warning event
 */
data class WarningEvent(
    val warningType: WarningType,
    val warningText: String,
    val context: String,
    val timestamp: Date
)

/**
 * Escalation event
 */
data class EscalationEvent(
    val escalationType: EscalationType,
    val promptText: String,
    val userResponse: EscalationResponse,
    val timestamp: Date
)
