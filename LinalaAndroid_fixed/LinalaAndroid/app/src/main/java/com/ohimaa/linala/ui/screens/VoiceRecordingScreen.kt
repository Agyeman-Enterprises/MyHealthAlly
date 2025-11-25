package com.ohimaa.linala.ui.screens

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ohimaa.linala.managers.AudioRecordingManager
import com.ohimaa.linala.managers.RecordingState
import com.ohimaa.linala.ui.theme.AppColors
import com.ohimaa.linala.ui.theme.BrandConfig
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceRecordingScreen(
    recordingManager: AudioRecordingManager,
    onDismiss: () -> Unit,
    onSubmit: (ByteArray) -> Unit
) {
    val scope = rememberCoroutineScope()
    
    val state by recordingManager.state.collectAsState()
    val durationMs by recordingManager.durationMs.collectAsState()
    val audioLevel by recordingManager.audioLevel.collectAsState()
    val hasRecording by recordingManager.hasRecording.collectAsState()
    
    var showConfirmation by remember { mutableStateOf(false) }
    var hasPermission by remember { mutableStateOf(recordingManager.hasPermission()) }
    
    // Permission launcher
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasPermission = granted
    }
    
    // Request permission on first load if needed
    LaunchedEffect(Unit) {
        if (!hasPermission) {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }
    
    ModalBottomSheet(
        onDismissRequest = {
            recordingManager.cancelRecording()
            onDismiss()
        },
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Text(
                text = "Voice Message",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = AppColors.TextPrimary
            )
            
            Text(
                text = "Send a message to your care team at ${BrandConfig.providerName}",
                fontSize = 14.sp,
                color = AppColors.TextSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
            )
            
            if (!hasPermission) {
                // Permission Required View
                PermissionRequiredView(
                    onRequestPermission = {
                        permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    }
                )
            } else if (showConfirmation && hasRecording) {
                // Confirmation View
                SubmitConfirmationView(
                    onConfirm = {
                        recordingManager.getRecordingData()?.let { data ->
                            onSubmit(data)
                        }
                    },
                    onCancel = {
                        showConfirmation = false
                    }
                )
            } else if (state is RecordingState.Finished && hasRecording) {
                // Review Recording View
                ReviewRecordingView(
                    duration = recordingManager.getFormattedDuration(),
                    onReRecord = {
                        recordingManager.reset()
                    },
                    onSend = {
                        showConfirmation = true
                    }
                )
            } else {
                // Recording View
                RecordingView(
                    state = state,
                    durationMs = durationMs,
                    audioLevel = audioLevel,
                    formattedDuration = recordingManager.getFormattedDuration(),
                    formattedRemaining = recordingManager.getFormattedRemainingTime(),
                    progress = recordingManager.getProgress(),
                    onStartRecording = {
                        scope.launch {
                            recordingManager.startRecording()
                        }
                    },
                    onStopRecording = {
                        recordingManager.stopRecording()
                    },
                    onCancel = {
                        recordingManager.cancelRecording()
                        onDismiss()
                    }
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun PermissionRequiredView(
    onRequestPermission: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Icon(
            imageVector = Icons.Default.MicOff,
            contentDescription = null,
            modifier = Modifier.size(60.dp),
            tint = AppColors.TextSecondary
        )
        
        Text(
            text = "Microphone Access Required",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = AppColors.TextPrimary
        )
        
        Text(
            text = "Please allow microphone access to record voice messages for your care team.",
            fontSize = 14.sp,
            color = AppColors.TextSecondary,
            textAlign = TextAlign.Center
        )
        
        Button(
            onClick = onRequestPermission,
            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Primary)
        ) {
            Text("Grant Permission")
        }
    }
}

@Composable
private fun RecordingView(
    state: RecordingState,
    durationMs: Long,
    audioLevel: Float,
    formattedDuration: String,
    formattedRemaining: String,
    progress: Float,
    onStartRecording: () -> Unit,
    onStopRecording: () -> Unit,
    onCancel: () -> Unit
) {
    val isRecording = state is RecordingState.Recording
    
    // Pulsing animation for recording
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(600),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )
    
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Progress Ring
        Box(
            contentAlignment = Alignment.Center
        ) {
            // Background ring
            CircularProgressIndicator(
                progress = { 1f },
                modifier = Modifier.size(180.dp),
                color = AppColors.SurfaceVariant,
                strokeWidth = 8.dp
            )
            
            // Progress ring
            CircularProgressIndicator(
                progress = { progress },
                modifier = Modifier.size(180.dp),
                color = if (isRecording) Color(0xFFE63946) else AppColors.Primary,
                strokeWidth = 8.dp
            )
            
            // Center content
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = formattedDuration,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.TextPrimary
                )
                
                if (isRecording) {
                    Text(
                        text = "$formattedRemaining left",
                        fontSize = 14.sp,
                        color = AppColors.TextSecondary
                    )
                }
            }
        }
        
        // Waveform Visualization
        if (isRecording) {
            WaveformVisualization(audioLevel = audioLevel)
        }
        
        // Recording Button
        Box(
            modifier = Modifier
                .size(80.dp)
                .scale(if (isRecording) pulseScale else 1f)
        ) {
            FloatingActionButton(
                onClick = {
                    if (isRecording) {
                        onStopRecording()
                    } else {
                        onStartRecording()
                    }
                },
                modifier = Modifier.fillMaxSize(),
                containerColor = Color(0xFFE63946),
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(
                    imageVector = if (isRecording) Icons.Default.Stop else Icons.Default.Mic,
                    contentDescription = if (isRecording) "Stop" else "Record",
                    modifier = Modifier.size(36.dp)
                )
            }
        }
        
        Text(
            text = if (isRecording) "Tap to stop" else "Tap to start recording",
            fontSize = 14.sp,
            color = AppColors.TextSecondary
        )
        
        // Cancel button
        TextButton(onClick = onCancel) {
            Text("Cancel", color = AppColors.TextSecondary)
        }
    }
}

@Composable
private fun WaveformVisualization(audioLevel: Float) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.height(40.dp)
    ) {
        repeat(7) { index ->
            val barHeight = remember { mutableFloatStateOf(0.3f) }
            
            LaunchedEffect(audioLevel) {
                // Create varied bar heights based on audio level
                barHeight.floatValue = (0.2f + audioLevel * (0.5f + (index % 3) * 0.2f)).coerceIn(0.2f, 1f)
            }
            
            Box(
                modifier = Modifier
                    .width(6.dp)
                    .fillMaxHeight(barHeight.floatValue)
                    .clip(RoundedCornerShape(3.dp))
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(AppColors.Accent, AppColors.Primary)
                        )
                    )
            )
        }
    }
}

@Composable
private fun ReviewRecordingView(
    duration: String,
    onReRecord: () -> Unit,
    onSend: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Success icon
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(AppColors.Primary.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                modifier = Modifier.size(50.dp),
                tint = AppColors.Primary
            )
        }
        
        Text(
            text = "Recording Complete",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = AppColors.TextPrimary
        )
        
        Text(
            text = "Duration: $duration",
            fontSize = 16.sp,
            color = AppColors.TextSecondary
        )
        
        // Action buttons
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedButton(
                onClick = onReRecord,
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = AppColors.TextSecondary
                )
            ) {
                Icon(Icons.Default.Refresh, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Re-record")
            }
            
            Button(
                onClick = onSend,
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppColors.Primary
                )
            ) {
                Icon(Icons.Default.Send, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Send")
            }
        }
    }
}

@Composable
private fun SubmitConfirmationView(
    onConfirm: () -> Unit,
    onCancel: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Send,
            contentDescription = null,
            modifier = Modifier.size(60.dp),
            tint = AppColors.Primary
        )
        
        Text(
            text = "Send to Care Team?",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = AppColors.TextPrimary
        )
        
        Text(
            text = "Your message will be reviewed by your care team at ${BrandConfig.providerName}. You'll receive a response within 24-48 hours.",
            fontSize = 14.sp,
            color = AppColors.TextSecondary,
            textAlign = TextAlign.Center
        )
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(top = 8.dp)
        ) {
            OutlinedButton(onClick = onCancel) {
                Text("Cancel")
            }
            
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppColors.Primary
                )
            ) {
                Text("Send Message")
            }
        }
    }
}
