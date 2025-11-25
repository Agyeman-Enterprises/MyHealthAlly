package com.ohimaa.linala.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Lina'la Light Theme
private val LinalaLightColorScheme = lightColorScheme(
    primary = LinalaColors.Primary,
    onPrimary = LinalaColors.OnPrimary,
    primaryContainer = LinalaColors.PrimaryContainer,
    onPrimaryContainer = LinalaColors.OnPrimaryContainer,
    secondary = LinalaColors.Secondary,
    onSecondary = LinalaColors.OnSecondary,
    secondaryContainer = LinalaColors.SecondaryContainer,
    onSecondaryContainer = LinalaColors.OnSecondaryContainer,
    tertiary = LinalaColors.Accent,
    onTertiary = LinalaColors.OnAccent,
    tertiaryContainer = LinalaColors.AccentContainer,
    onTertiaryContainer = LinalaColors.OnAccentContainer,
    error = StatusColors.Error,
    onError = Color.White,
    errorContainer = StatusColors.ErrorLight,
    background = LinalaColors.Background,
    onBackground = LinalaColors.OnBackground,
    surface = LinalaColors.Surface,
    onSurface = LinalaColors.OnSurface,
    surfaceVariant = LinalaColors.SurfaceVariant,
    outline = LinalaColors.TextTertiary
)

// MyHealthAlly Light Theme
private val MyHealthAllyLightColorScheme = lightColorScheme(
    primary = MyHealthAllyColors.Primary,
    onPrimary = MyHealthAllyColors.OnPrimary,
    primaryContainer = MyHealthAllyColors.PrimaryContainer,
    onPrimaryContainer = MyHealthAllyColors.OnPrimaryContainer,
    secondary = MyHealthAllyColors.Secondary,
    onSecondary = MyHealthAllyColors.OnSecondary,
    secondaryContainer = MyHealthAllyColors.SecondaryContainer,
    onSecondaryContainer = MyHealthAllyColors.OnSecondaryContainer,
    tertiary = MyHealthAllyColors.Accent,
    onTertiary = MyHealthAllyColors.OnAccent,
    tertiaryContainer = MyHealthAllyColors.AccentContainer,
    onTertiaryContainer = MyHealthAllyColors.OnAccentContainer,
    error = StatusColors.Error,
    onError = Color.White,
    errorContainer = StatusColors.ErrorLight,
    background = MyHealthAllyColors.Background,
    onBackground = MyHealthAllyColors.OnBackground,
    surface = MyHealthAllyColors.Surface,
    onSurface = MyHealthAllyColors.OnSurface,
    surfaceVariant = MyHealthAllyColors.SurfaceVariant,
    outline = MyHealthAllyColors.TextTertiary
)

// Dark themes (optional - can customize later)
private val LinalaLarkColorScheme = darkColorScheme(
    primary = LinalaColors.PrimaryLight,
    onPrimary = LinalaColors.PrimaryDark,
    secondary = LinalaColors.SecondaryLight,
    tertiary = LinalaColors.AccentLight,
    background = Color(0xFF0D1F1A),
    surface = Color(0xFF1A2E28)
)

private val MyHealthAllyDarkColorScheme = darkColorScheme(
    primary = MyHealthAllyColors.PrimaryLight,
    onPrimary = MyHealthAllyColors.PrimaryDark,
    secondary = MyHealthAllyColors.SecondaryLight,
    tertiary = MyHealthAllyColors.AccentLight,
    background = Color(0xFF0F1419),
    surface = Color(0xFF1A2026)
)

@Composable
fun LinalaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Disabled to use brand colors
    content: @Composable () -> Unit
) {
    val isLinala = BrandConfig.isLinala
    
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> {
            if (isLinala) LinalaLarkColorScheme else MyHealthAllyDarkColorScheme
        }
        else -> {
            if (isLinala) LinalaLightColorScheme else MyHealthAllyLightColorScheme
        }
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
