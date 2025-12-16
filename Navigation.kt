package com.agyeman.myhealthally.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.agyeman.myhealthally.ui.screens.*

sealed class Screen(val route: String) {
    object Lock : Screen("lock")
    object Dashboard : Screen("dashboard")
    object Messages : Screen("messages")
    object MessageDetail : Screen("messages/{messageId}") {
        fun createRoute(messageId: String) = "messages/$messageId"
    }
    object RecordMessage : Screen("recordMessage")
    object Tasks : Screen("tasks")
    object Schedule : Screen("schedule")
    object Profile : Screen("profile")
    object Settings : Screen("settings")
    object CarePlan : Screen("carePlan")
    object Labs : Screen("labs")
    object Pharmacy : Screen("pharmacy")
    object Nutrition : Screen("nutrition")
    object Exercises : Screen("exercises")
    object Resources : Screen("resources")
    object Vitals : Screen("vitals")
    object BMICalculator : Screen("bmiCalculator")
    object AISymptomAssistant : Screen("aiSymptomAssistant")
    object AITriage : Screen("aiTriage")
    object Notifications : Screen("notifications")
    object AppointmentRequest : Screen("appointmentRequest")
    object UploadRecords : Screen("uploadRecords")
    object ChatMA : Screen("chatMA")
    object ChatMD : Screen("chatMD")
    object VoiceHistory : Screen("voiceHistory")
}

@Composable
fun AppNavigation(
    navController: NavHostController,
    startDestination: String = Screen.Lock.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Lock.route) {
            LockScreen(navController = navController)
        }
        composable(Screen.Dashboard.route) {
            DashboardScreen(navController = navController)
        }
        composable(Screen.Messages.route) {
            VoiceMessagesListScreen(navController = navController)
        }
        composable(Screen.MessageDetail.route) { backStackEntry ->
            val messageId = backStackEntry.arguments?.getString("messageId") ?: ""
            MessageDetailScreen(navController = navController, messageId = messageId)
        }
        composable(Screen.RecordMessage.route) {
            VoiceRecordingScreen(navController = navController)
        }
        composable(Screen.Tasks.route) {
            TasksScreen(navController = navController)
        }
        composable(Screen.Schedule.route) {
            ScheduleScreen(navController = navController)
        }
        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
        composable(Screen.CarePlan.route) {
            CarePlanScreen(navController = navController)
        }
        composable(Screen.Labs.route) {
            LabsScreen(navController = navController)
        }
        composable(Screen.Pharmacy.route) {
            PharmacyScreen(navController = navController)
        }
        composable(Screen.Nutrition.route) {
            NutritionScreen(navController = navController)
        }
        composable(Screen.Exercises.route) {
            ExercisesScreen(navController = navController)
        }
        composable(Screen.Resources.route) {
            ResourcesScreen(navController = navController)
        }
        composable(Screen.Vitals.route) {
            VitalsScreen(navController = navController)
        }
        composable(Screen.BMICalculator.route) {
            BMICalculatorScreen(navController = navController)
        }
        composable(Screen.AISymptomAssistant.route) {
            AISymptomAssistantScreen(navController = navController)
        }
        composable(Screen.AITriage.route) {
            AITriageScreen(navController = navController)
        }
        composable(Screen.Notifications.route) {
            NotificationsScreen(navController = navController)
        }
        composable(Screen.AppointmentRequest.route) {
            AppointmentRequestScreen(navController = navController)
        }
        composable(Screen.UploadRecords.route) {
            UploadRecordsScreen(navController = navController)
        }
        composable(Screen.ChatMA.route) {
            ChatMAScreen(navController = navController)
        }
        composable(Screen.ChatMD.route) {
            ChatMDScreen(navController = navController)
        }
        composable(Screen.VoiceHistory.route) {
            VoiceHistoryScreen(navController = navController)
        }
    }
}
