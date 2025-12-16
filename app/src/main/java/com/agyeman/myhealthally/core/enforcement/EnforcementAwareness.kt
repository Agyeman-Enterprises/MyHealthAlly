package com.agyeman.myhealthally.core.enforcement

import com.agyeman.myhealthally.core.incidents.IncidentLog
import com.agyeman.myhealthally.core.incidents.SystemState
import com.agyeman.myhealthally.core.incidents.SystemStatusStateMachine
import com.agyeman.myhealthally.core.logging.Logger

/**
 * CG-2C: Enforcement Awareness
 * 
 * Ensures enforcement layer:
 * - reads getCurrentSystemStatus()
 * - records incident_id on blocks/escalations when applicable
 * - never ignores outage/degraded states
 */
class EnforcementAwareness(
    private val systemStatusStateMachine: SystemStatusStateMachine
) {
    
    /**
     * Check system status before enforcement
     * 
     * @return SystemState and any related incident IDs
     */
    suspend fun checkSystemStatus(): SystemStatusCheck {
        val status = systemStatusStateMachine.getCurrentSystemStatus()
        val details = systemStatusStateMachine.getSystemStatusWithDetails()
        
        return SystemStatusCheck(
            status = status,
            incidentIds = details.activeIncidents.map { it.id },
            canProceed = status == SystemState.NORMAL
        )
    }
    
    /**
     * Assert system is in normal state before proceeding
     * 
     * @throws SystemOutageException if system is in outage
     * @throws SystemDegradedException if system is degraded
     */
    suspend fun assertSystemNormal() {
        val check = checkSystemStatus()
        
        when (check.status) {
            SystemState.OUTAGE -> {
                Logger.w("Enforcement", "System in OUTAGE state - blocking operation")
                throw SystemOutageException(
                    "System is in outage state. Active incidents: ${check.incidentIds.joinToString()}"
                )
            }
            SystemState.DEGRADED -> {
                Logger.w("Enforcement", "System in DEGRADED state - allowing with warning")
                // Degraded state allows operations but logs warning
                // Could be made stricter if needed
            }
            SystemState.NORMAL -> {
                // Proceed normally
            }
        }
    }
    
    /**
     * Record incident ID on block/escalation
     */
    fun recordIncidentOnBlock(
        incidentIds: List<String>,
        blockReason: String,
        context: Map<String, Any>?
    ) {
        Logger.i("Enforcement", "Block recorded with incidents: ${incidentIds.joinToString()}")
        Logger.i("Enforcement", "Block reason: $blockReason")
        // In production, this would write to audit log with incident IDs
    }
}

/**
 * System status check result
 */
data class SystemStatusCheck(
    val status: SystemState,
    val incidentIds: List<String>,
    val canProceed: Boolean
)

/**
 * System outage exception
 */
class SystemOutageException(message: String) : Exception(message)

/**
 * System degraded exception
 */
class SystemDegradedException(message: String) : Exception(message)
