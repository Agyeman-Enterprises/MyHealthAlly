package com.agyeman.myhealthally.core.enforcement

import com.agyeman.myhealthally.core.audit.AuditLogger
import com.agyeman.myhealthally.core.logging.Logger

/**
 * R11: No Silent Failure Invariant
 * 
 * Any exception path must:
 * - leave a terminal state
 * - create a work item or
 * - block progression explicitly
 * 
 * "Nothing happened" is not allowed.
 */
object NoSilentFailure {
    
    /**
     * Assert that a terminal outcome was reached
     * 
     * This guard must run at the end of every request handler / workflow
     * 
     * @param context The execution context
     * @throws SilentFailureException if no terminal outcome was reached
     */
    fun assertTerminalOutcome(context: ExecutionContext) {
        val outcome = context.outcome
        
        when {
            // Explicit success
            outcome is TerminalOutcome.Success -> {
                Logger.d("R11", "Terminal outcome: Success")
                return
            }
            
            // Explicit block
            outcome is TerminalOutcome.Blocked -> {
                Logger.d("R11", "Terminal outcome: Blocked - ${outcome.reason}")
                return
            }
            
            // Explicit deferral
            outcome is TerminalOutcome.Deferred -> {
                Logger.d("R11", "Terminal outcome: Deferred - ${outcome.reason}")
                return
            }
            
            // Work item created
            outcome is TerminalOutcome.WorkItemCreated -> {
                Logger.d("R11", "Terminal outcome: WorkItemCreated - ${outcome.workItemId}")
                return
            }
            
            // No terminal outcome - this is a silent failure
            else -> {
                val error = SilentFailureException(
                    "No terminal outcome reached. Outcome: ${outcome?.javaClass?.simpleName ?: "null"}",
                    context
                )
                
                Logger.e("R11", "Silent failure prevented", error)
                
                // Write audit log
                context.auditLogger?.let { auditLogger ->
                    // This would be async in production
                    // auditLogger.logSecurityEvent(
                    //     eventType = "silent_failure_prevented",
                    //     details = mapOf(
                    //         "context" to context.toString(),
                    //         "outcome" to (outcome?.toString() ?: "null")
                    //     )
                    // )
                }
                
                throw error
            }
        }
    }
    
    /**
     * Create a terminal outcome from a result
     */
    fun <T> createTerminalOutcome(result: Result<T>): TerminalOutcome {
        return result.fold(
            onSuccess = { TerminalOutcome.Success(it) },
            onFailure = { exception ->
                when (exception) {
                    is BlockedException -> TerminalOutcome.Blocked(exception.reason)
                    is DeferredException -> TerminalOutcome.Deferred(exception.reason, exception.nextActionAt)
                    is WorkItemCreatedException -> TerminalOutcome.WorkItemCreated(exception.workItemId)
                    else -> TerminalOutcome.Blocked("Unexpected error: ${exception.message}")
                }
            }
        )
    }
}

/**
 * Execution context
 */
data class ExecutionContext(
    val requestId: String,
    val patientId: String? = null,
    val userId: String? = null,
    val outcome: TerminalOutcome? = null,
    val auditLogger: AuditLogger? = null
)

/**
 * Terminal outcomes
 */
sealed class TerminalOutcome {
    data class Success(val data: Any? = null) : TerminalOutcome()
    data class Blocked(val reason: String, val details: Map<String, Any>? = null) : TerminalOutcome()
    data class Deferred(val reason: String, val nextActionAt: Date? = null) : TerminalOutcome()
    data class WorkItemCreated(val workItemId: String, val priority: String? = null) : TerminalOutcome()
}

/**
 * Silent failure exception
 */
class SilentFailureException(
    message: String,
    val context: ExecutionContext
) : Exception(message)

/**
 * Blocked exception
 */
class BlockedException(val reason: String) : Exception(reason)

/**
 * Deferred exception
 */
class DeferredException(val reason: String, val nextActionAt: Date? = null) : Exception(reason)

/**
 * Work item created exception
 */
class WorkItemCreatedException(val workItemId: String) : Exception("Work item created: $workItemId")
