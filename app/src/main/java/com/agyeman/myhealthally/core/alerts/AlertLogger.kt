package com.agyeman.myhealthally.core.alerts

import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2D: Alert Logging
 * 
 * Logs every alert attempt for auditability.
 */
class AlertLogger {
    
    private val alertLogs = mutableListOf<AlertLogEntry>()
    
    /**
     * Log alert attempt
     */
    fun logAlert(
        alert: Alert,
        channel: AlertChannel,
        delivered: Boolean,
        suppressed: Boolean,
        relatedIncidentId: String? = null
    ) {
        val entry = AlertLogEntry(
            id = UUID.randomUUID().toString(),
            alertType = alert.alertType,
            target = channel.target,
            delivered = delivered,
            suppressed = suppressed,
            timestamp = Date(),
            relatedIncidentId = relatedIncidentId
        )
        
        alertLogs.add(entry)
        
        Logger.i("AlertLog", "Alert logged: ${alert.alertType} → ${channel.target} (delivered: $delivered, suppressed: $suppressed)")
    }
    
    /**
     * Get alert logs
     */
    fun getAlertLogs(limit: Int = 100): List<AlertLogEntry> {
        return alertLogs
            .sortedByDescending { it.timestamp }
            .take(limit)
    }
    
    /**
     * Get alert logs for incident
     */
    fun getAlertLogsForIncident(incidentId: String): List<AlertLogEntry> {
        return alertLogs.filter { it.relatedIncidentId == incidentId }
    }
}

/**
 * Alert log entry
 */
data class AlertLogEntry(
    val id: String,
    val alertType: AlertType,
    val target: String,
    val delivered: Boolean,
    val suppressed: Boolean,
    val timestamp: Date,
    val relatedIncidentId: String?
)
