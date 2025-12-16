package com.agyeman.myhealthally.core.failsafe

import com.agyeman.myhealthally.core.logging.Logger
import java.util.Date
import java.util.concurrent.atomic.AtomicReference

/**
 * CG-2B: Kill Switches & Degraded Modes
 * Rule 3: Kill Switch Is Mandatory
 *
 * Goal: unsafe operations can be stopped instantly; system can enter read-only / limited modes.
 * No UI, no integrations. Server-side policy guard only.
 * 
 * Founder-controlled kill switches for:
 * - Feature kill switch
 * - API shutoff
 * - Region-based disable
 * - Model rollback
 */
object KillSwitches {

    private val stateRef = AtomicReference(KillSwitchState())

    /**
     * Current kill switch state snapshot
     */
    fun current(): KillSwitchState = stateRef.get()

    /**
     * Set global read-only mode
     */
    fun setReadOnly(enabled: Boolean, reason: String, expiresAt: Date? = null) {
        updateState { it.copy(readOnly = enabled, readOnlyReason = reason, readOnlyExpiresAt = expiresAt) }
        Logger.w("KillSwitch", "Read-only mode ${if (enabled) "ENABLED" else "DISABLED"}: $reason")
    }

    /**
     * Pause messaging (e.g., outages in messaging pipeline)
     */
    fun setMessagingPaused(enabled: Boolean, reason: String, expiresAt: Date? = null) {
        updateState { it.copy(messagingPaused = enabled, messagingReason = reason, messagingExpiresAt = expiresAt) }
        Logger.w("KillSwitch", "Messaging ${if (enabled) "PAUSED" else "RESUMED"}: $reason")
    }

    /**
     * Pause telehealth (e.g., video infra outage)
     */
    fun setTelehealthPaused(enabled: Boolean, reason: String, expiresAt: Date? = null) {
        updateState { it.copy(telehealthPaused = enabled, telehealthReason = reason, telehealthExpiresAt = expiresAt) }
        Logger.w("KillSwitch", "Telehealth ${if (enabled) "PAUSED" else "RESUMED"}: $reason")
    }

    /**
     * Reset all kill switches
     */
    fun reset() {
        stateRef.set(KillSwitchState())
        Logger.i("KillSwitch", "All kill switches reset")
    }

    /**
     * Check if an operation is allowed under current kill switch state
     */
    fun assertAllowed(operation: KillSwitchOperation) {
        val state = stateRef.get()

        // Expire any switches past expiration
        val now = Date()
        val effectiveState = state.expireIfNeeded(now)
        if (effectiveState != state) stateRef.set(effectiveState)

        when (operation) {
            KillSwitchOperation.WRITE_ANY -> {
                if (effectiveState.readOnly) {
                    throw KillSwitchException("Read-only mode active: ${effectiveState.readOnlyReason}")
                }
            }
            KillSwitchOperation.SEND_MESSAGE -> {
                if (effectiveState.messagingPaused) {
                    throw KillSwitchException("Messaging paused: ${effectiveState.messagingReason}")
                }
                if (effectiveState.readOnly) {
                    throw KillSwitchException("Read-only mode active: ${effectiveState.readOnlyReason}")
                }
            }
            KillSwitchOperation.TELEHEALTH -> {
                if (effectiveState.telehealthPaused) {
                    throw KillSwitchException("Telehealth paused: ${effectiveState.telehealthReason}")
                }
                if (effectiveState.readOnly) {
                    throw KillSwitchException("Read-only mode active: ${effectiveState.readOnlyReason}")
                }
            }
        }
    }

    private fun updateState(transform: (KillSwitchState) -> KillSwitchState) {
        stateRef.updateAndGet(transform)
    }
}

/**
 * Kill switch state snapshot
 */
data class KillSwitchState(
    val readOnly: Boolean = false,
    val readOnlyReason: String? = null,
    val readOnlyExpiresAt: Date? = null,

    val messagingPaused: Boolean = false,
    val messagingReason: String? = null,
    val messagingExpiresAt: Date? = null,

    val telehealthPaused: Boolean = false,
    val telehealthReason: String? = null,
    val telehealthExpiresAt: Date? = null
) {
    /**
     * Return a state with expired switches cleared
     */
    fun expireIfNeeded(now: Date): KillSwitchState {
        var newState = this
        if (readOnlyExpiresAt != null && now.after(readOnlyExpiresAt)) {
            newState = newState.copy(readOnly = false, readOnlyReason = null, readOnlyExpiresAt = null)
        }
        if (messagingExpiresAt != null && now.after(messagingExpiresAt)) {
            newState = newState.copy(messagingPaused = false, messagingReason = null, messagingExpiresAt = null)
        }
        if (telehealthExpiresAt != null && now.after(telehealthExpiresAt)) {
            newState = newState.copy(telehealthPaused = false, telehealthReason = null, telehealthExpiresAt = null)
        }
        return newState
    }
}

/**
 * Kill switch operations to guard
 */
enum class KillSwitchOperation {
    WRITE_ANY,
    SEND_MESSAGE,
    TELEHEALTH
}

/**
 * Kill switch exception thrown when operation blocked
 */
class KillSwitchException(message: String) : Exception(message)
