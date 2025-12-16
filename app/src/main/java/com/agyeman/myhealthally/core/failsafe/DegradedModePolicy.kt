package com.agyeman.myhealthally.core.failsafe

import com.agyeman.myhealthally.core.logging.Logger

/**
 * Degraded mode policy guard.
 * Applies kill switches before performing sensitive operations.
 */
object DegradedModePolicy {

    /**
     * Guard any write operation (e.g., message send, refill request, measurements).
     */
    fun guardWrite(reasonContext: String = "write") {
        try {
            KillSwitches.assertAllowed(KillSwitchOperation.WRITE_ANY)
        } catch (e: KillSwitchException) {
            Logger.w("DegradedMode", "Blocked $reasonContext: ${e.message}")
            throw e
        }
    }

    /**
     * Guard messaging operations
     */
    fun guardMessaging() {
        try {
            KillSwitches.assertAllowed(KillSwitchOperation.SEND_MESSAGE)
        } catch (e: KillSwitchException) {
            Logger.w("DegradedMode", "Blocked messaging: ${e.message}")
            throw e
        }
    }

    /**
     * Guard telehealth operations
     */
    fun guardTelehealth() {
        try {
            KillSwitches.assertAllowed(KillSwitchOperation.TELEHEALTH)
        } catch (e: KillSwitchException) {
            Logger.w("DegradedMode", "Blocked telehealth: ${e.message}")
            throw e
        }
    }
}
