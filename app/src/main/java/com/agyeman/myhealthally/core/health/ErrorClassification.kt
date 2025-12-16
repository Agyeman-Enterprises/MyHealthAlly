package com.agyeman.myhealthally.core.health

import com.agyeman.myhealthally.core.logging.Logger

/**
 * CG-2A: Error Classification
 * 
 * Structured error categories for system health monitoring.
 * Every thrown error must map to one category.
 */
object ErrorClassification {
    
    /**
     * Error categories
     */
    enum class ErrorCategory {
        SYSTEM_OUTAGE,        // System is down or unavailable
        DEPENDENCY_FAILURE,   // External dependency failed
        TIMEOUT,              // Operation timed out
        LOGIC_VIOLATION,      // Business logic violation (CG rules, etc.)
        UNKNOWN               // Unclassified error
    }
    
    /**
     * Classify an error
     * 
     * @param throwable The exception/error to classify
     * @return ErrorCategory
     */
    fun classifyError(throwable: Throwable): ErrorCategory {
        return when {
            isSystemOutage(throwable) -> ErrorCategory.SYSTEM_OUTAGE
            isDependencyFailure(throwable) -> ErrorCategory.DEPENDENCY_FAILURE
            isTimeout(throwable) -> ErrorCategory.TIMEOUT
            isLogicViolation(throwable) -> ErrorCategory.LOGIC_VIOLATION
            else -> ErrorCategory.UNKNOWN
        }
    }
    
    /**
     * Check if error indicates system outage
     */
    private fun isSystemOutage(throwable: Throwable): Boolean {
        val message = throwable.message?.lowercase() ?: ""
        val className = throwable.javaClass.simpleName.lowercase()
        
        return message.contains("connection refused") ||
               message.contains("service unavailable") ||
               message.contains("503") ||
               message.contains("502") ||
               message.contains("500") ||
               className.contains("connection") ||
               className.contains("unavailable")
    }
    
    /**
     * Check if error indicates dependency failure
     */
    private fun isDependencyFailure(throwable: Throwable): Boolean {
        val message = throwable.message?.lowercase() ?: ""
        val className = throwable.javaClass.simpleName.lowercase()
        
        return message.contains("database") ||
               message.contains("external service") ||
               message.contains("dependency") ||
               message.contains("third party") ||
               className.contains("sql") ||
               className.contains("database")
    }
    
    /**
     * Check if error indicates timeout
     */
    private fun isTimeout(throwable: Throwable): Boolean {
        val message = throwable.message?.lowercase() ?: ""
        val className = throwable.javaClass.simpleName.lowercase()
        
        return message.contains("timeout") ||
               message.contains("timed out") ||
               message.contains("408") ||
               className.contains("timeout")
    }
    
    /**
     * Check if error indicates logic violation
     */
    private fun isLogicViolation(throwable: Throwable): Boolean {
        val message = throwable.message?.lowercase() ?: ""
        val className = throwable.javaClass.simpleName.lowercase()
        
        return message.contains("rule") ||
               message.contains("violation") ||
               message.contains("blocked") ||
               message.contains("forbidden") ||
               message.contains("403") ||
               className.contains("rule") ||
               className.contains("violation") ||
               className.contains("blocked")
    }
    
    /**
     * Get error details for logging
     */
    fun getErrorDetails(throwable: Throwable): ErrorDetails {
        val category = classifyError(throwable)
        
        Logger.e("ErrorClassification", "Error classified as: $category", throwable)
        
        return ErrorDetails(
            category = category,
            message = throwable.message ?: "Unknown error",
            className = throwable.javaClass.simpleName,
            stackTrace = throwable.stackTrace.take(5).joinToString("\n") { it.toString() }
        )
    }
}

/**
 * Error details
 */
data class ErrorDetails(
    val category: ErrorClassification.ErrorCategory,
    val message: String,
    val className: String,
    val stackTrace: String
)
