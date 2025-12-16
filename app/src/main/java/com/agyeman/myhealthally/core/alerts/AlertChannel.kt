package com.agyeman.myhealthally.core.alerts

import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2D: Alerting & Ownership
 * 
 * Alert channel abstraction for routing alerts to humans.
 */
sealed class AlertChannel {
    abstract val type: AlertChannelType
    abstract val target: String
    abstract val enabled: Boolean
    
    /**
     * Send alert
     */
    abstract suspend fun send(alert: Alert): AlertDeliveryResult
    
    data class EmailChannel(
        override val target: String,
        override val enabled: Boolean = true
    ) : AlertChannel() {
        override val type = AlertChannelType.EMAIL
        
        override suspend fun send(alert: Alert): AlertDeliveryResult {
            if (!enabled) {
                return AlertDeliveryResult.suppressed("Channel disabled")
            }
            
            // In production, this would send actual email
            Logger.w("Alert", "EMAIL alert to $target: ${alert.title}")
            Logger.w("Alert", "  ${alert.message}")
            
            // Simulate email send
            return AlertDeliveryResult.delivered("Email sent to $target")
        }
    }
    
    data class SmsChannel(
        override val target: String,
        override val enabled: Boolean = true
    ) : AlertChannel() {
        override val type = AlertChannelType.SMS
        
        override suspend fun send(alert: Alert): AlertDeliveryResult {
            if (!enabled) {
                return AlertDeliveryResult.suppressed("Channel disabled")
            }
            
            // Stub implementation
            Logger.w("Alert", "SMS alert to $target: ${alert.title}")
            return AlertDeliveryResult.delivered("SMS sent to $target")
        }
    }
    
    data class WebhookChannel(
        override val target: String,
        override val enabled: Boolean = true
    ) : AlertChannel() {
        override val type = AlertChannelType.WEBHOOK
        
        override suspend fun send(alert: Alert): AlertDeliveryResult {
            if (!enabled) {
                return AlertDeliveryResult.suppressed("Channel disabled")
            }
            
            // Stub implementation
            Logger.w("Alert", "WEBHOOK alert to $target: ${alert.title}")
            return AlertDeliveryResult.delivered("Webhook sent to $target")
        }
    }
    
    data class NoopChannel(
        override val target: String = "noop",
        override val enabled: Boolean = false
    ) : AlertChannel() {
        override val type = AlertChannelType.NOOP
        
        override suspend fun send(alert: Alert): AlertDeliveryResult {
            return AlertDeliveryResult.suppressed("No-op channel")
        }
    }
}

/**
 * Alert channel types
 */
enum class AlertChannelType {
    EMAIL,
    SMS,
    WEBHOOK,
    NOOP
}

/**
 * Alert model
 */
data class Alert(
    val alertType: AlertType,
    val title: String,
    val message: String,
    val severity: AlertSeverity,
    val relatedIncidentId: String? = null,
    val metadata: Map<String, Any>? = null
)

/**
 * Alert types
 */
enum class AlertType {
    SEV1_INCIDENT_CREATED,
    SYSTEM_OUTAGE,
    RED_ESCALATION_FAILED,
    HEALTH_UNHEALTHY
}

/**
 * Alert severity
 */
enum class AlertSeverity {
    CRITICAL,
    HIGH,
    MEDIUM,
    LOW
}

/**
 * Alert delivery result
 */
sealed class AlertDeliveryResult {
    abstract val delivered: Boolean
    abstract val suppressed: Boolean
    abstract val message: String
    
    data class Delivered(override val message: String) : AlertDeliveryResult() {
        override val delivered = true
        override val suppressed = false
    }
    
    data class Suppressed(override val message: String) : AlertDeliveryResult() {
        override val delivered = false
        override val suppressed = true
    }
    
    data class Failed(override val message: String) : AlertDeliveryResult() {
        override val delivered = false
        override val suppressed = false
    }
    
    companion object {
        fun delivered(message: String) = Delivered(message)
        fun suppressed(message: String) = Suppressed(message)
        fun failed(message: String) = Failed(message)
    }
}
