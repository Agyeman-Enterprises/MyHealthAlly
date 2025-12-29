package com.agyeman.myhealthally.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.agyeman.myhealthally.ui.navigation.Screen
import com.agyeman.myhealthally.ui.theme.CardBackground
import com.agyeman.myhealthally.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceMessagesListScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Messages") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate(Screen.RecordMessage.route) },
                containerColor = TealPrimary
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Record Message")
            }
        },
        bottomBar = {
            BottomNavigationBar(navController = navController, currentRoute = Screen.Messages.route)
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            items(mockMessages) { message ->
                VoiceMessageCard(
                    message = message,
                    onClick = { navController.navigate(Screen.MessageDetail.createRoute(message.id)) }
                )
            }
        }
    }
}

@Composable
fun VoiceMessageCard(
    message: MockVoiceMessage,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (message.isRead) CardBackground else TealPrimary.copy(alpha = 0.1f)
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Surface(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape),
                color = TealPrimary
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = message.providerInitials,
                        color = MaterialTheme.colorScheme.onPrimary,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Message info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = message.providerName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (!message.isRead) {
                        Badge(containerColor = TealPrimary) {
                            Text("New", color = MaterialTheme.colorScheme.onPrimary)
                        }
                    }
                }
                
                Text(
                    text = message.providerRole,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = message.preview,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.AccessTime,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${message.duration} • ${message.timeAgo}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                    )
                }
            }
            
            Icon(
                imageVector = Icons.Default.PlayArrow,
                contentDescription = "Play",
                tint = TealPrimary,
                modifier = Modifier.size(32.dp)
            )
        }
    }
}

// Mock data
data class MockVoiceMessage(
    val id: String,
    val providerName: String,
    val providerRole: String,
    val providerInitials: String,
    val preview: String,
    val duration: String,
    val timeAgo: String,
    val isRead: Boolean
)

private val mockMessages = listOf(
    MockVoiceMessage(
        id = "1",
        providerName = "Dr. Sarah Johnson",
        providerRole = "Primary Care Physician",
        providerInitials = "SJ",
        preview = "Your recent lab results look great! Blood pressure is well controlled...",
        duration = "1:23",
        timeAgo = "2 hours ago",
        isRead = false
    ),
    MockVoiceMessage(
        id = "2",
        providerName = "Nurse Maria Santos",
        providerRole = "Care Coordinator",
        providerInitials = "MS",
        preview = "Remember to take your evening medication and log your vitals...",
        duration = "0:45",
        timeAgo = "5 hours ago",
        isRead = false
    ),
    MockVoiceMessage(
        id = "3",
        providerName = "Dr. Michael Chen",
        providerRole = "Specialist",
        providerInitials = "MC",
        preview = "Following up on your appointment. Everything looks good...",
        duration = "2:10",
        timeAgo = "Yesterday",
        isRead = true
    )
)
