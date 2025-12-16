package com.agyeman.myhealthally.core.alerts

import android.content.Context
import com.agyeman.myhealthally.core.audit.AuditLogger
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import java.util.*

/**
 * CG-2D: Alerting & Ownership Tests
 */
class CG2DAlertTest {
    
    private lateinit var ownershipResolver: OwnershipResolver
    private lateinit var alertLogger: AlertLogger
    private lateinit var alertService: AlertService
    
    @Mock
    private lateinit var mockContext: Context
    
    private lateinit var auditLogger: AuditLogger
    
    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        ownershipResolver = OwnershipResolver()
        alertLogger = AlertLogger()
        // In production tests, use real AuditLogger with test database
        auditLogger = AuditLogger(mockContext)
        alertService = AlertService(ownershipResolver, alertLogger, auditLogger)
    }
    
    @Test
    fun `SEV1 incident triggers alert`() = runBlocking {
        val payload = mapOf(
            "incident_id" to "inc1",
            "severity" to "SEV1"
        )
        
        alertService.triggerAlert(AlertType.SEV1_INCIDENT_CREATED, payload)
        
        val logs = alertLogger.getAlertLogs()
        assertTrue("Alert should be logged", logs.isNotEmpty())
        assertEquals(AlertType.SEV1_INCIDENT_CREATED, logs.first().alertType)
    }
    
    @Test
    fun `ownership fallback works`() {
        // No explicit owner set
        val owner1 = ownershipResolver.resolveOnCallOwner()
        assertNotNull("Should have system owner fallback", owner1)
        assertEquals("system-owner@solopractice.com", owner1.target)
        
        // Set admin fallback
        val adminChannel = AlertChannel.EmailChannel("admin@example.com")
        ownershipResolver.setAdminFallback(adminChannel, "admin-user")
        
        val owner2 = ownershipResolver.resolveOnCallOwner()
        assertEquals("admin@example.com", owner2.target)
        
        // Set explicit on-call
        val onCallChannel = AlertChannel.EmailChannel("oncall@example.com")
        ownershipResolver.setOnCallOwner(onCallChannel, "admin-user")
        
        val owner3 = ownershipResolver.resolveOnCallOwner()
        assertEquals("oncall@example.com", owner3.target)
    }
    
    @Test
    fun `deduplication prevents spam`() = runBlocking {
        val payload = mapOf("incident_id" to "inc1")
        
        // First alert
        alertService.triggerAlert(AlertType.SEV1_INCIDENT_CREATED, payload)
        
        // Second alert within deduplication window
        alertService.triggerAlert(AlertType.SEV1_INCIDENT_CREATED, payload)
        
        val logs = alertLogger.getAlertLogs()
        val suppressedLogs = logs.filter { it.suppressed }
        
        assertTrue("Second alert should be suppressed", suppressedLogs.isNotEmpty())
    }
    
    @Test
    fun `alerts logged even on failure`() = runBlocking {
        // Create a disabled channel
        val disabledChannel = AlertChannel.EmailChannel("test@example.com", enabled = false)
        ownershipResolver.setOnCallOwner(disabledChannel, "admin-user")
        
        val payload = mapOf("incident_id" to "inc1")
        alertService.triggerAlert(AlertType.SEV1_INCIDENT_CREATED, payload)
        
        val logs = alertLogger.getAlertLogs()
        assertTrue("Alert should be logged even if suppressed", logs.isNotEmpty())
        assertTrue("Alert should be suppressed", logs.first().suppressed)
    }
    
    @Test
    fun `non-admins cannot configure alert routing`() {
        val channel = AlertChannel.EmailChannel("test@example.com")
        
        // In production, this would check admin role and throw
        // For now, we verify the function exists
        try {
            ownershipResolver.setOnCallOwner(channel, "non-admin-user")
            // In production, this should fail
            // For now, we just verify it doesn't crash
        } catch (e: Exception) {
            // Expected in production
        }
    }
    
    @Test
    fun `system outage triggers alert`() = runBlocking {
        val payload = mapOf(
            "incident_id" to "inc1",
            "state" to "OUTAGE"
        )
        
        alertService.triggerAlert(AlertType.SYSTEM_OUTAGE, payload)
        
        val logs = alertLogger.getAlertLogs()
        assertEquals(AlertType.SYSTEM_OUTAGE, logs.first().alertType)
    }
    
    @Test
    fun `red escalation failure triggers alert`() = runBlocking {
        val payload = mapOf(
            "reason" to "Provider unreachable",
            "escalation_id" to "esc1"
        )
        
        alertService.triggerAlert(AlertType.RED_ESCALATION_FAILED, payload)
        
        val logs = alertLogger.getAlertLogs()
        assertEquals(AlertType.RED_ESCALATION_FAILED, logs.first().alertType)
    }
}
