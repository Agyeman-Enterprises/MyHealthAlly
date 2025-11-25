package com.ohimaa.linala.ui.theme

import androidx.compose.ui.graphics.Color
import com.ohimaa.linala.BuildConfig

/**
 * Brand Configuration
 * Automatically switches based on build flavor (linala vs myhealthally)
 */
object BrandConfig {
    
    val isLinala: Boolean = BuildConfig.BRAND_NAME == "LINALA"
    
    // App Identity
    val appName: String = if (isLinala) "Lina'la" else "MyHealthAlly"
    val tagline: String = if (isLinala) "Life · Lina'la" else "Your Health Ally"
    val subtitle: String = if (isLinala) "Functional Medicine Wellness" else "Patient Engagement Platform"
    val providerName: String = BuildConfig.PROVIDER_NAME
    val supportEmail: String = BuildConfig.SUPPORT_EMAIL
    val apiBaseUrl: String = BuildConfig.API_BASE_URL
    
    // Feature Flags
    val enableChamorroLanguage: Boolean = BuildConfig.ENABLE_CHAMORRO
    val showPoweredByLinala: Boolean = !isLinala
    
    // Onboarding Content
    val onboardingPages: List<OnboardingPage> = if (isLinala) {
        listOf(
            OnboardingPage(
                title = "Håfa Adai!",
                description = "Welcome to Lina'la, your wellness companion from Ohimaa GU Functional Medicine",
                iconName = "favorite"
            ),
            OnboardingPage(
                title = "Track Your Health",
                description = "Log vitals, medications, and symptoms to keep your care team informed",
                iconName = "monitor_heart"
            ),
            OnboardingPage(
                title = "Voice Messages",
                description = "Send voice messages directly to your care team anytime",
                iconName = "mic"
            ),
            OnboardingPage(
                title = "Stay Connected",
                description = "Receive updates, care plans, and support throughout your journey",
                iconName = "people"
            )
        )
    } else {
        listOf(
            OnboardingPage(
                title = "Welcome!",
                description = "MyHealthAlly connects you with your healthcare team for better outcomes",
                iconName = "favorite"
            ),
            OnboardingPage(
                title = "Track Your Health",
                description = "Log vitals, medications, and symptoms all in one place",
                iconName = "monitor_heart"
            ),
            OnboardingPage(
                title = "Voice Messages",
                description = "Send voice messages to your care team anytime, anywhere",
                iconName = "mic"
            ),
            OnboardingPage(
                title = "Better Care Together",
                description = "Stay connected with your providers and take control of your health",
                iconName = "people"
            )
        )
    }
}

data class OnboardingPage(
    val title: String,
    val description: String,
    val iconName: String
)
