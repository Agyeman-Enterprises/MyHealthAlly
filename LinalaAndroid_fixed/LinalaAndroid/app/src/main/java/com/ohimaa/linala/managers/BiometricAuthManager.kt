package com.ohimaa.linala.managers

import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Biometric Authentication Manager
 * Handles fingerprint, face, and iris recognition on Android
 */
class BiometricAuthManager(private val context: Context) {
    
    private val biometricManager = BiometricManager.from(context)
    
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()
    
    private val _authError = MutableStateFlow<String?>(null)
    val authError: StateFlow<String?> = _authError.asStateFlow()
    
    private val _requiresPINFallback = MutableStateFlow(false)
    val requiresPINFallback: StateFlow<Boolean> = _requiresPINFallback.asStateFlow()
    
    /**
     * Check if biometric authentication is available
     */
    fun canAuthenticate(): BiometricStatus {
        return when (biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG or
            BiometricManager.Authenticators.BIOMETRIC_WEAK
        )) {
            BiometricManager.BIOMETRIC_SUCCESS -> BiometricStatus.Available
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> BiometricStatus.NoHardware
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> BiometricStatus.HardwareUnavailable
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricStatus.NoneEnrolled
            BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED -> BiometricStatus.SecurityUpdateRequired
            else -> BiometricStatus.Unknown
        }
    }
    
    /**
     * Check if device credential (PIN/Pattern/Password) is available
     */
    fun canAuthenticateWithDeviceCredential(): Boolean {
        return biometricManager.canAuthenticate(
            BiometricManager.Authenticators.DEVICE_CREDENTIAL
        ) == BiometricManager.BIOMETRIC_SUCCESS
    }
    
    /**
     * Authenticate with biometrics
     */
    fun authenticate(
        activity: FragmentActivity,
        title: String = "Unlock ${com.ohimaa.linala.ui.theme.BrandConfig.appName}",
        subtitle: String = "Authenticate to access your health information",
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onFallback: () -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(context)
        
        val callback = object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                _isAuthenticated.value = true
                _authError.value = null
                _requiresPINFallback.value = false
                onSuccess()
            }
            
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                
                when (errorCode) {
                    BiometricPrompt.ERROR_NEGATIVE_BUTTON -> {
                        // User chose to use PIN
                        _requiresPINFallback.value = true
                        onFallback()
                    }
                    BiometricPrompt.ERROR_USER_CANCELED -> {
                        // User cancelled - don't show error
                    }
                    BiometricPrompt.ERROR_LOCKOUT,
                    BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> {
                        _requiresPINFallback.value = true
                        _authError.value = "Biometric locked. Please use PIN."
                        onFallback()
                    }
                    else -> {
                        _authError.value = errString.toString()
                        onError(errString.toString())
                    }
                }
            }
            
            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                // Single attempt failed, prompt continues
            }
        }
        
        val biometricPrompt = BiometricPrompt(activity, executor, callback)
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setNegativeButtonText("Use PIN")
            .setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG or
                BiometricManager.Authenticators.BIOMETRIC_WEAK
            )
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
    
    /**
     * Authenticate with device credential (PIN/Pattern/Password) as fallback
     */
    fun authenticateWithDeviceCredential(
        activity: FragmentActivity,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(context)
        
        val callback = object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                _isAuthenticated.value = true
                _authError.value = null
                onSuccess()
            }
            
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                if (errorCode != BiometricPrompt.ERROR_USER_CANCELED) {
                    _authError.value = errString.toString()
                    onError(errString.toString())
                }
            }
        }
        
        val biometricPrompt = BiometricPrompt(activity, executor, callback)
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Unlock ${com.ohimaa.linala.ui.theme.BrandConfig.appName}")
            .setSubtitle("Enter your device PIN, pattern, or password")
            .setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG or
                BiometricManager.Authenticators.BIOMETRIC_WEAK or
                BiometricManager.Authenticators.DEVICE_CREDENTIAL
            )
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
    
    /**
     * Lock the app
     */
    fun lock() {
        _isAuthenticated.value = false
        _requiresPINFallback.value = false
        _authError.value = null
    }
    
    /**
     * Unlock with PIN (called when PIN verification succeeds)
     */
    fun unlockWithPIN() {
        _isAuthenticated.value = true
        _requiresPINFallback.value = false
        _authError.value = null
    }
    
    /**
     * Clear error
     */
    fun clearError() {
        _authError.value = null
    }
}

enum class BiometricStatus {
    Available,
    NoHardware,
    HardwareUnavailable,
    NoneEnrolled,
    SecurityUpdateRequired,
    Unknown
}
