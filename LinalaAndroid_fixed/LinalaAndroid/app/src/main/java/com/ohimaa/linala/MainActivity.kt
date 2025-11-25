package com.ohimaa.linala

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.ohimaa.linala.managers.AudioRecordingManager
import com.ohimaa.linala.managers.BiometricAuthManager
import com.ohimaa.linala.managers.PINManager
import com.ohimaa.linala.ui.MainAppWithBottomNav
import com.ohimaa.linala.ui.theme.LinalaTheme

class MainActivity : ComponentActivity() {
    
    private lateinit var biometricManager: BiometricAuthManager
    private lateinit var pinManager: PINManager
    private lateinit var recordingManager: AudioRecordingManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize managers
        biometricManager = BiometricAuthManager(this)
        pinManager = PINManager(this)
        recordingManager = AudioRecordingManager(this)
        
        enableEdgeToEdge()
        
        setContent {
            LinalaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Handle app lifecycle for locking
                    AppLifecycleHandler(
                        biometricManager = biometricManager,
                        pinManager = pinManager
                    )
                    
                    MainAppWithBottomNav(
                        biometricManager = biometricManager,
                        pinManager = pinManager,
                        recordingManager = recordingManager
                    )
                }
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Clean up recording manager
        recordingManager.cancelRecording()
    }
}

/**
 * Handles app lifecycle events for security
 * Locks the app when it goes to background (if PIN/biometric is enabled)
 */
@Composable
fun AppLifecycleHandler(
    biometricManager: BiometricAuthManager,
    pinManager: PINManager
) {
    val lifecycleOwner = LocalLifecycleOwner.current
    var wasInBackground by remember { mutableStateOf(false) }
    
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_STOP -> {
                    // App went to background
                    wasInBackground = true
                    if (pinManager.isPINSet.value || pinManager.isBiometricEnabled) {
                        biometricManager.lock()
                    }
                }
                Lifecycle.Event.ON_START -> {
                    // App came to foreground
                    if (wasInBackground) {
                        wasInBackground = false
                        // Lock screen will show automatically via navigation
                    }
                }
                else -> {}
            }
        }
        
        lifecycleOwner.lifecycle.addObserver(observer)
        
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }
}
