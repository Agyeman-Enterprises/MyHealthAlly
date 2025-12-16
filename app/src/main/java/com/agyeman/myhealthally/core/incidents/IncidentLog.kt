package com.agyeman.myhealthally.core.incidents

import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2C: Incident Logging & System Status States
 * 
 * Incident log model for tracking system incidents, outages, and degradations.
 */
data class IncidentLog(
    val id: String,
    val incidentType: IncidentType,
    val severity: Severity,
    val systemState: SystemState,
    val startedAt: Date,
    val resolvedAt: Date?,
    val description: String,
    val detectedBy: DetectedBy,
    val relatedCapabilities: List<String>,
    val createdAt: Date
)

/**
 * Incident types
 */
enum class IncidentType {
    OUTAGE,
    DEGRADATION,
    DATA_ISSUE,
    SECURITY,
    UNKNOWN
}

/**
 * Severity levels
 */
enum class Severity {
    SEV1,  // Critical - system outage
    SEV2,  // High - degradation
    SEV3   // Medium - minor issues
}

/**
 * System state
 */
enum class SystemState {
    NORMAL,
    DEGRADED,
    OUTAGE
}

/**
 * Who detected the incident
 */
enum class DetectedBy {
    SYSTEM,
    ADMIN,
    SUPPORT
}

/**
 * Incident repository interface
 */
interface IncidentRepository {
    suspend fun createIncident(incident: IncidentLog): Result<IncidentLog>
    suspend fun resolveIncident(incidentId: String, resolvedAt: Date): Result<IncidentLog>
    suspend fun getIncident(incidentId: String): Result<IncidentLog?>
    suspend fun getActiveIncidents(): Result<List<IncidentLog>>
    suspend fun getRecentIncidents(limit: Int = 50): Result<List<IncidentLog>>
}

/**
 * In-memory incident repository (for reference implementation)
 * In production, this would use a database
 */
class InMemoryIncidentRepository : IncidentRepository {
    private val incidents = mutableMapOf<String, IncidentLog>()
    
    override suspend fun createIncident(incident: IncidentLog): Result<IncidentLog> {
        incidents[incident.id] = incident
        Logger.i("Incident", "Incident created: ${incident.id} - ${incident.incidentType} ${incident.severity}")
        return Result.success(incident)
    }
    
    override suspend fun resolveIncident(incidentId: String, resolvedAt: Date): Result<IncidentLog> {
        val incident = incidents[incidentId] ?: return Result.failure(Exception("Incident not found"))
        val resolved = incident.copy(resolvedAt = resolvedAt)
        incidents[incidentId] = resolved
        Logger.i("Incident", "Incident resolved: $incidentId")
        return Result.success(resolved)
    }
    
    override suspend fun getIncident(incidentId: String): Result<IncidentLog?> {
        return Result.success(incidents[incidentId])
    }
    
    override suspend fun getActiveIncidents(): Result<List<IncidentLog>> {
        val active = incidents.values.filter { it.resolvedAt == null }
        return Result.success(active)
    }
    
    override suspend fun getRecentIncidents(limit: Int): Result<List<IncidentLog>> {
        val recent = incidents.values
            .sortedByDescending { it.createdAt }
            .take(limit)
        return Result.success(recent)
    }
}
