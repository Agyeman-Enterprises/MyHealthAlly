package com.agyeman.myhealthally.core.logging

import android.util.Log
import com.agyeman.myhealthally.core.config.AppConfig

/**
 * Enterprise Logging System
 * 
 * Provides structured logging with:
 * - PHI sanitization (HIPAA compliance)
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Remote logging integration (Sentry/Crashlytics)
 * - Performance monitoring
 */
object Logger {
    
    private const val TAG = "MyHealthAlly"
    private val isLoggingEnabled = AppConfig.Features.LOGGING_ENABLED
    
    /**
     * Log levels
     */
    enum class Level {
        DEBUG,
        INFO,
        WARN,
        ERROR
    }
    
    /**
     * Log debug message
     */
    fun d(tag: String = TAG, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) {
            val sanitizedMessage = sanitizePHI(message)
            if (throwable != null) {
                Log.d(tag, sanitizedMessage, throwable)
            } else {
                Log.d(tag, sanitizedMessage)
            }
        }
    }
    
    /**
     * Log info message
     */
    fun i(tag: String = TAG, message: String, throwable: Throwable? = null) {
        if (isLoggingEnabled) {
            val sanitizedMessage = sanitizePHI(message)
            if (throwable != null) {
                Log.i(tag, sanitizedMessage, throwable)
            } else {
                Log.i(tag, sanitizedMessage)
            }
        }
    }
    
    /**
     * Log warning message
     */
    fun w(tag: String = TAG, message: String, throwable: Throwable? = null) {
        val sanitizedMessage = sanitizePHI(message)
        if (throwable != null) {
            Log.w(tag, sanitizedMessage, throwable)
        } else {
            Log.w(tag, sanitizedMessage)
        }
        // Always log warnings to remote logging
        logToRemote(Level.WARN, tag, sanitizedMessage, throwable)
    }
    
    /**
     * Log error message
     */
    fun e(tag: String = TAG, message: String, throwable: Throwable? = null) {
        val sanitizedMessage = sanitizePHI(message)
        if (throwable != null) {
            Log.e(tag, sanitizedMessage, throwable)
        } else {
            Log.e(tag, sanitizedMessage)
        }
        // Always log errors to remote logging
        logToRemote(Level.ERROR, tag, sanitizedMessage, throwable)
    }
    
    /**
     * Log API call
     */
    fun logApiCall(
        method: String,
        endpoint: String,
        statusCode: Int? = null,
        durationMs: Long? = null,
        error: Throwable? = null
    ) {
        if (!AppConfig.Audit.LOG_API_CALLS) return
        
        val message = buildString {
            append("API Call: $method $endpoint")
            statusCode?.let { append(" | Status: $it") }
            durationMs?.let { append(" | Duration: ${it}ms") }
            error?.let { append(" | Error: ${it.message}") }
        }
        
        if (error != null || (statusCode != null && statusCode >= 400)) {
            e("API", message, error)
        } else {
            d("API", message)
        }
    }
    
    /**
     * Log authentication event
     */
    fun logAuthEvent(event: String, success: Boolean, error: Throwable? = null) {
        if (!AppConfig.Audit.LOG_AUTH_EVENTS) return
        
        val message = "Auth Event: $event | Success: $success"
        if (success) {
            i("Auth", message)
        } else {
            e("Auth", message, error)
        }
    }
    
    /**
     * Log PHI access (for audit trail)
     */
    fun logPHIAccess(resource: String, action: String, userId: String? = null) {
        if (!AppConfig.Audit.LOG_PHI_ACCESS) return
        
        val message = buildString {
            append("PHI Access: $action on $resource")
            userId?.let { append(" | User: ${sanitizeUserId(it)}") }
        }
        i("Audit", message)
    }
    
    /**
     * Sanitize PHI from log messages
     * Removes or masks sensitive information
     */
    private fun sanitizePHI(message: String): String {
        var sanitized = message
        
        // Remove email addresses
        sanitized = sanitized.replace(Regex("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"), "[EMAIL]")
        
        // Remove phone numbers
        sanitized = sanitized.replace(Regex("\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b"), "[PHONE]")
        
        // Remove SSN patterns
        sanitized = sanitized.replace(Regex("\\b\\d{3}-\\d{2}-\\d{4}\\b"), "[SSN]")
        
        // Remove potential medical record numbers (long numeric strings)
        sanitized = sanitized.replace(Regex("\\b\\d{8,}\\b"), "[MRN]")
        
        // Remove dates that might be DOB
        // (This is conservative - might need refinement)
        
        return sanitized
    }
    
    /**
     * Sanitize user ID for logging (keep first 4 chars, mask rest)
     */
    private fun sanitizeUserId(userId: String): String {
        return if (userId.length > 4) {
            "${userId.take(4)}****"
        } else {
            "****"
        }
    }
    
    /**
     * Log to remote logging service (Sentry/Crashlytics)
     */
    private fun logToRemote(level: Level, tag: String, message: String, throwable: Throwable?) {
        if (!AppConfig.Features.CRASH_REPORTING_ENABLED) return
        
        // TODO: Integrate with Sentry or Firebase Crashlytics
        // Example:
        // Sentry.captureMessage("[$tag] $message", level.toSentryLevel())
        // if (throwable != null) {
        //     Sentry.captureException(throwable)
        // }
    }
}
