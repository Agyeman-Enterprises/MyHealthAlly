package com.ohimaa.linala.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.ohimaa.linala.managers.AudioRecordingManager
import com.ohimaa.linala.managers.BiometricAuthManager
import com.ohimaa.linala.managers.PINManager
import com.ohimaa.linala.ui.screens.*
import com.ohimaa.linala.ui.theme.AppColors

/**
 * Navigation Routes
 */
sealed class Screen(val route: String) {
    object Lock : Screen("lock")
    object Dashboard : Screen("dashboard")
    object Vitals : Screen("vitals")
    object Medications : Screen("medications")
    object Messages : Screen("messages")
    object VoiceMessages : Screen("voice_messages")
    object VoiceMessageDetail : Screen("voice_message/{id}") {
        fun createRoute(id: String) = "voice_message/$id"
    }
    object CarePlan : Screen("care_plan")
    object Settings : Screen("settings")
}

/**
 * Bottom Navigation Items
 */
enum class BottomNavItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    Home(Screen.Dashboard.route, "Home", Icons.Filled.Home, Icons.Outlined.Home),
    Vitals(Screen.Vitals.route, "Vitals", Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder),
    Medications(Screen.Medications.route, "Meds", Icons.Filled.Medication, Icons.Outlined.Medication),
    Messages(Screen.Messages.route, "Messages", Icons.Filled.Message, Icons.Outlined.Message),
    More(Screen.Settings.route, "More", Icons.Filled.MoreHoriz, Icons.Outlined.MoreHoriz)
}

/**
 * Main App Navigation
 */
@Composable
fun LinalaNavHost(
    navController: NavHostController = rememberNavController(),
    biometricManager: BiometricAuthManager,
    pinManager: PINManager,
    recordingManager: AudioRecordingManager,
    isAuthenticated: Boolean,
    onAuthenticated: () -> Unit
) {
    val startDestination = if (isAuthenticated) Screen.Dashboard.route else Screen.Lock.route
    
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Lock Screen
        composable(Screen.Lock.route) {
            LockScreen(
                biometricManager = biometricManager,
                pinManager = pinManager,
                onAuthenticated = {
                    onAuthenticated()
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Lock.route) { inclusive = true }
                    }
                }
            )
        }
        
        // Dashboard
        composable(Screen.Dashboard.route) {
            var showRecordingSheet by remember { mutableStateOf(false) }
            
            DashboardScreen(
                onRecordMessage = { showRecordingSheet = true },
                onNavigateToVitals = { navController.navigate(Screen.Vitals.route) },
                onNavigateToMedications = { navController.navigate(Screen.Medications.route) },
                onNavigateToMessages = { navController.navigate(Screen.VoiceMessages.route) },
                onNavigateToCarePlan = { navController.navigate(Screen.CarePlan.route) }
            )
            
            if (showRecordingSheet) {
                VoiceRecordingScreen(
                    recordingManager = recordingManager,
                    onDismiss = { showRecordingSheet = false },
                    onSubmit = { audioData ->
                        // TODO: Submit to API
                        showRecordingSheet = false
                    }
                )
            }
        }
        
        // Vitals
        composable(Screen.Vitals.route) {
            PlaceholderScreen(title = "Vitals", icon = Icons.Default.Favorite)
        }
        
        // Medications
        composable(Screen.Medications.route) {
            PlaceholderScreen(title = "Medications", icon = Icons.Default.Medication)
        }
        
        // Messages Hub
        composable(Screen.Messages.route) {
            PlaceholderScreen(title = "Messages", icon = Icons.Default.Message)
        }
        
        // Voice Messages List
        composable(Screen.VoiceMessages.route) {
            VoiceMessageListScreen(
                messages = MockVoiceMessages.samples,
                onMessageClick = { id ->
                    navController.navigate(Screen.VoiceMessageDetail.createRoute(id))
                }
            )
        }
        
        // Voice Message Detail
        composable(
            route = Screen.VoiceMessageDetail.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType })
        ) { backStackEntry ->
            val messageId = backStackEntry.arguments?.getString("id") ?: ""
            PlaceholderScreen(title = "Message: $messageId", icon = Icons.Default.GraphicEq)
        }
        
        // Care Plan
        composable(Screen.CarePlan.route) {
            PlaceholderScreen(title = "Care Plan", icon = Icons.Default.Description)
        }
        
        // Settings
        composable(Screen.Settings.route) {
            PlaceholderScreen(title = "Settings", icon = Icons.Default.Settings)
        }
    }
}

/**
 * Main App with Bottom Navigation
 */
@Composable
fun MainAppWithBottomNav(
    biometricManager: BiometricAuthManager,
    pinManager: PINManager,
    recordingManager: AudioRecordingManager
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    var isAuthenticated by remember { mutableStateOf(false) }
    
    // Check if we should show bottom nav
    val showBottomNav = currentRoute !in listOf(Screen.Lock.route)
    
    Scaffold(
        bottomBar = {
            if (showBottomNav) {
                NavigationBar(
                    containerColor = AppColors.Surface
                ) {
                    BottomNavItem.entries.forEach { item ->
                        val selected = currentRoute == item.route
                        
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(Screen.Dashboard.route) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.title
                                )
                            },
                            label = { Text(item.title) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = AppColors.Primary,
                                selectedTextColor = AppColors.Primary,
                                indicatorColor = AppColors.Primary.copy(alpha = 0.1f)
                            )
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = if (isAuthenticated) Screen.Dashboard.route else Screen.Lock.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            // Lock Screen
            composable(Screen.Lock.route) {
                LockScreen(
                    biometricManager = biometricManager,
                    pinManager = pinManager,
                    onAuthenticated = {
                        isAuthenticated = true
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Lock.route) { inclusive = true }
                        }
                    }
                )
            }
            
            // Dashboard
            composable(Screen.Dashboard.route) {
                var showRecordingSheet by remember { mutableStateOf(false) }
                
                DashboardScreen(
                    onRecordMessage = { showRecordingSheet = true },
                    onNavigateToVitals = { navController.navigate(Screen.Vitals.route) },
                    onNavigateToMedications = { navController.navigate(Screen.Medications.route) },
                    onNavigateToMessages = { navController.navigate(Screen.VoiceMessages.route) },
                    onNavigateToCarePlan = { navController.navigate(Screen.CarePlan.route) }
                )
                
                if (showRecordingSheet) {
                    VoiceRecordingScreen(
                        recordingManager = recordingManager,
                        onDismiss = { showRecordingSheet = false },
                        onSubmit = { audioData ->
                            showRecordingSheet = false
                        }
                    )
                }
            }
            
            // Other screens
            composable(Screen.Vitals.route) {
                PlaceholderScreen(title = "Vitals", icon = Icons.Default.Favorite)
            }
            
            composable(Screen.Medications.route) {
                PlaceholderScreen(title = "Medications", icon = Icons.Default.Medication)
            }
            
            composable(Screen.Messages.route) {
                VoiceMessageListScreen(
                    messages = MockVoiceMessages.samples,
                    onMessageClick = { id ->
                        navController.navigate(Screen.VoiceMessageDetail.createRoute(id))
                    }
                )
            }
            
            composable(Screen.VoiceMessages.route) {
                VoiceMessageListScreen(
                    messages = MockVoiceMessages.samples,
                    onMessageClick = { id ->
                        navController.navigate(Screen.VoiceMessageDetail.createRoute(id))
                    }
                )
            }
            
            composable(Screen.CarePlan.route) {
                PlaceholderScreen(title = "Care Plan", icon = Icons.Default.Description)
            }
            
            composable(Screen.Settings.route) {
                PlaceholderScreen(title = "Settings", icon = Icons.Default.Settings)
            }
        }
    }
}

/**
 * Placeholder screen for features to be implemented
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceholderScreen(
    title: String,
    icon: ImageVector
) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(title) })
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = AppColors.TextTertiary
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = AppColors.TextSecondary
                )
                Text(
                    text = "Coming Soon",
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextTertiary
                )
            }
        }
    }
}
