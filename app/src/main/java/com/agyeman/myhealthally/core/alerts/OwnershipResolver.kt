package com.agyeman.myhealthally.core.alerts

import com.agyeman.myhealthally.core.logging.Logger

/**
 * CG-2D: Ownership Resolution
 * 
 * Resolves on-call owner with fallback chain:
 * 1. Explicit on-call owner config
 * 2. Admin role fallback
 * 3. System owner (you, for now)
 * 
 * No nulls. Ever.
 */
class OwnershipResolver {
    
    private var explicitOnCallOwner: AlertChannel? = null
    private var adminFallback: AlertChannel? = null
    private val systemOwner: AlertChannel = AlertChannel.EmailChannel(
        target = "system-owner@solopractice.com",
        enabled = true
    )
    
    /**
     * Set explicit on-call owner (admin-only)
     */
    fun setOnCallOwner(channel: AlertChannel, adminUserId: String) {
        // In production, verify admin role
        // if (!isAdmin(adminUserId)) {
        //     throw Exception("Unauthorized: Admin role required")
        // }
        
        explicitOnCallOwner = channel
        Logger.i("Ownership", "On-call owner set: ${channel.type} → ${channel.target}")
    }
    
    /**
     * Set admin fallback (admin-only)
     */
    fun setAdminFallback(channel: AlertChannel, adminUserId: String) {
        // In production, verify admin role
        adminFallback = channel
        Logger.i("Ownership", "Admin fallback set: ${channel.type} → ${channel.target}")
    }
    
    /**
     * Resolve on-call owner
     * 
     * Priority:
     * 1. Explicit on-call owner
     * 2. Admin fallback
     * 3. System owner
     * 
     * No nulls. Ever.
     */
    fun resolveOnCallOwner(): AlertChannel {
        return explicitOnCallOwner
            ?: adminFallback
            ?: systemOwner
    }
    
    /**
     * Resolve on-call owner for specific org
     * 
     * In production, this would check org-specific on-call config
     */
    fun resolveOnCallOwner(orgId: String): AlertChannel {
        // In production, check org-specific config first
        // For now, use global resolution
        return resolveOnCallOwner()
    }
}
