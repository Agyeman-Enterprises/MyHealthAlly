package com.myhealthally.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.myhealthally.app.ui.screens.auth.SignInScreen
import com.myhealthally.app.ui.screens.home.HomeScreen
import com.myhealthally.app.ui.screens.metrics.MetricsScreen
import com.myhealthally.app.ui.screens.coach.CoachScreen
import com.myhealthally.app.ui.screens.onboarding.OnboardingScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "onboarding"
    ) {
        composable("onboarding") {
            OnboardingScreen(
                onGetStarted = { navController.navigate("signin") },
                onSignIn = { navController.navigate("signin") }
            )
        }
        composable("signin") {
            SignInScreen(
                onSignInSuccess = { navController.navigate("home") },
                onSignUp = { /* Navigate to sign up */ }
            )
        }
        composable("home") {
            HomeScreen()
        }
        composable("metrics") {
            MetricsScreen()
        }
        composable("coach") {
            CoachScreen()
        }
    }
}

