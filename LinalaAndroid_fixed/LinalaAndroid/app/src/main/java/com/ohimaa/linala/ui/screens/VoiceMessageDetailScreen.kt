package com.ohimaa.linala.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ohimaa.linala.data.models.*
import com.ohimaa.linala.ui.theme.AppColors
import com.ohimaa.linala.ui.theme.BrandConfig
import com.ohimaa.linala.ui.theme.StatusColors
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceMessageDetailScreen(
    messageId: String,
    onBack: () -> Unit,
    onPlayAudio: (String) -> Unit = {},
    onNavigateToCarePlan: (String) -> Unit = {}
) {
    // Mock data - replace with actual API call
    val message = remember {
        VoiceMessageDetail(
            id = messageId,
            createdAt = Instant.now().minusSeconds(3600),
            transcript = "I've been experiencing some mild cramping in my lower abdomen since yesterday morning. It's not severe, but it comes and goes every few hours. I haven't noticed any bleeding or other concerning symptoms. I've been staying hydrated and resting when the cramping occurs.",
            englishTranscript = null,
            patientLanguage = "en",
            durationSeconds = 45,
            aiSummary = "Patient reports intermittent mild lower abdominal cramping starting yesterday. No associated bleeding or other symptoms. Self-managing with rest and hydration.",
            aiTriageLevel = TriageLevel.ROUTINE,
            hasAudioAvailableToPatient = true,
            careTeamResponse = CareTeamResponse(
                respondedAt = Instant.now().minusSeconds(1800),
                responderName = "Dr. Sarah Chen",
                responderTitle = "OB-GYN",
                message = "Thank you for letting us know about the cramping. Mild, intermittent cramping is common during pregnancy and usually not concerning. Continue to rest and stay hydrated. However, please call our office immediately if you experience any of the following.",
                actionItems = listOf(
                    "Rest when cramping occurs",
                    "Stay well hydrated",
                    "Call if cramping becomes severe or constant",
                    "Call if you notice any bleeding"
                )
            ),
            relatedCarePlan = CarePlanSummary(
                id = "cp_001",
                title = "Pregnancy Care Plan - Second Trimester",
                status = "active"
            )
        )
    }
    
    var showLanguageMenu by remember { mutableStateOf(false) }
    var showingEnglish by remember { mutableStateOf(false) }
    var showAudioConfirmation by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Voice Message") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    if (message.englishTranscript != null) {
                        Box {
                            IconButton(onClick = { showLanguageMenu = true }) {
                                Icon(Icons.Default.Translate, "Language")
                            }
                            DropdownMenu(
                                expanded = showLanguageMenu,
                                onDismissRequest = { showLanguageMenu = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("My Language") },
                                    onClick = {
                                        showingEnglish = false
                                        showLanguageMenu = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("English") },
                                    onClick = {
                                        showingEnglish = true
                                        showLanguageMenu = false
                                    }
                                )
                            }
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .background(AppColors.Background)
        ) {
            // Header with date and triage level
            MessageHeader(message)
            
            // Transcript
            TranscriptSection(
                transcript = if (showingEnglish) message.englishTranscript ?: message.transcript else message.transcript
            )
            
            // AI Summary
            message.aiSummary?.let { summary ->
                AISummarySection(summary = summary, triageLevel = message.aiTriageLevel)
            }
            
            // Audio Playback
            if (message.hasAudioAvailableToPatient) {
                AudioPlaybackSection(
                    onPlayClick = { showAudioConfirmation = true }
                )
            }
            
            // Care Team Response
            message.careTeamResponse?.let { response ->
                CareTeamResponseSection(response = response)
            }
            
            // Related Care Plan
            message.relatedCarePlan?.let { carePlan ->
                RelatedCarePlanSection(
                    carePlan = carePlan,
                    onClick = { onNavigateToCarePlan(carePlan.id) }
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
    
    // Audio confirmation dialog
    if (showAudioConfirmation) {
        AlertDialog(
            onDismissRequest = { showAudioConfirmation = false },
            icon = { Icon(Icons.Default.VolumeUp, null, tint = AppColors.Primary) },
            title = { Text("Play Audio Recording") },
            text = {
                Text(
                    "This audio may contain sensitive information or include other voices. " +
                    "Please ensure you are in a private space before playing.",
                    color = AppColors.TextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showAudioConfirmation = false
                        onPlayAudio(message.id)
                    }
                ) {
                    Text("Play Audio")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAudioConfirmation = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun MessageHeader(message: VoiceMessageDetail) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = formatDate(message.createdAt),
                fontSize = 14.sp,
                color = AppColors.TextSecondary
            )
            Text(
                text = "${message.durationSeconds} seconds",
                fontSize = 12.sp,
                color = AppColors.TextTertiary
            )
        }
        
        TriageBadge(level = message.aiTriageLevel)
    }
}

@Composable
private fun TriageBadge(level: TriageLevel) {
    Surface(
        color = Color(level.colorHex).copy(alpha = 0.1f),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(Color(level.colorHex))
            )
            Text(
                text = level.displayName,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(level.colorHex)
            )
        }
    }
}

@Composable
private fun TranscriptSection(transcript: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Transcript",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = transcript,
                fontSize = 16.sp,
                lineHeight = 24.sp,
                color = AppColors.TextPrimary
            )
        }
    }
}

@Composable
private fun AISummarySection(summary: String, triageLevel: TriageLevel) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            AppColors.Primary.copy(alpha = 0.1f),
                            AppColors.Accent.copy(alpha = 0.05f)
                        )
                    )
                )
                .padding(16.dp)
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = AppColors.Primary
                    )
                    Text(
                        text = "AI Summary",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppColors.Primary
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = summary,
                    fontSize = 14.sp,
                    lineHeight = 22.sp,
                    color = AppColors.TextPrimary
                )
            }
        }
    }
}

@Composable
private fun AudioPlaybackSection(onPlayClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.GraphicEq,
                    contentDescription = null,
                    tint = AppColors.Accent
                )
                Text(
                    text = "Audio Recording",
                    fontSize = 14.sp,
                    color = AppColors.TextPrimary
                )
            }
            
            Button(
                onClick = onPlayClick,
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppColors.Accent
                )
            ) {
                Icon(Icons.Default.PlayArrow, null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Play")
            }
        }
    }
}

@Composable
private fun CareTeamResponseSection(response: CareTeamResponse) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(AppColors.Primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = response.responderName.split(" ").map { it.first() }.joinToString(""),
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
                Column {
                    Text(
                        text = response.responderName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppColors.TextPrimary
                    )
                    Text(
                        text = response.responderTitle,
                        fontSize = 12.sp,
                        color = AppColors.TextSecondary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = response.message,
                fontSize = 14.sp,
                lineHeight = 22.sp,
                color = AppColors.TextPrimary
            )
            
            if (response.actionItems.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Action Items",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextSecondary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                response.actionItems.forEach { item ->
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircleOutline,
                            contentDescription = null,
                            tint = StatusColors.Success,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = item,
                            fontSize = 14.sp,
                            color = AppColors.TextPrimary
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Responded ${formatRelativeTime(response.respondedAt)}",
                fontSize = 12.sp,
                color = AppColors.TextTertiary
            )
        }
    }
}

@Composable
private fun RelatedCarePlanSection(
    carePlan: CarePlanSummary,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Description,
                    contentDescription = null,
                    tint = StatusColors.Warning
                )
                Column {
                    Text(
                        text = "Related Care Plan",
                        fontSize = 12.sp,
                        color = AppColors.TextSecondary
                    )
                    Text(
                        text = carePlan.title,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = AppColors.TextPrimary
                    )
                }
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = AppColors.TextTertiary
            )
        }
    }
}

private fun formatDate(instant: Instant): String {
    val formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a")
        .withZone(ZoneId.systemDefault())
    return formatter.format(instant)
}

private fun formatRelativeTime(instant: Instant): String {
    val now = Instant.now()
    val diff = now.epochSecond - instant.epochSecond
    
    return when {
        diff < 60 -> "just now"
        diff < 3600 -> "${diff / 60} minutes ago"
        diff < 86400 -> "${diff / 3600} hours ago"
        diff < 604800 -> "${diff / 86400} days ago"
        else -> formatDate(instant)
    }
}
