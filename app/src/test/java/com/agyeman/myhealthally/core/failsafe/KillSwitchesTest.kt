package com.agyeman.myhealthally.core.failsafe

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.Calendar
import java.util.Date

class KillSwitchesTest {

    @Before
    fun setup() {
        KillSwitches.reset()
    }

    @Test
    fun `read-only blocks writes`() {
        KillSwitches.setReadOnly(true, "maintenance")
        try {
            KillSwitches.assertAllowed(KillSwitchOperation.WRITE_ANY)
            fail("Should be blocked")
        } catch (e: KillSwitchException) {
            assertTrue(e.message!!.contains("Read-only"))
        }
    }

    @Test
    fun `messaging pause blocks messaging but not telehealth`() {
        KillSwitches.setMessagingPaused(true, "messaging outage")
        try {
            KillSwitches.assertAllowed(KillSwitchOperation.SEND_MESSAGE)
            fail("Should be blocked")
        } catch (_: KillSwitchException) {}

        // Telehealth should still pass when only messaging paused
        KillSwitches.assertAllowed(KillSwitchOperation.TELEHEALTH)
    }

    @Test
    fun `telehealth pause blocks telehealth`() {
        KillSwitches.setTelehealthPaused(true, "telehealth outage")
        try {
            KillSwitches.assertAllowed(KillSwitchOperation.TELEHEALTH)
            fail("Should be blocked")
        } catch (_: KillSwitchException) {}
    }

    @Test
    fun `expiration clears kill switch`() {
        val past = Calendar.getInstance().apply { add(Calendar.MINUTE, -10) }.time
        KillSwitches.setReadOnly(true, "expired", expiresAt = past)
        // After expiration the assertion should pass
        KillSwitches.assertAllowed(KillSwitchOperation.WRITE_ANY)
    }

    @Test
    fun `degraded mode guard surfaces exceptions`() {
        KillSwitches.setReadOnly(true, "maintenance")
        try {
            DegradedModePolicy.guardWrite("test write")
            fail("Should be blocked")
        } catch (e: KillSwitchException) {
            assertTrue(e.message!!.contains("Read-only"))
        }
    }
}
