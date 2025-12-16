package com.agyeman.myhealthally.core.health

import com.agyeman.myhealthally.core.logging.Logger
import java.util.*

/**
 * CG-2A: System Health & Observability
 * 
 * System health monitoring for Solopractice backend.
 * Provides health endpoints, dependency checks, and system status.
 */
object SystemHealth {
    
    /**
     * System health status
     */
    enum class HealthStatus {
        OK,           // All systems operational
        DEGRADED,     // Some systems degraded but functional
        UNHEALTHY     // Critical systems down
    }
    
    /**
     * Dependency check status
     */
    enum class DependencyStatus {
        OK,
        SLOW,
        DOWN,
        DEGRADED,
        ERROR
    }
    
    /**
     * Get system health status
     * 
     * @return HealthResponse with current system status
     */
    suspend fun getHealthStatus(
        dependencyChecker: DependencyChecker
    ): HealthResponse {
        val checks = dependencyChecker.checkAllDependencies()
        val timestamp = Date()
        
        // Determine overall status based on dependency checks
        val status = determineOverallStatus(checks)
        
        Logger.i("Health", "System health check: $status")
        
        return HealthResponse(
            status = status,
            timestamp = timestamp,
            checks = checks
        )
    }
    
    /**
     * Determine overall system status from dependency checks
     */
    private fun determineOverallStatus(checks: DependencyChecks): HealthStatus {
        // If database is down → unhealthy
        if (checks.database == DependencyStatus.DOWN) {
            return HealthStatus.UNHEALTHY
        }
        
        // If enforcement layer has error → unhealthy
        if (checks.enforcement == DependencyStatus.ERROR) {
            return HealthStatus.UNHEALTHY
        }
        
        // If database is slow or jobs are lagging → degraded
        if (checks.database == DependencyStatus.SLOW ||
            checks.jobs == DependencyStatus.SLOW ||
            checks.jobs == DependencyStatus.DEGRADED) {
            return HealthStatus.DEGRADED
        }
        
        // If auth is degraded → degraded
        if (checks.auth == DependencyStatus.DEGRADED) {
            return HealthStatus.DEGRADED
        }
        
        // All checks OK
        return HealthStatus.OK
    }
}

/**
 * Health response model
 */
data class HealthResponse(
    val status: SystemHealth.HealthStatus,
    val timestamp: Date,
    val checks: DependencyChecks
)

/**
 * Dependency checks result
 */
data class DependencyChecks(
    val database: SystemHealth.DependencyStatus,
    val auth: SystemHealth.DependencyStatus,
    val enforcement: SystemHealth.DependencyStatus,
    val jobs: SystemHealth.DependencyStatus
)

/**
 * Dependency checker interface
 * 
 * Implementations should perform lightweight checks:
 * - Database: Simple connectivity test
 * - Auth: Verify auth service is reachable
 * - Enforcement: Verify enforcement layer is functional
 * - Jobs: Check job queue status
 */
interface DependencyChecker {
    /**
     * Check all dependencies
     */
    suspend fun checkAllDependencies(): DependencyChecks
    
    /**
     * Check database connectivity
     */
    suspend fun checkDatabase(): SystemHealth.DependencyStatus
    
    /**
     * Check auth service
     */
    suspend fun checkAuth(): SystemHealth.DependencyStatus
    
    /**
     * Check enforcement layer
     */
    suspend fun checkEnforcement(): SystemHealth.DependencyStatus
    
    /**
     * Check background jobs
     */
    suspend fun checkJobs(): SystemHealth.DependencyStatus
}

/**
 * Default dependency checker implementation
 */
class DefaultDependencyChecker(
    private val databaseChecker: () -> suspend () -> SystemHealth.DependencyStatus = { { SystemHealth.DependencyStatus.OK } },
    private val authChecker: () -> suspend () -> SystemHealth.DependencyStatus = { { SystemHealth.DependencyStatus.OK } },
    private val enforcementChecker: () -> suspend () -> SystemHealth.DependencyStatus = { { SystemHealth.DependencyStatus.OK } },
    private val jobsChecker: () -> suspend () -> SystemHealth.DependencyStatus = { { SystemHealth.DependencyStatus.OK } }
) : DependencyChecker {
    
    override suspend fun checkAllDependencies(): DependencyChecks {
        return DependencyChecks(
            database = checkDatabase(),
            auth = checkAuth(),
            enforcement = checkEnforcement(),
            jobs = checkJobs()
        )
    }
    
    override suspend fun checkDatabase(): SystemHealth.DependencyStatus {
        return try {
            // In production: Perform lightweight database ping
            // SELECT 1 or similar
            // Measure response time
            // Return OK, SLOW, or DOWN
            
            // For now, use provided checker
            databaseChecker()()
        } catch (e: Exception) {
            Logger.e("Health", "Database check failed", e)
            SystemHealth.DependencyStatus.DOWN
        }
    }
    
    override suspend fun checkAuth(): SystemHealth.DependencyStatus {
        return try {
            // In production: Verify auth service is reachable
            // Check if JWT validation is working
            // Return OK or DEGRADED
            
            authChecker()()
        } catch (e: Exception) {
            Logger.e("Health", "Auth check failed", e)
            SystemHealth.DependencyStatus.DEGRADED
        }
    }
    
    override suspend fun checkEnforcement(): SystemHealth.DependencyStatus {
        return try {
            // In production: Verify enforcement layer is functional
            // Test that rules can be evaluated
            // Return OK or ERROR
            
            enforcementChecker()()
        } catch (e: Exception) {
            Logger.e("Health", "Enforcement check failed", e)
            SystemHealth.DependencyStatus.ERROR
        }
    }
    
    override suspend fun checkJobs(): SystemHealth.DependencyStatus {
        return try {
            // In production: Check job queue status
            // Verify jobs are processing
            // Check for backlog
            // Return OK, SLOW, or DEGRADED
            
            jobsChecker()()
        } catch (e: Exception) {
            Logger.e("Health", "Jobs check failed", e)
            SystemHealth.DependencyStatus.DEGRADED
        }
    }
}
