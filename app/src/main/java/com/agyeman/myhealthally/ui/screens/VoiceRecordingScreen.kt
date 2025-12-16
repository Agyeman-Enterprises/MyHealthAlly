package com.agyeman.myhealthally.ui.screens

import android.Manifest
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.agyeman.myhealthally.data.models.solopractice.SymptomScreenResult
import com.agyeman.myhealthally.data.repositories.AuthRepository
import com.agyeman.myhealthally.data.repositories.MessagesRepository
import com.agyeman.myhealthally.managers.AudioRecordingManager
import com.agyeman.myhealthally.managers.PINManager
import com.agyeman.myhealthally.ui.theme.StatusError
import com.agyeman.myhealthally.ui.theme.TealPrimary
import com.agyeman.myhealthally.ui.components.DisclaimerBanner
import com.agyeman.myhealthally.core.governance.RoleClarity
import com.agyeman.myhealthally.core.governance.MisuseDetection
import com.agyeman.myhealthally.core.audit.AuditLogger
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import java.io.File

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun VoiceRecordingScreen(navController: NavController) {
    val context = LocalContext.current
    val audioManager = remember { AudioRecordingManager(context) }
    val messagesRepository = remember { MessagesRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val pinManager = remember { PINManager(context) }
    val scope = rememberCoroutineScope()
    
    val isRecording by audioManager.isRecording.collectAsState()
    var recordingDuration by remember { mutableStateOf(0) }
    var showSuccessDialog by remember { mutableStateOf(false) }
    var showSymptomScreen by remember { mutableStateOf(false) }
    var showDeferredDialog by remember { mutableStateOf<String?>(null) }
    var showBlockedDialog by remember { mutableStateOf<String?>(null) }
    var showEmergencyDialog by remember { mutableStateOf(false) }
    var showErrorDialog by remember { mutableStateOf<String?>(null) }
    var isSending by remember { mutableStateOf(false) }
    
    var recordedFile: File? by remember { mutableStateOf(null) }
    var recordedDuration: Int by remember { mutableStateOf(0) }
    
    // Permission handling
    val audioPermission = rememberPermissionState(Manifest.permission.RECORD_AUDIO)
    
    // Update duration
    LaunchedEffect(isRecording) {
        while (isRecording) {
            delay(1000)
            recordingDuration++
        }
    }
    
    DisposableEffect(Unit) {
        onDispose {
            audioManager.release()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Record Message") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (!audioPermission.status.isGranted) {
                // Permission request UI
                Text(
                    text = "Microphone permission is required",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = { audioPermission.launchPermissionRequest() }) {
                    Text("Grant Permission")
                }
            } else {
                // Recording UI
                Text(
                    text = if (isRecording) "Recording..." else "Tap to start recording",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Timer
                Text(
                    text = formatDuration(recordingDuration),
                    style = MaterialTheme.typography.displayMedium,
                    color = if (isRecording) StatusError else MaterialTheme.colorScheme.onBackground
                )
                
                Spacer(modifier = Modifier.height(48.dp))
                
                // Record button with animation
                Box(
                    modifier = Modifier.size(120.dp),
                    contentAlignment = Alignment.Center
                ) {
                    if (isRecording) {
                        PulsingCircle()
                    }
                    
                    Surface(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape),
                        color = if (isRecording) StatusError else TealPrimary,
                        onClick = {
                            if (isRecording) {
                                val result = audioManager.stopRecording()
                                result.onSuccess { file ->
                                    recordedFile = file
                                    recordedDuration = recordingDuration
                                    recordingDuration = 0
                                    // Show symptom screen before sending (for after-hours messages)
                                    showSymptomScreen = true
                                }.onFailure {
                                    showErrorDialog = "Failed to save recording: ${it.message}"
                                }
                            } else {
                                audioManager.startRecording()
                            }
                        }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = if (isRecording) Icons.Default.Stop else Icons.Default.Mic,
                                contentDescription = if (isRecording) "Stop" else "Record",
                                tint = Color.White,
                                modifier = Modifier.size(48.dp)
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(48.dp))
                
                if (isRecording) {
                    OutlinedButton(
                        onClick = {
                            audioManager.cancelRecording()
                            recordingDuration = 0
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Cancel, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Cancel Recording")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Instructions
                Text(
                    text = if (isRecording) 
                        "Speak clearly into your microphone. Tap the red button to stop." 
                    else 
                        "Record a voice message for your care team. Tap the microphone to begin.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
            }
        }
    }
    
    // Symptom screen (shown before sending after-hours messages)
    if (showSymptomScreen && recordedFile != null) {
        SymptomScreen(
            onComplete = { symptomScreen ->
                showSymptomScreen = false
                isSending = true
                sendMessage(recordedFile!!, recordedDuration, symptomScreen, scope, messagesRepository, authRepository) { result ->
                    isSending = false
                    result.onSuccess { message ->
                        when (message.status) {
                            "sent", "after_hours_deferred" -> {
                                if (message.status == "after_hours_deferred") {
                                    showDeferredDialog = message.nextOpenAt
                                } else {
                                    showSuccessDialog = true
                                }
                            }
                            "blocked" -> {
                                if (message.action == "redirect_emergency") {
                                    showEmergencyDialog = true
                                } else {
                                    showBlockedDialog = message.reason ?: message.message ?: "Message was blocked"
                                }
                            }
                            else -> {
                                showSuccessDialog = true
                            }
                        }
                    }.onFailure { error ->
                        showErrorDialog = when (error) {
                            is com.agyeman.myhealthally.data.api.SoloPracticeApiClient.AppError.RuleBlocked -> 
                                "Message blocked: ${error.reason ?: error.message}"
                            is com.agyeman.myhealthally.data.api.SoloPracticeApiClient.AppError.RateLimited -> 
                                "Too many requests. Please try again later."
                            is com.agyeman.myhealthally.data.api.SoloPracticeApiClient.AppError.Unauthorized -> 
                                "Please log in again."
                            else -> "Failed to send message: ${error.message}"
                        }
                    }
                }
            },
            onCancel = {
                showSymptomScreen = false
                recordedFile = null
            }
        )
    }
    
    // Success dialog
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { 
                showSuccessDialog = false
                navController.popBackStack()
            },
            icon = { Icon(Icons.Default.CheckCircle, contentDescription = null, tint = TealPrimary) },
            title = { Text("Message Sent!") },
            text = { Text("Your voice message has been sent to your care team.") },
            confirmButton = {
                Button(onClick = {
                    showSuccessDialog = false
                    navController.popBackStack()
                }) {
                    Text("Done")
                }
            }
        )
    }
    
    // Deferred message dialog
    showDeferredDialog?.let { nextOpenAt ->
        AlertDialog(
            onDismissRequest = { 
                showDeferredDialog = null
                navController.popBackStack()
            },
            icon = { Icon(Icons.Default.Schedule, contentDescription = null, tint = TealPrimary) },
            title = { Text("Message Received After Hours") },
            text = { 
                Text("Your message has been received and will be reviewed when the practice opens at $nextOpenAt.")
            },
            confirmButton = {
                Button(onClick = {
                    showDeferredDialog = null
                    navController.popBackStack()
                }) {
                    Text("OK")
                }
            }
        )
    }
    
    // Blocked message dialog
    showBlockedDialog?.let { reason ->
        AlertDialog(
            onDismissRequest = { 
                showBlockedDialog = null
            },
            icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = StatusError) },
            title = { Text("Message Blocked") },
            text = { Text(reason) },
            confirmButton = {
                Button(onClick = {
                    showBlockedDialog = null
                }) {
                    Text("OK")
                }
            }
        )
    }
    
    // Emergency redirect dialog
    if (showEmergencyDialog) {
        AlertDialog(
            onDismissRequest = { showEmergencyDialog = false },
            icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = StatusError) },
            title = { Text("Medical Emergency Detected") },
            text = { 
                Text("Based on your symptoms, this appears to be a medical emergency. Please call 911 immediately.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showEmergencyDialog = false
                        // Call 911
                        val intent = Intent(Intent.ACTION_DIAL).apply {
                            data = Uri.parse("tel:911")
                        }
                        context.startActivity(intent)
                        navController.popBackStack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusError)
                ) {
                    Text("Call 911")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEmergencyDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Error dialog
    showErrorDialog?.let { error ->
        AlertDialog(
            onDismissRequest = { showErrorDialog = null },
            icon = { Icon(Icons.Default.Error, contentDescription = null, tint = StatusError) },
            title = { Text("Error") },
            text = { Text(error) },
            confirmButton = {
                Button(onClick = {
                    showErrorDialog = null
                }) {
                    Text("OK")
                }
            }
        )
    }
    
    // Sending indicator
    if (isSending) {
        AlertDialog(
            onDismissRequest = { },
            title = { Text("Sending Message...") },
            text = { 
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            },
            confirmButton = { }
        )
    }
}

private fun sendMessage(
    audioFile: File,
    durationSeconds: Int,
    symptomScreen: SymptomScreenResult,
    scope: CoroutineScope,
    messagesRepository: MessagesRepository,
    authRepository: AuthRepository,
    onComplete: (Result<com.agyeman.myhealthally.data.models.solopractice.MessageResponse>) -> Unit
) {
    scope.launch(Dispatchers.IO) {
        try {
            // Get user context from JWT token
            val userContext = authRepository.getUserContext()
            
            if (!userContext.isAuthenticated) {
                onComplete(Result.failure(Exception("User not authenticated")))
                return@launch
            }
            
            val patientId = userContext.patientId
                ?: run {
                    onComplete(Result.failure(Exception("Patient ID not found in token")))
                    return@launch
                }
            
            val userId = userContext.userId
                ?: run {
                    onComplete(Result.failure(Exception("User ID not found in token")))
                    return@launch
                }
            
            val practiceId = userContext.practiceId
            
            // Get or create default thread
            val threadResult = messagesRepository.getOrCreateDefaultThread(patientId, practiceId)
            val threadId = threadResult.getOrNull()
                ?: run {
                    onComplete(Result.failure(Exception("Failed to get or create thread")))
                    return@launch
                }
            
            // Use the method that returns API response with status
            val result = messagesRepository.sendVoiceMessageWithStatus(
                threadId = threadId,
                senderId = userId,
                audioFile = audioFile,
                durationSeconds = durationSeconds,
                transcript = null,
                symptomScreen = symptomScreen
            )
            
            onComplete(result)
        } catch (e: Exception) {
            onComplete(Result.failure(e))
        }
    }
}

@Composable
fun PulsingCircle() {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )
    
    Box(
        modifier = Modifier
            .size((100 * scale).dp)
            .clip(CircleShape)
            .background(StatusError.copy(alpha = 0.3f))
    )
}

fun formatDuration(seconds: Int): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}
