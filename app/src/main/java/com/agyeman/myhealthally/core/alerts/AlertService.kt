package com.agyeman.myhealthally.core.alerts

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2D: Alert Service
 * 
 * Handles alert triggers, ownership resolution, deduplication, and logging.
 */
class AlertService(
    private val ownershipResolver: OwnershipResolver,
    private val alertLogger: AlertLogger,
    private val auditLogger: AuditLogger
) {
    
    private val deduplicationWindow = 5 * 60 * 1000L // 5 minutes
    private val recentAlerts = mutableMapOf<String, Long>() // alertKey -> timestamp
    
    /**
     * Trigger alert
     * 
     * Alerts must fire for:
     * - SEV1 incident created
     * - System enters outage
     * - RED escalation fails to resolve provider
     * - Health endpoint reports unhealthy for > N minutes
     */
    suspend fun triggerAlert(
        alertType: AlertType,
        payload: Map<String, Any>
    ) {
        // Resolve ownership
        val owner = ownershipResolver.resolveOnCallOwner()
        
        // Create alert
        val alert = createAlert(alertType, payload)
        
        // Check deduplication
        val alertKey = "${alertType.name}:${owner.target}"
        val lastSent = recentAlerts[alertKey]
        val now = System.currentTimeMillis()
        
        if (lastSent != null && (now - lastSent) < deduplicationWindow) {
            Logger.d("Alert", "Alert suppressed (deduplication): $alertType to ${owner.target}")
            alertLogger.logAlert(
                alert = alert,
                channel = owner,
                delivered = false,
                suppressed = true,
                relatedIncidentId = payload["incident_id"] as? String
            )
            return
        }
        
        // Send alert
        val result = owner.send(alert)
        
        // Update deduplication cache
        if (result.delivered) {
            recentAlerts[alertKey] = now
        }
        
        // Log alert attempt
        alertLogger.logAlert(
            alert = alert,
            channel = owner,
            delivered = result.delivered,
            suppressed = result.suppressed,
            relatedIncidentId = payload["incident_id"] as? String
        )
        
        // Audit log
        auditLogger.logPHIAccess(
            resource = "alerts",
            action = "trigger",
            userId = null,
            patientId = null,
            details = mapOf(
                "alert_type" to alertType.name,
                "target" to owner.target,
                "delivered" to result.delivered.toString(),
                "suppressed" to result.suppressed.toString()
            )
        )
        
        Logger.w("Alert", "Alert triggered: $alertType → ${owner.target} (delivered: ${result.delivered})")
    }
    
    /**
     * Create alert from type and payload
     */
    private fun createAlert(alertType: AlertType, payload: Map<String, Any>): Alert {
        return when (alertType) {
            AlertType.SEV1_INCIDENT_CREATED -> Alert(
                alertType = alertType,
                title = "SEV1 Incident Created",
                message = "A critical SEV1 incident has been created: ${payload["incident_id"]}",
                severity = AlertSeverity.CRITICAL,
                relatedIncidentId = payload["incident_id"] as? String,
                metadata = payload
            )
            AlertType.SYSTEM_OUTAGE -> Alert(
                alertType = alertType,
                title = "System Outage",
                message = "System has entered outage state",
                severity = AlertSeverity.CRITICAL,
                relatedIncidentId = payload["incident_id"] as? String,
                metadata = payload
            )
            AlertType.RED_ESCALATION_FAILED -> Alert(
                alertType = alertType,
                title = "RED Escalation Failed",
                message = "RED escalation failed to reach provider: ${payload["reason"]}",
                severity = AlertSeverity.CRITICAL,
                metadata = payload
            )
            AlertType.HEALTH_UNHEALTHY -> Alert(
                alertType = alertType,
                title = "System Unhealthy",
                message = "Health endpoint reports unhealthy for ${payload["duration_minutes"]} minutes",
                severity = AlertSeverity.HIGH,
                metadata = payload
            )
        }
    }
}
