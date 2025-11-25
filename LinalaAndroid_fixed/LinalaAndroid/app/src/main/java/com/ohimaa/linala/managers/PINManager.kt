package com.ohimaa.linala.managers

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.security.MessageDigest

/**
 * PIN Manager
 * Handles app-level PIN authentication with secure storage
 */
class PINManager(context: Context) {
    
    companion object {
        private const val PREFS_NAME = "linala_secure_prefs"
        private const val KEY_PIN_HASH = "pin_hash"
        private const val KEY_FAILED_ATTEMPTS = "failed_attempts"
        private const val KEY_LOCKOUT_END = "lockout_end"
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"
        
        private const val MAX_ATTEMPTS = 5
        private const val LOCKOUT_DURATION_MS = 5 * 60 * 1000L // 5 minutes
        private const val SALT = "linala_pin_salt_ohimaa_gu_2024"
    }
    
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val securePrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        PREFS_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    private val _isPINSet = MutableStateFlow(checkPINExists())
    val isPINSet: StateFlow<Boolean> = _isPINSet.asStateFlow()
    
    private val _failedAttempts = MutableStateFlow(getStoredFailedAttempts())
    val failedAttempts: StateFlow<Int> = _failedAttempts.asStateFlow()
    
    private val _isLocked = MutableStateFlow(checkLockoutStatus())
    val isLocked: StateFlow<Boolean> = _isLocked.asStateFlow()
    
    private val _lockoutEndTime = MutableStateFlow(getStoredLockoutEnd())
    val lockoutEndTime: StateFlow<Long> = _lockoutEndTime.asStateFlow()
    
    var isBiometricEnabled: Boolean
        get() = securePrefs.getBoolean(KEY_BIOMETRIC_ENABLED, false)
        set(value) = securePrefs.edit().putBoolean(KEY_BIOMETRIC_ENABLED, value).apply()
    
    // MARK: - PIN Status
    
    private fun checkPINExists(): Boolean {
        return securePrefs.contains(KEY_PIN_HASH)
    }
    
    private fun getStoredFailedAttempts(): Int {
        return securePrefs.getInt(KEY_FAILED_ATTEMPTS, 0)
    }
    
    private fun getStoredLockoutEnd(): Long {
        return securePrefs.getLong(KEY_LOCKOUT_END, 0)
    }
    
    private fun checkLockoutStatus(): Boolean {
        val lockoutEnd = getStoredLockoutEnd()
        return System.currentTimeMillis() < lockoutEnd
    }
    
    // MARK: - PIN Operations
    
    /**
     * Set a new PIN (4-6 digits)
     */
    fun setPIN(pin: String): Boolean {
        if (pin.length !in 4..6) return false
        if (!pin.all { it.isDigit() }) return false
        
        val hash = hashPIN(pin)
        securePrefs.edit()
            .putString(KEY_PIN_HASH, hash)
            .putInt(KEY_FAILED_ATTEMPTS, 0)
            .apply()
        
        _isPINSet.value = true
        _failedAttempts.value = 0
        
        return true
    }
    
    /**
     * Verify PIN
     */
    fun verifyPIN(pin: String): Boolean {
        if (_isLocked.value) {
            // Check if lockout has expired
            if (System.currentTimeMillis() >= _lockoutEndTime.value) {
                clearLockout()
            } else {
                return false
            }
        }
        
        val storedHash = securePrefs.getString(KEY_PIN_HASH, null) ?: return false
        val inputHash = hashPIN(pin)
        
        return if (inputHash == storedHash) {
            _failedAttempts.value = 0
            securePrefs.edit().putInt(KEY_FAILED_ATTEMPTS, 0).apply()
            true
        } else {
            val attempts = _failedAttempts.value + 1
            _failedAttempts.value = attempts
            securePrefs.edit().putInt(KEY_FAILED_ATTEMPTS, attempts).apply()
            
            if (attempts >= MAX_ATTEMPTS) {
                activateLockout()
            }
            false
        }
    }
    
    /**
     * Change PIN (requires current PIN verification)
     */
    fun changePIN(currentPIN: String, newPIN: String): Boolean {
        if (!verifyPIN(currentPIN)) return false
        return setPIN(newPIN)
    }
    
    /**
     * Remove PIN (requires current PIN verification)
     */
    fun removePIN(currentPIN: String): Boolean {
        if (!verifyPIN(currentPIN)) return false
        
        securePrefs.edit()
            .remove(KEY_PIN_HASH)
            .remove(KEY_FAILED_ATTEMPTS)
            .apply()
        
        _isPINSet.value = false
        return true
    }
    
    // MARK: - Lockout Management
    
    private fun activateLockout() {
        val lockoutEnd = System.currentTimeMillis() + LOCKOUT_DURATION_MS
        _isLocked.value = true
        _lockoutEndTime.value = lockoutEnd
        securePrefs.edit().putLong(KEY_LOCKOUT_END, lockoutEnd).apply()
    }
    
    fun clearLockout() {
        _isLocked.value = false
        _lockoutEndTime.value = 0
        _failedAttempts.value = 0
        securePrefs.edit()
            .putLong(KEY_LOCKOUT_END, 0)
            .putInt(KEY_FAILED_ATTEMPTS, 0)
            .apply()
    }
    
    /**
     * Get remaining lockout time in milliseconds
     */
    fun getRemainingLockoutTime(): Long {
        return maxOf(0, _lockoutEndTime.value - System.currentTimeMillis())
    }
    
    /**
     * Format remaining lockout time as "M:SS"
     */
    fun getFormattedRemainingTime(): String {
        val remaining = getRemainingLockoutTime()
        val minutes = (remaining / 1000 / 60).toInt()
        val seconds = ((remaining / 1000) % 60).toInt()
        return String.format("%d:%02d", minutes, seconds)
    }
    
    // MARK: - Hashing
    
    private fun hashPIN(pin: String): String {
        val combined = pin + SALT
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(combined.toByteArray())
        return hashBytes.joinToString("") { "%02x".format(it) }
    }
}
