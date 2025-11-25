package com.ohimaa.linala.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ohimaa.linala.data.models.VoiceMessagePreview
import com.ohimaa.linala.ui.theme.AppColors
import java.time.Instant
import java.time.temporal.ChronoUnit

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceMessageListScreen(
    messages: List<VoiceMessagePreview>,
    onMessageClick: (String) -> Unit,
    onRefresh: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Voice Messages") }
            )
        }
    ) { paddingValues ->
        if (messages.isEmpty()) {
            EmptyStateView(modifier = Modifier.padding(paddingValues))
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(AppColors.Background),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages, key = { it.id }) { message ->
                    VoiceMessageRow(
                        message = message,
                        onClick = { onMessageClick(message.id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun VoiceMessageRow(
    message: VoiceMessagePreview,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Unread indicator + Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(AppColors.Accent.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.GraphicEq,
                    contentDescription = null,
                    tint = AppColors.Accent,
                    modifier = Modifier.size(24.dp)
                )
                
                // Unread dot
                if (!message.isRead) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(AppColors.Accent)
                            .align(Alignment.TopEnd)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = message.formattedDate,
                        fontSize = 12.sp,
                        color = AppColors.TextSecondary
                    )
                    
                    Text(
                        text = message.formattedDuration,
                        fontSize = 12.sp,
                        color = AppColors.TextTertiary
                    )
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = message.transcriptPreview,
                    fontSize = 14.sp,
                    fontWeight = if (!message.isRead) FontWeight.SemiBold else FontWeight.Normal,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                // AI Summary badge
                if (message.hasAISummary) {
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = AppColors.Primary.copy(alpha = 0.1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                modifier = Modifier.size(12.dp),
                                tint = AppColors.Primary
                            )
                            Text(
                                text = "AI Summary Available",
                                fontSize = 11.sp,
                                color = AppColors.Primary
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = AppColors.TextTertiary
            )
        }
    }
}

@Composable
private fun EmptyStateView(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Mic,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = AppColors.TextTertiary
            )
            
            Text(
                text = "No Voice Messages",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextSecondary
            )
            
            Text(
                text = "Record a message to send to your care team",
                fontSize = 14.sp,
                color = AppColors.TextTertiary
            )
        }
    }
}

/**
 * Sample mock data for testing
 */
object MockVoiceMessages {
    val samples = listOf(
        VoiceMessagePreview(
            id = "vm_001",
            createdAt = Instant.now().minus(1, ChronoUnit.HOURS),
            transcriptPreview = "I've been having some mild cramping in my lower abdomen since this morning...",
            hasAISummary = true,
            isRead = true,
            durationSeconds = 45,
            languageCode = "en"
        ),
        VoiceMessagePreview(
            id = "vm_002",
            createdAt = Instant.now().minus(1, ChronoUnit.DAYS),
            transcriptPreview = "My blood pressure readings have been a bit higher than usual this week...",
            hasAISummary = true,
            isRead = true,
            durationSeconds = 32,
            languageCode = "en"
        ),
        VoiceMessagePreview(
            id = "vm_003",
            createdAt = Instant.now().minus(2, ChronoUnit.DAYS),
            transcriptPreview = "Hu na'setbe i amot-hu gi egga'an na tiempo...",
            hasAISummary = true,
            isRead = false,
            durationSeconds = 58,
            languageCode = "ch"
        )
    )
}
