package com.ohimaa.linala.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ohimaa.linala.ui.theme.AppColors
import com.ohimaa.linala.ui.theme.BrandConfig
import com.ohimaa.linala.ui.theme.StatusColors
import java.time.LocalTime

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onRecordMessage: () -> Unit,
    onNavigateToVitals: () -> Unit = {},
    onNavigateToMedications: () -> Unit = {},
    onNavigateToMessages: () -> Unit = {},
    onNavigateToCarePlan: () -> Unit = {}
) {
    var streakDays by remember { mutableStateOf(7) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Home") },
                actions = {
                    IconButton(onClick = { }) {
                        BadgedBox(badge = { Badge { Text("3") } }) {
                            Icon(Icons.Default.Notifications, "Notifications")
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(AppColors.Background),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Card
            item {
                HeaderCard(streakDays)
            }
            
            // Record Message Button (RED)
            item {
                RecordMessageButton(onClick = onRecordMessage)
            }
            
            // Quick Actions
            item {
                QuickActionsSection(
                    onVitals = onNavigateToVitals,
                    onMedications = onNavigateToMedications,
                    onMessages = onNavigateToMessages,
                    onCarePlan = onNavigateToCarePlan
                )
            }
            
            // Today's Tasks
            item {
                TodaysTasksSection()
            }
            
            // Recent Voice Messages
            item {
                RecentVoiceMessagesSection()
            }
            
            // Care Plan Summary
            item {
                CarePlanSummarySection(onClick = onNavigateToCarePlan)
            }
            
            // Spacer at bottom
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun HeaderCard(streakDays: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        colors = listOf(AppColors.Accent, AppColors.Primary)
                    )
                )
                .padding(24.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = getGreeting(),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Week 18 · Day 3",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.9f)
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Streak indicator
                Surface(
                    color = Color.White.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = null,
                            tint = Color(0xFFFF9800)
                        )
                        Text(
                            text = "$streakDays day streak!",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}

/**
 * Red Record Message Button
 */
@Composable
fun RecordMessageButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .height(56.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFFE63946)
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = ButtonDefaults.buttonElevation(
            defaultElevation = 4.dp,
            pressedElevation = 8.dp
        )
    ) {
        Icon(
            imageVector = Icons.Default.Mic,
            contentDescription = null,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = "Record Message",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun QuickActionsSection(
    onVitals: () -> Unit,
    onMedications: () -> Unit,
    onMessages: () -> Unit,
    onCarePlan: () -> Unit
) {
    Column(
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Text(
            text = "Quick Actions",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = AppColors.TextPrimary
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                QuickActionCard(
                    title = "Log Vitals",
                    icon = Icons.Default.Favorite,
                    color = StatusColors.Error,
                    onClick = onVitals
                )
            }
            item {
                QuickActionCard(
                    title = "Medications",
                    icon = Icons.Default.Medication,
                    color = StatusColors.Info,
                    onClick = onMedications
                )
            }
            item {
                QuickActionCard(
                    title = "Messages",
                    icon = Icons.Default.Message,
                    color = StatusColors.Success,
                    onClick = onMessages
                )
            }
            item {
                QuickActionCard(
                    title = "Care Plan",
                    icon = Icons.Default.Description,
                    color = StatusColors.Warning,
                    onClick = onCarePlan
                )
            }
        }
    }
}

@Composable
private fun QuickActionCard(
    title: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.size(80.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                fontSize = 11.sp,
                color = AppColors.TextPrimary
            )
        }
    }
}

@Composable
private fun TodaysTasksSection() {
    val tasks = listOf(
        TaskItem("Morning blood pressure", "8:00 AM", true),
        TaskItem("Prenatal vitamin", "9:00 AM", true),
        TaskItem("Log weight", "10:00 AM", true),
        TaskItem("Afternoon walk", "2:00 PM", false),
        TaskItem("Evening blood pressure", "6:00 PM", false)
    )
    
    Column(
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Today's Tasks",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary
            )
            Text(
                text = "${tasks.count { it.isComplete }} of ${tasks.size} complete",
                fontSize = 12.sp,
                color = AppColors.TextSecondary
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            tasks.forEach { task ->
                TaskRow(task)
            }
        }
    }
}

private data class TaskItem(
    val title: String,
    val time: String,
    val isComplete: Boolean
)

@Composable
private fun TaskRow(task: TaskItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (task.isComplete) Icons.Default.CheckCircle else Icons.Outlined.Circle,
                contentDescription = null,
                tint = if (task.isComplete) StatusColors.Success else AppColors.TextTertiary
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Text(
                text = task.title,
                modifier = Modifier.weight(1f),
                color = if (task.isComplete) AppColors.TextSecondary else AppColors.TextPrimary,
                fontSize = 14.sp
            )
            
            Text(
                text = task.time,
                color = AppColors.TextTertiary,
                fontSize = 12.sp
            )
        }
    }
}

@Composable
private fun RecentVoiceMessagesSection() {
    Column(
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Mic,
                    contentDescription = null,
                    tint = AppColors.Accent
                )
                Text(
                    text = "Voice Messages",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextPrimary
                )
            }
            TextButton(onClick = { }) {
                Text("See All", color = AppColors.Accent)
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Sample message
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(AppColors.Accent.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = null,
                        tint = AppColors.Accent
                    )
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "I've been having some mild cramping...",
                        fontSize = 14.sp,
                        maxLines = 1,
                        color = AppColors.TextPrimary
                    )
                    Text(
                        text = "1 hour ago",
                        fontSize = 12.sp,
                        color = AppColors.TextSecondary
                    )
                }
                
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(AppColors.Accent)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = AppColors.TextTertiary
                )
            }
        }
    }
}

@Composable
private fun CarePlanSummarySection(onClick: () -> Unit) {
    Column(
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Description,
                    contentDescription = null,
                    tint = StatusColors.Warning
                )
                Text(
                    text = "Your Care Plan",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextPrimary
                )
            }
            TextButton(onClick = onClick) {
                Text("View", color = StatusColors.Warning)
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = AppColors.Surface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Pregnancy Care Plan - Second Trimester",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = AppColors.TextPrimary
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    StatBadge(value = "2", label = "Goals", color = AppColors.Primary)
                    StatBadge(value = "2", label = "Meds", color = StatusColors.Info)
                    StatBadge(value = "2", label = "Appts", color = StatusColors.Success)
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Text(
                    text = "Current Goal: Maintain healthy weight gain",
                    fontSize = 12.sp,
                    color = AppColors.TextSecondary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                LinearProgressIndicator(
                    progress = { 0.6f },
                    modifier = Modifier.fillMaxWidth(),
                    color = AppColors.Accent,
                    trackColor = AppColors.SurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun StatBadge(value: String, label: String, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            fontSize = 11.sp,
            color = AppColors.TextSecondary
        )
    }
}

private fun getGreeting(): String {
    return when (LocalTime.now().hour) {
        in 0..11 -> "Good morning! ☀️"
        in 12..16 -> "Good afternoon! 🌤"
        else -> "Good evening! 🌙"
    }
}
