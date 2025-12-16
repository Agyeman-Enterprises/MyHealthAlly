package com.agyeman.myhealthally.core.health

import com.agyeman.myhealthally.core.logging.Logger
import java.util.concurrent.atomic.AtomicLong

/**
 * CG-2A: Minimal Metrics Collection
 * 
 * Lightweight metrics for system health monitoring.
 * This is not full observability — just proof of life.
 */
object SystemMetrics {
    
    // Counters (in-memory, thread-safe)
    private val requestsTotal = AtomicLong(0)
    private val requestsFailed = AtomicLong(0)
    private val enforcementBlocks = AtomicLong(0)
    private val redEscalationsTriggered = AtomicLong(0)
    
    /**
     * Increment total requests counter
     */
    fun incrementRequestsTotal() {
        val count = requestsTotal.incrementAndGet()
        Logger.d("Metrics", "requests_total: $count")
    }
    
    /**
     * Increment failed requests counter
     */
    fun incrementRequestsFailed() {
        val count = requestsFailed.incrementAndGet()
        Logger.d("Metrics", "requests_failed: $count")
    }
    
    /**
     * Increment enforcement blocks counter
     */
    fun incrementEnforcementBlocks() {
        val count = enforcementBlocks.incrementAndGet()
        Logger.d("Metrics", "enforcement_blocks: $count")
    }
    
    /**
     * Increment red escalations counter
     */
    fun incrementRedEscalations() {
        val count = redEscalationsTriggered.incrementAndGet()
        Logger.w("Metrics", "red_escalations_triggered: $count")
    }
    
    /**
     * Get current metrics snapshot
     */
    fun getMetrics(): MetricsSnapshot {
        return MetricsSnapshot(
            requestsTotal = requestsTotal.get(),
            requestsFailed = requestsFailed.get(),
            enforcementBlocks = enforcementBlocks.get(),
            redEscalationsTriggered = redEscalationsTriggered.get()
        )
    }
    
    /**
     * Reset all metrics (for testing)
     */
    fun reset() {
        requestsTotal.set(0)
        requestsFailed.set(0)
        enforcementBlocks.set(0)
        redEscalationsTriggered.set(0)
        Logger.d("Metrics", "Metrics reset")
    }
}

/**
 * Metrics snapshot
 */
data class MetricsSnapshot(
    val requestsTotal: Long,
    val requestsFailed: Long,
    val enforcementBlocks: Long,
    val redEscalationsTriggered: Long
) {
    /**
     * Calculate failure rate
     */
    fun getFailureRate(): Double {
        return if (requestsTotal > 0) {
            requestsFailed.toDouble() / requestsTotal.toDouble()
        } else {
            0.0
        }
    }
}
