package com.agyeman.myhealthally.core.health

import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.*

/**
 * CG-2A: System Health & Observability Tests
 * 
 * Tests for:
 * - Health endpoint
 * - Dependency checks
 * - Error classification
 * - Metrics collection
 */
class CG2AHealthTest {
    
    @Before
    fun setup() {
        SystemMetrics.reset()
    }
    
    // ==================== Health Endpoint Tests ====================
    
    @Test
    fun `Health endpoint returns ok when dependencies are up`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker(
            databaseChecker = { { SystemHealth.DependencyStatus.OK } },
            authChecker = { { SystemHealth.DependencyStatus.OK } },
            enforcementChecker = { { SystemHealth.DependencyStatus.OK } },
            jobsChecker = { { SystemHealth.DependencyStatus.OK } }
        )
        
        val healthEndpoint = HealthEndpoint(dependencyChecker)
        val response = healthEndpoint.handleHealthCheck()
        
        assertEquals("ok", response.status)
        assertEquals("ok", response.checks.database)
        assertEquals("ok", response.checks.auth)
        assertEquals("ok", response.checks.enforcement)
        assertEquals("ok", response.checks.jobs)
    }
    
    @Test
    fun `Health endpoint returns degraded when jobs lag`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker(
            databaseChecker = { { SystemHealth.DependencyStatus.OK } },
            authChecker = { { SystemHealth.DependencyStatus.OK } },
            enforcementChecker = { { SystemHealth.DependencyStatus.OK } },
            jobsChecker = { { SystemHealth.DependencyStatus.SLOW } } // Jobs lagging
        )
        
        val healthEndpoint = HealthEndpoint(dependencyChecker)
        val response = healthEndpoint.handleHealthCheck()
        
        assertEquals("degraded", response.status)
        assertEquals("ok", response.checks.database)
        assertEquals("slow", response.checks.jobs)
    }
    
    @Test
    fun `Health endpoint returns unhealthy when DB unavailable`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker(
            databaseChecker = { { SystemHealth.DependencyStatus.DOWN } }, // DB down
            authChecker = { { SystemHealth.DependencyStatus.OK } },
            enforcementChecker = { { SystemHealth.DependencyStatus.OK } },
            jobsChecker = { { SystemHealth.DependencyStatus.OK } }
        )
        
        val healthEndpoint = HealthEndpoint(dependencyChecker)
        val response = healthEndpoint.handleHealthCheck()
        
        assertEquals("unhealthy", response.status)
        assertEquals("down", response.checks.database)
    }
    
    @Test
    fun `Health endpoint returns unhealthy when enforcement has error`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker(
            databaseChecker = { { SystemHealth.DependencyStatus.OK } },
            authChecker = { { SystemHealth.DependencyStatus.OK } },
            enforcementChecker = { { SystemHealth.DependencyStatus.ERROR } }, // Enforcement error
            jobsChecker = { { SystemHealth.DependencyStatus.OK } }
        )
        
        val healthEndpoint = HealthEndpoint(dependencyChecker)
        val response = healthEndpoint.handleHealthCheck()
        
        assertEquals("unhealthy", response.status)
        assertEquals("error", response.checks.enforcement)
    }
    
    @Test
    fun `Health endpoint does not expose PHI or secrets`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker()
        val healthEndpoint = HealthEndpoint(dependencyChecker)
        val response = healthEndpoint.handleHealthCheck()
        
        // Validate no PHI exposure
        val noPHI = healthEndpoint.validateNoPHIExposure(response)
        assertTrue("Health endpoint should not expose PHI", noPHI)
        
        // Verify response doesn't contain sensitive data
        val responseString = response.toString()
        assertFalse("Should not contain email", responseString.contains("@"))
        assertFalse("Should not contain 'password'", responseString.lowercase().contains("password"))
        assertFalse("Should not contain 'secret'", responseString.lowercase().contains("secret"))
        assertFalse("Should not contain 'token'", responseString.lowercase().contains("token"))
    }
    
    // ==================== Dependency Check Tests ====================
    
    @Test
    fun `Dependency checks return correct status`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker(
            databaseChecker = { { SystemHealth.DependencyStatus.OK } },
            authChecker = { { SystemHealth.DependencyStatus.DEGRADED } },
            enforcementChecker = { { SystemHealth.DependencyStatus.OK } },
            jobsChecker = { { SystemHealth.DependencyStatus.SLOW } }
        )
        
        val checks = dependencyChecker.checkAllDependencies()
        
        assertEquals(SystemHealth.DependencyStatus.OK, checks.database)
        assertEquals(SystemHealth.DependencyStatus.DEGRADED, checks.auth)
        assertEquals(SystemHealth.DependencyStatus.OK, checks.enforcement)
        assertEquals(SystemHealth.DependencyStatus.SLOW, checks.jobs)
    }
    
    @Test
    fun `Database check handles exceptions`() = runBlocking {
        val dependencyChecker = DefaultDependencyChecker(
            databaseChecker = { 
                { 
                    throw Exception("Database connection failed")
                    SystemHealth.DependencyStatus.OK 
                } 
            }
        )
        
        val status = dependencyChecker.checkDatabase()
        
        assertEquals(SystemHealth.DependencyStatus.DOWN, status)
    }
    
    // ==================== Error Classification Tests ====================
    
    @Test
    fun `Error classification maps system outage correctly`() {
        val error = Exception("Connection refused: service unavailable")
        val category = ErrorClassification.classifyError(error)
        
        assertEquals(ErrorClassification.ErrorCategory.SYSTEM_OUTAGE, category)
    }
    
    @Test
    fun `Error classification maps dependency failure correctly`() {
        val error = Exception("Database connection failed")
        val category = ErrorClassification.classifyError(error)
        
        assertEquals(ErrorClassification.ErrorCategory.DEPENDENCY_FAILURE, category)
    }
    
    @Test
    fun `Error classification maps timeout correctly`() {
        val error = Exception("Request timed out after 30 seconds")
        val category = ErrorClassification.classifyError(error)
        
        assertEquals(ErrorClassification.ErrorCategory.TIMEOUT, category)
    }
    
    @Test
    fun `Error classification maps logic violation correctly`() {
        val error = Exception("Rule violation: blocked by R2")
        val category = ErrorClassification.classifyError(error)
        
        assertEquals(ErrorClassification.ErrorCategory.LOGIC_VIOLATION, category)
    }
    
    @Test
    fun `Error classification maps unknown errors correctly`() {
        val error = Exception("Something unexpected happened")
        val category = ErrorClassification.classifyError(error)
        
        assertEquals(ErrorClassification.ErrorCategory.UNKNOWN, category)
    }
    
    @Test
    fun `Error details are captured correctly`() {
        val error = Exception("Test error message")
        val details = ErrorClassification.getErrorDetails(error)
        
        assertEquals(ErrorClassification.ErrorCategory.UNKNOWN, details.category)
        assertEquals("Test error message", details.message)
        assertNotNull(details.stackTrace)
    }
    
    // ==================== Metrics Tests ====================
    
    @Test
    fun `Metrics increment correctly`() {
        SystemMetrics.reset()
        
        SystemMetrics.incrementRequestsTotal()
        SystemMetrics.incrementRequestsTotal()
        SystemMetrics.incrementRequestsFailed()
        SystemMetrics.incrementEnforcementBlocks()
        SystemMetrics.incrementRedEscalations()
        
        val metrics = SystemMetrics.getMetrics()
        
        assertEquals(2, metrics.requestsTotal)
        assertEquals(1, metrics.requestsFailed)
        assertEquals(1, metrics.enforcementBlocks)
        assertEquals(1, metrics.redEscalationsTriggered)
    }
    
    @Test
    fun `Metrics failure rate calculated correctly`() {
        SystemMetrics.reset()
        
        // 10 total requests, 3 failed
        repeat(10) { SystemMetrics.incrementRequestsTotal() }
        repeat(3) { SystemMetrics.incrementRequestsFailed() }
        
        val metrics = SystemMetrics.getMetrics()
        val failureRate = metrics.getFailureRate()
        
        assertEquals(0.3, failureRate, 0.01)
    }
    
    @Test
    fun `Metrics reset works correctly`() {
        SystemMetrics.incrementRequestsTotal()
        SystemMetrics.incrementRequestsFailed()
        
        SystemMetrics.reset()
        
        val metrics = SystemMetrics.getMetrics()
        
        assertEquals(0, metrics.requestsTotal)
        assertEquals(0, metrics.requestsFailed)
        assertEquals(0, metrics.enforcementBlocks)
        assertEquals(0, metrics.redEscalationsTriggered)
    }
    
    // ==================== System Health Status Tests ====================
    
    @Test
    fun `System health status determined correctly from checks`() = runBlocking {
        // All OK → OK
        val checks1 = DependencyChecks(
            database = SystemHealth.DependencyStatus.OK,
            auth = SystemHealth.DependencyStatus.OK,
            enforcement = SystemHealth.DependencyStatus.OK,
            jobs = SystemHealth.DependencyStatus.OK
        )
        val dependencyChecker1 = object : DependencyChecker {
            override suspend fun checkAllDependencies() = checks1
            override suspend fun checkDatabase() = checks1.database
            override suspend fun checkAuth() = checks1.auth
            override suspend fun checkEnforcement() = checks1.enforcement
            override suspend fun checkJobs() = checks1.jobs
        }
        val status1 = SystemHealth.getHealthStatus(dependencyChecker1)
        assertEquals(SystemHealth.HealthStatus.OK, status1.status)
        
        // DB down → UNHEALTHY
        val checks2 = DependencyChecks(
            database = SystemHealth.DependencyStatus.DOWN,
            auth = SystemHealth.DependencyStatus.OK,
            enforcement = SystemHealth.DependencyStatus.OK,
            jobs = SystemHealth.DependencyStatus.OK
        )
        val dependencyChecker2 = object : DependencyChecker {
            override suspend fun checkAllDependencies() = checks2
            override suspend fun checkDatabase() = checks2.database
            override suspend fun checkAuth() = checks2.auth
            override suspend fun checkEnforcement() = checks2.enforcement
            override suspend fun checkJobs() = checks2.jobs
        }
        val status2 = SystemHealth.getHealthStatus(dependencyChecker2)
        assertEquals(SystemHealth.HealthStatus.UNHEALTHY, status2.status)
        
        // Jobs slow → DEGRADED
        val checks3 = DependencyChecks(
            database = SystemHealth.DependencyStatus.OK,
            auth = SystemHealth.DependencyStatus.OK,
            enforcement = SystemHealth.DependencyStatus.OK,
            jobs = SystemHealth.DependencyStatus.SLOW
        )
        val dependencyChecker3 = object : DependencyChecker {
            override suspend fun checkAllDependencies() = checks3
            override suspend fun checkDatabase() = checks3.database
            override suspend fun checkAuth() = checks3.auth
            override suspend fun checkEnforcement() = checks3.enforcement
            override suspend fun checkJobs() = checks3.jobs
        }
        val status3 = SystemHealth.getHealthStatus(dependencyChecker3)
        assertEquals(SystemHealth.HealthStatus.DEGRADED, status3.status)
    }
}
