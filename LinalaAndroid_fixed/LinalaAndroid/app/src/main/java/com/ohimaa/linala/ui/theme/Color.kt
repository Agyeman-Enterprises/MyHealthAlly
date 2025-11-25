package com.ohimaa.linala.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Lina'la Color Palette
 * Dark Forest Green + Coral (from logo)
 */
object LinalaColors {
    // Primary - Dark Forest Green (logo leaves)
    val Primary = Color(0xFF1B4D3E)
    val PrimaryLight = Color(0xFF2D6B5A)
    val PrimaryDark = Color(0xFF0D3328)
    val PrimaryContainer = Color(0xFFB8E0D4)
    val OnPrimary = Color.White
    val OnPrimaryContainer = Color(0xFF0D3328)
    
    // Secondary - Teal
    val Secondary = Color(0xFF45B5AA)
    val SecondaryLight = Color(0xFF6BC7BE)
    val SecondaryDark = Color(0xFF2D8A80)
    val SecondaryContainer = Color(0xFFD4F4F0)
    val OnSecondary = Color.White
    val OnSecondaryContainer = Color(0xFF1B4D3E)
    
    // Accent - Coral (logo dot)
    val Accent = Color(0xFFFF8B7A)
    val AccentLight = Color(0xFFFFA799)
    val AccentDark = Color(0xFFE57262)
    val AccentContainer = Color(0xFFFFE5E1)
    val OnAccent = Color.White
    val OnAccentContainer = Color(0xFF5D2E28)
    
    // Text
    val TextPrimary = Color(0xFF1A2E28)
    val TextSecondary = Color(0xFF4A635C)
    val TextTertiary = Color(0xFF7A918A)
    val TextOnDark = Color.White
    
    // Background
    val Background = Color(0xFFF5F9F8)
    val Surface = Color.White
    val SurfaceVariant = Color(0xFFE8F0EE)
    val OnBackground = Color(0xFF1A2E28)
    val OnSurface = Color(0xFF1A2E28)
    
    // Gradients
    val GradientStart = Accent
    val GradientEnd = Primary
}

/**
 * MyHealthAlly Color Palette
 * Teal focused
 */
object MyHealthAllyColors {
    // Primary - Teal
    val Primary = Color(0xFF2BA39B)
    val PrimaryLight = Color(0xFF39C6B3)
    val PrimaryDark = Color(0xFF1F7A73)
    val PrimaryContainer = Color(0xFFCCF2EE)
    val OnPrimary = Color.White
    val OnPrimaryContainer = Color(0xFF0D3330)
    
    // Secondary - Light Teal
    val Secondary = Color(0xFF45B5AA)
    val SecondaryLight = Color(0xFF6BC7BE)
    val SecondaryDark = Color(0xFF2D8A80)
    val SecondaryContainer = Color(0xFFD4F4F0)
    val OnSecondary = Color.White
    val OnSecondaryContainer = Color(0xFF1B4D3E)
    
    // Accent - Lighter Teal (no coral for international)
    val Accent = Color(0xFF39C6B3)
    val AccentLight = Color(0xFF5DD4C8)
    val AccentDark = Color(0xFF2BA39B)
    val AccentContainer = Color(0xFFD4F4F0)
    val OnAccent = Color.White
    val OnAccentContainer = Color(0xFF0D3330)
    
    // Text
    val TextPrimary = Color(0xFF1A1A1A)
    val TextSecondary = Color(0xFF6B7280)
    val TextTertiary = Color(0xFF9CA3AF)
    val TextOnDark = Color.White
    
    // Background
    val Background = Color(0xFFF8F9FA)
    val Surface = Color.White
    val SurfaceVariant = Color(0xFFF0F4F3)
    val OnBackground = Color(0xFF1A1A1A)
    val OnSurface = Color(0xFF1A1A1A)
    
    // Gradients
    val GradientStart = Primary
    val GradientEnd = PrimaryLight
}

/**
 * Shared Status Colors
 */
object StatusColors {
    val Success = Color(0xFF10B981)
    val SuccessLight = Color(0xFFD1FAE5)
    val Warning = Color(0xFFF59E0B)
    val WarningLight = Color(0xFFFEF3C7)
    val Error = Color(0xFFEF4444)
    val ErrorLight = Color(0xFFFEE2E2)
    val Info = Color(0xFF3B82F6)
    val InfoLight = Color(0xFFDBEAFE)
}

/**
 * Dynamic color accessor based on current brand
 */
object AppColors {
    private val isLinala: Boolean get() = BrandConfig.isLinala
    
    val Primary: Color get() = if (isLinala) LinalaColors.Primary else MyHealthAllyColors.Primary
    val PrimaryLight: Color get() = if (isLinala) LinalaColors.PrimaryLight else MyHealthAllyColors.PrimaryLight
    val PrimaryDark: Color get() = if (isLinala) LinalaColors.PrimaryDark else MyHealthAllyColors.PrimaryDark
    val PrimaryContainer: Color get() = if (isLinala) LinalaColors.PrimaryContainer else MyHealthAllyColors.PrimaryContainer
    val OnPrimary: Color get() = if (isLinala) LinalaColors.OnPrimary else MyHealthAllyColors.OnPrimary
    
    val Secondary: Color get() = if (isLinala) LinalaColors.Secondary else MyHealthAllyColors.Secondary
    val SecondaryLight: Color get() = if (isLinala) LinalaColors.SecondaryLight else MyHealthAllyColors.SecondaryLight
    
    val Accent: Color get() = if (isLinala) LinalaColors.Accent else MyHealthAllyColors.Accent
    val AccentLight: Color get() = if (isLinala) LinalaColors.AccentLight else MyHealthAllyColors.AccentLight
    val AccentDark: Color get() = if (isLinala) LinalaColors.AccentDark else MyHealthAllyColors.AccentDark
    
    val TextPrimary: Color get() = if (isLinala) LinalaColors.TextPrimary else MyHealthAllyColors.TextPrimary
    val TextSecondary: Color get() = if (isLinala) LinalaColors.TextSecondary else MyHealthAllyColors.TextSecondary
    val TextTertiary: Color get() = if (isLinala) LinalaColors.TextTertiary else MyHealthAllyColors.TextTertiary
    
    val Background: Color get() = if (isLinala) LinalaColors.Background else MyHealthAllyColors.Background
    val Surface: Color get() = if (isLinala) LinalaColors.Surface else MyHealthAllyColors.Surface
    val SurfaceVariant: Color get() = if (isLinala) LinalaColors.SurfaceVariant else MyHealthAllyColors.SurfaceVariant
    
    val GradientStart: Color get() = if (isLinala) LinalaColors.GradientStart else MyHealthAllyColors.GradientStart
    val GradientEnd: Color get() = if (isLinala) LinalaColors.GradientEnd else MyHealthAllyColors.GradientEnd
    
    // Status colors are shared
    val Success = StatusColors.Success
    val Warning = StatusColors.Warning
    val Error = StatusColors.Error
    val Info = StatusColors.Info
}
