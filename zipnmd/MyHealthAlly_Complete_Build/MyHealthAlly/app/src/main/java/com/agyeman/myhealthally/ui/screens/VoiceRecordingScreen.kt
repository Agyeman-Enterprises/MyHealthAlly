package com.agyeman.myhealthally.ui.screens

import android.Manifest
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
import com.agyeman.myhealthally.managers.AudioRecordingManager
import com.agyeman.myhealthally.ui.theme.StatusError
import com.agyeman.myhealthally.ui.theme.TealPrimary
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun VoiceRecordingScreen(navController: NavController) {
    val context = LocalContext.current
    val audioManager = remember { AudioRecordingManager(context) }
    
    val isRecording by audioManager.isRecording.collectAsState()
    var recordingDuration by remember { mutableStateOf(0) }
    var showSuccessDialog by remember { mutableStateOf(false) }
    
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
                                audioManager.stopRecording()
                                showSuccessDialog = true
                                recordingDuration = 0
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
    
    // Success dialog
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { showSuccessDialog = false },
            icon = { Icon(Icons.Default.CheckCircle, contentDescription = null, tint = TealPrimary) },
            title = { Text("Message Recorded!") },
            text = { Text("Your voice message has been recorded and will be sent to your care team.") },
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
