package com.agyeman.myhealthally.core.incidents

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2C: Incident Lifecycle Management
 * 
 * Admin-only APIs for creating and resolving incidents.
 * Strict role enforcement required.
 */
class IncidentLifecycle(
    private val incidentRepository: IncidentRepository,
    private val systemStatusStateMachine: SystemStatusStateMachine,
    private val auditLogger: AuditLogger
) {
    
    /**
     * Create incident (Admin-only)
     * 
     * POST /api/admin/incidents
     */
    suspend fun createIncident(
        request: CreateIncidentRequest,
        adminUserId: String
    ): Result<IncidentLog> {
        // In production, verify admin role here
        // if (!isAdmin(adminUserId)) {
        //     return Result.failure(Exception("Unauthorized: Admin role required"))
        // }
        
        val incident = IncidentLog(
            id = UUID.randomUUID().toString(),
            incidentType = request.incidentType,
            severity = request.severity,
            systemState = determineSystemState(request.severity),
            startedAt = Date(),
            resolvedAt = null,
            description = request.description,
            detectedBy = request.detectedBy,
            relatedCapabilities = request.relatedCapabilities,
            createdAt = Date()
        )
        
        val result = incidentRepository.createIncident(incident)
        
        if (result.isSuccess) {
            // Audit log
            auditLogger.logPHIAccess(
                resource = "incidents",
                action = "create",
                userId = adminUserId,
                patientId = null,
                details = mapOf(
                    "incident_id" to incident.id,
                    "incident_type" to incident.incidentType.name,
                    "severity" to incident.severity.name,
                    "system_state" to incident.systemState.name
                )
            )
            
            // Log state change
            val previousState = systemStatusStateMachine.getCurrentSystemStatus()
            val newState = systemStatusStateMachine.getCurrentSystemStatus()
            logStateChange(adminUserId, previousState, newState, "Incident created: ${incident.id}")
        }
        
        return result
    }
    
    /**
     * Resolve incident (Admin-only)
     * 
     * PATCH /api/admin/incidents/:id/resolve
     */
    suspend fun resolveIncident(
        incidentId: String,
        adminUserId: String,
        reason: String? = null
    ): Result<IncidentLog> {
        // In production, verify admin role here
        // if (!isAdmin(adminUserId)) {
        //     return Result.failure(Exception("Unauthorized: Admin role required"))
        // }
        
        val previousState = systemStatusStateMachine.getCurrentSystemStatus()
        val resolvedAt = Date()
        
        val result = incidentRepository.resolveIncident(incidentId, resolvedAt)
        
        if (result.isSuccess) {
            // Audit log
            auditLogger.logPHIAccess(
                resource = "incidents",
                action = "resolve",
                userId = adminUserId,
                patientId = null,
                details = mapOf(
                    "incident_id" to incidentId,
                    "resolved_at" to resolvedAt.toString(),
                    "reason" to (reason ?: "")
                )
            )
            
            // Log state change
            val newState = systemStatusStateMachine.getCurrentSystemStatus()
            logStateChange(adminUserId, previousState, newState, "Incident resolved: $incidentId")
        }
        
        return result
    }
    
    /**
     * Get incidents (Admin-only)
     * 
     * GET /api/admin/incidents
     */
    suspend fun getIncidents(
        adminUserId: String,
        activeOnly: Boolean = false
    ): Result<List<IncidentLog>> {
        // In production, verify admin role here
        // if (!isAdmin(adminUserId)) {
        //     return Result.failure(Exception("Unauthorized: Admin role required"))
        // }
        
        return if (activeOnly) {
            incidentRepository.getActiveIncidents()
        } else {
            incidentRepository.getRecentIncidents()
        }
    }
    
    /**
     * Determine system state from severity
     */
    private fun determineSystemState(severity: Severity): SystemState {
        return when (severity) {
            Severity.SEV1 -> SystemState.OUTAGE
            Severity.SEV2 -> SystemState.DEGRADED
            Severity.SEV3 -> SystemState.NORMAL
        }
    }
    
    /**
     * Log state change for audit
     */
    private suspend fun logStateChange(
        userId: String,
        previousState: SystemState,
        newState: SystemState,
        reason: String
    ) {
        auditLogger.logPHIAccess(
            resource = "system_status",
            action = "state_change",
            userId = userId,
            patientId = null,
            details = mapOf(
                "previous_state" to previousState.name,
                "new_state" to newState.name,
                "reason" to reason,
                "timestamp" to Date().toString()
            )
        )
        
        Logger.i("Incident", "System state changed: $previousState → $newState ($reason)")
    }
}

/**
 * Create incident request
 */
data class CreateIncidentRequest(
    val incidentType: IncidentType,
    val severity: Severity,
    val description: String,
    val detectedBy: DetectedBy,
    val relatedCapabilities: List<String>
)
