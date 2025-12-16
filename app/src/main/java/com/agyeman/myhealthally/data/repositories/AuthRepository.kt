package com.agyeman.myhealthally.data.repositories

import android.content.Context
import com.agyeman.myhealthally.core.auth.JwtTokenManager
import com.agyeman.myhealthally.managers.PINManager

/**
 * Authentication Repository
 * 
 * Manages authentication state and user context
 */
class AuthRepository(private val context: Context) {
    
    private val pinManager = PINManager(context)
    
    /**
     * Get current user ID from JWT token
     */
    fun getCurrentUserId(): String? {
        val token = pinManager.getAuthToken() ?: return null
        val payload = JwtTokenManager.parseToken(token)
        return payload?.userId
    }
    
    /**
     * Get current patient ID from JWT token
     */
    fun getCurrentPatientId(): String? {
        val token = pinManager.getAuthToken() ?: return null
        val payload = JwtTokenManager.parseToken(token)
        return payload?.patientId
    }
    
    /**
     * Get current practice ID from JWT token
     */
    fun getCurrentPracticeId(): String? {
        val token = pinManager.getAuthToken() ?: return null
        val payload = JwtTokenManager.parseToken(token)
        return payload?.practiceId
    }
    
    /**
     * Get current user role from JWT token
     */
    fun getCurrentUserRole(): String? {
        val token = pinManager.getAuthToken() ?: return null
        val payload = JwtTokenManager.parseToken(token)
        return payload?.role
    }
    
    /**
     * Check if user is authenticated
     */
    fun isAuthenticated(): Boolean {
        val token = pinManager.getAuthToken() ?: return false
        return !JwtTokenManager.isTokenExpired(token)
    }
    
    /**
     * Check if token needs refresh
     */
    fun needsTokenRefresh(): Boolean {
        val token = pinManager.getAuthToken() ?: return true
        return JwtTokenManager.needsRefresh(token)
    }
    
    /**
     * Get all user context
     */
    data class UserContext(
        val userId: String?,
        val patientId: String?,
        val practiceId: String?,
        val role: String?,
        val isAuthenticated: Boolean
    )
    
    fun getUserContext(): UserContext {
        val token = pinManager.getAuthToken()
        val payload = token?.let { JwtTokenManager.parseToken(it) }
        
        return UserContext(
            userId = payload?.userId,
            patientId = payload?.patientId,
            practiceId = payload?.practiceId,
            role = payload?.role,
            isAuthenticated = isAuthenticated()
        )
    }
}
