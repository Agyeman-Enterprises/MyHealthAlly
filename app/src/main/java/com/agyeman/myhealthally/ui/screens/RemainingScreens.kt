package com.agyeman.myhealthally.ui.screens

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.agyeman.myhealthally.data.repositories.AppointmentsRepository
import com.agyeman.myhealthally.data.repositories.AuthRepository
import com.agyeman.myhealthally.data.repositories.MessagesRepository
import com.agyeman.myhealthally.ui.theme.CardBackground
import com.agyeman.myhealthally.ui.theme.TealPrimary
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.pow

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
    var heightFeet by remember { mutableStateOf("") }
    var heightInches by remember { mutableStateOf("") }
    var weightPounds by remember { mutableStateOf("") }
    var bmiResult by remember { mutableStateOf<Double?>(null) }
    var bmiCategory by remember { mutableStateOf<String?>(null) }
    
    fun calculateBMI() {
        try {
            val feet = heightFeet.toDoubleOrNull() ?: return
            val inches = heightInches.toDoubleOrNull() ?: 0.0
            val pounds = weightPounds.toDoubleOrNull() ?: return
            
            val totalInches = (feet * 12) + inches
            if (totalInches <= 0 || pounds <= 0) return
            
            val bmi = (pounds / totalInches.pow(2)) * 703
            bmiResult = bmi
            
            bmiCategory = when {
                bmi < 18.5 -> "Underweight"
                bmi < 25.0 -> "Normal weight"
                bmi < 30.0 -> "Overweight"
                else -> "Obese"
            }
        } catch (e: Exception) {
            bmiResult = null
            bmiCategory = null
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("BMI Calculator") },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Calculate Your BMI",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                Text(
                    text = "Enter your height and weight to calculate your Body Mass Index (BMI)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = heightFeet,
                        onValueChange = {
                            heightFeet = it
                            calculateBMI()
                        },
                        label = { Text("Feet") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.foundation.text.KeyboardType.Number)
                    )
                    OutlinedTextField(
                        value = heightInches,
                        onValueChange = {
                            heightInches = it
                            calculateBMI()
                        },
                        label = { Text("Inches") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.foundation.text.KeyboardType.Number)
                    )
                }
            }
            
            item {
                OutlinedTextField(
                    value = weightPounds,
                    onValueChange = {
                        weightPounds = it
                        calculateBMI()
                    },
                    label = { Text("Weight (lbs)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.foundation.text.KeyboardType.Number)
                )
            }
            
            item {
                Button(
                    onClick = { calculateBMI() },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = heightFeet.isNotBlank() && weightPounds.isNotBlank()
                ) {
                    Text("Calculate BMI")
                }
            }
            
            if (bmiResult != null && bmiCategory != null) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = when (bmiCategory) {
                                "Normal weight" -> androidx.compose.ui.graphics.Color(0xFF4CAF50)
                                "Underweight", "Overweight" -> androidx.compose.ui.graphics.Color(0xFFFF9800)
                                "Obese" -> androidx.compose.ui.graphics.Color(0xFFF44336)
                                else -> CardBackground
                            }.copy(alpha = 0.1f)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = String.format("%.1f", bmiResult),
                                style = MaterialTheme.typography.displayMedium,
                                fontWeight = FontWeight.Bold,
                                color = TealPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = bmiCategory ?: "",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "BMI Categories:",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("• Underweight: BMI < 18.5")
                            Text("• Normal weight: BMI 18.5-24.9")
                            Text("• Overweight: BMI 25-29.9")
                            Text("• Obese: BMI ≥ 30")
                        }
                    }
                }
            }
        }
    }
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
    val context = LocalContext.current
    val messagesRepository = remember { MessagesRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val scope = rememberCoroutineScope()
    
    var notifications by remember { mutableStateOf<List<NotificationItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    
    data class NotificationItem(
        val id: String,
        val title: String,
        val message: String,
        val timestamp: String,
        val type: NotificationType,
        val isRead: Boolean
    )
    
    enum class NotificationType {
        MESSAGE, APPOINTMENT, MEDICATION, VITAL
    }
    
    LaunchedEffect(Unit) {
        scope.launch {
            val userContext = authRepository.getUserContext()
            if (!userContext.isAuthenticated) {
                isLoading = false
                return@launch
            }
            
            val patientId = userContext.patientId ?: run {
                isLoading = false
                return@launch
            }
            
            // Get unread messages
            val threadsResult = messagesRepository.getPatientThreads(patientId)
            val notificationList = mutableListOf<NotificationItem>()
            
            threadsResult.onSuccess { threads ->
                threads.forEach { thread ->
                    val messagesResult = messagesRepository.getThreadMessages(thread.id)
                    messagesResult.onSuccess { messages ->
                        messages.filter { !it.read }.forEach { message ->
                            notificationList.add(
                                NotificationItem(
                                    id = message.id,
                                    title = "New Message",
                                    message = message.content.take(50) + if (message.content.length > 50) "..." else "",
                                    timestamp = message.createdAt,
                                    type = NotificationType.MESSAGE,
                                    isRead = message.read
                                )
                            )
                        }
                    }
                }
            }
            
            // Sort by timestamp (newest first)
            notifications = notificationList.sortedByDescending {
                try {
                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(it.timestamp)?.time ?: 0L
                } catch (e: Exception) {
                    0L
                }
            }
            isLoading = false
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            notifications.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Notifications, contentDescription = null, modifier = Modifier.size(64.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("No notifications", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(notifications) { notification ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (notification.isRead) CardBackground else TealPrimary.copy(alpha = 0.1f)
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    when (notification.type) {
                                        NotificationType.MESSAGE -> Icons.Default.Message
                                        NotificationType.APPOINTMENT -> Icons.Default.CalendarToday
                                        NotificationType.MEDICATION -> Icons.Default.Medication
                                        NotificationType.VITAL -> Icons.Default.MonitorHeart
                                    },
                                    contentDescription = null,
                                    tint = TealPrimary,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = notification.title,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = notification.message,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    Text(
                                        text = try {
                                            val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(notification.timestamp)
                                            SimpleDateFormat("MMM d, h:mm a", Locale.US).format(date ?: Date())
                                        } catch (e: Exception) {
                                            notification.timestamp
                                        },
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                if (!notification.isRead) {
                                    Surface(
                                        modifier = Modifier.size(8.dp),
                                        shape = CircleShape,
                                        color = TealPrimary
                                    ) {}
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentRequestScreen(navController: NavController) {
    val context = LocalContext.current
    val appointmentsRepository = remember { AppointmentsRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val scope = rememberCoroutineScope()
    
    var appointmentType by remember { mutableStateOf("") }
    var preferredDate by remember { mutableStateOf("") }
    var preferredTime by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var urgency by remember { mutableStateOf("routine") }
    var isLoading by remember { mutableStateOf(false) }
    var showSuccessDialog by remember { mutableStateOf(false) }
    var showErrorDialog by remember { mutableStateOf<String?>(null) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Request Appointment") },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Request an Appointment",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                OutlinedTextField(
                    value = appointmentType,
                    onValueChange = { appointmentType = it },
                    label = { Text("Appointment Type") },
                    placeholder = { Text("e.g., General Checkup, Follow-up") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
            
            item {
                OutlinedTextField(
                    value = preferredDate,
                    onValueChange = { preferredDate = it },
                    label = { Text("Preferred Date (Optional)") },
                    placeholder = { Text("YYYY-MM-DD") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
            
            item {
                OutlinedTextField(
                    value = preferredTime,
                    onValueChange = { preferredTime = it },
                    label = { Text("Preferred Time (Optional)") },
                    placeholder = { Text("HH:MM") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
            
            item {
                var expanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }) {
                    OutlinedTextField(
                        value = urgency,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Urgency") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        listOf("routine", "urgent").forEach { option ->
                            DropdownMenuItem(
                                text = { Text(option.replaceFirstChar { it.uppercaseChar() }) },
                                onClick = {
                                    urgency = option
                                    expanded = false
                                }
                            )
                        }
                    }
                }
            }
            
            item {
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Reason (Optional)") },
                    placeholder = { Text("Brief description of your concern") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5
                )
            }
            
            item {
                Button(
                    onClick = {
                        if (appointmentType.isBlank()) {
                            showErrorDialog = "Please enter an appointment type"
                            return@Button
                        }
                        
                        isLoading = true
                        scope.launch {
                            val userContext = authRepository.getUserContext()
                            if (!userContext.isAuthenticated) {
                                showErrorDialog = "Please log in to request an appointment"
                                isLoading = false
                                return@launch
                            }
                            
                            val result = appointmentsRepository.requestAppointment(
                                type = appointmentType,
                                preferredDate = preferredDate.takeIf { it.isNotBlank() },
                                preferredTime = preferredTime.takeIf { it.isNotBlank() },
                                reason = reason.takeIf { it.isNotBlank() },
                                urgency = urgency
                            )
                            
                            isLoading = false
                            result.onSuccess {
                                showSuccessDialog = true
                            }.onFailure {
                                showErrorDialog = it.message ?: "Failed to request appointment"
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading && appointmentType.isNotBlank()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp))
                    } else {
                        Text("Request Appointment")
                    }
                }
            }
        }
    }
    
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { showSuccessDialog = false },
            title = { Text("Appointment Requested") },
            text = { Text("Your appointment request has been submitted. You will be notified when it's confirmed.") },
            confirmButton = {
                TextButton(onClick = {
                    showSuccessDialog = false
                    navController.popBackStack()
                }) {
                    Text("OK")
                }
            }
        )
    }
    
    showErrorDialog?.let { error ->
        AlertDialog(
            onDismissRequest = { showErrorDialog = null },
            title = { Text("Error") },
            text = { Text(error) },
            confirmButton = {
                TextButton(onClick = { showErrorDialog = null }) {
                    Text("OK")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadRecordsScreen(navController: NavController) {
    PlaceholderScreen(navController, "Upload Records")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatMAScreen(navController: NavController) {
    val context = LocalContext.current
    val messagesRepository = remember { MessagesRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val scope = rememberCoroutineScope()
    
    var threads by remember { mutableStateOf<List<com.agyeman.myhealthally.data.models.supabase.SupabaseMessageThread>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(Unit) {
        scope.launch {
            val userContext = authRepository.getUserContext()
            if (!userContext.isAuthenticated) {
                error = "Please log in"
                isLoading = false
                return@launch
            }
            
            val patientId = userContext.patientId ?: run {
                error = "Patient ID not found"
                isLoading = false
                return@launch
            }
            
            val threadsResult = messagesRepository.getPatientThreads(patientId)
            threadsResult.onSuccess {
                // Filter threads that might be with MA (you can enhance this with participant filtering)
                threads = it
                isLoading = false
            }.onFailure {
                error = it.message ?: "Failed to load messages"
                isLoading = false
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chat with MA") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate("record_message") },
                containerColor = TealPrimary
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Record Message")
            }
        }
    ) { paddingValues ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(error ?: "Unknown error")
                }
            }
            threads.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Message, contentDescription = null, modifier = Modifier.size(64.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("No messages yet", style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Tap the mic to send a message", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(threads) { thread ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    navController.navigate("message_detail/${thread.id}")
                                },
                            colors = CardDefaults.cardColors(containerColor = CardBackground)
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.Person,
                                    contentDescription = null,
                                    tint = TealPrimary,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = thread.subject ?: "Medical Assistant",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    thread.lastMessageAt?.let {
                                        Text(
                                            text = "Last message: $it",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                                Icon(Icons.Default.ChevronRight, contentDescription = null)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatMDScreen(navController: NavController) {
    val context = LocalContext.current
    val messagesRepository = remember { MessagesRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val scope = rememberCoroutineScope()
    
    var threads by remember { mutableStateOf<List<com.agyeman.myhealthally.data.models.supabase.SupabaseMessageThread>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(Unit) {
        scope.launch {
            val userContext = authRepository.getUserContext()
            if (!userContext.isAuthenticated) {
                error = "Please log in"
                isLoading = false
                return@launch
            }
            
            val patientId = userContext.patientId ?: run {
                error = "Patient ID not found"
                isLoading = false
                return@launch
            }
            
            val threadsResult = messagesRepository.getPatientThreads(patientId)
            threadsResult.onSuccess {
                // Filter threads that might be with Doctor (you can enhance this with participant filtering)
                threads = it
                isLoading = false
            }.onFailure {
                error = it.message ?: "Failed to load messages"
                isLoading = false
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chat with Doctor") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate("record_message") },
                containerColor = TealPrimary
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Record Message")
            }
        }
    ) { paddingValues ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(error ?: "Unknown error")
                }
            }
            threads.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Message, contentDescription = null, modifier = Modifier.size(64.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("No messages yet", style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Tap the mic to send a message", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(threads) { thread ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    navController.navigate("message_detail/${thread.id}")
                                },
                            colors = CardDefaults.cardColors(containerColor = CardBackground)
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.MedicalServices,
                                    contentDescription = null,
                                    tint = TealPrimary,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = thread.subject ?: "Doctor",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    thread.lastMessageAt?.let {
                                        Text(
                                            text = "Last message: $it",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                                Icon(Icons.Default.ChevronRight, contentDescription = null)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceHistoryScreen(navController: NavController) {
    val context = LocalContext.current
    val messagesRepository = remember { MessagesRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val scope = rememberCoroutineScope()
    
    var voiceMessages by remember { mutableStateOf<List<com.agyeman.myhealthally.data.models.supabase.SupabaseMessage>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(Unit) {
        scope.launch {
            val userContext = authRepository.getUserContext()
            if (!userContext.isAuthenticated) {
                error = "Please log in to view voice history"
                isLoading = false
                return@launch
            }
            
            val patientId = userContext.patientId ?: run {
                error = "Patient ID not found"
                isLoading = false
                return@launch
            }
            
            val threadsResult = messagesRepository.getPatientThreads(patientId)
            threadsResult.onSuccess { threads ->
                val allMessages = mutableListOf<com.agyeman.myhealthally.data.models.supabase.SupabaseMessage>()
                threads.forEach { thread ->
                    val messagesResult = messagesRepository.getThreadMessages(thread.id)
                    messagesResult.onSuccess { messages ->
                        // Filter for voice messages (those with audio attachments)
                        val voiceMsgs = messages.filter { 
                            it.attachments?.containsKey("audio_url") == true 
                        }
                        allMessages.addAll(voiceMsgs)
                    }
                }
                // Sort by date (newest first)
                voiceMessages = allMessages.sortedByDescending { 
                    try {
                        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(it.createdAt)?.time ?: 0L
                    } catch (e: Exception) {
                        0L
                    }
                }
                isLoading = false
            }.onFailure {
                error = it.message ?: "Failed to load voice messages"
                isLoading = false
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Voice History") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Error, contentDescription = null, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(error ?: "Unknown error", style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }
            voiceMessages.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Mic, contentDescription = null, modifier = Modifier.size(64.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("No voice messages yet", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(voiceMessages) { message ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = CardBackground)
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.Mic,
                                    contentDescription = null,
                                    tint = TealPrimary,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Voice Message",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = try {
                                            val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(message.createdAt)
                                            SimpleDateFormat("MMM d, yyyy 'at' h:mm a", Locale.US).format(date ?: Date())
                                        } catch (e: Exception) {
                                            message.createdAt
                                        },
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                if (!message.read) {
                                    Surface(
                                        modifier = Modifier.size(8.dp),
                                        shape = CircleShape,
                                        color = TealPrimary
                                    ) {}
                                }
                            }
                        }
                    }
                }
            }
        }
    }
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
