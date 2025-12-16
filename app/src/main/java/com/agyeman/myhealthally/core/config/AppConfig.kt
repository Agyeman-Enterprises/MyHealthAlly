package com.agyeman.myhealthally.core.config

import android.content.Context
import com.agyeman.myhealthally.BuildConfig

/**
 * Enterprise Configuration Management
 * 
 * Centralized configuration for all environments (dev, staging, production)
 * Handles API endpoints, feature flags, and environment-specific settings
 */
object AppConfig {
    
    /**
     * Application environment
     */
    enum class Environment {
        DEVELOPMENT,
        STAGING,
        PRODUCTION
    }
    
    /**
     * Current environment based on build type
     */
    val currentEnvironment: Environment
        get() = when {
            BuildConfig.DEBUG -> Environment.DEVELOPMENT
            BuildConfig.BUILD_TYPE == "staging" -> Environment.STAGING
            else -> Environment.PRODUCTION
        }
    
    /**
     * Solopractice API base URL
     */
    val apiBaseUrl: String
        get() = BuildConfig.API_BASE_URL
    
    /**
     * API timeout settings (in seconds)
     */
    object Timeouts {
        const val CONNECT = 30L
        const val READ = 60L
        const val WRITE = 60L
    }
    
    /**
     * Retry configuration
     */
    object Retry {
        const val MAX_RETRIES = 3
        const val INITIAL_BACKOFF_MS = 1000L
        const val MAX_BACKOFF_MS = 10000L
        const val BACKOFF_MULTIPLIER = 2.0
    }
    
    /**
     * Feature flags
     */
    object Features {
        const val OFFLINE_MODE = true
        const val ANALYTICS_ENABLED = !BuildConfig.DEBUG
        const val CRASH_REPORTING_ENABLED = !BuildConfig.DEBUG
        const val LOGGING_ENABLED = BuildConfig.DEBUG
        const val CERTIFICATE_PINNING = currentEnvironment == Environment.PRODUCTION
    }
    
    /**
     * Security settings
     */
    object Security {
        const val TOKEN_REFRESH_THRESHOLD_SECONDS = 300L // Refresh 5 minutes before expiry
        const val MAX_PIN_ATTEMPTS = 5
        const val PIN_LOCKOUT_DURATION_SECONDS = 300L // 5 minutes
        const val SESSION_TIMEOUT_SECONDS = 1800L // 30 minutes
    }
    
    /**
     * Cache settings
     */
    object Cache {
        const val MESSAGES_CACHE_DURATION_MINUTES = 5L
        const val MEASUREMENTS_CACHE_DURATION_MINUTES = 10L
        const val PROFILE_CACHE_DURATION_MINUTES = 30L
    }
    
    /**
     * Audit logging settings
     */
    object Audit {
        const val ENABLED = true
        const val LOG_PHI_ACCESS = true
        const val LOG_AUTH_EVENTS = true
        const val LOG_API_CALLS = true
        const val MAX_LOG_AGE_DAYS = 90L
    }
    
    /**
     * Get environment-specific configuration
     */
    fun getEnvironmentConfig(): EnvironmentConfig {
        return when (currentEnvironment) {
            Environment.DEVELOPMENT -> DevelopmentConfig
            Environment.STAGING -> StagingConfig
            Environment.PRODUCTION -> ProductionConfig
        }
    }
}

/**
 * Environment-specific configuration
 */
interface EnvironmentConfig {
    val apiBaseUrl: String
    val enableLogging: Boolean
    val enableAnalytics: Boolean
    val enableCrashReporting: Boolean
    val certificatePinningEnabled: Boolean
}

object DevelopmentConfig : EnvironmentConfig {
    override val apiBaseUrl: String = BuildConfig.API_BASE_URL
    override val enableLogging: Boolean = true
    override val enableAnalytics: Boolean = false
    override val enableCrashReporting: Boolean = false
    override val certificatePinningEnabled: Boolean = false
}

object StagingConfig : EnvironmentConfig {
    override val apiBaseUrl: String = BuildConfig.API_BASE_URL
    override val enableLogging: Boolean = true
    override val enableAnalytics: Boolean = true
    override val enableCrashReporting: Boolean = true
    override val certificatePinningEnabled: Boolean = false // Can enable for testing
}

object ProductionConfig : EnvironmentConfig {
    override val apiBaseUrl: String = BuildConfig.API_BASE_URL
    override val enableLogging: Boolean = false // Only errors in production
    override val enableAnalytics: Boolean = true
    override val enableCrashReporting: Boolean = true
    override val certificatePinningEnabled: Boolean = true
}
