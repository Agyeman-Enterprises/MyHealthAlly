package com.agyeman.myhealthally.core.incidents

import com.agyeman.myhealthally.core.failsafe.KillSwitches
import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2C: System Status State Machine
 * 
 * Single authoritative resolver for system status.
 * Rules:
 * - Explicit admin override (from CG-2B) wins
 * - Active unresolved SEV1 incident → outage
 * - Active unresolved SEV2 incident → degraded
 * - Otherwise → normal
 */
class SystemStatusStateMachine(
    private val incidentRepository: IncidentRepository
) {
    
    /**
     * Get current system status
     * 
     * This function is used by:
     * - health endpoint
     * - enforcement layer
     * - admin dashboards
     */
    suspend fun getCurrentSystemStatus(): SystemState {
        // Check explicit admin override (read-only mode from CG-2B)
        val killSwitchState = KillSwitches.current()
        if (killSwitchState.readOnly) {
            Logger.d("SystemStatus", "Read-only mode active → OUTAGE")
            return SystemState.OUTAGE
        }
        
        // Check active incidents
        val activeIncidentsResult = incidentRepository.getActiveIncidents()
        if (activeIncidentsResult.isFailure) {
            Logger.w("SystemStatus", "Failed to fetch active incidents, defaulting to NORMAL")
            return SystemState.NORMAL
        }
        
        val activeIncidents = activeIncidentsResult.getOrNull() ?: emptyList()
        
        // Check for SEV1 incidents (outage)
        val sev1Incidents = activeIncidents.filter { it.severity == Severity.SEV1 }
        if (sev1Incidents.isNotEmpty()) {
            Logger.w("SystemStatus", "Active SEV1 incident(s) → OUTAGE")
            return SystemState.OUTAGE
        }
        
        // Check for SEV2 incidents (degraded)
        val sev2Incidents = activeIncidents.filter { it.severity == Severity.SEV2 }
        if (sev2Incidents.isNotEmpty()) {
            Logger.w("SystemStatus", "Active SEV2 incident(s) → DEGRADED")
            return SystemState.DEGRADED
        }
        
        // No active critical incidents
        Logger.d("SystemStatus", "No active critical incidents → NORMAL")
        return SystemState.NORMAL
    }
    
    /**
     * Get system status with details
     */
    suspend fun getSystemStatusWithDetails(): SystemStatusDetails {
        val status = getCurrentSystemStatus()
        val activeIncidents = incidentRepository.getActiveIncidents().getOrNull() ?: emptyList()
        
        return SystemStatusDetails(
            status = status,
            activeIncidents = activeIncidents,
            killSwitchActive = KillSwitches.current().readOnly
        )
    }
}

/**
 * System status details
 */
data class SystemStatusDetails(
    val status: SystemState,
    val activeIncidents: List<IncidentLog>,
    val killSwitchActive: Boolean
)
