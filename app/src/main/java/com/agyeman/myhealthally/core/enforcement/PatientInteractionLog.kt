package com.agyeman.myhealthally.core.enforcement

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * R10: Patient-Visible Transparency Logging
 * 
 * The system must be able to reconstruct:
 * - exactly what the patient saw
 * - when they saw it
 * - why an action was blocked / deferred / escalated
 * 
 * If you cannot prove this, you lose in court.
 */
class PatientInteractionLog(private val auditLogger: AuditLogger) {
    
    /**
     * Log patient interaction for transparency
     * 
     * This must be called for every patient-facing decision:
     * - after-hours intercepts
     * - emergency redirects
     * - refill blocks
     * - deferrals
     * - escalations
     */
    suspend fun logPatientInteraction(
        patientId: String,
        interactionType: InteractionType,
        practiceOpen: Boolean,
        copyShown: String, // The exact text shown to patient
        actionTaken: ActionTaken,
        reason: String? = null,
        metadata: Map<String, Any>? = null
    ) {
        val logEntry = PatientInteractionLogEntry(
            patientId = patientId,
            interactionType = interactionType,
            practiceOpen = practiceOpen,
            copyShown = copyShown,
            actionTaken = actionTaken,
            reason = reason,
            timestamp = Date(),
            metadata = metadata
        )
        
        // Persist to audit log
        auditLogger.logPHIAccess(
            resource = interactionType.resourceName,
            action = actionTaken.name,
            userId = null, // Patient-initiated
            patientId = patientId,
            details = buildMap {
                put("interaction_type", interactionType.name)
                put("practice_open", practiceOpen.toString())
                put("copy_shown", copyShown)
                put("action_taken", actionTaken.name)
                reason?.let { put("reason", it) }
                metadata?.forEach { (key, value) -> put(key, value.toString()) }
            }
        )
        
        Logger.i("R10", "Patient interaction logged: ${interactionType.name} - ${actionTaken.name}")
        
        // TODO: Also persist to patient_interaction_log table for querying
        // This would be in the database layer
    }
    
    /**
     * Reconstruct what patient saw at a specific time
     */
    suspend fun reconstructPatientView(
        patientId: String,
        timestamp: Date,
        interactionType: InteractionType? = null
    ): List<PatientInteractionLogEntry> {
        // In production, this would query the database
        // For now, return empty list (implementation would query audit log)
        Logger.i("R10", "Reconstructing patient view for $patientId at $timestamp")
        
        // TODO: Query patient_interaction_log table
        // SELECT * FROM patient_interaction_log
        // WHERE patient_id = ? AND timestamp <= ?
        // ORDER BY timestamp DESC
        
        return emptyList()
    }
}

/**
 * Patient interaction log entry
 */
data class PatientInteractionLogEntry(
    val patientId: String,
    val interactionType: InteractionType,
    val practiceOpen: Boolean,
    val copyShown: String, // Exact text shown to patient
    val actionTaken: ActionTaken,
    val reason: String?,
    val timestamp: Date,
    val metadata: Map<String, Any>?
)

/**
 * Interaction types
 */
enum class InteractionType(val resourceName: String) {
    MESSAGE("messages"),
    REFILL_REQUEST("medications"),
    VISIT_REQUEST("appointments"),
    MEASUREMENT("measurements"),
    CARE_PLAN("care_plans"),
    DIAGNOSIS("diagnoses"),
    MEDICATION("medications")
}

/**
 * Actions taken
 */
enum class ActionTaken {
    BLOCKED,        // Action was blocked
    DEFERRED,       // Action was deferred
    ALLOWED,        // Action was allowed
    REDIRECTED,     // Patient was redirected (e.g., to 911)
    ESCALATED       // Action was escalated
}
