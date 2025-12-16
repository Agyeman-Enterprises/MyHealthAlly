package com.agyeman.myhealthally.ui.theme

import com.agyeman.myhealthally.BuildConfig

object BrandConfig {
    const val APP_NAME = "MyHealthAlly"
    const val TAGLINE = "Your Health Ally"
    const val SUBTITLE = "Patient Engagement Platform"
    const val PROVIDER_NAME = "Ohimaa Medical"
    const val SUPPORT_EMAIL = "support@myhealthally.com"

    val apiBaseUrl: String
        get() = BuildConfig.API_BASE_URL
}
