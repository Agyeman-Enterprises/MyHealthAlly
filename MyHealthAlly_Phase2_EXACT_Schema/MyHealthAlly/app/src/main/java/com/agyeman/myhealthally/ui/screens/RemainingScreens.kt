package com.agyeman.myhealthally.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.agyeman.myhealthally.ui.theme.CardBackground

// TasksScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tasks") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController, currentRoute = "tasks")
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "Today's Tasks",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            items(5) { index ->
                TaskItem(
                    title = "Task ${index + 1}",
                    time = "${8 + index}:00 AM",
                    completed = index % 2 == 0,
                    onToggle = {}
                )
            }
        }
    }
}

// ScheduleScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScheduleScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Schedule") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController, currentRoute = "schedule")
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                text = "Upcoming Appointments",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))
            Card(colors = CardDefaults.cardColors(containerColor = CardBackground)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("No upcoming appointments", style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}

// ProfileScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                actions = {
                    IconButton(onClick = { navController.navigate("settings") }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController, currentRoute = "profile")
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Default.Person,
                contentDescription = null,
                modifier = Modifier.size(100.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text("Patient Name", style = MaterialTheme.typography.headlineSmall)
            Text("patient@email.com", style = MaterialTheme.typography.bodyMedium)
        }
    }
}

// SettingsScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            item {
                ListItem(
                    headlineContent = { Text("Notifications") },
                    leadingContent = { Icon(Icons.Default.Notifications, contentDescription = null) }
                )
            }
            item {
                ListItem(
                    headlineContent = { Text("Security") },
                    leadingContent = { Icon(Icons.Default.Lock, contentDescription = null) }
                )
            }
            item {
                ListItem(
                    headlineContent = { Text("Privacy") },
                    leadingContent = { Icon(Icons.Default.PrivacyTip, contentDescription = null) }
                )
            }
        }
    }
}

// CarePlanScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CarePlanScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Care Plan") },
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
                .padding(16.dp)
        ) {
            Text("Your Care Plan", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            Card(colors = CardDefaults.cardColors(containerColor = CardBackground)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Active care plan details will appear here")
                }
            }
        }
    }
}

// MessageDetailScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessageDetailScreen(navController: NavController, messageId: String) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Message Detail") },
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
                .padding(16.dp)
        ) {
            Text("Message ID: $messageId", style = MaterialTheme.typography.bodyLarge)
            Spacer(modifier = Modifier.height(16.dp))
            Card(colors = CardDefaults.cardColors(containerColor = CardBackground)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Voice message player and transcript will appear here")
                }
            }
        }
    }
}

// VitalsScreen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VitalsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Track Vitals") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            items(listOf("Blood Pressure", "Heart Rate", "Weight", "Glucose", "Temperature", "Oxygen")) { vital ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = CardBackground)
                ) {
                    ListItem(
                        headlineContent = { Text(vital) },
                        trailingContent = { Icon(Icons.Default.ChevronRight, contentDescription = null) }
                    )
                }
            }
        }
    }
}

// Remaining placeholder screens
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabsScreen(navController: NavController) {
    PlaceholderScreen(navController, "Labs")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyScreen(navController: NavController) {
    PlaceholderScreen(navController, "Pharmacy")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NutritionScreen(navController: NavController) {
    PlaceholderScreen(navController, "Nutrition")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExercisesScreen(navController: NavController) {
    PlaceholderScreen(navController, "Exercises")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResourcesScreen(navController: NavController) {
    PlaceholderScreen(navController, "Resources")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BMICalculatorScreen(navController: NavController) {
    PlaceholderScreen(navController, "BMI Calculator")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AISymptomAssistantScreen(navController: NavController) {
    PlaceholderScreen(navController, "AI Symptom Assistant")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AITriageScreen(navController: NavController) {
    PlaceholderScreen(navController, "AI Triage")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(navController: NavController) {
    PlaceholderScreen(navController, "Notifications")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentRequestScreen(navController: NavController) {
    PlaceholderScreen(navController, "Request Appointment")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadRecordsScreen(navController: NavController) {
    PlaceholderScreen(navController, "Upload Records")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatMAScreen(navController: NavController) {
    PlaceholderScreen(navController, "Chat with MA")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatMDScreen(navController: NavController) {
    PlaceholderScreen(navController, "Chat with Doctor")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceHistoryScreen(navController: NavController) {
    PlaceholderScreen(navController, "Voice History")
}

// Generic placeholder screen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceholderScreen(navController: NavController, title: String) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.Construction,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "$title Coming Soon",
                    style = MaterialTheme.typography.titleLarge
                )
            }
        }
    }
}
