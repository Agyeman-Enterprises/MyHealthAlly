package com.agyeman.myhealthally.core.enforcement

import com.agyeman.myhealthally.core.logging.Logger

/**
 * R12: Rule Priority Resolution
 * 
 * When rules conflict, enforcement priority is:
 * 1. Patient safety (highest)
 * 2. Explicit policy
 * 3. Provider approval
 * 4. Automation convenience (lowest)
 * 
 * This priority must be encoded, not implied.
 */
object RulePriorityResolver {
    
    /**
     * Priority levels (higher number = higher priority)
     */
    enum class Priority(val level: Int, val description: String) {
        AUTOMATION_CONVENIENCE(1, "Automation convenience - lowest priority"),
        PROVIDER_APPROVAL(2, "Provider approval"),
        EXPLICIT_POLICY(3, "Explicit policy"),
        PATIENT_SAFETY(4, "Patient safety - highest priority");
        
        companion object {
            fun fromRuleResult(result: RuleResult): Priority {
                return when (result.ruleType) {
                    RuleType.SAFETY -> PATIENT_SAFETY
                    RuleType.POLICY -> EXPLICIT_POLICY
                    RuleType.PROVIDER_APPROVAL -> PROVIDER_APPROVAL
                    RuleType.AUTOMATION -> AUTOMATION_CONVENIENCE
                }
            }
        }
    }
    
    /**
     * Resolve conflicts between multiple rule results
     * 
     * @param ruleResults Array of rule results that may conflict
     * @return Resolved outcome based on priority
     */
    fun resolveRuleConflict(ruleResults: List<RuleResult>): ResolvedOutcome {
        if (ruleResults.isEmpty()) {
            Logger.w("R12", "No rule results provided")
            return ResolvedOutcome.allowed("No rules to evaluate")
        }
        
        // Sort by priority (highest first)
        val sortedResults = ruleResults.sortedByDescending { Priority.fromRuleResult(it).level }
        
        Logger.d("R12", "Resolving ${ruleResults.size} rule results")
        sortedResults.forEach { result ->
            Logger.d("R12", "  ${result.ruleType.name} (${Priority.fromRuleResult(result).description}): ${result.action}")
        }
        
        // Apply priority rules
        for (result in sortedResults) {
            val priority = Priority.fromRuleResult(result)
            
            // Safety overrides all
            if (priority == Priority.PATIENT_SAFETY && result.action == RuleAction.BLOCK) {
                Logger.i("R12", "Patient safety rule blocks action: ${result.reason}")
                return ResolvedOutcome.blocked(
                    reason = result.reason ?: "Blocked by patient safety rule",
                    ruleType = result.ruleType,
                    details = result.details
                )
            }
            
            // Provider approval overrides automation
            if (priority == Priority.PROVIDER_APPROVAL && result.action == RuleAction.ALLOW) {
                val lowerPriorityBlocks = sortedResults
                    .filter { Priority.fromRuleResult(it).level < priority.level }
                    .any { it.action == RuleAction.BLOCK }
                
                if (lowerPriorityBlocks) {
                    Logger.i("R12", "Provider approval overrides automation convenience")
                    return ResolvedOutcome.allowed(
                        reason = result.reason ?: "Allowed by provider approval",
                        ruleType = result.ruleType,
                        details = result.details
                    )
                }
            }
            
            // Policy overrides convenience
            if (priority == Priority.EXPLICIT_POLICY && result.action == RuleAction.BLOCK) {
                val lowerPriorityAllows = sortedResults
                    .filter { Priority.fromRuleResult(it).level < priority.level }
                    .any { it.action == RuleAction.ALLOW }
                
                if (lowerPriorityAllows) {
                    Logger.i("R12", "Explicit policy overrides automation convenience")
                    return ResolvedOutcome.blocked(
                        reason = result.reason ?: "Blocked by explicit policy",
                        ruleType = result.ruleType,
                        details = result.details
                    )
                }
            }
            
            // Convenience never overrides safety
            if (priority == Priority.AUTOMATION_CONVENIENCE) {
                val higherPriorityBlocks = sortedResults
                    .filter { Priority.fromRuleResult(it).level > priority.level }
                    .any { it.action == RuleAction.BLOCK }
                
                if (higherPriorityBlocks) {
                    Logger.i("R12", "Automation convenience cannot override higher priority block")
                    continue // Skip this result, check next
                }
            }
            
            // Apply the result if no conflicts
            when (result.action) {
                RuleAction.BLOCK -> {
                    return ResolvedOutcome.blocked(
                        reason = result.reason ?: "Blocked by ${result.ruleType.name}",
                        ruleType = result.ruleType,
                        details = result.details
                    )
                }
                RuleAction.ALLOW -> {
                    // Continue to check if higher priority blocks
                    continue
                }
                RuleAction.DEFER -> {
                    return ResolvedOutcome.deferred(
                        reason = result.reason ?: "Deferred by ${result.ruleType.name}",
                        ruleType = result.ruleType,
                        details = result.details
                    )
                }
            }
        }
        
        // If we get here, all rules allow
        Logger.d("R12", "All rules allow action")
        return ResolvedOutcome.allowed(
            reason = "All rules allow",
            ruleType = null,
            details = null
        )
    }
}

/**
 * Rule result
 */
data class RuleResult(
    val ruleType: RuleType,
    val action: RuleAction,
    val reason: String? = null,
    val details: Map<String, Any>? = null
)

/**
 * Rule types
 */
enum class RuleType {
    SAFETY,              // Patient safety rules (R2, R4, R5, R7)
    POLICY,              // Explicit policy rules (R1, R3)
    PROVIDER_APPROVAL,   // Provider approval required (R9)
    AUTOMATION           // Automation convenience
}

/**
 * Rule actions
 */
enum class RuleAction {
    ALLOW,
    BLOCK,
    DEFER
}

/**
 * Resolved outcome
 */
sealed class ResolvedOutcome {
    abstract val reason: String
    abstract val ruleType: RuleType?
    abstract val details: Map<String, Any>?
    
    data class Allowed(
        override val reason: String,
        override val ruleType: RuleType?,
        override val details: Map<String, Any>?
    ) : ResolvedOutcome()
    
    data class Blocked(
        override val reason: String,
        override val ruleType: RuleType?,
        override val details: Map<String, Any>?
    ) : ResolvedOutcome()
    
    data class Deferred(
        override val reason: String,
        override val ruleType: RuleType?,
        override val details: Map<String, Any>?
    ) : ResolvedOutcome()
    
    companion object {
        fun allowed(reason: String, ruleType: RuleType? = null, details: Map<String, Any>? = null) =
            Allowed(reason, ruleType, details)
        
        fun blocked(reason: String, ruleType: RuleType? = null, details: Map<String, Any>? = null) =
            Blocked(reason, ruleType, details)
        
        fun deferred(reason: String, ruleType: RuleType? = null, details: Map<String, Any>? = null) =
            Deferred(reason, ruleType, details)
    }
}
