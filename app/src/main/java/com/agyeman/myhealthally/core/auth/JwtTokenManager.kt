package com.agyeman.myhealthally.core.auth

import android.util.Base64
import com.agyeman.myhealthally.core.logging.Logger
import org.json.JSONObject

/**
 * JWT Token Manager
 * 
 * Parses and manages JWT tokens for authentication
 * Extracts user context (user ID, patient ID, etc.) from tokens
 */
object JwtTokenManager {
    
    /**
     * Parse JWT token and extract payload
     */
    fun parseToken(token: String): TokenPayload? {
        return try {
            val parts = token.split(".")
            if (parts.size != 3) {
                Logger.e("JWT", "Invalid token format")
                return null
            }
            
            val payload = parts[1]
            val decodedBytes = Base64.decode(payload, Base64.URL_SAFE)
            val decodedString = String(decodedBytes)
            val json = JSONObject(decodedString)
            
            TokenPayload(
                userId = json.optString("sub") ?: json.optString("user_id"),
                patientId = json.optString("patient_id"),
                practiceId = json.optString("practice_id"),
                email = json.optString("email"),
                role = json.optString("role"),
                expiresAt = json.optLong("exp", 0L) * 1000, // Convert to milliseconds
                issuedAt = json.optLong("iat", 0L) * 1000
            )
        } catch (e: Exception) {
            Logger.e("JWT", "Failed to parse token", e)
            null
        }
    }
    
    /**
     * Check if token is expired
     */
    fun isTokenExpired(token: String): Boolean {
        val payload = parseToken(token) ?: return true
        val now = System.currentTimeMillis()
        return payload.expiresAt > 0 && now >= payload.expiresAt
    }
    
    /**
     * Check if token needs refresh (within threshold)
     */
    fun needsRefresh(token: String, thresholdSeconds: Long = 300L): Boolean {
        val payload = parseToken(token) ?: return true
        if (payload.expiresAt <= 0) return false
        
        val now = System.currentTimeMillis()
        val thresholdMs = thresholdSeconds * 1000
        return (payload.expiresAt - now) <= thresholdMs
    }
    
    /**
     * Get time until token expires (in seconds)
     */
    fun getTimeUntilExpiry(token: String): Long {
        val payload = parseToken(token) ?: return 0L
        if (payload.expiresAt <= 0) return Long.MAX_VALUE
        
        val now = System.currentTimeMillis()
        val remaining = (payload.expiresAt - now) / 1000
        return maxOf(0, remaining)
    }
    
    /**
     * JWT Token Payload
     */
    data class TokenPayload(
        val userId: String?,
        val patientId: String?,
        val practiceId: String?,
        val email: String?,
        val role: String?,
        val expiresAt: Long,
        val issuedAt: Long
    )
}
